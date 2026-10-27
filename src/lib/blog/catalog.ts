import "server-only";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { listStoredArticles, readPublishedArticles, readStoredArticle, readStoredArticleById } from "./store";

const database = cache(async () => (await getCloudflareContext({ async: true })).env.DB);

/** D1 is the only live catalog. Repository briefs are imported by an explicit seed. */
export const getAllArticles = cache(async (includeArchived = false) => listStoredArticles(await database(), includeArchived));
export const getArticle = cache(async (slug: string, includeArchived = false) => readStoredArticle(await database(), slug, includeArchived));
export const getArticleById = cache(async (id: string, includeArchived = false) => readStoredArticleById(await database(), id, includeArchived));
export const getPublishedArticles = cache(async () => readPublishedArticles(await database()));
export const getPublishedArticle = cache(async (slug: string) => (await getPublishedArticles()).find(article => article.slug === slug));
