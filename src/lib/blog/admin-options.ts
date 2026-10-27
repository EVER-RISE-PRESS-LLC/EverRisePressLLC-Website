import "server-only";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getAllArticles } from "./catalog";
export async function articleEditorOptions(currentSlug?: string) {
  const { env } = await getCloudflareContext({ async: true });
  const [authors, articles] = await Promise.all([env.DB.prepare("SELECT name,slug FROM authors ORDER BY name ASC").all<{ name: string; slug: string }>(), getAllArticles()]);
  return { authors: authors.results || [], otherArticles: articles.filter(article => article.slug !== currentSlug).map(({ slug, title }) => ({ slug, title })) };
}
