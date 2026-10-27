import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { adminJson, sameOrigin } from "@/lib/admin/api";
import { MEDIA_ID_PATTERN, MEDIA_IN_USE_SQL } from "@/lib/admin/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!sameOrigin(request))
      return adminJson(
        { error: "Open the image library on this website and try again." },
        403,
      );
    const { env } = await getCloudflareContext({ async: true });
    const user = await getSessionUser(request, env.DB);
    if (!user)
      return adminJson(
        { error: "Your session has expired. Sign in again before deleting." },
        401,
      );
    const { id } = await params;
    if (!MEDIA_ID_PATTERN.test(id))
      return adminJson({ error: "Image not found." }, 404);
    const existing = await env.DB.prepare("SELECT id FROM media WHERE id = ?")
      .bind(id)
      .first();
    if (!existing) return adminJson({ error: "Image not found." }, 404);
    const removed = await env.DB.prepare(
      `DELETE FROM media WHERE id = ? AND NOT ${MEDIA_IN_USE_SQL} RETURNING id`,
    )
      .bind(id)
      .first();
    if (!removed)
      return adminJson(
        {
          error:
            "This image is used by a book, author or article. Replace it there and save before deleting it.",
        },
        409,
      );
    return adminJson({ success: true });
  } catch (error) {
    console.error("Media delete failed:", error);
    return adminJson(
      { error: "This image could not be deleted. Please try again." },
      500,
    );
  }
}
