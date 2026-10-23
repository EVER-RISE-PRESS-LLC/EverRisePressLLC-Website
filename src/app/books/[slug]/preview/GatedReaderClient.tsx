"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import TurnstileLeadForm from "@/components/forms/TurnstileLeadForm";
import { trackEvent } from "@/components/providers/PostHogProvider";
import { gtagEvent } from "@/lib/gtag";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

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
  partnerSlug: string | null;
  hasAccess: boolean;
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
  partnerSlug,
  hasAccess,
}: GatedReaderClientProps) {
  const isUnlocked = hasAccess;
  const trackedOpen = useRef(false);

  useEffect(() => {
    if (!isUnlocked && !trackedOpen.current) {
      trackedOpen.current = true;
      trackEvent("chapter_unlock_modal_open", {
        book_slug: bookSlug,
        partner_slug: partnerSlug ?? null,
      });
      gtagEvent("chapter_unlock_modal_open", {
        book_slug: bookSlug,
        partner_slug: partnerSlug ?? undefined,
      });
    }
  }, [isUnlocked, bookSlug, partnerSlug]);

  const handleSuccess = () => {
    // The server verifies the HttpOnly cookie and returns the chapter on reload.
    window.location.reload();
  };

  return (
    <div className="bg-cream text-charcoal min-h-screen">
      <Navbar
        cta={{
          label: isUnlocked ? "Get the Full Book" : "Back to Book",
          href: `/books/${bookSlug}`,
        }}
        refreshKey={isUnlocked ? "unlocked" : "locked"}
      />

      {isUnlocked ? (
        <main id="page-content" tabIndex={-1}>
          <article
            className="mx-auto max-w-180 px-6 pb-12 pt-28 md:px-8 md:pb-16 md:pt-32"
            data-nav-surface="light"
          >
            <p className="text-gold font-sans text-xs uppercase tracking-[0.2em] mb-3">
              Free Chapter 1 Preview
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

          <section
            className="ambient-dark bg-grain relative overflow-hidden rhythm-section"
            data-nav-surface="dark"
          >
            <div className="max-w-3xl mx-auto px-6 text-center">
              <p className="text-gold font-sans text-xs uppercase tracking-[0.2em] mb-4">
                End of Free Preview
              </p>
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
                That Was Just the <span className="text-gold">Surface.</span>
              </h2>
              <p className="text-cream/70 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                You&apos;ve seen where the pattern started. The rest of the book shows you
                exactly how it snowballed, and what to do about it. 14 more chapters.
                Every one a mirror.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                {purchaseUrl ? (
                  <a
                    href={purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-10 py-5 bg-gold text-charcoal font-sans font-bold text-sm uppercase tracking-wider rounded-md hover:bg-gold-hover transition-colors duration-300 active:scale-[0.98]"
                  >
                    Get the Full Book for ${retailPrice}
                  </a>
                ) : (
                  <Link
                    href={`/books/${bookSlug}`}
                    className="inline-flex items-center justify-center px-10 py-5 bg-gold text-charcoal font-sans font-bold text-sm uppercase tracking-wider rounded-md hover:bg-gold-hover transition-colors duration-300 active:scale-[0.98]"
                  >
                    Get the Full Book for ${retailPrice}
                  </Link>
                )}
                <Link
                  href={`/books/${bookSlug}`}
                  className="inline-flex items-center justify-center px-10 py-5 border border-cream/25 text-cream font-sans font-bold text-sm uppercase tracking-wider rounded-md hover:border-gold hover:text-gold transition-colors duration-300 active:scale-[0.98]"
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
        <main id="page-content" tabIndex={-1} className="rhythm-top pb-20 md:pb-24" data-nav-surface="light">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-start">
              <div className="md:col-span-2 flex flex-col items-center md:items-start">
                <div className="relative w-56 md:w-full aspect-2/3 rounded-lg shadow-2xl shadow-gold/10 overflow-hidden border border-gold/20 mb-6">
                  <Image
                    src={bookCoverUrl}
                    alt={`${bookTitle} cover`}
                    fill
                    sizes="(max-width: 768px) 14rem, 24rem"
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
                  The Diagnosis: Chapter 1
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
                  <TurnstileLeadForm
                    bookSlug={bookSlug}
                    partnerSlug={partnerSlug}
                    onSuccess={handleSuccess}
                  />
                </div>

                <div className="mt-8 pt-8 border-t border-charcoal/10">
                  <p className="text-text-muted text-sm mb-3">
                    What you&apos;ll read in this chapter:
                  </p>
                  <ul className="list-disc space-y-2 pl-5 text-text-body text-sm marker:text-gold-deep">
                    <li>
                      The $10 weekly allowance that taught you money is infinite
                    </li>
                    <li>
                      Penny candy, quarters, and the muscle memory of spending everything
                    </li>
                    <li>
                      Why Friday money became your most dangerous pattern
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      <SiteFooter />
    </div>
  );
}
