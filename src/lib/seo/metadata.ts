import type { Metadata } from "next";
import { BRAND_NAME, SITE_URL } from "./ids";
import { seoRegistry, type SeoPageType } from "./registry";

/**
 * Build a Next.js Metadata object from the registry entry for a page type.
 * One content-type registration drives title, description, canonical,
 * OpenGraph, Twitter, and robots — no per-page hand wiring.
 */
export function buildMetadata(type: SeoPageType, data?: unknown): Metadata {
  const meta = seoRegistry[type].metadata(data ?? {});

  const title = meta.title.includes(BRAND_NAME)
    ? meta.title
    : `${meta.title} | ${BRAND_NAME}`;

  const ogImages = meta.imageUrl
    ? [
        {
          url: meta.imageUrl,
          width: 1200,
          height: 630,
          alt: meta.imageAlt ?? meta.title,
        },
        ...(meta.extraOgImages ?? []),
      ]
    : [{ url: `${SITE_URL}/images/og/everrise-default.png`, width: 1200, height: 630, alt: BRAND_NAME }];

  return {
    title,
    description: meta.description,
    alternates: meta.noindex ? {} : { canonical: `${SITE_URL}${meta.canonicalPath}` },
    ...(meta.author ? { authors: [meta.author] } : {}),
    openGraph: {
      url: `${SITE_URL}${meta.canonicalPath}`,
      siteName: BRAND_NAME,
      type: meta.ogType ?? "website",
      ...(meta.ogType === "article" ? { publishedTime: meta.publishedTime, modifiedTime: meta.modifiedTime, authors: meta.author ? [meta.author.url] : undefined } : {}),
      title: meta.ogTitle ?? meta.title,
      description: meta.ogDescription ?? meta.description,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.twitterTitle ?? meta.ogTitle ?? meta.title,
      description:
        meta.twitterDescription ?? meta.ogDescription ?? meta.description,
      images: [meta.imageUrl ?? `${SITE_URL}/images/og/everrise-default.png`],
    },
    ...(meta.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
