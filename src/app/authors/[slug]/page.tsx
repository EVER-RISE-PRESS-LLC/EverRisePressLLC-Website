import Image from "@/components/ui/SiteImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDatabase } from "@/lib/db/client";
import { authors, books, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildMetadata } from "@/lib/seo/metadata";
import type { AuthorSeoData } from "@/lib/seo/registry";
import { cleanDashes } from "@/lib/utils";
import SeoJsonLd from "@/components/seo/SeoJsonLd";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ReactiveButton from "@/components/ui/ReactiveButton";
import { AUTHOR_SITE } from "@/lib/publisher";
import { FINANCIAL_HEART_ATTACK_SLUG, FORMAT_LABELS, uniqueEditions } from "@/lib/book-editorial";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDatabase();
  const author = await db
    .select()
    .from(authors)
    .where(eq(authors.slug, slug))
    .limit(1)
    .then((rows) => rows[0]);

  if (!author) return { title: "Author Not Found" };

  return buildMetadata("author", {
    slug: author.slug,
    name: author.name,
    title: author.title,
    bio: author.bio,
    avatarUrl: author.avatarUrl,
    updatedAt: author.updatedAt,
    socialLinks: author.socialLinks as Record<string, string> | null,
  } satisfies AuthorSeoData);
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDatabase();

  const author = await db
    .select()
    .from(authors)
    .where(eq(authors.slug, slug))
    .limit(1)
    .then((rows) => rows[0]);

  if (!author) notFound();

  const authorBooks = await db
    .select()
    .from(books)
    .where(eq(books.authorId, author.id));

  const booksWithFormats = await Promise.all(
    authorBooks.map(async (book) => {
      const formats = await db
        .select()
        .from(bookFormats)
        .where(eq(bookFormats.bookId, book.id));
      return { ...book, formats };
    })
  );

  const socialLinks = author.socialLinks as Record<string, string> | null;

  const seoAuthorData: AuthorSeoData = {
    slug: author.slug,
    name: author.name,
    title: author.title,
    bio: author.bio,
    avatarUrl: author.avatarUrl,
    updatedAt: author.updatedAt,
    socialLinks,
  };

  const featuredBook = booksWithFormats.find(book => book.slug === FINANCIAL_HEART_ATTACK_SLUG) ?? booksWithFormats[0];

  return (
    <main id="page-content" tabIndex={-1} className="w-full max-w-full overflow-x-hidden bg-cream text-charcoal">
      <SeoJsonLd type="author" data={seoAuthorData} />
      <Navbar />

      <section className="ambient-dark pb-16 pt-28 md:pb-24 md:pt-36" data-nav-surface="dark" aria-labelledby="author-name">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-16">
          <Image src={author.avatarUrl || "/images/authors/lamont-mcleod.jpg"} alt={author.name} width={256} height={256} className="order-2 mx-auto aspect-square w-48 rounded-lg object-cover object-top md:order-none md:w-64" priority />
          <div className="order-1 min-w-0 md:order-none">
            <h1 id="author-name" className="font-heading text-4xl font-bold leading-tight text-balance text-cream md:text-5xl">{author.name}</h1>
            {author.title && <p className="mt-4 text-base text-gold">{author.title}</p>}
            {author.slug === "lamont-mcleod" && <p className="mt-6 text-lg leading-relaxed text-cream/85">Author of <Link href={`/books/${FINANCIAL_HEART_ATTACK_SLUG}`} className="underline hover:text-gold">How To Have a Financial Heart Attack</Link>, a personal account of spending habits, early jobs, and lessons from debt collection.</p>}
            <div className="mt-5 flex flex-wrap gap-x-6 text-sm text-cream/80">
              {author.slug === "lamont-mcleod" && <a href={AUTHOR_SITE} className="inline-flex min-h-11 items-center gap-1 underline hover:text-gold">Official website<ArrowUpRight className="size-4" aria-hidden /></a>}
              {socialLinks?.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline hover:text-gold">Facebook</a>}
              {socialLinks?.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline hover:text-gold">LinkedIn</a>}
            </div>
          </div>
        </div>
      </section>

      <section className="rhythm-section" aria-labelledby="background-title">
        <div className="mx-auto max-w-3xl px-6">
          <h2 id="background-title" className="font-heading text-3xl font-semibold md:text-4xl">His background and writing</h2>
          <div className="mt-7 space-y-5 text-lg leading-relaxed text-text-body">
            {cleanDashes(author.bio).split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          {author.slug === "lamont-mcleod" && <p className="mt-7 text-base leading-relaxed text-text-body">Read <a href={`${AUTHOR_SITE}/story`} className="underline hover:text-gold-deep">McLeod&apos;s personal story on his official website</a> for more about his life and work.</p>}
        </div>
      </section>

      {booksWithFormats.length > 0 && <section id="books" className="rhythm-section bg-charcoal text-cream" data-nav-surface="dark" aria-labelledby="author-books-title">
        <div className="mx-auto max-w-5xl px-6">
          <h2 id="author-books-title" className="font-heading text-3xl font-semibold md:text-4xl">Books by {author.name}</h2>
          <div className="mt-10 divide-y divide-cream/20">
            {booksWithFormats.map(book => <article key={book.id} className="grid gap-8 py-8 first:pt-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)] md:gap-12">
              <Link href={`/books/${book.slug}`} className="mx-auto block w-40 self-start" aria-label={`Explore ${book.title}`}>
                <Image src={book.coverImageUrl} alt={`${book.title} book cover`} width={160} height={240} sizes="160px" className="press-book-jacket h-auto w-full" />
              </Link>
              <div className="min-w-0">
                <h3 className="font-heading text-2xl font-semibold leading-snug md:text-3xl"><Link href={`/books/${book.slug}`} className="hover:text-gold">{book.title}</Link></h3>
                {book.subtitle && <p className="mt-3 font-heading text-lg italic text-cream/80">{book.subtitle}</p>}
                <p className="mt-5 max-w-prose text-base leading-relaxed text-cream/85">{cleanDashes(book.synopsis.split("\n\n")[0])}</p>
                {book.formats.length > 0 && <p className="mt-5 text-sm text-cream/75">{uniqueEditions(book.formats).map(format => FORMAT_LABELS[format.formatType] ?? format.formatType).join(" · ")}</p>}
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ReactiveButton href={`/books/${book.slug}`} surface="dark">Explore the book<ArrowRight className="size-4" aria-hidden /></ReactiveButton>
                  <ReactiveButton href={`/books/${book.slug}/preview`} variant="outline" surface="dark">Read Chapter 1 Free</ReactiveButton>
                </div>
                <p className="mt-4 text-sm text-cream/75">The free chapter opens on this site with email signup.</p>
              </div>
            </article>)}
          </div>
        </div>
      </section>}

      <section className="rhythm-section" aria-labelledby="start-reading-title">
        <div className="mx-auto max-w-3xl px-6">
          <h2 id="start-reading-title" className="font-heading text-3xl font-semibold md:text-4xl">Start with a chapter.</h2>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-text-body">Try the writing, explore the chapter guide, and check the available editions before choosing a book. For questions about the site, book details, or a correction, <Link href="/about#contact" className="underline hover:text-gold-deep">contact EverRise Press</Link>.</p>
          {featuredBook && <div className="mt-8"><ReactiveButton href={`/books/${featuredBook.slug}/preview`} surface="light">Read Chapter 1 Free<ArrowRight className="size-4" aria-hidden /></ReactiveButton><p className="mt-3 text-sm text-text-muted">Free with email signup.</p></div>}
        </div>
      </section>
      <SiteFooter extraLinks={[{ label: "Author", href: `/authors/${author.slug}` }]} />
    </main>
  );
}
