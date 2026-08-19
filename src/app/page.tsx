import Image from "next/image";
import Link from "next/link";
import { getDatabase } from "@/lib/db/client";
import { books, authors, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWebSiteSchema, getOrganizationSchema } from "@/lib/schema";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 3600;

export default async function Home() {
  const db = await getDatabase();

  const book = await db
    .select()
    .from(books)
    .where(eq(books.slug, "how-to-have-a-financial-heart-attack"))
    .limit(1)
    .then((rows) => rows[0]);

  const author = await db
    .select()
    .from(authors)
    .where(eq(authors.slug, "lamont-mcleod"))
    .limit(1)
    .then((rows) => rows[0]);

  const formats = book
    ? await db
        .select()
        .from(bookFormats)
        .where(eq(bookFormats.bookId, book.id))
    : [];

  return (
    <div className="bg-cream text-charcoal">
      <JsonLd data={[getWebSiteSchema(), getOrganizationSchema()]} />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-charcoal text-cream overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.3),transparent_70%)]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="text-gold font-sans text-sm uppercase tracking-[0.2em] mb-6">
            EverRise Press
          </p>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
            Your Financial Heart Attack{" "}
            <span className="text-gold">Is Already in Progress</span>
          </h1>
          <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            You&apos;re not losing money. You&apos;re <em>practicing</em> poverty until you&apos;re an expert. 
            The patterns were installed before you could say no. The diagnosis is free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/books/how-to-have-a-financial-heart-attack"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-charcoal font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold-hover transition-colors"
            >
              Read the Diagnosis (Free Chapter 1)
            </Link>
            <Link
              href="#the-book"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-gold text-gold font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold hover:text-charcoal transition-colors"
            >
              See How Bad It Really Is
            </Link>
          </div>
        </div>
      </section>

      {/* Wake-Up Call Section */}
      <section className="py-20 md:py-32 bg-cream">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-8">
            You Don&apos;t Have a Money Problem.{" "}
            <span className="text-gold">You Have a Pattern Problem.</span>
          </h2>
          <div className="space-y-6 text-text-body text-lg leading-relaxed">
            <p>
              Every Friday, the paycheck comes. Every Monday, it&apos;s gone. You check your bank account 
              like it&apos;s a horror movie — peeking through your fingers, hoping the monster went away.
            </p>
            <p>
              It didn&apos;t. It never does. Because the monster isn&apos;t your income. It&apos;s the muscle memory 
              you built when you were 8 years old, blowing $10 on penny candy and quarters, learning the 
              most dangerous lesson of your life: <strong>money will always come.</strong>
            </p>
            <p className="text-charcoal font-semibold text-xl">
              Friday is coming. So is the crash.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Book Section */}
      {book && (
        <section id="the-book" className="py-20 md:py-32 bg-charcoal text-cream">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="order-2 md:order-1">
                <p className="text-gold font-sans text-sm uppercase tracking-[0.2em] mb-4">
                  The Diagnosis
                </p>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                  {book.title}
                </h2>
                {book.subtitle && (
                  <p className="text-cream/60 text-lg mb-8 font-heading italic">
                    {book.subtitle}
                  </p>
                )}
                <div className="space-y-4 text-cream/80 leading-relaxed mb-8">
                  {book.synopsis.split("\n\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/books/how-to-have-a-financial-heart-attack"
                    className="inline-flex items-center justify-center px-8 py-4 bg-gold text-charcoal font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold-hover transition-colors"
                  >
                    Read Chapter 1 Free
                  </Link>
                  {formats.length > 0 && (
                    <a
                      href={formats[0].purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-gold text-gold font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold hover:text-charcoal transition-colors"
                    >
                      Get the Book — ${formats[0].retailPrice}
                    </a>
                  )}
                </div>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                <div className="relative w-64 md:w-80 aspect-[2/3] bg-charcoal rounded-lg shadow-2xl shadow-gold/10 overflow-hidden border border-gold/20">
                  <Image
                    src={book.coverImageUrl}
                    alt={`${book.title} cover`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Author Section */}
      {author && (
        <section className="py-20 md:py-32 bg-cream">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
              <div className="shrink-0">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-gold shadow-lg">
                  <Image
                    src={author.avatarUrl || "/images/authors/lamont-mcleod.jpg"}
                    alt={author.name}
                    width={192}
                    height={192}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div>
                <p className="text-gold font-sans text-sm uppercase tracking-[0.2em] mb-2">
                  {author.title}
                </p>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6">
                  {author.name}
                </h2>
                <div className="space-y-4 text-text-body leading-relaxed">
                  <p>
                    Lamont D. McLeod doesn&apos;t do financial advice. He does financial autopsies.
                  </p>
                  <p>
                    In November 2010, a car accident left him quadriplegic. Thirteen days later, his mother died. 
                    Most people would call that a tragedy. Lamont calls it the moment he stopped lying to himself 
                    about what actually matters.
                  </p>
                  <p>
                    Before the accident, he was the guy calling you about your credit card debt. The irony wasn&apos;t 
                    lost on him — he was collecting on the same patterns he was living. He was practicing poverty 
                    until he became an expert.
                  </p>
                </div>
                <Link
                  href="/authors/lamont-mcleod"
                  className="inline-flex items-center mt-8 text-gold font-sans font-bold text-sm uppercase tracking-wider hover:text-gold-hover transition-colors"
                >
                  Read the Full Diagnosis &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-charcoal text-cream">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
            You&apos;ve Been Diagnosed.{" "}
            <span className="text-gold">Now What?</span>
          </h2>
          <p className="text-cream/70 text-lg mb-10 max-w-xl mx-auto">
            The patterns are visible. The muscle memory is documented. You can keep scrolling, 
            or you can read the full autopsy. Chapter 1 is free. The cure is up to you.
          </p>
          <Link
            href="/books/how-to-have-a-financial-heart-attack"
            className="inline-flex items-center justify-center px-10 py-5 bg-gold text-charcoal font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold-hover transition-colors"
          >
            Read Chapter 1 — Free
          </Link>
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
            <Link href="/authors/lamont-mcleod" className="hover:text-gold transition-colors">
              Author
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
