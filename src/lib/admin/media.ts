export const MEDIA_MAX_BYTES = 500 * 1024;
export const MEDIA_MAX_TOTAL_BYTES = 20 * 1024 * 1024;
export const MEDIA_MAX_IMAGES = 100;
export const MEDIA_MAX_DIMENSION = 1600;
export const MEDIA_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export interface MediaItem {
  id: string;
  name: string;
  contentType: string;
  byteSize: number;
  width: number;
  height: number;
  createdAt: string;
  url: string;
  inUse: boolean;
}
export interface MediaUsage {
  count: number;
  bytes: number;
  maxCount: number;
  maxBytes: number;
  maxFileBytes: number;
}
export const mediaUsage = (count: number, bytes: number): MediaUsage => ({
  count,
  bytes,
  maxCount: MEDIA_MAX_IMAGES,
  maxBytes: MEDIA_MAX_TOTAL_BYTES,
  maxFileBytes: MEDIA_MAX_BYTES,
});
export function formatMediaBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(0, Math.round(bytes / 1024))} KB`;
}

/** Inspect raster headers rather than trusting file names or submitted dimensions. */
export function inspectRaster(
  bytes: Uint8Array,
): { contentType: string; width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (offset: number, length: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + length));
  let result: { contentType: string; width: number; height: number } | null =
    null;
  if (
    bytes.length >= 33 &&
    bytes[0] === 137 &&
    ascii(1, 3) === "PNG" &&
    bytes[4] === 13 &&
    bytes[5] === 10 &&
    bytes[6] === 26 &&
    bytes[7] === 10 &&
    ascii(12, 4) === "IHDR" &&
    view.getUint32(8) === 13
  ) {
    let offset = 8;
    let hasEnd = false;
    let hasPixels = false;
    while (offset + 12 <= bytes.length) {
      const length = view.getUint32(offset);
      if (length > bytes.length - offset - 12) return null;
      const chunk = ascii(offset + 4, 4);
      if (chunk === "IDAT" && length > 0) hasPixels = true;
      if (chunk === "acTL") return null; // This library stores still images.
      if (chunk === "IEND") {
        hasEnd = length === 0 && offset + 12 === bytes.length;
        break;
      }
      offset += length + 12;
    }
    if (!hasEnd || !hasPixels) return null;
    result = {
      contentType: "image/png",
      width: view.getUint32(16),
      height: view.getUint32(20),
    };
  } else if (
    bytes.length >= 12 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[bytes.length - 2] === 255 &&
    bytes[bytes.length - 1] === 217
  ) {
    let offset = 2;
    let hasScan = false;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 255) return null;
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 218) {
        if (offset + 2 > bytes.length) return null;
        const scanHeaderLength = view.getUint16(offset);
        hasScan =
          scanHeaderLength >= 6 && offset + scanHeaderLength + 2 < bytes.length;
        break;
      }
      if (marker === 217) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (offset + 2 > bytes.length) return null;
      const length = view.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) return null;
      if (
        [
          192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207,
        ].includes(marker)
      ) {
        if (length < 8) return null;
        result = {
          contentType: "image/jpeg",
          width: view.getUint16(offset + 5),
          height: view.getUint16(offset + 3),
        };
      }
      offset += length;
    }
    if (!hasScan) return null;
  } else if (
    bytes.length >= 30 &&
    ascii(0, 4) === "RIFF" &&
    ascii(8, 4) === "WEBP" &&
    view.getUint32(4, true) + 8 === bytes.length
  ) {
    let chunkOffset = 12;
    let hasPixels = false;
    while (chunkOffset + 8 <= bytes.length) {
      const chunkLength = view.getUint32(chunkOffset + 4, true);
      if (chunkLength > bytes.length - chunkOffset - 8) return null;
      const chunkType = ascii(chunkOffset, 4);
      if (chunkType === "ANIM" || chunkType === "ANMF") return null;
      if (
        (chunkType === "VP8 " && chunkLength > 10) ||
        (chunkType === "VP8L" && chunkLength > 5)
      )
        hasPixels = true;
      chunkOffset += 8 + chunkLength + (chunkLength % 2);
    }
    if (!hasPixels || chunkOffset !== bytes.length) return null;
    const type = ascii(12, 4);
    if (type === "VP8X" && bytes.length >= 30) {
      if (bytes[20] & 2) return null; // Animated WebP is not accepted.
      const uint24 = (offset: number) =>
        bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16);
      result = {
        contentType: "image/webp",
        width: uint24(24) + 1,
        height: uint24(27) + 1,
      };
    } else if (type === "VP8L" && bytes[20] === 47 && bytes.length >= 25) {
      const bits = view.getUint32(21, true);
      result = {
        contentType: "image/webp",
        width: (bits & 16383) + 1,
        height: ((bits >>> 14) & 16383) + 1,
      };
    } else if (
      type === "VP8 " &&
      bytes[23] === 157 &&
      bytes[24] === 1 &&
      bytes[25] === 42
    ) {
      result = {
        contentType: "image/webp",
        width: view.getUint16(26, true) & 16383,
        height: view.getUint16(28, true) & 16383,
      };
    }
  }
  return result &&
    result.width > 0 &&
    result.height > 0 &&
    result.width <= MEDIA_MAX_DIMENSION &&
    result.height <= MEDIA_MAX_DIMENSION
    ? result
    : null;
}

export const MEDIA_IN_USE_SQL = `(EXISTS(SELECT 1 FROM books WHERE instr(cover_image_url, '/media/' || media.id) > 0 OR instr(chapter_one_body, '/media/' || media.id) > 0)
  OR EXISTS(SELECT 1 FROM authors WHERE instr(COALESCE(avatar_url, ''), '/media/' || media.id) > 0)
  OR EXISTS(SELECT 1 FROM articles WHERE instr(document, '/media/' || media.id) > 0 OR instr(COALESCE(published_document, ''), '/media/' || media.id) > 0))`;
