"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import TurnstileLeadForm from "@/components/forms/TurnstileLeadForm";
import { trackEvent } from "@/components/providers/PostHogProvider";
import { gtagEvent } from "@/lib/gtag";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ReactiveButton from "@/components/ui/ReactiveButton";
import { ArrowUpRight } from "lucide-react";
import { FINANCIAL_HEART_ATTACK_SLUG } from "@/lib/book-editorial";
import { trackRetailerClick } from "@/lib/retailer-click";

interface GatedReaderClientProps {
  bookSlug: string;
  bookTitle: string;
  bookSubtitle: string | null;
  bookCoverUrl: string;
  chapterTitle: string;
  chapterBody: string;
  authorName: string;
  authorSlug: string;
  ebookOffer: { purchaseUrl: string; price: string } | null;
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
  ebookOffer,
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

          <section id="get-the-book" className="rhythm-section bg-gold text-charcoal" data-nav-surface="light" aria-labelledby="continue-reading-title">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-14">
              <div className="order-2 flex items-center gap-6 md:order-none md:flex-col md:items-start lg:items-center">
                <Image src={bookCoverUrl} alt={`${bookTitle} book cover`} width={240} height={360} sizes="(max-width: 767px) 112px, 240px" className="press-book-jacket h-auto w-28! shrink-0 md:w-60!" />
                <p className="max-w-60 text-base leading-relaxed">{bookTitle}<br /><Link href={`/authors/${authorSlug}`} className="mt-2 inline-flex min-h-11 items-center text-sm underline hover:no-underline">By {authorName}</Link></p>
              </div>
              <div className="order-1 min-w-0 md:order-none">
                <h2 id="continue-reading-title" className="max-w-xl font-heading text-4xl font-bold leading-[1.08] text-balance md:text-5xl lg:text-6xl">Keep reading the full story.</h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed">{bookSlug === FINANCIAL_HEART_ATTACK_SLUG ? "Follow McLeod through early jobs, borrowed money, and life in Atlanta in the remaining fourteen chapters." : "You have reached the end of the free preview. Explore the full book to keep reading."}</p>
                <div className="mt-8 max-w-xl">
                  {ebookOffer ? <>
                    <ReactiveButton href={ebookOffer.purchaseUrl} external surface="light" size="lg" className="press-purchase-button w-full" onClick={() => trackRetailerClick({ bookSlug, distributor: "APPLE_BOOKS", formatType: "EBOOK" })}>Get the Full Book for {ebookOffer.price}<ArrowUpRight className="size-5" aria-hidden /></ReactiveButton>
                    <p className="mt-3 text-sm leading-relaxed">eBook on Apple Books · US price. Final price may vary by country.</p>
                  </> : <ReactiveButton href={`/books/${bookSlug}#editions`} surface="light" size="lg" className="press-purchase-button w-full">Get the full book<ArrowUpRight className="size-5" aria-hidden /></ReactiveButton>}
                  <Link href={`/books/${bookSlug}#editions`} className="mt-5 inline-flex min-h-11 items-center text-base font-semibold underline hover:no-underline">See all formats and retailers</Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <main id="page-content" tabIndex={-1} className="rhythm-top pb-20 md:pb-24" data-nav-surface="light">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-start">
              <div className="order-2 md:order-none md:col-span-2 flex flex-col items-center md:items-start">
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

              <div className="order-1 md:order-none md:col-span-3">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3 leading-tight">
                  {chapterTitle}
                </h1>
                <p className="text-text-muted mb-6">Chapter 1 of <Link href={`/books/${bookSlug}`} className="underline hover:text-gold-deep">{bookTitle}</Link>{bookSubtitle && <span className="sr-only">: {bookSubtitle}</span>} by <Link href={`/authors/${authorSlug}`} className="underline hover:text-gold-deep">{authorName}</Link>.</p>
                <p className="text-text-body text-lg leading-relaxed mb-8">
                  Read how a weekly allowance and trips to the candy store began McLeod&apos;s story.
                  Enter your email and complete the verification to open the free chapter on this site.
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
                      McLeod&apos;s $10 weekly allowance for chores
                    </li>
                    <li>
                      Sunday trips to the penny candy store and arcade
                    </li>
                    <li>
                      His memory of spending the allowance and waiting for Friday
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
