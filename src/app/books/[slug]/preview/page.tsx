import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/db/client";
import { books, authors } from "@/lib/db/schema";
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

  return (
    <div className="bg-cream text-charcoal min-h-screen">
      {/* Header */}
      <header className="bg-charcoal py-6">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="EverRise Press"
              width={32}
              height={32}
            />
            <span className="text-cream font-heading text-lg">EverRise Press</span>
          </Link>
          <Link
            href={`/books/${book.slug}`}
            className="text-gold font-sans text-sm uppercase tracking-wider hover:text-gold-hover transition-colors"
          >
            Back to Book
          </Link>
        </div>
      </header>

      {/* Gated Reader */}
      <GatedReaderClient
        bookSlug={book.slug}
        bookTitle={book.title}
        chapterTitle={book.chapterOneTitle}
        chapterBody={book.chapterOneBody}
        authorName={author?.name || "Unknown"}
        authorSlug={author?.slug || ""}
      />
    </div>
  );
}
