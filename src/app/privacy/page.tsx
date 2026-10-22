import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import SeoJsonLd from "@/components/seo/SeoJsonLd";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = buildMetadata("privacy");

const SECTIONS = [
  {
    title: "Overview",
    body: [
      "EverRise Press LLC (\u201cwe\u201d, \u201cus\u201d) publishes books and offers a free first-chapter reading experience. This policy explains what personal data we collect through everrisepress.com, why we collect it, and the choices you have.",
      "We collect the minimum needed to deliver the free chapter and follow up by email. We do not sell your personal information.",
    ],
  },
  {
    title: "What We Collect",
    body: [
      "Email address. Required to unlock the free Chapter 1 preview and to deliver the related reading sequence.",
      "Reading context. We record which book you unlocked and, if you arrived through a partner link, which partner referred you. We also store referral parameters (such as utm_source) attached to your visit.",
      "Bot-verification result. Our forms run Cloudflare Turnstile, which shares a one-time verification token with Cloudflare to confirm you are human. Turnstile does not show you ads or track you across sites.",
    ],
  },
  {
    title: "How We Use It",
    body: [
      "To unlock the free chapter and remember your access on return visits.",
      "To send you the reading sequence for the book you unlocked, delivered through our email service provider, Mailchimp. Every email includes an unsubscribe link.",
      "To understand which pages and referrals work, in aggregate, so we can improve the site.",
    ],
  },
  {
    title: "Cookies",
    body: [
      "chapter_access: a short-lived, signed cookie set after you unlock a chapter, so you do not have to re-enter your email. It contains no personal data beyond your access status.",
      "No advertising or cross-site tracking cookies are set by us.",
    ],
  },
  {
    title: "Sharing",
    body: [
      "Mailchimp stores your email address on our behalf to deliver the reading sequence. Their processing is governed by their own privacy terms.",
      "Retailers such as Amazon, Draft2Digital, and Bookshop.org are separate companies. If you click through to buy, their policies apply to anything you do on their sites.",
      "We disclose personal data only when required by law.",
    ],
  },
  {
    title: "Your Rights",
    body: [
      "You can unsubscribe from our emails at any time using the link in any message.",
      "You can request a copy of your data or ask us to delete it by emailing privacy@everrisepress.com. We will respond within 30 days.",
      "If you are in the EU or UK, you may also lodge a complaint with your local data protection authority.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "We keep your email address and reading history until you unsubscribe or request deletion. Aggregate, anonymized statistics may be retained longer.",
    ],
  },
  {
    title: "Changes",
    body: [
      "If we change this policy, we will post the updated version on this page with a new effective date.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main id="page-content" tabIndex={-1} className="w-full max-w-full overflow-x-hidden bg-cream text-charcoal">
      <SeoJsonLd type="privacy" />
      <Navbar />
      <section
        className="ambient-cream relative rhythm-top pb-20 md:pb-28"
        data-nav-surface="light"
      >
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="font-heading text-4xl font-bold leading-tight text-charcoal text-balance md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm uppercase tracking-wider text-text-muted">
            Effective August 2026
          </p>

          <div className="rhythm-gap space-y-12">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="font-heading text-2xl font-bold text-charcoal">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-relaxed text-text-body">
                  {section.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
