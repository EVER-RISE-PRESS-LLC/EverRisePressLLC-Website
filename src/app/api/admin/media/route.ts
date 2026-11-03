import { NextRequest } from "next/server";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getSessionUser } from "@/lib/auth";
import { adminJson, sameOrigin } from "@/lib/admin/api";
import { listMedia, MediaStoreError, uploadMedia } from "@/lib/admin/media-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!(await getSessionUser(request, env.DB))) return adminJson({ error: "Sign in to open the image library." }, 401);
    return adminJson(await listMedia(env.DB));
  } catch {
    console.error("Media list failed");
    return adminJson({ error: "The image library could not load. Please try again." }, 500);
  }
}
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return adminJson({ error: "Open the image library on this website and try again." }, 403);
    const { env } = await getCloudflareContext({ async: true });
    if (!(await getSessionUser(request, env.DB))) return adminJson({ error: "Your session has expired. Sign in again before uploading." }, 401);
    const { image } = await uploadMedia(request, env.DB);
    return adminJson({ image }, 201);
  } catch (error) {
    if (error instanceof MediaStoreError) return adminJson({ error: error.message }, error.status);
    console.error("Media upload failed");
    return adminJson({ error: "The image could not be uploaded. Your current image is unchanged; please try again." }, 500);
  }
}
