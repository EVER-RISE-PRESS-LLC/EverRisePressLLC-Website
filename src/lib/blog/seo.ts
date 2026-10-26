import type { ArticleSeoData } from "@/lib/seo/registry";
import type { BlogArticle } from "./model";
import { articleWordCount } from "./model";

/** Call only after the publication gate; preview pages never emit Article schema. */
export function articleToSeo(article: BlogArticle): ArticleSeoData {
  if (!article.publishedAt || !article.updatedAt) throw new Error("Published article dates are required");
  return {
    slug: article.slug, title: article.title, description: article.description,
    publishedAt: article.publishedAt, updatedAt: article.updatedAt,
    imageUrl: article.imageUrl, imageAlt: article.imageAlt, section: article.section,
    wordCount: articleWordCount(article),
    author: { name: article.author.name, url: article.author.url, type: article.author.type },
  };
}
