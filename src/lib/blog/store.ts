import { z } from "zod";
import { articleDraftSchema, articleSchema, articleSlugSchema, publishedArticles, type BlogArticle, type StoredArticle } from "./model.ts";

type ArticleRow = { id: string; slug: string; document: string; published_document: string | null; published_at: string | null; revision: number; archived_at: string | null; created_at: string; updated_at: string };
export type ArticleAction = "save" | "publish" | "unpublish" | "archive" | "restore";
export const articleCreateRequestSchema = z.object({ document: articleDraftSchema }).strict();
export const articleMutationRequestSchema = z.object({
  action: z.enum(["save", "publish", "unpublish", "archive", "restore"]),
  revision: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
  document: articleDraftSchema.optional(),
  reviewConfirmed: z.boolean().optional(),
}).strict();
export type ArticleMutation = z.infer<typeof articleMutationRequestSchema>;
export type ArticleErrorCode = "REVISION_CONFLICT" | "SLUG_CONFLICT";
export class ArticleStoreError extends Error {
  status: number;
  issues: string[];
  code?: ArticleErrorCode;
  constructor(message: string, status = 422, issues: string[] = [], code?: ArticleErrorCode) { super(message); this.name = "ArticleStoreError"; this.status = status; this.issues = issues.length ? issues : [message]; this.code = code; }
}

function parseDocument(value: string): BlogArticle { return articleDraftSchema.parse(JSON.parse(value)); }
function editableDocument(article: BlogArticle) {
  return {
    slug: article.slug, title: article.title, description: article.description,
    section: article.section, author: article.author, imageUrl: article.imageUrl,
    imageAlt: article.imageAlt, imageWidth: article.imageWidth, imageHeight: article.imageHeight,
    blocks: article.blocks, sources: article.sources, relatedSlugs: article.relatedSlugs,
  };
}
function sameContent(first: BlogArticle, second: BlogArticle) { return JSON.stringify(editableDocument(first)) === JSON.stringify(editableDocument(second)); }
export function storedArticleFromRow(row: ArticleRow): StoredArticle {
  const document = parseDocument(row.document);
  const published = row.published_document ? parseDocument(row.published_document) : null;
  return {
    ...document, id: row.id, slug: row.slug, revision: Number(row.revision),
    isLive: !row.archived_at && !!published,
    hasUnpublishedChanges: !published || !sameContent(document, published),
    everPublishedAt: row.published_at ?? published?.publishedAt ?? null,
    createdAt: row.created_at, savedAt: row.updated_at, archivedAt: row.archived_at,
  };
}
function validationError(error: z.ZodError) { return new ArticleStoreError(error.issues[0]?.message ?? "Review the article details before continuing.", 422, [...new Set(error.issues.map(issue => issue.message))]); }
function normalizeDraft(input: unknown, trusted?: BlogArticle, everPublishedAt?: string | null): BlogArticle {
  const parsed = articleDraftSchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error);
  const checked = articleSchema.safeParse({ ...parsed.data, status: "draft", publishedAt: everPublishedAt ?? null, updatedAt: trusted?.updatedAt ?? null, review: null });
  if (!checked.success) throw validationError(checked.error);
  if (checked.data.slug && !articleSlugSchema.safeParse(checked.data.slug).success) throw new ArticleStoreError("Use lowercase letters, numbers, and single hyphens for the article address.");
  return checked.data;
}
function uniqueConflict(error: unknown): never {
  if (error instanceof Error && /UNIQUE constraint failed: articles\.slug|unique.*articles.*slug/i.test(error.message)) throw new ArticleStoreError("That article address is already in use. Choose a different address.", 409, [], "SLUG_CONFLICT");
  throw error;
}
async function readRow(db: D1Database, value: string, column: "id" | "slug", includeArchived = false) {
  return db.prepare(`SELECT * FROM articles WHERE ${column} = ? ${includeArchived ? "" : "AND archived_at IS NULL"} LIMIT 1`).bind(value).first<ArticleRow>();
}
export async function listStoredArticles(db: D1Database, includeArchived = false): Promise<StoredArticle[]> {
  const rows = await db.prepare(`SELECT * FROM articles ${includeArchived ? "" : "WHERE archived_at IS NULL"} ORDER BY updated_at DESC, id`).all<ArticleRow>();
  return rows.results.map(storedArticleFromRow);
}
export async function readStoredArticle(db: D1Database, slug: string, includeArchived = false): Promise<StoredArticle | undefined> {
  const row = await readRow(db, slug, "slug", includeArchived); return row ? storedArticleFromRow(row) : undefined;
}
export async function readStoredArticleById(db: D1Database, id: string, includeArchived = false): Promise<StoredArticle | undefined> {
  const row = await readRow(db, id, "id", includeArchived); return row ? storedArticleFromRow(row) : undefined;
}
export async function readPublishedArticles(db: D1Database): Promise<BlogArticle[]> {
  const rows = await db.prepare("SELECT published_document FROM articles WHERE archived_at IS NULL AND published_document IS NOT NULL").all<{ published_document: string }>();
  const documents: BlogArticle[] = [];
  for (const row of rows.results) {
    try {
      const parsed = articleSchema.safeParse(JSON.parse(row.published_document));
      if (parsed.success) documents.push({ ...parsed.data, editorialNotes: "" });
    } catch { /* A malformed record must never become a public draft fallback. */ }
  }
  return publishedArticles(documents);
}

export async function createStoredArticle(db: D1Database, input: unknown, now = new Date().toISOString()): Promise<StoredArticle> {
  const id = crypto.randomUUID();
  const document = normalizeDraft(input);
  if (!document.slug) document.slug = `untitled-${id.slice(0, 8)}`;
  try {
    const row = await db.prepare(`INSERT INTO articles (id, slug, document, published_document, published_at, revision, archived_at, created_at, updated_at)
      VALUES (?, ?, ?, NULL, NULL, 1, NULL, ?, ?) RETURNING *`).bind(id, document.slug, JSON.stringify(document), now, now).first<ArticleRow>();
    if (!row) throw new Error("Article insertion returned no record");
    return storedArticleFromRow(row);
  } catch (error) { return uniqueConflict(error); }
}

export async function mutateStoredArticle(db: D1Database, id: string, request: ArticleMutation, reviewer: { name: string }, now = new Date().toISOString()): Promise<StoredArticle> {
  const row = await readRow(db, id, "id", true);
  if (!row) throw new ArticleStoreError("This article could not be found.", 404);
  if (Number(row.revision) !== request.revision) throw new ArticleStoreError("This article changed in another tab. Reload it before saving so no work is overwritten.", 409, [], "REVISION_CONFLICT");
  if (row.archived_at && request.action !== "restore") throw new ArticleStoreError("Restore this archived article before making changes.", 409);
  if (!row.archived_at && request.action === "restore") throw new ArticleStoreError("This article is already in the workspace.", 409);
  const current = storedArticleFromRow(row);
  let document = parseDocument(row.document);
  let publishedDocument = row.published_document;
  let publishedAt = current.everPublishedAt;
  let archivedAt = row.archived_at;
  if (request.action === "save" || request.action === "publish" || ((request.action === "unpublish" || request.action === "archive") && request.document)) {
    if (request.action === "save" && !request.document) throw new ArticleStoreError("Send the article document to save your draft.", 400);
    document = normalizeDraft(request.document ?? document, document, publishedAt);
    if (!document.slug) document.slug = row.slug;
    if (publishedAt && document.slug !== row.slug) throw new ArticleStoreError("The address is locked after the first publication so existing reader links keep working.", 409);
    if (publishedDocument) {
      const published = parseDocument(publishedDocument);
      if (sameContent(document, published)) document = { ...document, status: "published", publishedAt: published.publishedAt, updatedAt: published.updatedAt, review: published.review };
    }
  }
  if (request.action === "publish") {
    if (!request.reviewConfirmed) throw new ArticleStoreError("Confirm that you have reviewed the article, sources, and byline before publishing.");
    const previousPublished = publishedDocument ? parseDocument(publishedDocument) : null;
    const unchanged = previousPublished && sameContent(document, previousPublished);
    // Repeating Publish or changing only a private note is not a material
    // public update. Keep the real modification and review dates truthful.
    const candidate = articleSchema.safeParse({
      ...document, status: "published", publishedAt: publishedAt ?? now,
      updatedAt: unchanged ? previousPublished.updatedAt : now,
      review: unchanged ? previousPublished.review : { by: reviewer.name, at: now },
    });
    if (!candidate.success) throw validationError(candidate.error);
    document = candidate.data;
    const knownRows = await db.prepare("SELECT slug FROM articles WHERE archived_at IS NULL AND id != ?").bind(id).all<{ slug: string }>();
    const knownSlugs = new Set(knownRows.results.map(article => article.slug));
    if (document.relatedSlugs.some(related => !knownSlugs.has(related))) throw new ArticleStoreError("Choose related articles that are still in the workspace.");
    publishedAt = publishedAt ?? now;
    publishedDocument = JSON.stringify({ ...document, editorialNotes: "" });
  } else if (request.action === "unpublish") {
    publishedDocument = null;
    document = { ...document, status: "draft", review: null };
  } else if (request.action === "archive") {
    archivedAt = now;
  } else if (request.action === "restore") {
    archivedAt = null;
  }
  try {
    const updated = await db.prepare(`UPDATE articles SET slug = ?, document = ?, published_document = ?, published_at = ?, revision = revision + 1, archived_at = ?, updated_at = ?
      WHERE id = ? AND revision = ? RETURNING *`).bind(document.slug, JSON.stringify(document), publishedDocument, publishedAt, archivedAt, now, id, request.revision).first<ArticleRow>();
    if (!updated) throw new ArticleStoreError("This article changed in another tab. Reload it before continuing so no work is overwritten.", 409, [], "REVISION_CONFLICT");
    return storedArticleFromRow(updated);
  } catch (error) { return uniqueConflict(error); }
}
