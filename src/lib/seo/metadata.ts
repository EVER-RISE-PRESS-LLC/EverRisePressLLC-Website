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
    : undefined;

  return {
    title,
    description: meta.description,
    alternates: {
      canonical: `${SITE_URL}${meta.canonicalPath}`,
    },
    openGraph: {
      type: meta.ogType ?? "website",
      title: meta.ogTitle ?? meta.title,
      description: meta.ogDescription ?? meta.description,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.twitterTitle ?? meta.ogTitle ?? meta.title,
      description:
        meta.twitterDescription ?? meta.ogDescription ?? meta.description,
      ...(meta.imageUrl ? { images: [meta.imageUrl] } : {}),
    },
    ...(meta.noindex ? { robots: { index: false } } : {}),
  };
}
