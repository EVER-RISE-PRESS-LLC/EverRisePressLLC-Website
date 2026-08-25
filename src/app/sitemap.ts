import type { MetadataRoute } from "next";
import { getDatabase } from "@/lib/db/client";
import { authors, books } from "@/lib/db/schema";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_SITE_URL;
  const db = await getDatabase();

  const [bookRows, authorRows] = await Promise.all([
    db
      .select({ slug: books.slug, updatedAt: books.updatedAt })
      .from(books),
    db
      .select({ slug: authors.slug, updatedAt: authors.updatedAt })
      .from(authors),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
    },
  ];

  const bookEntries: MetadataRoute.Sitemap = bookRows.map((book) => ({
    url: `${baseUrl}/books/${book.slug}`,
    lastModified: book.updatedAt ? new Date(book.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const authorEntries: MetadataRoute.Sitemap = authorRows.map((author) => ({
    url: `${baseUrl}/authors/${author.slug}`,
    lastModified: author.updatedAt ? new Date(author.updatedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...bookEntries, ...authorEntries];
}
