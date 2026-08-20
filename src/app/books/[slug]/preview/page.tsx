import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/db/client";
import { books, authors, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import GatedReaderClient from "./GatedReaderClient";

export const dynamic = "force-dynamic";

export default async function BookPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDatabase();

  const book = await db
    .select()
    .from(books)
    .where(eq(books.slug, slug))
    .limit(1)
    .then((rows) => rows[0]);

  if (!book) notFound();

  const author = await db
    .select()
    .from(authors)
    .where(eq(authors.id, book.authorId))
    .limit(1)
    .then((rows) => rows[0]);

  const formats = await db
    .select()
    .from(bookFormats)
    .where(eq(bookFormats.bookId, book.id));

  return (
    <GatedReaderClient
      bookSlug={book.slug}
      bookTitle={book.title}
      bookSubtitle={book.subtitle}
      bookCoverUrl={book.coverImageUrl}
      chapterTitle={book.chapterOneTitle}
      chapterBody={book.chapterOneBody}
      authorName={author?.name || "Unknown"}
      authorSlug={author?.slug || ""}
      purchaseUrl={formats[0]?.purchaseUrl || ""}
      retailPrice={formats[0]?.retailPrice || 0}
    />
  );
}
