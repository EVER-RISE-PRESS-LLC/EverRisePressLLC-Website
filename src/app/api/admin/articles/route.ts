import { NextRequest } from "next/server";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getSessionUser } from "@/lib/auth";
import { adminJson, readBoundedJson, sameOrigin } from "@/lib/admin/api";
import { articleCreateRequestSchema, ArticleStoreError, createStoredArticle, listStoredArticles } from "@/lib/blog/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!(await getSessionUser(request, env.DB))) return adminJson({ error: "Sign in to open your articles." }, 401);
    return adminJson({ articles: await listStoredArticles(env.DB, request.nextUrl.searchParams.get("includeArchived") === "true") });
  } catch { return adminJson({ error: "Your articles could not load. Please try again." }, 503); }
}
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return adminJson({ error: "Open the article editor on this website and try again." }, 403);
    const { env } = await getCloudflareContext({ async: true });
    if (!(await getSessionUser(request, env.DB))) return adminJson({ error: "Your session has expired. Sign in again before saving." }, 401);
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return adminJson({ error: "Send the article document as JSON." }, 415);
    const parsed = articleCreateRequestSchema.safeParse(await readBoundedJson(request, 250_000));
    if (!parsed.success) return adminJson({ error: parsed.error.issues[0]?.message ?? "Review your article details.", issues: [...new Set(parsed.error.issues.map(issue => issue.message))] }, 422);
    return adminJson({ article: await createStoredArticle(env.DB, parsed.data.document) }, 201);
  } catch (error) {
    if (error instanceof ArticleStoreError) return adminJson({ error: error.message, issues: error.issues, code: error.code }, error.status);
    if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") return adminJson({ error: "This article is too large. Keep the saved document under 250 KB." }, 413);
    console.error("Article creation failed", error instanceof Error ? error.name : "UnknownError");
    return adminJson({ error: "The draft could not be saved. Please try again." }, 503);
  }
}
