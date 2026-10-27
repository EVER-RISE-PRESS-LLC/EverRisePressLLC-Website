"use client";

import { MEDIA_MAX_BYTES, MEDIA_MAX_DIMENSION } from "@/lib/admin/media";

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(
              new Error(
                "This browser could not prepare the image. Try a JPEG or PNG file.",
              ),
            ),
      type,
      quality,
    ),
  );
}

/** Re-encode uploads in the browser to remove source metadata and control image size. */
export async function prepareImage(
  file: File,
): Promise<{ blob: Blob; name: string }> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error(
      "Choose a JPEG, PNG or WebP image. SVG and animated files are not supported.",
    );
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Choose an original image smaller than 20 MB.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "This image could not be opened. Try exporting it as a JPEG or PNG.",
    );
  }
  try {
    if (
      !bitmap.width ||
      !bitmap.height ||
      bitmap.width * bitmap.height > 40_000_000
    )
      throw new Error(
        "This image is too large to prepare here. Choose an image under 40 megapixels.",
      );
    let scale = Math.min(
      1,
      MEDIA_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error(
        "This browser could not prepare the image. Try another browser.",
      );
    for (let attempt = 0; attempt < 5; attempt++) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      if (file.type === "image/png" && attempt === 0) {
        const png = await canvasBlob(canvas, "image/png");
        if (png.size <= MEDIA_MAX_BYTES)
          return {
            blob: png,
            name: `${file.name.replace(/\.[^.]+$/, "")}.png`,
          };
      }
      const type = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
      for (const quality of [0.88, 0.74, 0.58]) {
        const blob = await canvasBlob(canvas, type, quality);
        if (blob.size <= MEDIA_MAX_BYTES) {
          const extension =
            blob.type === "image/png"
              ? "png"
              : blob.type === "image/webp"
                ? "webp"
                : "jpg";
          return {
            blob,
            name: `${file.name.replace(/\.[^.]+$/, "")}.${extension}`,
          };
        }
      }
      scale *= 0.8;
    }
    throw new Error(
      "This image could not fit within 500 KB. Try a smaller or simpler image.",
    );
  } finally {
    bitmap.close();
  }
}
