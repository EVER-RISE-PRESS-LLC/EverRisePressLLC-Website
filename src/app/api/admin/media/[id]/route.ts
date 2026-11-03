import { NextRequest } from "next/server";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getSessionUser } from "@/lib/auth";
import { adminJson, sameOrigin } from "@/lib/admin/api";
import { deleteMedia, MediaStoreError } from "@/lib/admin/media-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!sameOrigin(request)) return adminJson({ error: "Open the image library on this website and try again." }, 403);
    const { env } = await getCloudflareContext({ async: true });
    if (!(await getSessionUser(request, env.DB))) return adminJson({ error: "Your session has expired. Sign in again before deleting." }, 401);
    return adminJson(await deleteMedia(env.DB, (await params).id));
  } catch (error) {
    if (error instanceof MediaStoreError) return adminJson({ error: error.message }, error.status);
    console.error("Media delete failed");
    return adminJson({ error: "This image could not be deleted. Please try again." }, 500);
  }
}
