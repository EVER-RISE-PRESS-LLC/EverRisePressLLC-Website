import type { MetadataRoute } from "next";
import { getDatabase } from "@/lib/db/client";
import { SITE_URL } from "@/lib/seo/ids";
import { seoRegistry, type SeoPageType } from "@/lib/seo/registry";

export const dynamic = "force-dynamic";

/**
 * Iteration order for registry-driven sitemap entries. Ordering is
 * cosmetic (search engines ignore it) but kept stable: home + privacy
 * first, then content types.
 */
const SITEMAP_TYPE_ORDER: SeoPageType[] = [
  "home",
  "privacy",
  "book",
  "author",
  "article",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDatabase();

  const entries: MetadataRoute.Sitemap = [];

  for (const type of SITEMAP_TYPE_ORDER) {
    const entry = seoRegistry[type];
    if (!entry.sitemapEntries) continue;

    const items = await entry.sitemapEntries(db);
    for (const item of items) {
      entries.push({
        url: `${SITE_URL}${item.path}`,
        ...(item.lastModified && !Number.isNaN(Date.parse(item.lastModified))
          ? { lastModified: new Date(item.lastModified) }
          : {}),
        ...(item.changeFrequency
          ? { changeFrequency: item.changeFrequency }
          : {}),
        ...(item.priority !== undefined ? { priority: item.priority } : {}),
      });
    }
  }

  return entries;
}
