import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDatabase } from "@/lib/db/client";
import { books, authors, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getBookSchema, getOrganizationSchema } from "@/lib/schema";
import JsonLd from "@/components/seo/JsonLd";
import MultiRetailerModal from "@/components/marketing/MultiRetailerModal";

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

  return {
    title: `${book.title} | EverRise Press`,
    description: "You aren't just losing money — you're practicing poverty until you're an expert. The diagnosis is free.",
    openGraph: {
      title: book.title,
      description: book.synopsis.slice(0, 160),
      type: "book",
    },
  };
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

  const bookSchema = getBookSchema(
    {
      slug: book.slug,
      title: book.title,
      subtitle: book.subtitle,
      synopsis: book.synopsis,
      coverImageUrl: book.coverImageUrl,
      publishedAt: book.publishedAt,
      formats: formats.map((f) => ({
        formatType: f.formatType,
        isbn: f.isbn,
        retailPrice: f.retailPrice,
        currency: f.currency,
        purchaseUrl: f.purchaseUrl,
      })),
    },
    author
      ? {
          slug: author.slug,
          name: author.name,
          title: author.title,
          bio: author.bio,
          avatarUrl: author.avatarUrl,
          socialLinks: author.socialLinks as Record<string, string> | null,
        }
      : { slug: "", name: "Unknown", title: null, bio: "", avatarUrl: null, socialLinks: null }
  );

  return (
    <div className="bg-cream text-charcoal min-h-screen">
      <JsonLd data={[bookSchema, getOrganizationSchema()]} />

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
            href={`/books/${book.slug}/preview`}
            className="text-gold font-sans text-sm uppercase tracking-wider hover:text-gold-hover transition-colors"
          >
            Read Chapter 1
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-charcoal text-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Book Cover */}
            <div className="flex justify-center">
              <div className="relative w-72 md:w-96 aspect-[2/3] bg-charcoal rounded-lg shadow-2xl shadow-gold/20 overflow-hidden border-2 border-gold/30">
                <Image
                  src={book.coverImageUrl}
                  alt={`${book.title} cover`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Book Info */}
            <div>
              <p className="text-gold font-sans text-sm uppercase tracking-[0.2em] mb-4">
                The Diagnosis
              </p>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-cream/60 text-xl mb-8 font-heading italic">
                  {book.subtitle}
                </p>
              )}

              {/* Price and Format */}
              {formats.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-gold text-3xl font-bold">
                      ${formats[0].retailPrice}
                    </span>
                    <span className="text-cream/50 text-sm uppercase">
                      {formats[0].formatType}
                    </span>
                  </div>
                  {formats[0].isbn && (
                    <p className="text-cream/40 text-xs">
                      ISBN: {formats[0].isbn}
                    </p>
                  )}
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href={`/books/${book.slug}/preview`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gold text-charcoal font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold-hover transition-colors"
                >
                  Read Chapter 1 Free
                </Link>
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
                  coverImageUrl={book.coverImageUrl}
                  triggerText="Buy Now"
                />
              </div>

              {/* Author */}
              {author && (
                <div className="flex items-center gap-4 pt-6 border-t border-cream/10">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold">
                    <Image
                      src={author.avatarUrl || "/images/authors/lamont-mcleod.jpg"}
                      alt={author.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="text-cream text-sm font-semibold">{author.name}</p>
                    <Link
                      href={`/authors/${author.slug}`}
                      className="text-gold text-xs hover:text-gold-hover transition-colors"
                    >
                      View Author Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Synopsis Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">
            You Aren&apos;t Just Losing Money.{" "}
            <span className="text-gold">You&apos;re Practicing Poverty.</span>
          </h2>
          <div className="space-y-6 text-text-body text-lg leading-relaxed">
            {book.synopsis.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Pattern Interrupt Section */}
      <section className="py-16 md:py-24 bg-charcoal text-cream">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8">
            The Muscle Memory That&apos;s Costing You{" "}
            <span className="text-gold">$40,000 a Year</span>
          </h2>
          <div className="space-y-6 text-cream/80 text-lg leading-relaxed max-w-2xl mx-auto">
            <p>
              You check your bank account like it&apos;s a horror movie. Peeking through your fingers, 
              hoping the monster went away. It didn&apos;t. It never does.
            </p>
            <p>
              Because the monster isn&apos;t your income. It&apos;s the pattern you built when you were 8 years old. 
              Blowing $10 on penny candy and quarters. Learning the most dangerous lesson of your life.
            </p>
            <p className="text-gold font-semibold text-xl">
              Money will always come.
            </p>
            <p>
              That belief is running your checking account right now. And it&apos;s about to cost you 
              everything you&apos;ve been working for.
            </p>
          </div>
        </div>
      </section>

      {/* What's Inside Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">
            What You&apos;ll <span className="text-gold">Discover</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "The Penny Candy Foundation",
                desc: "How your childhood allowance taught you to be broke before you could read.",
              },
              {
                title: "The First Paycheck Syndrome",
                desc: "Why every Monday feels like a financial hangover.",
              },
              {
                title: "The Job Hopping Hustle",
                desc: "The invisible cage of chasing the next paycheck instead of building a foundation.",
              },
              {
                title: "The Awakening",
                desc: "The moment you realize you're the debtor you've been calling.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-lg border border-charcoal/10 hover:border-gold/30 transition-colors"
              >
                <h3 className="font-heading text-xl font-bold text-charcoal mb-2">
                  {item.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-charcoal text-cream">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
            The Diagnosis Is Free.{" "}
            <span className="text-gold">The Cure Is Up to You.</span>
          </h2>
          <p className="text-cream/70 text-lg mb-10 max-w-xl mx-auto">
            You&apos;ve seen the patterns. You&apos;ve felt the muscle memory. Now read the full autopsy. 
            Chapter 1 will show you exactly where the bleeding started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/books/${book.slug}/preview`}
              className="inline-flex items-center justify-center px-10 py-5 bg-gold text-charcoal font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold-hover transition-colors"
            >
              Read Chapter 1 — Free
            </Link>
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
              coverImageUrl={book.coverImageUrl}
              triggerText={`Get the Full Book — $${formats[0]?.retailPrice}`}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-charcoal border-t border-cream/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="EverRise Press"
              width={32}
              height={32}
              className="opacity-60"
            />
            <span className="text-cream/40 text-sm">
              &copy; {new Date().getFullYear()} EverRise Press LLC
            </span>
          </div>
          <div className="flex gap-6 text-cream/40 text-sm">
            <Link href="/privacy" className="hover:text-gold transition-colors">
              Privacy
            </Link>
            <Link href="/" className="hover:text-gold transition-colors">
              Home
            </Link>
            <Link href={`/authors/${author?.slug}`} className="hover:text-gold transition-colors">
              Author
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
