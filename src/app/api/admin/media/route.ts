import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { adminJson, sameOrigin } from "@/lib/admin/api";
import {
  inspectRaster,
  MEDIA_IN_USE_SQL,
  MEDIA_MAX_BYTES,
  MEDIA_MAX_IMAGES,
  MEDIA_MAX_TOTAL_BYTES,
  mediaUsage,
} from "@/lib/admin/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!(await getSessionUser(request, env.DB)))
      return adminJson({ error: "Sign in to open the image library." }, 401);
    const [images, usage] = await Promise.all([
      env.DB.prepare(
        `SELECT id, name, content_type AS contentType, byte_size AS byteSize, width, height, created_at AS createdAt, ${MEDIA_IN_USE_SQL} AS inUse FROM media ORDER BY created_at DESC`,
      ).all(),
      env.DB.prepare(
        "SELECT COUNT(*) AS count, COALESCE(SUM(byte_size), 0) AS bytes FROM media",
      ).first<{ count: number; bytes: number }>(),
    ]);
    return adminJson({
      images: images.results.map((item) => ({
        ...item,
        url: `/media/${item.id}`,
        inUse: Boolean(item.inUse),
      })),
      usage: mediaUsage(usage?.count ?? 0, usage?.bytes ?? 0),
    });
  } catch (error) {
    console.error("Media list failed:", error);
    return adminJson(
      { error: "The image library could not load. Please try again." },
      500,
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request))
      return adminJson(
        { error: "Open the image library on this website and try again." },
        403,
      );
    const { env } = await getCloudflareContext({ async: true });
    if (!(await getSessionUser(request, env.DB)))
      return adminJson(
        { error: "Your session has expired. Sign in again before uploading." },
        401,
      );
    const declaredType = request.headers.get("content-type")?.split(";")[0];
    if (!["image/jpeg", "image/png", "image/webp"].includes(declaredType ?? ""))
      return adminJson({ error: "Choose a JPEG, PNG or WebP image." }, 415);
    if (Number(request.headers.get("content-length")) > MEDIA_MAX_BYTES)
      return adminJson(
        { error: "This image is too large. Choose an image under 500 KB." },
        413,
      );
    const reader = request.body?.getReader();
    if (!reader) return adminJson({ error: "Choose an image to upload." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > MEDIA_MAX_BYTES) {
        await reader.cancel();
        return adminJson(
          { error: "This image is too large. Choose an image under 500 KB." },
          413,
        );
      }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const image = inspectRaster(bytes);
    if (!image || image.contentType !== declaredType)
      return adminJson(
        {
          error:
            "This file is not a supported still image, or its dimensions exceed 1600 pixels. Choose a JPEG, PNG or WebP image.",
        },
        400,
      );
    let name = "Image";
    try {
      name =
        decodeURIComponent(request.headers.get("x-file-name") ?? "Image")
          .replace(/[\u0000-\u001f\u007f]/g, "")
          .trim()
          .slice(0, 160) || "Image";
    } catch {
      /* Keep the safe default name. */
    }
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    // The quota check and insertion are one statement, including simultaneous uploads.
    const created = await env.DB.prepare(
      `INSERT INTO media (id, name, content_type, byte_size, width, height, data, created_at)
      SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM media) < ? AND (SELECT COALESCE(SUM(byte_size), 0) FROM media) + ? <= ?
      RETURNING id`,
    )
      .bind(
        id,
        name,
        image.contentType,
        size,
        image.width,
        image.height,
        bytes.buffer,
        createdAt,
        MEDIA_MAX_IMAGES,
        size,
        MEDIA_MAX_TOTAL_BYTES,
      )
      .first();
    if (!created)
      return adminJson(
        {
          error:
            "The image library is full. Remove an unused image before uploading another.",
        },
        409,
      );
    return adminJson(
      {
        image: {
          id,
          name,
          contentType: image.contentType,
          byteSize: size,
          width: image.width,
          height: image.height,
          createdAt,
          url: `/media/${id}`,
          inUse: false,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Media upload failed:", error);
    return adminJson(
      {
        error:
          "The image could not be uploaded. Your current image is unchanged; please try again.",
      },
      500,
    );
  }
}
