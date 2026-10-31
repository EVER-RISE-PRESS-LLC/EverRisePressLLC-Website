import Image from "@/components/ui/SiteImage";
import Link from "next/link";
import type { Metadata } from "next";
import { getDatabase } from "@/lib/db/client";
import { books, authors, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cleanDashes } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo/metadata";
import SeoJsonLd from "@/components/seo/SeoJsonLd";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ReactiveButton from "@/components/ui/ReactiveButton";
import BookStories from "@/components/marketing/BookStories";
import ArticleList from "@/components/blog/ArticleList";
import { getPublishedArticles } from "@/lib/blog/catalog";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata("home");
const BOOK_PATH = "/books/how-to-have-a-financial-heart-attack";

export default async function Home() {
  const recentArticles = (await getPublishedArticles()).slice(0, 3);
  const db = await getDatabase();
  const [[book], [author]] = await Promise.all([
    db.select().from(books).where(eq(books.slug, "how-to-have-a-financial-heart-attack")).limit(1),
    db.select().from(authors).where(eq(authors.slug, "lamont-mcleod")).limit(1),
  ]);
  const formats = book ? await db.select().from(bookFormats).where(eq(bookFormats.bookId, book.id)) : [];

  return (
    <main id="page-content" tabIndex={-1} className="press-home">
      <SeoJsonLd type="home"/>
      <Navbar/>
      <section className="press-hero" aria-labelledby="home-title">
        <div className="press-container press-hero-grid">
          <div className="press-hero-copy">
            <h1 id="home-title">Books About Money.<br/><span>Stories Behind the Habits.</span></h1>
            <p>EverRise Press publishes <em>How To Have a Financial Heart Attack</em> by Lamont D. McLeod, a personal account of childhood spending, payday habits, and working in debt collection.</p>
            <div className="press-actions">
              <ReactiveButton href={`${BOOK_PATH}/preview`} size="lg">Read Chapter 1 Free<ArrowRight size={18}/></ReactiveButton>
              <Link href="#the-book" className="press-text-link">Explore the book<ArrowRight size={17}/></Link>
            </div>
            <p className="press-hero-note">Free with email signup. The chapter opens on this site.</p>
          </div>
          {book && <div className="press-hero-book">
            <Image src={book.coverImageUrl} alt={`${book.title} cover`} width={400} height={600} sizes="(max-width: 767px) 230px, 340px" priority className="press-book-jacket"/>
            <Link href="/authors/lamont-mcleod" className="press-author-credit">
              <Image src={author?.avatarUrl || "/images/authors/lamont-mcleod.jpg"} alt="" width={44} height={44}/>
              <span>By Lamont D. McLeod<small>Meet the author <ArrowRight size={13}/></small></span>
            </Link>
          </div>}
        </div>
      </section>

      <section className="press-section" aria-labelledby="inside-title">
        <div className="press-container">
          <div className="press-section-intro">
            <h2 id="inside-title">What did your first experiences<br className="hidden md:block"/> with money teach you?</h2>
            <p>Explore four themes from McLeod&apos;s story, from his first allowance to working in debt collection.</p>
          </div>
          <BookStories/>
        </div>
      </section>

      {book && <section id="the-book" className="press-section press-book-section" aria-labelledby="book-title">
        <div className="press-container press-book-grid">
          <div className="press-book-aside">
            <Image src={book.coverImageUrl} alt={`${book.title} cover`} width={320} height={480} sizes="(max-width: 767px) 180px, 280px" className="press-book-jacket"/>
            <Link href={BOOK_PATH} className="press-text-link">Book details &amp; editions<ArrowRight size={17}/></Link>
          </div>
          <div>
            <h2 id="book-title">{book.title}</h2>
            {book.subtitle && <p className="press-book-subtitle">{book.subtitle}</p>}
            <div className="press-book-description">
              {cleanDashes(book.synopsis).split("\n\n").slice(0,3).map((paragraph,i) => <p key={i}>{paragraph}</p>)}
            </div>
            <div className="press-actions">
              <ReactiveButton href={`${BOOK_PATH}/preview`} surface="light">Read Chapter 1 Free<ArrowRight size={17}/></ReactiveButton>
              {formats.length > 0 && <ReactiveButton href={`/books/${book.slug}#editions`} variant="outline" surface="light">Compare editions</ReactiveButton>}
            </div>
            {recentArticles.length > 0 && <p className="mt-6 max-w-prose text-base leading-relaxed text-text-body">Reading with a group or looking for a worksheet? <Link href={`${BOOK_PATH}#book-related-reading`} className="underline hover:text-gold-deep">Find the free discussion guide, spending check and cash flow calendar</Link>. These resources need no signup.</p>}
          </div>
        </div>
      </section>}

      <section className="press-section" aria-labelledby="author-title">
        <div className="press-container press-author-grid">
          <div className="press-author-portrait"><Image src={author?.avatarUrl || "/images/authors/lamont-mcleod.jpg"} alt={author?.name || "Lamont D. McLeod"} width={600} height={765} sizes="(max-width: 767px) calc(100vw - 48px), 400px"/></div>
          <div className="press-author-copy">
            <h2 id="author-title">Meet the Author.<br/><span>Lamont D. McLeod.</span></h2>
            <p>McLeod draws on his own experiences with an allowance, paychecks, and debt collection. His author profile brings together his background and the story behind the book.</p>
            <ReactiveButton href="/authors/lamont-mcleod" variant="outline" surface="light">Read the Author Profile<ArrowRight size={17}/></ReactiveButton>
          </div>
        </div>
      </section>

      <section className="press-section press-closing" aria-labelledby="start-title">
        <div className="press-container">
          <h2 id="start-title">Start with Chapter 1.</h2>
          <p>Read how McLeod&apos;s story begins with a ten-dollar allowance. Enter your email to read the chapter free, then decide whether the full book is for you.</p>
          <ReactiveButton href={`${BOOK_PATH}/preview`} size="lg">Read Chapter 1 Free<ArrowRight size={18}/></ReactiveButton>
        </div>
      </section>
      {recentArticles.length > 0 && <section className="press-section" aria-labelledby="latest-reading-title"><div className="press-container"><div className="mb-9 flex flex-wrap items-end justify-between gap-5"><h2 id="latest-reading-title" className="font-heading text-3xl font-semibold">From the press</h2><Link href="/blog" className="press-text-link">All articles<ArrowRight size={17} aria-hidden /></Link></div><ArticleList articles={recentArticles} /></div></section>}
      <SiteFooter extraLinks={[{label:"The Book",href:BOOK_PATH}]}/>
    </main>
  );
}
