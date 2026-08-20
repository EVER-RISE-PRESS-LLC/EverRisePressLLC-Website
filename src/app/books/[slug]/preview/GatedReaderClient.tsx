"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TurnstileLeadForm from "@/components/forms/TurnstileLeadForm";

interface GatedReaderClientProps {
  bookSlug: string;
  bookTitle: string;
  bookSubtitle: string | null;
  bookCoverUrl: string;
  chapterTitle: string;
  chapterBody: string;
  authorName: string;
  authorSlug: string;
  purchaseUrl: string;
  retailPrice: number;
}

export default function GatedReaderClient({
  bookSlug,
  bookTitle,
  bookSubtitle,
  bookCoverUrl,
  chapterTitle,
  chapterBody,
  authorName,
  authorSlug,
  purchaseUrl,
  retailPrice,
}: GatedReaderClientProps) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof document !== "undefined") {
      return document.cookie.includes("chapter_access");
    }
    return false;
  });

  const handleSuccess = () => {
    setIsUnlocked(true);
  };

  return (
    <div className="bg-cream text-charcoal min-h-screen">
      <header className="bg-charcoal py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="EverRise Press"
              width={28}
              height={28}
            />
            <span className="text-cream font-heading text-base">EverRise Press</span>
          </Link>
          <div className="flex items-center gap-6">
            {isUnlocked && purchaseUrl && (
              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center px-5 py-2 bg-gold text-charcoal font-sans font-bold text-xs uppercase tracking-wider rounded hover:bg-gold-hover transition-colors"
              >
                Buy Full Book — ${retailPrice}
              </a>
            )}
            <Link
              href={`/books/${bookSlug}`}
              className="text-gold font-sans text-sm uppercase tracking-wider hover:text-gold-hover transition-colors"
            >
              Back to Book
            </Link>
          </div>
        </div>
      </header>

      {isUnlocked ? (
        <main>
          <article className="max-w-[720px] mx-auto px-6 md:px-8 py-12 md:py-20">
            <p className="text-gold font-sans text-xs uppercase tracking-[0.2em] mb-3">
              Chapter 1 — Free Preview
            </p>
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-charcoal mb-10 leading-tight">
              {chapterTitle}
            </h1>
            <div
              className="prose-content text-text-body text-lg leading-[1.85] space-y-6
                [&_p:first-of-type]:first-letter:font-heading
                [&_p:first-of-type]:first-letter:text-6xl
                [&_p:first-of-type]:first-letter:font-bold
                [&_p:first-of-type]:first-letter:text-gold
                [&_p:first-of-type]:first-letter:float-left
                [&_p:first-of-type]:first-letter:mr-3
                [&_p:first-of-type]:first-letter:mt-1
                [&_p:first-of-type]:first-letter:leading-none"
              dangerouslySetInnerHTML={{ __html: chapterBody }}
            />
          </article>

          <section className="bg-charcoal text-cream py-16 md:py-24">
            <div className="max-w-3xl mx-auto px-6 text-center">
              <p className="text-gold font-sans text-xs uppercase tracking-[0.2em] mb-4">
                End of Free Preview
              </p>
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
                That Was Just the <span className="text-gold">Surface.</span>
              </h2>
              <p className="text-cream/70 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                You&apos;ve seen where the pattern started. The rest of the book shows you 
                exactly how it snowballed — and what to do about it. 14 more chapters. 
                Every one a mirror.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                {purchaseUrl && (
                  <a
                    href={purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-10 py-5 bg-gold text-charcoal font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold-hover transition-colors"
                  >
                    Get the Full Book — ${retailPrice}
                  </a>
                )}
                <Link
                  href={`/books/${bookSlug}`}
                  className="inline-flex items-center justify-center px-10 py-5 border-2 border-gold text-gold font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold hover:text-charcoal transition-colors"
                >
                  See All Formats
                </Link>
              </div>

              <div className="flex items-center justify-center gap-4 pt-8 border-t border-cream/10">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold">
                  <Image
                    src="/images/authors/lamont-mcleod.jpg"
                    alt={authorName}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-left">
                  <p className="text-cream text-sm font-semibold">{authorName}</p>
                  <Link
                    href={`/authors/${authorSlug}`}
                    className="text-gold text-xs hover:text-gold-hover transition-colors"
                  >
                    Read the author&apos;s full story
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <main className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-start">
              <div className="md:col-span-2 flex flex-col items-center md:items-start">
                <div className="relative w-56 md:w-full aspect-[2/3] rounded-lg shadow-2xl shadow-gold/10 overflow-hidden border border-gold/20 mb-6">
                  <Image
                    src={bookCoverUrl}
                    alt={`${bookTitle} cover`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="text-text-muted text-xs uppercase tracking-wider text-center md:text-left">
                  Free Chapter 1 Preview
                </p>
              </div>

              <div className="md:col-span-3">
                <p className="text-gold font-sans text-xs uppercase tracking-[0.2em] mb-3">
                  The Diagnosis — Chapter 1
                </p>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3 leading-tight">
                  {chapterTitle}
                </h1>
                {bookSubtitle && (
                  <p className="text-text-muted italic mb-6">{bookSubtitle}</p>
                )}
                <p className="text-text-body text-lg leading-relaxed mb-8">
                  Most people don&apos;t like what they see. That&apos;s the point. Enter your email, 
                  complete the verification, and start reading immediately.
                </p>

                <div className="bg-white rounded-lg border border-charcoal/10 p-6 md:p-8">
                  <TurnstileLeadForm bookSlug={bookSlug} onSuccess={handleSuccess} />
                </div>

                <div className="mt-8 pt-8 border-t border-charcoal/10">
                  <p className="text-text-muted text-sm mb-3">
                    What you&apos;ll read in this chapter:
                  </p>
                  <ul className="space-y-2 text-text-body text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-gold mt-0.5">—</span>
                      The $10 weekly allowance that taught you money is infinite
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold mt-0.5">—</span>
                      Penny candy, quarters, and the muscle memory of spending everything
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold mt-0.5">—</span>
                      Why Friday money became your most dangerous pattern
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      <footer className="py-6 bg-charcoal border-t border-cream/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-cream/40 text-sm">
            &copy; {new Date().getFullYear()} EverRise Press LLC
          </span>
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
