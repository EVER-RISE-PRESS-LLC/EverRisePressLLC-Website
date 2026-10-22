import Link from "next/link";
import Image from "next/image";
import { BookOpen, UserRound, ShieldCheck } from "lucide-react";

interface SiteFooterProps {
  /** Optional extra links per page. */
  extraLinks?: { label: string; href: string }[];
}

export default function SiteFooter({ extraLinks = [] }: SiteFooterProps) {
  const links = [
    { label: "Home", href: "/", icon: BookOpen },
    { label: "Author", href: "/authors/lamont-mcleod", icon: UserRound },
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent"
      />
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
              className="text-sm text-cream/70 transition-colors duration-300 hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-cream/60 md:flex-row">
          <p>&copy; {new Date().getFullYear()} EverRise Press LLC. All rights reserved.</p>
          <p>Read. Reflect. Start a conversation.</p>
        </div>
      </div>
    </footer>
  );
}
