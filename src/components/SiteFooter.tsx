import Link from "next/link";
import Image from "@/components/ui/SiteImage";
import { BookOpen, UserRound, ShieldCheck } from "lucide-react";
import { BlogFooterLink } from "@/components/blog/BlogAvailability";
import { PrivacySettingsButton } from "@/components/privacy/PrivacyPreferences";

interface SiteFooterProps {
  /** Optional extra links per page. */
  extraLinks?: { label: string; href: string }[];
}

export default function SiteFooter({ extraLinks = [] }: SiteFooterProps) {
  const links = [
    { label: "Home", href: "/", icon: BookOpen },
    { label: "Author", href: "/authors/lamont-mcleod", icon: UserRound },
    { label: "About & contact", href: "/about", icon: UserRound },
    { label: "Press & book info", href: "/press", icon: BookOpen },
    { label: "Privacy", href: "/privacy", icon: ShieldCheck },
  ];

  const seenHrefs = new Set(links.map((link) => link.href));
  const extra = extraLinks
    .filter((link) => !seenHrefs.has(link.href))
    .map((link) => ({ ...link, icon: BookOpen }));
  const allLinks = [...links, ...extra];

  return (
    <footer
      className="relative overflow-hidden border-t border-cream/10 bg-charcoal"
      data-nav-surface="dark"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-6 py-14 md:flex-row">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="EverRise Press"
            width={36}
            height={36}
            className="size-9 rounded-full object-contain"
          />
          <div>
            <p className="font-heading text-lg font-semibold text-cream">
              EverRise Press LLC
            </p>
            <p className="text-xs uppercase tracking-wider text-cream/60">
              Books about money and the stories behind our habits.
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {allLinks.map((link) => (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              className="inline-flex min-h-11 items-center text-sm text-cream/70 transition-colors duration-300 hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
          <BlogFooterLink />
        </nav>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-cream/60 md:flex-row">
            <p>&copy; {new Date().getFullYear()} EverRise Press LLC. All rights reserved.</p>
            <p>Read. Reflect. Start a conversation.</p>
          </div>
          <div className="mt-4 max-w-3xl text-center text-sm leading-relaxed text-cream/75 md:text-left">
            <p>Google Analytics, PostHog, and Meta load by default to measure visits and advertising. They may use cookies and device information. You can change these settings below.</p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-5 md:justify-start">
              <Link href="/privacy" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-gold">Privacy policy</Link>
              <PrivacySettingsButton />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
