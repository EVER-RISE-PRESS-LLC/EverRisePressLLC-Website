import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDatabase } from "@/lib/db/client";
import { books, authors, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildMetadata } from "@/lib/seo/metadata";
import type { BookSeoData } from "@/lib/seo/registry";
import { cleanDashes } from "@/lib/utils";
import SeoJsonLd from "@/components/seo/SeoJsonLd";
import MultiRetailerModal from "@/components/marketing/MultiRetailerModal";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ReactiveButton from "@/components/ui/ReactiveButton";
import GlassCard from "@/components/ui/GlassCard";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight, BookOpen, Repeat, Briefcase, Sunrise } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDatabase();
  const book = await db
    .select()
    .from(books)
    .where(eq(books.slug, slug))
    .limit(1)
    .then((rows) => rows[0]);

  if (!book) return { title: "Book Not Found" };

  return buildMetadata("book", {
    slug: book.slug,
    title: book.title,
    subtitle: book.subtitle,
    synopsis: book.synopsis,
    coverImageUrl: book.coverImageUrl,
    publishedAt: book.publishedAt,
    formats: [],
    author: null,
  } satisfies BookSeoData);
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const seoBookData: BookSeoData = {
    slug: book.slug,
    title: book.title,
    subtitle: book.subtitle,
    synopsis: book.synopsis,
    coverImageUrl: book.coverImageUrl,
    publishedAt: book.publishedAt,
    updatedAt: book.updatedAt,
    formats: formats.map((f) => ({
      formatType: f.formatType,
      isbn: f.isbn,
      retailPrice: f.retailPrice,
      currency: f.currency,
      purchaseUrl: f.purchaseUrl,
    })),
    author: author ? { slug: author.slug, name: author.name } : null,
  };

  const insideItems = [
    {
      title: "The Penny Candy Foundation",
      desc: "How your childhood allowance taught you to be broke before you could read.",
      icon: BookOpen,
    },
    {
      title: "The First Paycheck Syndrome",
      desc: "Why every Monday feels like a financial hangover.",
      icon: Repeat,
    },
    {
      title: "The Job Hopping Hustle",
      desc: "The invisible cage of chasing the next paycheck instead of building a foundation.",
      icon: Briefcase,
    },
    {
      title: "The Awakening",
      desc: "The moment you realize you're the debtor you've been calling.",
      icon: Sunrise,
    },
  ];

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-cream text-charcoal">
      <SeoJsonLd type="book" data={seoBookData} />
      <Navbar />

      {/* Hero - editorial split */}
      <section className="ambient-dark bg-grain relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32" data-nav-surface="dark">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-14 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-20">
            <Reveal immediate className="mx-auto w-64 md:w-80 lg:w-96">
              <div className="glass-dark relative overflow-hidden rounded-2xl p-2.5">
                <span aria-hidden className="glass-sheen" />
                <div className="relative aspect-2/3 overflow-hidden rounded-xl">
                  <Image
                    src={book.coverImageUrl}
                    alt={`${book.title} cover`}
                    fill
                    sizes="(max-width: 768px) 16rem, 24rem"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal immediate>
                <h1 className="max-w-4xl font-heading text-4xl font-bold leading-[1.08] text-cream text-balance md:text-6xl">
                  {book.title}
                </h1>
              </Reveal>
              {book.subtitle && (
                <Reveal immediate delay={0.1}>
                  <p className="mt-5 font-heading text-lg italic text-cream/75 md:text-xl">
                    {book.subtitle}
                  </p>
                </Reveal>
              )}

              {formats.length > 0 && (
                <Reveal immediate delay={0.18}>
                  <div className="mt-8">
                    <div className="flex items-baseline gap-3">
                      <span className="font-heading text-3xl font-bold text-gold">
                        ${formats[0].retailPrice}
                      </span>
                      <span className="text-sm uppercase tracking-wider text-cream/75">
                        {formats[0].formatType === "EBOOK"
                          ? "eBook"
                          : formats[0].formatType.charAt(0) + formats[0].formatType.slice(1).toLowerCase()}
                      </span>
                    </div>
                    {formats[0].isbn && (
                      <p className="mt-1 text-xs tracking-wide text-cream/70">
                        ISBN: {formats[0].isbn}
                      </p>
                    )}
                  </div>
                </Reveal>
              )}

              <Reveal immediate delay={0.26}>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <ReactiveButton
                    href={`/books/${book.slug}/preview`}
                    surface="dark"
                  >
                    Read Chapter 1 Free
                    <ArrowRight className="size-4" />
                  </ReactiveButton>
                  <MultiRetailerModal
                    formats={formats.map((f) => ({
                      id: f.id,
                      formatType: f.formatType,
                      retailPrice: f.retailPrice,
                      currency: f.currency,
                      distributor: f.distributor,
                      purchaseUrl: f.purchaseUrl,
                      isbn: f.isbn,
                    }))}
                    bookTitle={book.title}
                    bookSlug={book.slug}
                    coverImageUrl={book.coverImageUrl}
                    triggerText={`Get the Full Book for $${formats[0]?.retailPrice}`}
                  />
                </div>
              </Reveal>

              {author && (
                <Reveal immediate delay={0.34}>
                  <div className="mt-10 flex items-center gap-4 border-t border-cream/10 pt-6">
                    <div className="size-12 shrink-0 overflow-hidden rounded-full border-2 border-gold">
                      <Image
                        src={author.avatarUrl || "/images/authors/lamont-mcleod.jpg"}
                        alt={author.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-cream">{author.name}</p>
                      <Link
                        href={`/authors/${author.slug}`}
                        className="text-xs text-gold transition-colors hover:text-gold-hover"
                      >
                        View Author Profile
                      </Link>
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Synopsis */}
      <section className="ambient-cream relative rhythm-section" data-nav-surface="light">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-center text-charcoal text-balance md:text-4xl">
              You Aren&apos;t Just Losing Money.{" "}
              <span className="text-gold-deep">You&apos;re Practicing Poverty.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="rhythm-gap space-y-6 text-lg leading-relaxed text-text-body">
              {cleanDashes(book.synopsis)
                .split("\n\n")
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pattern interrupt */}
      <section className="ambient-dark bg-grain relative overflow-hidden rhythm-section" data-nav-surface="dark">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-cream text-balance md:text-4xl">
              Money Will Always Come.{" "}
              <span className="text-gold">That Belief Is Costing You.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="rhythm-gap mx-auto max-w-2xl space-y-6 text-lg leading-relaxed text-cream/80">
              <p>
                You check your bank account like it&apos;s a horror movie. Peeking
                through your fingers, hoping the monster went away. It didn&apos;t.
                It never does.
              </p>
              <p>
                Because the monster isn&apos;t your income. It&apos;s the pattern you
                built when you were 8 years old. Blowing $10 on penny candy and
                quarters. Learning the most dangerous lesson of your life:
                money will always come.
              </p>
              <p>
                That belief is running your checking account right now. And it&apos;s
                about to cost you everything you&apos;ve been working for.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What's inside */}
      <section className="ambient-cream relative rhythm-section" data-nav-surface="light">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-center text-charcoal text-balance md:text-4xl">
              What You&apos;ll <span className="text-gold-deep">Discover</span>
            </h2>
          </Reveal>
          <div className="rhythm-gap grid gap-5 sm:grid-cols-2">
            {insideItems.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08} className="h-full">
                <GlassCard surface="light" interactive className="h-full">
                  <div className="flex h-full flex-col justify-between gap-6 p-7 md:p-8">
                    <item.icon className="size-7 text-gold-deep" />
                    <div>
                      <h3 className="font-heading text-xl font-bold text-charcoal">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-muted">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="ambient-dark bg-grain relative overflow-hidden rhythm-section" data-nav-surface="dark">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="font-heading text-4xl font-bold leading-tight text-cream text-balance md:text-6xl">
              The Diagnosis Is Free.{" "}
              <span className="text-gold">The Cure Is Up to You.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-cream/80">
              You&apos;ve seen the patterns. You&apos;ve felt the muscle memory. Now
              read the full autopsy. Chapter 1 will show you exactly where the
              bleeding started.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ReactiveButton
                href={`/books/${book.slug}/preview`}
                size="lg"
                surface="dark"
              >
                Read Chapter 1 Free
                <ArrowRight className="size-4" />
              </ReactiveButton>
              <MultiRetailerModal
                formats={formats.map((f) => ({
                  id: f.id,
                  formatType: f.formatType,
                  retailPrice: f.retailPrice,
                  currency: f.currency,
                  distributor: f.distributor,
                  purchaseUrl: f.purchaseUrl,
                  isbn: f.isbn,
                }))}
                bookTitle={book.title}
                bookSlug={book.slug}
                coverImageUrl={book.coverImageUrl}
                triggerText={`Get the Full Book for $${formats[0]?.retailPrice}`}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter
        extraLinks={[{ label: "The Book", href: `/books/${book.slug}` }]}
      />
    </main>
  );
}
