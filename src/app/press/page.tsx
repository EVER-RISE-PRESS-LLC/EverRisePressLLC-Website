import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import SeoJsonLd from "@/components/seo/SeoJsonLd";
import SiteImage from "@/components/ui/SiteImage";
import { buildMetadata } from "@/lib/seo/metadata";
import { getDatabase } from "@/lib/db/client";
import { books, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AUTHOR_SITE, BOOK_PATH, PUBLISHER_CONTACT } from "@/lib/publisher";
import { BOOK_CONTENT_REVIEW_DATE, FORMAT_LABELS, uniqueEditions } from "@/lib/book-editorial";
import { getPublishedArticles } from "@/lib/blog/catalog";
import BookReadingLinks from "@/components/marketing/BookReadingLinks";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata("press");
export default async function PressPage() {
  const db = await getDatabase();
  const [book] = await db.select().from(books).where(eq(books.slug, "how-to-have-a-financial-heart-attack")).limit(1);
  const formats = book ? uniqueEditions(await db.select().from(bookFormats).where(eq(bookFormats.bookId, book.id))) : [];
  const readingResources = await getPublishedArticles();
  const discussionGuide = readingResources.find(article => article.slug === "financial-heart-attack-book-club-guide");
  return <main id="page-content" tabIndex={-1} className="bg-cream text-charcoal"><Navbar /><SeoJsonLd type="press" />
    <article className="mx-auto max-w-5xl px-6 pb-24 pt-28 md:pt-36">
      <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight md:text-5xl">Press and book information</h1>
      <p className="mt-6 max-w-3xl text-xl leading-relaxed">Book details, author background and publisher contacts for readers, reviewers, libraries, podcasts and reading groups.</p>
      <div className="mt-12 grid items-start gap-10 md:grid-cols-[200px_minmax(0,1fr)]">
        <div>{book && <SiteImage src={book.coverImageUrl} alt={`${book.title} book cover`} width={400} height={600} sizes="200px" className="mx-auto h-auto w-44 md:w-full" />}</div>
        <section aria-labelledby="press-book-title"><h2 id="press-book-title" className="font-heading text-3xl font-semibold">{book?.title || "How To Have a Financial Heart Attack"}</h2>{book?.subtitle && <p className="mt-3 text-lg italic">{book.subtitle}</p>}<p className="mt-5 leading-relaxed">Lamont D. McLeod looks back at childhood spending, his first paychecks, moving to Atlanta and working in debt collection. The book follows his experience of repeating choices while hearing advice about money. It invites reflection through a personal story.</p>
          <dl className="mt-6 space-y-3 text-base leading-relaxed"><div><dt className="font-semibold">Author</dt><dd><Link href="/authors/lamont-mcleod" className="underline">Lamont D. McLeod</Link></dd></div><div><dt className="font-semibold">Language</dt><dd>English</dd></div>{book?.publishedAt && <div><dt className="font-semibold">Publication date</dt><dd>{new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(book.publishedAt))}</dd></div>}{formats.map(format => <div key={format.formatType}><dt className="font-semibold">{FORMAT_LABELS[format.formatType] || format.formatType} ISBN</dt><dd>{format.isbn || "Ask the publisher"}</dd></div>)}</dl>
          <p className="mt-6"><Link href={BOOK_PATH} className="inline-flex min-h-11 items-center underline">Book details, formats and retailer links</Link></p><p className="mt-3 text-sm text-text-muted">Edition identifiers checked <time dateTime={BOOK_CONTENT_REVIEW_DATE}>October 31, 2026</time>. Check each retailer for current price and availability.</p>
        </section>
      </div>
      <section className="mt-14 border-t border-charcoal/20 pt-9"><h2 className="font-heading text-2xl font-semibold">About the author and publisher</h2><p className="mt-4 max-w-3xl leading-relaxed">Lamont D. McLeod is the author of the book and founder of EverRise Press. His wider work includes real estate, home care and public speaking. His <Link href="/authors/lamont-mcleod" className="underline">author profile</Link> contains the approved biography and links to his work.</p><p className="mt-4 max-w-3xl leading-relaxed">EverRise Press uses publishing and distribution services through HMD Publishing. The book’s edition credits and the publisher’s service relationship are explained on the <Link href="/about" className="underline">About and contact page</Link>.</p><a href={AUTHOR_SITE} className="mt-4 inline-flex min-h-11 items-center underline">Lamont D. McLeod’s official website</a></section>
      <section className="mt-12 border-t border-charcoal/20 pt-9"><h2 className="font-heading text-2xl font-semibold">Cover and author files</h2><p className="mt-4 max-w-3xl leading-relaxed">Download the files supplied for this website. Contact the publisher about reuse permissions and the credits required for your coverage.</p><ul className="mt-4 space-y-2"><li>{book && <a href={book.coverImageUrl} download className="inline-flex min-h-11 items-center underline">Download the book cover</a>}</li><li><a href="/images/authors/lamont-mcleod.jpg" download className="inline-flex min-h-11 items-center underline">Download Lamont D. McLeod’s portrait</a></li></ul></section>
      <section className="mt-12 border-t border-charcoal/20 pt-9"><h2 className="font-heading text-2xl font-semibold">Interviews, coverage and corrections</h2><p className="mt-4 max-w-3xl leading-relaxed">Send the topic, publication or programme, proposed date and the information you need to <a href={`mailto:${PUBLISHER_CONTACT}`} className="underline">{PUBLISHER_CONTACT}</a>. The publisher can respond about availability, review copies, permissions and factual corrections.</p><p className="mt-4 max-w-3xl leading-relaxed">{discussionGuide && <>For a reading group, start with the <Link href={`/blog/${discussionGuide.slug}`} className="underline">book club discussion guide</Link>. </>}To sample the author’s voice, <Link href={`${BOOK_PATH}/preview`} className="underline">read Chapter 1 free with email signup</Link>.</p></section>
      {readingResources.length > 0 && <section className="mt-12 border-t border-charcoal/20 pt-9" aria-labelledby="press-reading-title"><h2 id="press-reading-title" className="font-heading text-2xl font-semibold">Free resources for readers and groups</h2><p className="mt-4 max-w-3xl leading-relaxed">Use these articles and printable resources without signup. The discussion guide contains spoilers; the first-chapter sample has its own email signup.</p><BookReadingLinks articles={readingResources} /></section>}
    </article><SiteFooter /></main>;
}
