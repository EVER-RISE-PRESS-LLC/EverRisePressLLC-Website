import { getDatabase } from "@/lib/db/client";
import { authors, bookFormats, books } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_SITE_URL;
  const db = await getDatabase();

  const [bookRows, authorRows] = await Promise.all([
    db
      .select({
        slug: books.slug,
        title: books.title,
        subtitle: books.subtitle,
        synopsis: books.synopsis,
      })
      .from(books)
      .orderBy(asc(books.publishedAt)),
    db
      .select({ slug: authors.slug, name: authors.name, title: authors.title })
      .from(authors),
  ]);

  const formats = await db
    .select({
      bookSlug: books.slug,
      formatType: bookFormats.formatType,
      retailPrice: bookFormats.retailPrice,
      distributor: bookFormats.distributor,
    })
    .from(bookFormats)
    .innerJoin(books, eq(bookFormats.bookId, books.id));

  const formatsByBook = new Map<string, typeof formats>();
  for (const format of formats) {
    const list = formatsByBook.get(format.bookSlug) ?? [];
    const isDuplicate = list.some(
      (f) => f.formatType === format.formatType && f.retailPrice === format.retailPrice
    );
    if (!isDuplicate) list.push(format);
    formatsByBook.set(format.bookSlug, list);
  }

  const bookLines = bookRows
    .map((book) => {
      const bookFormatsList = formatsByBook.get(book.slug) ?? [];
      const formatsSummary = bookFormatsList
        .map((f) => `${f.formatType.charAt(0) + f.formatType.slice(1).toLowerCase()} ($${f.retailPrice})`)
        .join(", ");
      const synopsis = book.synopsis
        .replace(/\s+/g, " ")
        .slice(0, 280)
        .trim();
      return [
        `### ${book.title}${book.subtitle ? ` — ${book.subtitle}` : ""}`,
        `- Slug: ${book.slug}`,
        `- URL: ${baseUrl}/books/${book.slug}`,
        `- Formats: ${formatsSummary || "Coming soon"}`,
        `- Free sample: ${baseUrl}/books/${book.slug}/preview`,
        `- About: ${synopsis}`,
      ].join("\n");
    })
    .join("\n\n");

  const authorLines = authorRows
    .map(
      (author) =>
        `### ${author.name}${author.title ? `, ${author.title}` : ""}\n- URL: ${baseUrl}/authors/${author.slug}`
    )
    .join("\n\n");

  const markdown = `# EverRise Press LLC

> Modern independent publishing house founded by Lamont D. McLeod. Debut title: *How To Have a Financial Heart Attack*.

## Catalog

${bookLines || "No books published yet."}

## Authors

${authorLines || "No authors listed."}

## Publisher

- Publisher: EverRise Press LLC
- Founder: Lamont D. McLeod
- Homepage: ${baseUrl}
- Privacy policy: ${baseUrl}/privacy
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
