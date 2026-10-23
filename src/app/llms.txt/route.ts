import { getDatabase } from "@/lib/db/client";
import { authors, books } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/seo/ids";
import { seoPageTypes, seoRegistry } from "@/lib/seo/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDatabase();

  // Registry-driven sections (## Catalog from the book type, ## Authors
  // from the author type). New content types contribute automatically.
  const sections: string[] = [];
  for (const type of seoPageTypes) {
    const entry = seoRegistry[type];
    if (!entry.llmsSection) continue;
    const section = await entry.llmsSection(db);
    if (section) sections.push(section);
  }

  // Per-entity @id references for AI crawlers that want deep links into
  // the knowledge graph (see /schema.json for the full assembled graph).
  const [bookRows, authorRows] = await Promise.all([
    db.select({ slug: books.slug, title: books.title }).from(books),
    db.select({ slug: authors.slug, name: authors.name }).from(authors),
  ]);

  const entityLines = [
    `- Knowledge graph (all entities, one fetch): ${SITE_URL}/schema.json`,
    `- Schemamap (schema endpoint discovery): ${SITE_URL}/schemamap.xml`,
    `- API catalog (RFC 9727): ${SITE_URL}/.well-known/api-catalog`,
    `- Organization: ${SITE_URL}/#organization`,
    `- WebSite: ${SITE_URL}/#website`,
    ...bookRows.map(
      (book) => `- Book "${book.title}": ${SITE_URL}/books/${book.slug}#book`
    ),
    ...authorRows.map(
      (author) => `- Person "${author.name}": ${SITE_URL}/authors/${author.slug}#person`
    ),
  ];

  const markdown = `# EverRise Press LLC

> Independent publishing house founded by Lamont D. McLeod. Featured book: *How To Have a Financial Heart Attack*.

${sections.join("\n\n")}

## Publisher

- Publisher: EverRise Press LLC
- Founder: Lamont D. McLeod
- Homepage: ${SITE_URL}
- Privacy policy: ${SITE_URL}/privacy

## Schema

${entityLines.join("\n")}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
