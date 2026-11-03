import { inspectRaster, MEDIA_ID_PATTERN, MEDIA_IN_USE_SQL, MEDIA_MAX_BYTES, MEDIA_MAX_IMAGES, MEDIA_MAX_TOTAL_BYTES, mediaUsage, type MediaItem } from "./media.ts";

export class MediaStoreError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = "MediaStoreError"; }
}
const fields = `id, name, content_type AS contentType, byte_size AS byteSize, width, height, created_at AS createdAt, ${MEDIA_IN_USE_SQL} AS inUse`;
function item(row: Omit<MediaItem, "url">): MediaItem { return { ...row, url: `/media/${row.id}`, inUse: Boolean(row.inUse) }; }

export async function listMedia(db: D1Database) {
  const [images, usage] = await Promise.all([
    db.prepare(`SELECT ${fields} FROM media ORDER BY created_at DESC`).all<Omit<MediaItem, "url">>(),
    db.prepare("SELECT COUNT(*) AS count, COALESCE(SUM(byte_size), 0) AS bytes FROM media").first<{ count: number; bytes: number }>(),
  ]);
  return { images: images.results.map(item), usage: mediaUsage(usage?.count ?? 0, usage?.bytes ?? 0) };
}

export async function uploadMedia(request: Request, db: D1Database, deduplicate = false) {
  const declaredType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (!["image/jpeg", "image/png", "image/webp"].includes(declaredType ?? "")) throw new MediaStoreError(415, "Choose a JPEG, PNG or WebP image.");
  const tooLarge = () => new MediaStoreError(413, "This image is too large. Choose an image under 500 KB.");
  if (Number(request.headers.get("content-length")) > MEDIA_MAX_BYTES) throw tooLarge();
  const reader = request.body?.getReader();
  if (!reader) throw new MediaStoreError(400, "Choose an image to upload.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const chunk = await reader.read(); if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > MEDIA_MAX_BYTES) { await reader.cancel(); throw tooLarge(); }
    chunks.push(chunk.value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const image = inspectRaster(bytes);
  if (!image || image.contentType !== declaredType) throw new MediaStoreError(400, "This file is not a supported still image, or its dimensions exceed 1600 pixels. Choose a JPEG, PNG or WebP image.");
  let name = "Image";
  try { name = decodeURIComponent(request.headers.get("x-file-name") ?? "Image").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 160) || "Image"; } catch { /* Safe default. */ }
  const uploadHash = deduplicate ? Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), n => n.toString(16).padStart(2, "0")).join("") : null;
  const existing = async () => uploadHash ? db.prepare(`SELECT ${fields} FROM media WHERE upload_hash = ?`).bind(uploadHash).first<Omit<MediaItem, "url">>() : null;
  const previous = await existing();
  if (previous) return { image: item(previous), reused: true };
  const id = crypto.randomUUID(), createdAt = new Date().toISOString();
  const created = await db.prepare(`INSERT OR IGNORE INTO media (id, name, content_type, byte_size, width, height, data, created_at, upload_hash)
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM media) < ? AND (SELECT COALESCE(SUM(byte_size), 0) FROM media) + ? <= ? RETURNING id`)
    .bind(id, name, image.contentType, size, image.width, image.height, bytes.buffer, createdAt, uploadHash, MEDIA_MAX_IMAGES, size, MEDIA_MAX_TOTAL_BYTES).first();
  if (!created) {
    const concurrent = await existing();
    if (concurrent) return { image: item(concurrent), reused: true };
    throw new MediaStoreError(409, "The image library is full. Remove an unused image before uploading another.");
  }
  return { image: { id, name, contentType: image.contentType, byteSize: size, width: image.width, height: image.height, createdAt, url: `/media/${id}`, inUse: false }, reused: false };
}

export async function deleteMedia(db: D1Database, id: string) {
  if (!MEDIA_ID_PATTERN.test(id) || !(await db.prepare("SELECT id FROM media WHERE id = ?").bind(id).first())) throw new MediaStoreError(404, "Image not found.");
  const removed = await db.prepare(`DELETE FROM media WHERE id = ? AND NOT ${MEDIA_IN_USE_SQL} RETURNING id`).bind(id).first();
  if (!removed) throw new MediaStoreError(409, "This image is used by a book, author or article. Replace it there and save before deleting it.");
  return { success: true };
}
