import "server-only";
import rawArticles from "@/content/blog/articles.json";
import { parseArticleCatalog, publishedArticles } from "./model";

const articles = parseArticleCatalog(rawArticles);
export function getAllArticles() { return articles; }
export function getPublishedArticles() { return publishedArticles(articles); }
export function getPublishedArticle(slug: string) { return getPublishedArticles().find(article => article.slug === slug); }
