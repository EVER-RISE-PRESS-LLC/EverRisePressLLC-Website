import Image from "next/image";
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
import GlassCard from "@/components/ui/GlassCard";
import Reveal from "@/components/ui/Reveal";
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
    socialLinks,
  };

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-cream text-charcoal">
      <SeoJsonLd type="author" data={seoAuthorData} />
      <Navbar />

      {/* Author hero */}
      <section className="ambient-dark bg-grain relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32" data-nav-surface="dark">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center gap-12 md:flex-row md:items-start md:gap-16">
            <Reveal className="shrink-0">
              <div className="glass-dark relative overflow-hidden rounded-2xl p-2.5">
                <span aria-hidden className="glass-sheen" />
                <div className="size-48 overflow-hidden rounded-xl md:size-64">
                  <Image
                    src={author.avatarUrl || "/images/authors/lamont-mcleod.jpg"}
                    alt={author.name}
                    width={256}
                    height={256}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
              </div>
            </Reveal>

            <div className="text-center md:text-left">
              <Reveal>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">
                  {author.title}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.08] text-cream text-balance md:text-6xl">
                  {author.name}
                </h1>
              </Reveal>
              {socialLinks && (
                <Reveal delay={0.2}>
                  <div className="mt-6 flex justify-center gap-6 md:justify-start">
                    {socialLinks.facebook && (
                      <a
                        href={socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cream/75 transition-colors hover:text-gold"
                      >
                        Facebook
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cream/75 transition-colors hover:text-gold"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="ambient-cream relative rhythm-section" data-nav-surface="light">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="space-y-6 text-lg leading-relaxed text-text-body">
              {cleanDashes(author.bio)
                .split("\n\n")
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Books */}
      {booksWithFormats.length > 0 && (
        <section className="ambient-dark bg-grain relative overflow-hidden rhythm-section" data-nav-surface="dark">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="font-heading text-3xl font-bold text-center text-cream text-balance md:text-5xl">
                Books by <span className="text-gold">{author.name}</span>
              </h2>
            </Reveal>
            <div className="rhythm-gap grid gap-5 lg:grid-cols-2">
              {booksWithFormats.map((book, i) => (
                <Reveal key={book.id} delay={i * 0.1} className="h-full">
                  <GlassCard surface="dark" interactive radius="3xl" className="h-full">
                    <div className="flex h-full flex-col gap-8 p-7 sm:flex-row md:p-8">
                      <div className="mx-auto w-40 shrink-0 sm:mx-0">
                        <div className="relative aspect-2/3 overflow-hidden rounded-xl border border-cream/15 shadow-2xl shadow-black/40">
                          <Image
                            src={book.coverImageUrl}
                            alt={`${book.title} cover`}
                            fill
                            sizes="(max-width: 768px) 10rem, 12rem"
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h3 className="font-heading text-2xl font-bold leading-snug text-cream">
                          {book.title}
                        </h3>
                        {book.subtitle && (
                          <p className="mt-2 text-sm italic text-cream/75">
                            {book.subtitle}
                          </p>
                        )}
                        <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-cream/75">
                          {cleanDashes(book.synopsis.split("\n\n")[0])}
                        </p>
                        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
                          <ReactiveButton
                            href={`/books/${book.slug}`}
                            size="sm"
                            surface="dark"
                          >
                            Explore the Book
                          </ReactiveButton>
                          {book.formats.length > 0 && (
                            <ReactiveButton
                              href={book.formats[0].purchaseUrl}
                              external
                              size="sm"
                              variant="outline"
                              surface="dark"
                            >
                              Buy for ${book.formats[0].retailPrice}
                              <ArrowUpRight className="size-3.5" />
                            </ReactiveButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="ambient-cream relative rhythm-section" data-nav-surface="light">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold leading-tight text-charcoal text-balance md:text-5xl">
              Looking for a Cheerleader?{" "}
              <span className="text-gold-deep">Keep Scrolling.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-text-body">
              If you&apos;re ready to see your financial chart the way a doctor reads
              an X-ray, the diagnosis is free. The cure is up to you.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-12 flex justify-center">
              <ReactiveButton
                href="/books/how-to-have-a-financial-heart-attack"
                size="lg"
                surface="light"
              >
                Read Chapter 1 Free
                <ArrowRight className="size-4" />
              </ReactiveButton>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter
        extraLinks={[{ label: "Author", href: `/authors/${author.slug}` }]}
      />
    </main>
  );
}
