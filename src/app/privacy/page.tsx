import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import SeoJsonLd from "@/components/seo/SeoJsonLd";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { PRIVACY_CONTACT } from "@/lib/publisher";

export const metadata: Metadata = buildMetadata("privacy");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-4"><h2 className="font-heading text-2xl font-semibold text-charcoal">{title}</h2>{children}</section>;
}

export default function PrivacyPage() {
  return <main id="page-content" tabIndex={-1} className="w-full bg-cream text-charcoal">
    <SeoJsonLd type="privacy" />
    <Navbar />
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-28 md:pb-28 md:pt-36">
      <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">Privacy Policy</h1>
      <p className="mt-4 text-sm text-text-muted">Updated October 24, 2026</p>
      <p className="mt-6 text-lg leading-relaxed">EverRise Press LLC runs everrisepress.com. This policy explains the free-chapter signup, analytics, and advertising measurement. Tracking tools load by default. You can turn them off through Privacy choices in the footer.</p>
      <div className="mt-12 space-y-12 text-base leading-relaxed text-text-body">
        <Section title="Chapter signup and email">
          <p>When you unlock a chapter, we save your email address, the book, and the signup date in our Cloudflare database. If analytics is enabled and you arrive through a tracked partner link, we may also save the partner and referral details.</p>
          <p>The chapter opens on this site after signup. The current form does not send the chapter by email or subscribe you to an automated email series. Authorized site administrators can view and export signup records.</p>
        </Section>
        <Section title="Tracking settings">
          <p>Google Analytics, PostHog, and Meta load automatically when you visit the site, unless you have turned off their category in this browser. The notice below the footer copyright describes this behavior. There is no initial consent banner.</p>
          <p>Open Privacy choices in the footer to turn off analytics, advertising, or both. Choose Essential only to turn both off. We honor preferences already saved in this browser. Chapter access and form protection work regardless of these settings.</p>
          <p>Saving a change reloads the page and stops future tracking for the categories you turn off. It does not erase information already collected. Clearing your browser&apos;s site data removes the saved preferences, restores the default tracking settings, and may also remove your chapter access. Browser privacy tools can also limit cookies or tracking.</p>
        </Section>
        <Section title="Analytics and referrals">
          <p>With analytics enabled, Google Analytics and PostHog receive page visits and selected events, such as a chapter unlock or a retailer click. This can include browser and device details, page addresses, and a browser identifier. Session recording is disabled in our PostHog setup.</p>
          <p>With analytics enabled, we also save partner-link and retailer-click records in our database. These can include the book, partner or retailer, date, country, browser information, referring page, and a hashed IP address. Hashing changes the IP address into a code; it does not make every record anonymous.</p>
        </Section>
        <Section title="Advertising measurement">
          <p>With advertising measurement enabled, Meta can receive page views and chapter-signup events. For a signup, our server can send Meta a hashed email address, IP address, browser details, page address, and Meta browser identifiers when available. Meta uses this information to match and measure advertising activity.</p>
          <p>You can turn advertising measurement off through Privacy choices and still read the chapter.</p>
        </Section>
        <Section title="Cookies and browser storage">
          <ul className="list-disc space-y-3 pl-6">
            <li><strong>Privacy choice:</strong> after you save a preference, a cookie remembers your analytics and advertising settings for up to 180 days.</li>
            <li><strong>Chapter access:</strong> a signed cookie lasts up to seven days. New cookies contain the book identifier and token dates, without your email. Older cookies may include the email until they expire.</li>
            <li><strong>Partner referral:</strong> when analytics is enabled, a partner cookie lasts up to 30 days. We ignore it while analytics is off.</li>
            <li><strong>Analytics and advertising storage:</strong> Google Analytics, PostHog, and Meta can use cookies or local storage when their category is enabled. Their lifetimes vary by provider and browser. Local storage can remain until cleared.</li>
            <li><strong>Administration:</strong> signed-in site administrators have a separate login cookie lasting up to seven days.</li>
          </ul>
          <p>A cookie&apos;s expiry does not delete records already saved in a database or by a service provider.</p>
        </Section>
        <Section title="Hosting and form protection">
          <p>Cloudflare hosts the site and database. Cloudflare Turnstile checks browser and network signals to protect the signup form from automated abuse. These security functions can process technical information even when tracking is turned off.</p>
          <p>See <a className="underline underline-offset-4" href="https://www.cloudflare.com/privacypolicy/">Cloudflare&apos;s privacy policy</a> and the <a className="underline underline-offset-4" href="https://www.cloudflare.com/turnstile-privacy-policy/">Turnstile Privacy Addendum</a>.</p>
        </Section>
        <Section title="Service providers and retailers">
          <p>Cloudflare, Google, PostHog, and Meta process the information described above for the features and tracking tools in use. Their systems may process data outside your country. More detail is available in <a className="underline underline-offset-4" href="https://policies.google.com/privacy">Google&apos;s privacy policy</a>, <a className="underline underline-offset-4" href="https://posthog.com/privacy">PostHog&apos;s privacy policy</a>, and <a className="underline underline-offset-4" href="https://www.facebook.com/privacy/policy/">Meta&apos;s privacy policy</a>.</p>
          <p>Book purchases happen on separate retailer websites. Their checkout, payment, delivery, and privacy terms apply there. This site does not collect your payment-card details.</p>
        </Section>
        <Section title="Retention and requests">
          <p>The site currently keeps signup and referral records until they are manually deleted; there is no automatic deletion schedule. Provider-held analytics and advertising data have separate retention settings. Removing a browser cookie does not remove those records.</p>
          <p>To ask about your data or request a copy, correction, or deletion, email <a className="break-words underline underline-offset-4" href={`mailto:${PRIVACY_CONTACT}`}>{PRIVACY_CONTACT}</a>. Include the email you used for the chapter. We may need to confirm that a request relates to your own information.</p>
        </Section>
        <Section title="Contact and policy updates">
          <p>For book questions or website corrections, visit <Link className="underline underline-offset-4" href="/about#contact">About and contact</Link>. We will update the date on this page when this policy changes.</p>
        </Section>
      </div>
    </article>
    <SiteFooter />
  </main>;
}
