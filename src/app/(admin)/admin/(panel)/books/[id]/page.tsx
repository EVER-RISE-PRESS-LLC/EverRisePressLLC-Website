import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/db/client";
import { authors, bookFormats, books } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { BookEditorClient } from "@/components/admin/books/BookEditorClient";

export const dynamic = "force-dynamic";

export default async function AdminBookEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDatabase();

  const book = await db
    .select()
    .from(books)
    .where(eq(books.id, id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!book) notFound();

  const formats = await db
    .select({
      id: bookFormats.id,
      formatType: bookFormats.formatType,
      isbn: bookFormats.isbn,
      retailPrice: bookFormats.retailPrice,
      currency: bookFormats.currency,
      distributor: bookFormats.distributor,
      purchaseUrl: bookFormats.purchaseUrl,
    })
    .from(bookFormats)
    .where(eq(bookFormats.bookId, id));

  const authorOptions = await db
    .select({ id: authors.id, name: authors.name })
    .from(authors)
    .orderBy(asc(authors.name));

  return (
    <BookEditorClient
      bookId={book.id}
      book={{
        slug: book.slug,
        title: book.title,
        subtitle: book.subtitle,
        synopsis: book.synopsis,
        coverImageUrl: book.coverImageUrl,
        chapterOneTitle: book.chapterOneTitle,
        chapterOneBody: book.chapterOneBody,
        authorId: book.authorId,
        publishedAt: book.publishedAt,
      }}
      formats={formats.map((f) => ({
        id: f.id,
        formatType: f.formatType as
          | "EBOOK"
          | "PAPERBACK"
          | "HARDCOVER"
          | "AUDIOBOOK",
        isbn: f.isbn ?? "",
        retailPrice: f.retailPrice,
        currency: f.currency,
        distributor: f.distributor as
          | "AMAZON_KDP"
          | "DRAFT2DIGITAL"
          | "INGRAMSPARK"
          | "APPLE_BOOKS"
          | "BARNES_AND_NOBLE"
          | "KOBO"
          | "BOOKSHOP_ORG",
        purchaseUrl: f.purchaseUrl,
      }))}
      authors={authorOptions}
    />
  );
}
