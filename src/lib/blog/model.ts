import { z } from "zod";

const text = z.string().trim().min(1);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const timestamp = z.string().datetime({ offset: true });
const link = z.string().refine(value => {
  if (/[\\\s]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("..")) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "Use a site path or HTTPS URL");
const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text }).strict(),
  z.object({ type: z.literal("heading"), id: slug, text }).strict(),
  z.object({ type: z.literal("list"), ordered: z.boolean().default(false), items: z.array(text).min(1) }).strict(),
  z.object({ type: z.literal("quote"), text, attribution: text, sourceId: slug }).strict(),
  z.object({ type: z.literal("table"), caption: text, columns: z.array(text).min(2), rows: z.array(z.array(text)).min(1) }).strict(),
]);

export const articleSchema = z.object({
  slug,
  status: z.enum(["draft", "published"]),
  title: text.max(90),
  description: text.min(70).max(200),
  section: text,
  author: z.object({ type: z.enum(["Person", "Organization"]), name: text, url: link, confirmed: z.boolean() }).strict(),
  publishedAt: timestamp.nullable(),
  updatedAt: timestamp.nullable(),
  review: z.object({ by: text, at: timestamp }).strict().nullable(),
  imageUrl: z.string().regex(/^\/images\/[^\s]+\.(?:png|jpe?g)$/),
  imageAlt: text,
  blocks: z.array(blockSchema),
  sources: z.array(z.object({ id: slug, title: text, url: z.string().url().startsWith("https://") }).strict()),
  relatedSlugs: z.array(slug),
  editorialNotes: text,
}).strict().superRefine((article, ctx) => {
  const issue = (message: string) => ctx.addIssue({ code: "custom", message });
  if (article.status === "published") {
    if (!article.publishedAt || !article.updatedAt || !article.review || !article.author.confirmed) issue("Publication requires dates, a recorded review, and a confirmed byline");
    if (article.blocks.length < 2 || !article.blocks.some(b => b.type === "paragraph")) issue("Publication requires article content");
    if (!article.sources.length) issue("Publication requires supporting sources");
  }
  if (article.publishedAt && article.updatedAt && Date.parse(article.updatedAt) < Date.parse(article.publishedAt)) issue("Update date cannot precede publication");
  if (article.review && article.updatedAt && Date.parse(article.review.at) < Date.parse(article.updatedAt)) issue("Review must cover the latest content update");
  const headings = article.blocks.filter(b => b.type === "heading").map(b => b.id);
  if (new Set(headings).size !== headings.length || headings.some(id => ["sources", "related-reading", "article-title", "page-content"].includes(id) || id.startsWith("source-"))) issue("Heading anchors must be unique and cannot use reserved IDs");
  const sources = new Set(article.sources.map(s => s.id));
  if (sources.size !== article.sources.length) issue("Source IDs must be unique");
  for (const block of article.blocks) {
    if (block.type === "table" && block.rows.some(row => row.length !== block.columns.length)) issue("Each table row must match its column count");
    if (block.type === "quote" && !sources.has(block.sourceId)) issue("Quotes must point to a listed source");
  }
});

export type BlogArticle = z.infer<typeof articleSchema>;
export type ArticleBlock = BlogArticle["blocks"][number];

export function parseArticleCatalog(value: unknown): BlogArticle[] {
  const articles = z.array(articleSchema).parse(value);
  const slugs = new Set(articles.map(article => article.slug));
  if (slugs.size !== articles.length) throw new Error("Article slugs must be unique");
  for (const article of articles) {
    if (article.relatedSlugs.some(related => related === article.slug || !slugs.has(related))) throw new Error(`Invalid related reading for ${article.slug}`);
  }
  return articles;
}

/** The same publication gate drives routes, navigation, sitemap and discovery. */
export function publishedArticles(articles: BlogArticle[], now = Date.now()): BlogArticle[] {
  return articles.filter(article => article.status === "published" && article.author.confirmed && article.review && article.publishedAt && article.updatedAt
    && [article.publishedAt, article.updatedAt, article.review.at].every(date => Date.parse(date) <= now))
    .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!) || a.slug.localeCompare(b.slug));
}

export function articleWordCount(article: BlogArticle): number {
  return article.blocks.flatMap(block => block.type === "table" ? [block.caption, ...block.columns, ...block.rows.flat()] : block.type === "list" ? block.items : [block.text]).join(" ").trim().split(/\s+/).filter(Boolean).length;
}
