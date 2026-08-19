import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/db/client";
import { authors, books, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPersonSchema } from "@/lib/schema";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 3600;

export async function generateStaticParams() {
  return [{ slug: "lamont-mcleod" }];
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

  const personSchema = getPersonSchema({
    slug: author.slug,
    name: author.name,
    title: author.title,
    bio: author.bio,
    avatarUrl: author.avatarUrl,
    socialLinks,
  });

  return (
    <div className="bg-cream text-charcoal min-h-screen">
      <JsonLd data={personSchema} />

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
            href="/books/how-to-have-a-financial-heart-attack"
            className="text-gold font-sans text-sm uppercase tracking-wider hover:text-gold-hover transition-colors"
          >
            Read Chapter 1
          </Link>
        </div>
      </header>

      {/* Author Hero */}
      <section className="py-16 md:py-24 bg-charcoal text-cream">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="shrink-0">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-gold shadow-2xl shadow-gold/20">
                <Image
                  src={author.avatarUrl || "/images/authors/lamont-mcleod.jpg"}
                  alt={author.name}
                  width={256}
                  height={256}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <p className="text-gold font-sans text-sm uppercase tracking-[0.2em] mb-2">
                {author.title}
              </p>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                {author.name}
              </h1>
              {socialLinks && (
                <div className="flex gap-4 justify-center md:justify-start">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cream/50 hover:text-gold transition-colors text-sm"
                    >
                      Facebook
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cream/50 hover:text-gold transition-colors text-sm"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-6 text-text-body text-lg leading-relaxed">
            {author.bio.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Books Section */}
      {booksWithFormats.length > 0 && (
        <section className="py-16 md:py-24 bg-charcoal text-cream">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-16">
              The <span className="text-gold">Diagnoses</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              {booksWithFormats.map((book) => (
                <div key={book.id} className="flex flex-col md:flex-row gap-8">
                  <div className="shrink-0">
                    <div className="relative w-48 h-72 bg-charcoal rounded-lg shadow-xl shadow-gold/10 overflow-hidden border border-gold/20 mx-auto md:mx-0">
                      <Image
                        src={book.coverImageUrl}
                        alt={`${book.title} cover`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-heading text-2xl font-bold mb-2">
                      {book.title}
                    </h3>
                    {book.subtitle && (
                      <p className="text-cream/50 italic mb-4">{book.subtitle}</p>
                    )}
                    <p className="text-cream/70 text-sm leading-relaxed mb-6 line-clamp-4">
                      {book.synopsis.split("\n\n")[0]}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href={`/books/${book.slug}`}
                        className="inline-flex items-center justify-center px-6 py-3 bg-gold text-charcoal font-sans font-bold text-xs uppercase tracking-wider rounded hover:bg-gold-hover transition-colors"
                      >
                        Read Chapter 1 Free
                      </Link>
                      {book.formats.length > 0 && (
                        <a
                          href={book.formats[0].purchaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-6 py-3 border border-gold text-gold font-sans font-bold text-xs uppercase tracking-wider rounded hover:bg-gold hover:text-charcoal transition-colors"
                        >
                          Buy — ${book.formats[0].retailPrice}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6">
            Looking for a Cheerleader?{" "}
            <span className="text-gold">Keep Scrolling.</span>
          </h2>
          <p className="text-text-body text-lg mb-10">
            If you&apos;re ready to see your financial chart the way a doctor reads an X-ray, 
            the diagnosis is free. The cure is up to you.
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
            <Link href="/" className="hover:text-gold transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
