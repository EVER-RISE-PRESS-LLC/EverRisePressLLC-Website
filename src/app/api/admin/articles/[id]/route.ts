import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { adminJson, readBoundedJson, sameOrigin } from "@/lib/admin/api";
import { articleMutationRequestSchema, ArticleStoreError, mutateStoredArticle, readStoredArticleById } from "@/lib/blog/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!(await getSessionUser(request, env.DB))) return adminJson({ error: "Sign in to open this article." }, 401);
    const article = await readStoredArticleById(env.DB, (await params).id, true);
    return article ? adminJson({ article }) : adminJson({ error: "This article could not be found." }, 404);
  } catch { return adminJson({ error: "This article could not load. Please try again." }, 503); }
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!sameOrigin(request)) return adminJson({ error: "Open the article editor on this website and try again." }, 403);
    const { env } = await getCloudflareContext({ async: true });
    const user = await getSessionUser(request, env.DB);
    if (!user) return adminJson({ error: "Your session has expired. Sign in again before changing this article." }, 401);
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return adminJson({ error: "Send the article document as JSON." }, 415);
    const parsed = articleMutationRequestSchema.safeParse(await readBoundedJson(request, 250_000));
    if (!parsed.success) return adminJson({ error: parsed.error.issues[0]?.message ?? "Review the article details.", issues: [...new Set(parsed.error.issues.map(issue => issue.message))] }, 422);
    return adminJson({ article: await mutateStoredArticle(env.DB, (await params).id, parsed.data, user) });
  } catch (error) {
    if (error instanceof ArticleStoreError) return adminJson({ error: error.message, issues: error.issues, code: error.code }, error.status);
    if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") return adminJson({ error: "This article is too large. Keep the saved document under 250 KB." }, 413);
    console.error("Article update failed", error instanceof Error ? error.name : "UnknownError");
    return adminJson({ error: "The article could not be changed. Your saved work is still available; please try again." }, 503);
  }
}
