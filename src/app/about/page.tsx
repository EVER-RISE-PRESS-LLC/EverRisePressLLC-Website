import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import SeoJsonLd from "@/components/seo/SeoJsonLd";
import ReactiveButton from "@/components/ui/ReactiveButton";
import { buildMetadata } from "@/lib/seo/metadata";
import { AUTHOR_SITE, BOOK_PATH, PUBLISHER_CONTACT, PRIVACY_CONTACT } from "@/lib/publisher";

export const metadata: Metadata = buildMetadata("about");

export default function AboutPage() {
  return <main id="page-content" tabIndex={-1} className="w-full bg-cream text-charcoal">
    <SeoJsonLd type="about" />
    <Navbar />
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-28 md:pb-28 md:pt-36">
      <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">About EverRise Press</h1>
      <p className="mt-6 text-xl leading-relaxed">EverRise Press LLC is the publishing venture founded by author Lamont D. McLeod. This site brings together his book, his author profile, and a free first chapter.</p>

      <section className="mt-12 space-y-4 text-base leading-relaxed text-text-body">
        <h2 className="font-heading text-2xl font-semibold text-charcoal">The book and the stories behind it</h2>
        <p><Link className="underline underline-offset-4" href={BOOK_PATH}>How To Have a Financial Heart Attack</Link> follows McLeod&apos;s experiences with a childhood allowance, payday spending, and work in debt collection. Its subtitle is <em>A New Standard for Wealth and Responsibility</em>.</p>
        <p>You can <Link className="underline underline-offset-4" href={`${BOOK_PATH}/preview`}>read Chapter 1 free with email signup</Link>. The chapter opens on this site. The book page links to retailers where you can check the edition, current price, and availability before buying.</p>
      </section>

      <section className="mt-12 space-y-4 text-base leading-relaxed text-text-body">
        <h2 className="font-heading text-2xl font-semibold text-charcoal">Meet Lamont D. McLeod</h2>
        <p>McLeod writes about money habits from his own experience. His wider work includes real estate, home care, and public speaking. Visit his <Link className="underline underline-offset-4" href="/authors/lamont-mcleod">author profile</Link> for the book, or <a className="underline underline-offset-4" href={`${AUTHOR_SITE}/story`}>his official website</a> for his background and speaking work.</p>
      </section>

      <section className="mt-12 space-y-4 text-base leading-relaxed text-text-body">
        <h2 className="font-heading text-2xl font-semibold text-charcoal">Book credits and edition details</h2>
        <p>The <a className="underline underline-offset-4" href="https://books.apple.com/us/book/how-to-have-a-financial-heart-attack-a-new/id6793190934">Apple Books edition</a> names HMD Publishing as publisher and lists a release date of July 20, 2026. HMDPublishing.com is also credited for book design in the manuscript. These are book credits; EverRise Press LLC operates this website.</p>
        <p>We check book descriptions against the manuscript and edition details against retailer records. Prices and availability can change, so confirm them with the retailer. The <Link className="underline underline-offset-4" href="/privacy">privacy policy</Link> explains the chapter signup and your tracking choices.</p>
      </section>

      <section id="contact" className="mt-12 space-y-4 border-t border-charcoal/20 pt-10 text-base leading-relaxed text-text-body">
        <h2 className="font-heading text-2xl font-semibold text-charcoal">Contact and corrections</h2>
        <p>For book questions, publishing inquiries, or a correction to this site, email <a className="break-words underline underline-offset-4" href={`mailto:${PUBLISHER_CONTACT}`}>{PUBLISHER_CONTACT}</a>. For corrections, include the page URL, the detail to check, and a source if you have one.</p>
        <p>For a question about your personal data, use <a className="break-words underline underline-offset-4" href={`mailto:${PRIVACY_CONTACT}`}>{PRIVACY_CONTACT}</a>. Include the email you used to unlock a chapter so we can find the relevant record.</p>
        <div className="pt-2"><ReactiveButton href={`mailto:${PUBLISHER_CONTACT}`}>Email EverRise Press</ReactiveButton></div>
      </section>
      <p className="mt-12 text-sm text-text-muted">Book credits and links checked October 24, 2026.</p>
    </article>
    <SiteFooter />
  </main>;
}
