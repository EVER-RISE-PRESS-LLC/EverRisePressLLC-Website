import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo/ids";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { CHAPTER_ACCESS_COOKIE, hasChapterAccess } from "@/lib/chapter-access";
import { getDatabase } from "@/lib/db/client";
import { books, authors, bookFormats } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { REFERRAL_COOKIE_NAME } from "@/lib/referral";
import GatedReaderClient from "./GatedReaderClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDatabase();
  const [book] = await db.select({ title: books.title }).from(books).where(eq(books.slug, slug)).limit(1);
  if (!book) notFound();
  return {
    title: `Read Chapter 1 of ${book.title} | EverRise Press`,
    description: "Read the first chapter free with email signup, then explore the full book and available editions.",
    alternates: { canonical: `${SITE_URL}/books/${slug}/preview` },
    robots: { index: false, follow: true },
  };
}

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

  // The priced CTA names the specific US eBook listing checked on 2026-10-24.
  const [appleEbook] = await db.select().from(bookFormats).where(and(
    eq(bookFormats.bookId, book.id),
    eq(bookFormats.formatType, "EBOOK"),
    eq(bookFormats.distributor, "APPLE_BOOKS"),
    eq(bookFormats.currency, "USD"),
  )).limit(1);
  const ebookOffer = appleEbook ? {
    purchaseUrl: appleEbook.purchaseUrl,
    price: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(appleEbook.retailPrice),
  } : null;

  const cookieStore = await cookies();
  const partnerSlug = cookieStore.get(REFERRAL_COOKIE_NAME)?.value ?? null;
  const { env } = await getCloudflareContext({ async: true });
  const hasAccess = await hasChapterAccess(
    cookieStore.get(CHAPTER_ACCESS_COOKIE)?.value,
    book.slug,
    env.JWT_SECRET || process.env.JWT_SECRET,
  );

  return (
    <GatedReaderClient
      bookSlug={book.slug}
      bookTitle={book.title}
      bookSubtitle={book.subtitle}
      bookCoverUrl={book.coverImageUrl}
      chapterTitle={book.chapterOneTitle}
      chapterBody={hasAccess ? book.chapterOneBody : ""}
      hasAccess={hasAccess}
      authorName={author?.name || "Unknown"}
      authorSlug={author?.slug || ""}
      ebookOffer={ebookOffer}
      partnerSlug={partnerSlug}
    />
  );
}
