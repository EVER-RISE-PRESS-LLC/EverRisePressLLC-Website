import { z } from "zod";
import { cleanContentHtml, contentPlainText } from "../content-html.ts";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const timestamp = z.string().datetime({ offset: true });
const draftText = (max: number) => z.string().trim().max(max).default("");
const nonempty = z.string().trim().min(1);
const slug = z.string().max(120).regex(slugPattern, "Use lowercase letters, numbers, and single hyphens for the article address");

export function isSafeArticleLink(value: string) {
  if (!value || /[\\\s\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("..")) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}
export function isSafeArticleImage(value: string) {
  return isSafeArticleLink(value) && (/^\/media\/[a-zA-Z0-9-]+$/.test(value) || /^\/images\//.test(value) || value.startsWith("https://"));
}

const dimension = z.number().int().positive().max(100_000).optional();
export const articleBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: draftText(30_000) }).strict(),
  z.object({ type: z.literal("heading"), id: draftText(120), text: draftText(500) }).strict(),
  z.object({ type: z.literal("list"), ordered: z.boolean().default(false), items: z.array(z.string().max(10_000)).max(200).default([]) }).strict(),
  z.object({ type: z.literal("quote"), text: draftText(10_000), attribution: draftText(500), sourceId: draftText(120) }).strict(),
  z.object({ type: z.literal("table"), caption: draftText(1000), columns: z.array(z.string().max(1000)).max(30).default([]), rows: z.array(z.array(z.string().max(10_000)).max(30)).max(300).default([]) }).strict(),
  z.object({ type: z.literal("richtext"), html: z.string().max(180_000).transform(cleanContentHtml) }).strict(),
  z.object({ type: z.literal("image"), src: draftText(2048), alt: draftText(500), caption: z.string().trim().max(2000).optional(), width: dimension, height: dimension }).strict(),
]);

/** Drafts may be incomplete. Publication applies the stricter gate below. */
export const articleDraftSchema = z.object({
  slug: draftText(120),
  status: z.enum(["draft", "published"]).default("draft"),
  title: draftText(180),
  description: draftText(1000),
  section: draftText(100),
  author: z.object({ type: z.enum(["Person", "Organization"]).default("Organization"), name: draftText(200), url: draftText(2048), confirmed: z.boolean().default(false) }).strict().default({ type: "Organization", name: "EverRise Press", url: "/about", confirmed: false }),
  publishedAt: timestamp.nullable().default(null),
  updatedAt: timestamp.nullable().default(null),
  review: z.object({ by: nonempty.max(200), at: timestamp }).strict().nullable().default(null),
  imageUrl: draftText(2048),
  imageAlt: draftText(500),
  imageWidth: dimension,
  imageHeight: dimension,
  blocks: z.array(articleBlockSchema).max(200).default([]),
  sources: z.array(z.object({ id: draftText(120), title: draftText(500), url: draftText(2048) }).strict()).max(100).default([]),
  relatedSlugs: z.array(z.string().max(120)).max(50).default([]),
  editorialNotes: draftText(12_000),
}).strict();

export const articleSchema = articleDraftSchema.superRefine((article, ctx) => {
  const issue = (message: string, path?: (string | number)[]) => ctx.addIssue({ code: "custom", message, path });
  const published = article.status === "published";
  if (article.slug && !slugPattern.test(article.slug)) issue("Use lowercase letters, numbers, and single hyphens for the article address", ["slug"]);
  if (published) {
    if (!article.slug) issue("Choose an article address before publishing", ["slug"]);
    if (!article.title || article.title.length > 90) issue("Add an article title of 1–90 characters", ["title"]);
    if (article.description.length < 70 || article.description.length > 200) issue("Add a description of 70–200 characters", ["description"]);
    if (!article.section) issue("Choose an article section", ["section"]);
    if (!article.author.name || !isSafeArticleLink(article.author.url) || !article.author.confirmed) issue("Confirm the byline and add its name and a valid profile address", ["author"]);
    if (!article.publishedAt || !article.updatedAt || !article.review) issue("Publication requires dates and a recorded review", ["review"]);
    if (!isSafeArticleImage(article.imageUrl) || !article.imageAlt) issue("Choose a cover image and describe it for readers using assistive technology", ["imageUrl"]);
    if (articleBodyText(article).length < 80 || !article.blocks.some(block => (block.type === "paragraph" && block.text.length >= 20) || (block.type === "richtext" && contentPlainText(block.html).length >= 20))) issue("Add the finished article text before publishing", ["blocks"]);
    if (!article.sources.length) issue("Add supporting sources before publishing", ["sources"]);
  }
  // An explicitly supplied unsafe byline is rejected even in a draft, so it
  // cannot become an executable preview link. Empty draft metadata is allowed.
  if (article.author.url && !isSafeArticleLink(article.author.url)) issue("Use a site path or HTTPS address for the byline", ["author", "url"]);
  if (article.imageUrl && !isSafeArticleImage(article.imageUrl)) issue("Choose an uploaded image, an /images/ path, or an HTTPS image", ["imageUrl"]);
  if (article.publishedAt && article.updatedAt && Date.parse(article.updatedAt) < Date.parse(article.publishedAt)) issue("Update date cannot precede publication");
  if (article.review && article.updatedAt && Date.parse(article.review.at) < Date.parse(article.updatedAt)) issue("Review must cover the latest content update");
  const headings = article.blocks.filter(block => block.type === "heading").map(block => block.id);
  if (published && (new Set(headings).size !== headings.length || headings.some(id => !slugPattern.test(id) || ["sources", "related-reading", "article-title", "page-content"].includes(id) || id.startsWith("source-")))) issue("Heading anchors must be unique and cannot use reserved IDs");
  const sourceIds = article.sources.map(source => source.id);
  if (published && (new Set(sourceIds).size !== sourceIds.length || sourceIds.some(id => !slugPattern.test(id)))) issue("Give each source a unique identifier", ["sources"]);
  for (const source of article.sources) {
    if (published && (!source.title || !source.url.startsWith("https://") || !isSafeArticleLink(source.url))) issue("Give every source a title and an HTTPS address", ["sources"]);
  }
  if (published && (new Set(article.relatedSlugs).size !== article.relatedSlugs.length || article.relatedSlugs.some(related => !slugPattern.test(related) || related === article.slug))) issue("Related articles must have unique valid addresses and cannot refer to this article");
  for (const block of article.blocks) {
    if (block.type === "table" && published && (block.columns.length < 2 || !block.caption || !block.rows.length || block.rows.some(row => row.length !== block.columns.length))) issue("Each table needs a caption, at least two columns, and matching cells in every row");
    if (block.type === "quote" && published && (!block.text || !block.attribution || !sourceIds.includes(block.sourceId))) issue("Quotes need an attribution and a listed source");
    if (block.type === "image" && ((block.src && !isSafeArticleImage(block.src)) || (published && (!block.src || !block.alt)))) issue("Each article image needs a safe address and alternative text");
    if (published && block.type === "richtext" && /<img\b[^>]*>/i.test(block.html)) {
      for (const image of block.html.matchAll(/<img\b([^>]*)>/gi)) {
        if (!/\balt="[^"\s][^"]*"/i.test(image[1])) issue("Describe every image in the article with alternative text", ["blocks"]);
      }
    }
  }
});

export type BlogArticle = z.infer<typeof articleDraftSchema>;
export type ArticleBlock = BlogArticle["blocks"][number];
export type StoredArticle = BlogArticle & {
  id: string;
  revision: number;
  isLive: boolean;
  hasUnpublishedChanges: boolean;
  everPublishedAt: string | null;
  createdAt: string;
  savedAt: string;
  archivedAt: string | null;
};

export function createEmptyArticle(): BlogArticle { return articleDraftSchema.parse({ imageUrl: "/images/og/everrise-default.png", imageAlt: "EverRise Press" }); }
export function articleDocument(article: BlogArticle | StoredArticle): BlogArticle { return articleDraftSchema.strip().parse(article); }

export function parseArticleCatalog(value: unknown): BlogArticle[] {
  const articles = z.array(articleSchema).parse(value);
  const slugs = new Set(articles.map(article => article.slug));
  if (slugs.size !== articles.length) throw new Error("Article slugs must be unique");
  for (const article of articles) {
    if (article.relatedSlugs.some(related => related === article.slug || !slugs.has(related))) throw new Error(`Invalid related reading for ${article.slug}`);
  }
  return articles;
}

/** Public routes read the published snapshot, never the saved draft. */
export function publishedArticles(articles: BlogArticle[], now = Date.now()): BlogArticle[] {
  return articles.filter(article => articleSchema.safeParse(article).success && article.status === "published" && article.author.confirmed && article.review && article.publishedAt && article.updatedAt
    && [article.publishedAt, article.updatedAt, article.review.at].every(date => Date.parse(date) <= now))
    .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!) || a.slug.localeCompare(b.slug));
}

export function articleBodyText(article: Pick<BlogArticle, "blocks">): string {
  return article.blocks.flatMap(block => {
    switch (block.type) {
      case "table": return [block.caption, ...block.columns, ...block.rows.flat()];
      case "list": return block.items;
      case "richtext": return [contentPlainText(block.html)];
      case "image": return block.caption ? [block.caption] : [];
      default: return [block.text];
    }
  }).join(" ").trim();
}
export function articleWordCount(article: BlogArticle): number { return articleBodyText(article).split(/\s+/).filter(Boolean).length; }
export { slug as articleSlugSchema };
