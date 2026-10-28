import Image from "@/components/ui/SiteImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDatabase } from "@/lib/db/client";
import { books, authors, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildMetadata } from "@/lib/seo/metadata";
import type { BookSeoData } from "@/lib/seo/registry";
import { cleanDashes } from "@/lib/utils";
import { BOOK_CONTENT_REVIEW_DATE, FINANCIAL_HEART_ATTACK_SLUG, financialHeartAttackEditorial, FORMAT_LABELS, uniqueEditions } from "@/lib/book-editorial";
import SeoJsonLd from "@/components/seo/SeoJsonLd";
import MultiRetailerModal from "@/components/marketing/MultiRetailerModal";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ReactiveButton from "@/components/ui/ReactiveButton";
import { ArrowRight, ChevronDown } from "lucide-react";
import { getPublishedArticles } from "@/lib/blog/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDatabase();
  const [book] = await db.select().from(books).where(eq(books.slug, slug)).limit(1);
  if (!book) return { title: "Book Not Found" };
  return buildMetadata("book", { ...book, formats: [], author: null } satisfies BookSeoData);
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDatabase();
  const [book] = await db.select().from(books).where(eq(books.slug, slug)).limit(1);
  if (!book) notFound();

  const [[author], formats] = await Promise.all([
    db.select().from(authors).where(eq(authors.id, book.authorId)).limit(1),
    db.select().from(bookFormats).where(eq(bookFormats.bookId, book.id)),
  ]);
  const editorial = book.slug === FINANCIAL_HEART_ATTACK_SLUG ? financialHeartAttackEditorial : null;
  const editions = uniqueEditions(formats);
  const relatedArticles = editorial ? await getPublishedArticles() : [];
  const previewPath = `/books/${book.slug}/preview`;
  const publicationDate = book.publishedAt && !Number.isNaN(Date.parse(book.publishedAt))
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(book.publishedAt))
    : null;
  const seoBookData: BookSeoData = {
    ...book,
    formats,
    author: author ? { slug: author.slug, name: author.name } : null,
  };
  const retailerChooser = <MultiRetailerModal formats={formats} bookTitle={book.title} bookSlug={book.slug} coverImageUrl={book.coverImageUrl} triggerText="Choose a retailer" />;

  return (
    <main id="page-content" tabIndex={-1} className="w-full bg-cream text-charcoal">
      <SeoJsonLd type="book" data={seoBookData} />
      <Navbar />

      <section className="ambient-dark pb-16 pt-28 md:pb-24 md:pt-36" data-nav-surface="dark" aria-labelledby="book-title">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
          <div className="order-2 mx-auto w-52 sm:w-64 lg:order-none lg:w-full lg:max-w-80">
            <Image src={book.coverImageUrl} alt={`${book.title} book cover`} width={400} height={600} sizes="(max-width: 639px) 208px, (max-width: 1023px) 256px, 320px" className="press-book-jacket h-auto w-full" priority />
          </div>
          <div className="order-1 min-w-0 lg:order-none">
            <h1 id="book-title" className="max-w-2xl font-heading text-4xl font-bold leading-[1.1] text-balance text-cream sm:text-5xl xl:text-6xl">{book.title}</h1>
            {book.subtitle && <p className="mt-5 max-w-xl font-heading text-xl italic leading-relaxed text-cream/80">{book.subtitle}</p>}
            {author && <p className="mt-5 text-base text-cream/80">By <Link href={`/authors/${author.slug}`} className="underline hover:text-gold">{author.name}</Link></p>}
            {editorial && <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/85">{editorial.introduction}</p>}
            {editions.length > 0 && <p className="mt-5 text-sm text-cream/75">{editions.map(format => FORMAT_LABELS[format.formatType] ?? format.formatType).join(" · ")}{editorial && " · English"}</p>}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ReactiveButton href={previewPath} surface="dark">Read Chapter 1 Free<ArrowRight className="size-4" aria-hidden /></ReactiveButton>
              {retailerChooser}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-cream/75">Free with email signup. The chapter opens on this site.</p>
          </div>
        </div>
      </section>

      <nav aria-label="On this book page" className="border-b border-charcoal/15">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-7 px-6 py-3 text-sm font-semibold">
          <Link href="#about-book" className="inline-flex min-h-11 items-center underline hover:text-gold-deep">About the book</Link>
          {editorial && <><Link href="#sample" className="inline-flex min-h-11 items-center underline hover:text-gold-deep">First chapter</Link><Link href="#chapters" className="inline-flex min-h-11 items-center underline hover:text-gold-deep">Chapter guide</Link></>}
          <Link href="#editions" className="inline-flex min-h-11 items-center underline hover:text-gold-deep">Editions &amp; ISBNs</Link>
        </div>
      </nav>

      <section id="about-book" className="rhythm-section" aria-labelledby="about-book-title">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 id="about-book-title" className="font-heading text-3xl font-semibold text-balance md:text-4xl">About the book</h2>
            <div className="mt-7 max-w-prose space-y-5 text-lg leading-relaxed text-text-body">
              {cleanDashes(book.synopsis).split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </div>
          {editorial && <aside className="border-t border-charcoal/20 pt-7 lg:pt-8" aria-labelledby="reader-fit-title">
            <h3 id="reader-fit-title" className="font-heading text-2xl font-semibold">Is this your kind of read?</h3>
            <p className="mt-4 text-base leading-relaxed text-text-body">{editorial.audience}</p>
            <Link href={previewPath} className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold underline hover:text-gold-deep">Try the first chapter<ArrowRight className="size-4" aria-hidden /></Link>
          </aside>}
        </div>
      </section>

      {editorial && <>
        <section id="sample" className="rhythm-section bg-charcoal text-cream" data-nav-surface="dark" aria-labelledby="sample-title">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 id="sample-title" className="max-w-lg font-heading text-3xl font-semibold leading-tight text-balance md:text-4xl">It begins with a ten-dollar allowance.</h2>
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-cream/85">{editorial.sampleContext}</p>
              <p className="mt-5 text-base leading-relaxed text-cream/75">Read Chapter 1, <em>{book.chapterOneTitle}</em>, to hear the story in his own words.</p>
              <div className="mt-7"><ReactiveButton href={previewPath} surface="dark">Read Chapter 1 Free<ArrowRight className="size-4" aria-hidden /></ReactiveButton></div>
              <p className="mt-3 text-sm text-cream/75">Email signup unlocks the chapter on this site.</p>
            </div>
            <figure className="flex flex-col justify-center border-t border-cream/25 pt-8 lg:self-center">
              <blockquote className="font-heading text-3xl leading-snug text-balance text-gold md:text-4xl"><p>“{editorial.sampleQuote}”</p></blockquote>
              <figcaption className="mt-6 text-sm leading-relaxed text-cream/75">{author?.name}, <cite className="not-italic">{book.chapterOneTitle}</cite><br />From Chapter 1 of <em>{book.title}</em></figcaption>
            </figure>
          </div>
        </section>

        <section id="chapters" className="rhythm-section" aria-labelledby="chapters-title">
          <div className="mx-auto max-w-6xl px-6">
            <h2 id="chapters-title" className="font-heading text-3xl font-semibold md:text-4xl">Inside the fifteen chapters</h2>
            <p className="mt-5 max-w-prose text-lg leading-relaxed text-text-body">The story moves from childhood spending to early jobs, life in Atlanta, and conversations about money at work. Here is the full chapter list, with notes on six places to begin exploring.</p>
            <ol className="mt-9 list-decimal space-y-5 pl-7 marker:font-semibold marker:text-gold-deep md:columns-2 md:gap-x-16">
              {editorial.chapters.map(chapter => <li key={chapter.title} className="break-inside-avoid pl-2 pb-2">
                <h3 className="font-heading text-xl font-semibold leading-snug">{chapter.title}</h3>
                {"description" in chapter && <p className="mt-2 text-base leading-relaxed text-text-body">{chapter.description}</p>}
              </li>)}
            </ol>
          </div>
        </section>
      </>}

      <section id="editions" className="rhythm-section border-y border-charcoal/15 bg-white/40" aria-labelledby="editions-title">
        <div className="mx-auto max-w-4xl px-6">
          <h2 id="editions-title" className="font-heading text-3xl font-semibold md:text-4xl">Editions and book details</h2>
          {publicationDate && <p className="mt-5 text-base text-text-body">Published <time dateTime={book.publishedAt!}>{publicationDate}</time>{editorial && " · English"}</p>}
          {editions.length > 0 ? <table className="mt-7 w-full border-collapse text-left">
            <caption className="sr-only">Formats and ISBNs for {book.title}</caption>
            <thead><tr className="border-b border-charcoal/30"><th scope="col" className="py-3 pr-5 font-semibold">Format</th><th scope="col" className="py-3 font-semibold">ISBN</th></tr></thead>
            <tbody>{editions.map(format => <tr key={`${format.formatType}:${format.isbn}`} className="border-b border-charcoal/15"><th scope="row" className="py-4 pr-5 font-normal">{FORMAT_LABELS[format.formatType] ?? format.formatType}</th><td className="py-4 tabular-nums">{format.isbn ?? "Not listed"}</td></tr>)}</tbody>
          </table> : <p className="mt-6 text-text-body">Retailer links will appear here when an edition is listed.</p>}
          {editorial && <p className="mt-6 text-base leading-relaxed text-text-body">The <a href="https://books.apple.com/us/book/how-to-have-a-financial-heart-attack-a-new/id6793190934" className="underline hover:text-gold-deep">Apple Books record</a> credits HMD Publishing. EverRise Press uses publishing and distribution services through HMD. <Link href="/about" className="underline hover:text-gold-deep">Read about the publisher and contact the press</Link>.</p>}
          <p className="mt-4 text-base leading-relaxed text-text-body">Choose a retailer to check its current price, availability, and delivery options. Purchases take place on the retailer&apos;s website.</p>
          {editions.length > 0 && <div className="mt-7"><MultiRetailerModal formats={formats} bookTitle={book.title} bookSlug={book.slug} coverImageUrl={book.coverImageUrl} triggerText="Choose a retailer" surface="light" /></div>}
          {editorial && <p className="mt-6 text-sm text-text-muted">Chapter titles and edition details checked <time dateTime={BOOK_CONTENT_REVIEW_DATE}>October 24, 2026</time>.</p>}
        </div>
      </section>

      {editorial && <section className="rhythm-section" aria-labelledby="questions-title">
        <div className="mx-auto max-w-4xl px-6">
          <h2 id="questions-title" className="font-heading text-3xl font-semibold md:text-4xl">Before you start reading</h2>
          <div className="mt-8 border-t border-charcoal/20">{editorial.questions.map(item => <details key={item.question} className="group border-b border-charcoal/20 py-1">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 font-heading text-xl font-semibold [&::-webkit-details-marker]:hidden">{item.question}<ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden /></summary>
            <p className="max-w-prose pb-6 text-base leading-relaxed text-text-body">{item.answer}</p>
          </details>)}</div>
        </div>
      </section>}
      {relatedArticles.length > 0 && <section className="press-section border-t border-charcoal/15" aria-labelledby="book-related-reading"><div className="press-container"><h2 id="book-related-reading" className="font-heading text-3xl font-semibold">Read, plan and discuss</h2><p className="mt-4 max-w-prose text-base leading-relaxed text-text-body">Explore the stories in the book, work through a cash-flow example, or bring a discussion guide to your reading group.</p><ul className="mt-6 space-y-2">{relatedArticles.map(article => <li key={article.slug}><Link href={`/blog/${article.slug}`} className="inline-flex min-h-11 items-center gap-3 text-lg underline underline-offset-4 hover:text-gold-deep">{article.title}<ArrowRight className="size-4 shrink-0" aria-hidden /></Link></li>)}</ul></div></section>}
      <SiteFooter extraLinks={[{ label: "The Book", href: `/books/${book.slug}` }]} />
    </main>
  );
}
