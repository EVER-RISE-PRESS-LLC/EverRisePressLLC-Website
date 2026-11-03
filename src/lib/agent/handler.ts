import { z } from "zod";
import { readBoundedJson } from "../admin/api.ts";
import { deleteMedia, listMedia, MediaStoreError, uploadMedia } from "../admin/media-store.ts";
import { articleSchema } from "../blog/model.ts";
import { articleCreateRequestSchema, articleMutationRequestSchema, ArticleStoreError, createStoredArticle, listStoredArticles, mutateStoredArticle, readStoredArticleById } from "../blog/store.ts";
import { AgentError, authenticateAgent, requireScope, type AgentIdentity } from "./auth.ts";

const allowedMethods = ["GET", "POST", "PATCH", "DELETE"];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function jsonBody(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new AgentError(415, "CONTENT_TYPE", "Send application/json.");
  return readBoundedJson(request, 250_000);
}
function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) throw new ArticleStoreError(result.error.issues[0]?.message ?? "Review the request.", 422, [...new Set(result.error.issues.map(issue => issue.message))]);
  return result.data;
}

/** Same storage and publication gates as the staff workspace; separate identity. */
export async function handleAgentRequest(request: Request, db: D1Database, path: string[]) {
  const requestId = crypto.randomUUID();
  let agent: AgentIdentity | undefined, auditStarted = false;
  let resourceId: string | null = null, action = "unknown", status = 200, value: unknown;
  try {
    agent = await authenticateAgent(request, db);
    const [collection, id, operation] = path;
    if (!allowedMethods.includes(request.method)) throw new AgentError(405, "METHOD_NOT_ALLOWED", "Unsupported publishing method.");
    const exact = (method: string, length: number) => request.method === method && path.length === length;
    const isArticle = collection === "articles" && (!id || /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(id));
    const isMedia = collection === "media" && (!id || uuid.test(id));
    if (path.length > 3 || (!isArticle && !isMedia && !(path.length === 1 && ["me", "schema", "audit"].includes(collection)))) throw new AgentError(404, "NOT_FOUND", "Publishing endpoint not found.");
    resourceId = id ?? null;
    action = `${request.method} ${collection}${id ? "/:id" : ""}${operation ? `/${operation.slice(0, 40)}` : ""}`;
    // Reserve an audit record before a mutation; a pending record is recoverable
    // evidence even if the connection or Worker stops after the database write.
    await db.prepare("INSERT INTO agent_audit_log (request_id, credential_id, action, resource_id, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(requestId, agent.id, action, resourceId, new Date().toISOString()).run();
    auditStarted = true;
    if (collection === "me" && exact("GET", 1)) {
      value = { apiVersion: "1", agent, limits: { requestsPerMinute: 60, imageBytes: 512_000, imageDimension: 1600, images: 100, imageLibraryBytes: 20 * 1024 * 1024, articleBytes: 250_000 } };
    } else if (collection === "schema" && exact("GET", 1)) {
      requireScope(agent, "articles:read");
      value = { create: z.toJSONSchema(articleCreateRequestSchema, { io: "input" }), mutation: z.toJSONSchema(articleMutationRequestSchema, { io: "input" }) };
    } else if (collection === "audit" && exact("GET", 1)) {
      value = { requests: (await db.prepare("SELECT request_id AS requestId, action, resource_id AS resourceId, status, created_at AS createdAt, completed_at AS completedAt FROM agent_audit_log WHERE credential_id = ? ORDER BY created_at DESC LIMIT 100").bind(agent.id).all()).results };
    } else if (isArticle && exact("GET", 1)) {
      requireScope(agent, "articles:read");
      const url = new URL(request.url);
      const articles = await listStoredArticles(db, url.searchParams.get("includeArchived") === "true");
      value = { articles: url.searchParams.has("slug") ? articles.filter(article => article.slug === url.searchParams.get("slug") || article.id === url.searchParams.get("slug")) : articles };
    } else if (isArticle && exact("GET", 2)) {
      requireScope(agent, "articles:read");
      const article = await readStoredArticleById(db, id, true);
      if (!article) throw new AgentError(404, "NOT_FOUND", "Article not found.");
      value = { article };
    } else if (isArticle && exact("POST", 1)) {
      requireScope(agent, "articles:write");
      const input = parse(articleCreateRequestSchema, await jsonBody(request));
      if (!input.document.slug) throw new AgentError(422, "SLUG_REQUIRED", "Give agent-created drafts a stable slug so a retry cannot create an unnamed duplicate.");
      const article = await createStoredArticle(db, input.document);
      resourceId = article.id; value = { article }; status = 201;
    } else if (isArticle && exact("PATCH", 2)) {
      const input = parse(articleMutationRequestSchema, await jsonBody(request));
      requireScope(agent, input.action === "save" ? "articles:write" : "articles:publish");
      if (input.document) requireScope(agent, "articles:write");
      action = `articles.${input.action}`;
      value = { article: await mutateStoredArticle(db, id, input, agent) };
    } else if (isArticle && operation === "validate" && exact("POST", 3)) {
      requireScope(agent, "articles:read");
      const article = await readStoredArticleById(db, id, true);
      if (!article) throw new AgentError(404, "NOT_FOUND", "Article not found.");
      const now = new Date().toISOString();
      const { articleDocument } = await import("../blog/model.ts");
      const result = articleSchema.safeParse({ ...articleDocument(article), status: "published", publishedAt: article.everPublishedAt ?? now, updatedAt: now, review: { by: agent.name, at: now } });
      const issues = result.success ? [] : result.error.issues.map(issue => issue.message);
      const known = new Set((await db.prepare("SELECT slug FROM articles WHERE archived_at IS NULL AND id != ?").bind(id).all<{ slug: string }>()).results.map(row => row.slug));
      if (article.relatedSlugs.some(slug => !known.has(slug))) issues.push("Choose related articles that are still in the workspace.");
      if (article.archivedAt) issues.push("Restore this archived article before publishing.");
      value = { valid: issues.length === 0, issues: [...new Set(issues)], revision: article.revision, previewUrl: `/admin/articles/${article.slug}/preview`, note: "Validation checks required fields. Review the actual text, sources, image rights and layout before publishing." };
    } else if (isMedia && exact("GET", 1)) {
      requireScope(agent, "media:read"); value = await listMedia(db);
    } else if (isMedia && exact("POST", 1)) {
      requireScope(agent, "media:write");
      const result = await uploadMedia(request, db, true);
      resourceId = result.image.id; value = result; status = result.reused ? 200 : 201;
    } else if (isMedia && exact("DELETE", 2)) {
      requireScope(agent, "media:delete"); value = await deleteMedia(db, id);
    } else { throw new AgentError(404, "NOT_FOUND", "Publishing endpoint not found."); }
  } catch (error) {
    if (error instanceof AgentError) { status = error.status; value = { error: error.message, code: error.code }; }
    else if (error instanceof ArticleStoreError) { status = error.status; value = { error: error.message, code: error.code ?? "ARTICLE_VALIDATION", issues: error.issues }; }
    else if (error instanceof MediaStoreError) { status = error.status; value = { error: error.message, code: "MEDIA_VALIDATION" }; }
    else if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") { status = 413; value = { error: "Keep the article request below 250 KB.", code: "REQUEST_TOO_LARGE" }; }
    else { status = 503; value = { error: "Publishing is temporarily unavailable. Read the saved state before retrying a write.", code: "UNAVAILABLE" }; console.error(JSON.stringify({ event: "agent_api_error", requestId, error: error instanceof Error ? error.name : "UnknownError" })); }
  }
  if (auditStarted && agent) {
    try {
      await db.batch([
        db.prepare("UPDATE agent_audit_log SET action = ?, resource_id = ?, status = ?, completed_at = ? WHERE request_id = ?").bind(action, resourceId, status, new Date().toISOString(), requestId),
        db.prepare("DELETE FROM agent_audit_log WHERE rowid IN (SELECT rowid FROM agent_audit_log ORDER BY created_at DESC LIMIT -1 OFFSET 5000)"),
      ]);
    } catch { console.error(JSON.stringify({ event: "agent_audit_incomplete", requestId, status })); }
  }
  return Response.json({ ...(value as Record<string, unknown>), requestId }, { status, headers: {
    "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff", "X-Request-Id": requestId,
    ...(status === 401 ? { "WWW-Authenticate": 'Bearer realm="EverRise publishing"' } : {}),
    ...(status === 429 ? { "Retry-After": "60" } : {}),
  } });
}
