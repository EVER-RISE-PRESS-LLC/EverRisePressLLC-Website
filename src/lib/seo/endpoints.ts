import { getPublishedArticles } from "@/lib/blog/catalog";
import { articleToSeo } from "@/lib/blog/seo";
import { assembleGraph, type GraphEntity } from "@jdevalk/seo-graph-core";
import type { Database } from "@/lib/db";
import { getDatabase } from "@/lib/db/client";
import { authors, bookFormats, books } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { seoIds } from "./ids";
import {
  blogPiece,
  buildBookPiece,
  buildPersonPiece,
  organizationPiece,
  seoRegistry,
  websitePiece,
  type AuthorSeoData,
  type BookFormatSeoData,
  type BookSeoData,
} from "./registry";

/* ------------------------------------------------------------------ */
/* Data fetchers (live D1 — new content appears with no deploys)      */
/* ------------------------------------------------------------------ */

async function fetchBooks(db: Database): Promise<BookSeoData[]> {
  const [bookRows, authorRows, formatRows] = await Promise.all([
    db.select().from(books),
    db.select().from(authors),
    db
      .select({
        bookId: books.id,
        formatType: bookFormats.formatType,
        isbn: bookFormats.isbn,
        retailPrice: bookFormats.retailPrice,
        currency: bookFormats.currency,
        purchaseUrl: bookFormats.purchaseUrl,
      })
      .from(bookFormats)
      .innerJoin(books, eq(bookFormats.bookId, books.id)),
  ]);

  const authorsById = new Map(authorRows.map((a) => [a.id, a]));
  const formatsByBook = new Map<string, BookFormatSeoData[]>();
  for (const format of formatRows) {
    const list = formatsByBook.get(format.bookId) ?? [];
    list.push({
      formatType: format.formatType,
      isbn: format.isbn,
      retailPrice: format.retailPrice,
      currency: format.currency,
      purchaseUrl: format.purchaseUrl,
    });
    formatsByBook.set(format.bookId, list);
  }

  return bookRows.map((book) => {
    const author = authorsById.get(book.authorId);
    return {
      slug: book.slug,
      title: book.title,
      subtitle: book.subtitle,
      synopsis: book.synopsis,
      coverImageUrl: book.coverImageUrl,
      publishedAt: book.publishedAt,
      updatedAt: book.updatedAt,
      formats: formatsByBook.get(book.id) ?? [],
      author: author ? { slug: author.slug, name: author.name } : null,
    };
  });
}

async function fetchAuthors(db: Database): Promise<AuthorSeoData[]> {
  const rows = await db.select().from(authors);
  return rows.map((author) => ({
    slug: author.slug,
    name: author.name,
    title: author.title,
    bio: author.bio,
    avatarUrl: author.avatarUrl,
    updatedAt: author.updatedAt,
    socialLinks: author.socialLinks as AuthorSeoData["socialLinks"],
  }));
}

/* ------------------------------------------------------------------ */
/* Endpoint piece builders                                            */
/* ------------------------------------------------------------------ */

/** Site-wide entities for published sections only. */
export async function getSitePieces(): Promise<GraphEntity[]> {
  return [organizationPiece(), websitePiece(), ...(getPublishedArticles().length ? [blogPiece()] : [])];
}

/** Every book as a full page graph (Book + WebPage + BreadcrumbList). */
export async function getBookPieces(): Promise<GraphEntity[]> {
  const db = await getDatabase();
  const bookData = await fetchBooks(db);

  const pieces: GraphEntity[] = [organizationPiece(), websitePiece()];
  for (const book of bookData) {
    pieces.push(...seoRegistry.book.buildPieces(book, seoIds));
  }
  return pieces;
}

/** Every author as a full page graph (Person + ProfilePage + BreadcrumbList). */
export async function getPersonPieces(): Promise<GraphEntity[]> {
  const db = await getDatabase();
  const authorData = await fetchAuthors(db);

  const pieces: GraphEntity[] = [organizationPiece(), websitePiece()];
  for (const author of authorData) {
    pieces.push(...seoRegistry.author.buildPieces(author, seoIds));
  }
  return pieces;
}

/** Published articles only; private briefs never reach a public endpoint. */
export async function getArticlePieces(): Promise<GraphEntity[]> {
  return [organizationPiece(), websitePiece(), ...getPublishedArticles().flatMap(article => seoRegistry.article.buildPieces(articleToSeo(article), seoIds))];
}

/** Corpus-wide graph: site entities + all Persons + all Books. */
export async function getCorpusPieces(): Promise<GraphEntity[]> {
  const db = await getDatabase();
  const [bookData, authorData] = await Promise.all([
    fetchBooks(db),
    fetchAuthors(db),
  ]);

  return [
    organizationPiece(),
    websitePiece(),
    ...authorData.map(buildPersonPiece),
    ...bookData.map(buildBookPiece),
    ...getPublishedArticles().flatMap(article => seoRegistry.article.buildPieces(articleToSeo(article), seoIds)),
  ];
}

/* ------------------------------------------------------------------ */
/* Endpoint registry — single source of truth for the discovery maps  */
/* ------------------------------------------------------------------ */

export interface SchemaEndpoint {
  /** Absolute path on the canonical origin. */
  path: string;
  /**
   * schema.org type name (without the https://schema.org/ prefix) used to
   * type the endpoint in the API catalog. `null` for corpus endpoints
   * that aggregate multiple types (listed in the maps, skipped in the
   * typed catalog section).
   */
  schemaType: string | null;
  build(): Promise<GraphEntity[]>;
}

/**
 * Every machine-readable schema endpoint on the site. `/schemamap.xml` and
 * `/.well-known/api-catalog` are derived from this list — adding a new
 * content type's endpoint here updates both maps automatically.
 */
export const SCHEMA_ENDPOINTS: SchemaEndpoint[] = [
  { path: "/schema/site.json", schemaType: "WebSite", build: getSitePieces },
  { path: "/schema/books.json", schemaType: "Book", build: getBookPieces },
  { path: "/schema/articles.json", schemaType: "BlogPosting", build: getArticlePieces },
  { path: "/schema/authors.json", schemaType: "Person", build: getPersonPieces },
  { path: "/schema.json", schemaType: null, build: getCorpusPieces },
];

/* ------------------------------------------------------------------ */
/* Response helpers                                                   */
/* ------------------------------------------------------------------ */

export function schemaJsonResponse(
  graph: ReturnType<typeof assembleGraph>,
  cacheControl = "public, max-age=300"
) {
  return new Response(JSON.stringify(graph, null, 2), {
    headers: {
      "Content-Type": "application/ld+json; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}
