import { NextRequest } from "next/server";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { MEDIA_ID_PATTERN } from "@/lib/admin/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!MEDIA_ID_PATTERN.test(id))
    return new Response("Image not found", { status: 404 });
  try {
    const { env, ctx } = await getCloudflareContext({ async: true });
    const cache = (
      globalThis.caches as (CacheStorage & { default?: Cache }) | undefined
    )?.default;
    const cached = cache ? await cache.match(request.url) : undefined;
    if (cached) return cached;
    const image = await env.DB.prepare(
      "SELECT data, content_type AS contentType, byte_size AS byteSize FROM media WHERE id = ?",
    )
      .bind(id)
      .first<{
        data: ArrayBuffer | number[];
        contentType: string;
        byteSize: number;
      }>();
    if (
      !image ||
      !["image/jpeg", "image/png", "image/webp"].includes(image.contentType)
    )
      return new Response("Image not found", { status: 404 });
    const data =
      image.data instanceof ArrayBuffer
        ? image.data
        : new Uint8Array(image.data).buffer;
    const response = new Response(data, {
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": String(image.byteSize),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
    if (cache && ctx) ctx.waitUntil(cache.put(request.url, response.clone()));
    return response;
  } catch {
    return new Response("Image unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
