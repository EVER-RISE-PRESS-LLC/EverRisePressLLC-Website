import { makeIds } from "@jdevalk/seo-graph-core";
import { env } from "@/lib/env";

/**
 * Canonical site base URL. Single source of truth for every absolute URL
 * emitted by the SEO system — no other file may hardcode the domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_SITE_URL
).replace(/\/+$/, "");

/** Publisher brand name used across schema + metadata. */
export const BRAND_NAME = "EverRise Press";

/** Raw @jdevalk/seo-graph-core IdFactory (URL-shaping helpers). */
const factory = makeIds({ siteUrl: SITE_URL });

/**
 * Site-wide, stable @id system for the SEO knowledge graph.
 *
 * Convention (documented in docs/seo-system.md):
 * - Site-wide singletons are fragments on the site root or collection root.
 * - Per-entity nodes are fragments on their canonical page URL.
 *
 * Library piece builders (buildWebSite, buildWebPage, ...) receive
 * `ids.factory` and compute their own @ids (WebPage = canonical URL,
 * BreadcrumbList = `${url}#breadcrumb`, Article = `${url}#article`,
 * PrimaryImage = `${url}#primaryimage`).
 */
export const seoIds = {
  /** Organization entity for the publishing house. */
  organization: `${SITE_URL}/#organization`,
  /** WebSite entity for everrisepress.com. */
  website: `${SITE_URL}/#website`,
  /** Blog collection entity (pre-wired for the future /blog). */
  blog: `${SITE_URL}/blog/#blog`,
  /** Book entity, keyed by book slug. */
  book: (slug: string) => `${SITE_URL}/books/${slug}#book`,
  /** Person entity, keyed by author slug. */
  person: (slug: string) => `${SITE_URL}/authors/${slug}#person`,

  factory,
  webPage: (url: string) => factory.webPage(url),
  breadcrumb: (url: string) => factory.breadcrumb(url),
  article: (url: string) => factory.article(url),
  primaryImage: (url: string) => factory.primaryImage(url),
};

export type SeoIds = typeof seoIds;
