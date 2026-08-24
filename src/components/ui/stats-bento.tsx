import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";

/* ------------------------------------------------------------------ */
/* Building blocks (exported for reuse)                               */
/* ------------------------------------------------------------------ */

/** Diagonal hairline texture, masked radially from the top-right. */
export function BentoLines({ className }: { className?: string }) {
  return <span aria-hidden className={cn("bento-lines", className)} />;
}

/** Small pill eyebrow label, in dark or light surface tone. */
export function BentoBadge({
  tone = "light",
  children,
}: {
  tone?: "dark" | "light";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest",
        tone === "dark" ? "bg-cream/10 text-cream/60" : "bg-charcoal/5 text-text-muted"
      )}
    >
      {children}
    </span>
  );
}

/** Decorative compounding bar-chart motif; final bar picks up the gold accent. */
export function MiniBars({ className }: { className?: string }) {
  const heights = [15, 32, 24, 47, 39, 61, 54, 78, 70, 92, 100];
  return (
    <div aria-hidden className={cn("flex h-8 items-end gap-1", className)}>
      {heights.map((h, i) => (
        <div
          key={i}
          className={cn("w-1.5 rounded-full", i === heights.length - 1 ? "bg-gold" : "bg-charcoal/20")}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatsBento — Pattern Deck grid                                     */
/* ------------------------------------------------------------------ */

/**
 * Shared template for numbered pattern tiles. Both tiles render through
 * this one component with identical slots (numeral pinned top, text block
 * pinned bottom) so spacing stays unified at every viewport width.
 */
function PatternTile({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <GlassCard surface="light" interactive className="h-full">
      <div className="flex h-full flex-col p-7">
        <p className="font-heading text-2xl font-bold leading-none tracking-tighter text-gold-deep">
          {index}
        </p>
        <div className="mt-auto pt-5">
          <h3 className="font-heading text-lg font-bold leading-snug text-charcoal">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">{children}</p>
        </div>
      </div>
    </GlassCard>
  );
}

interface StatsBentoProps {
  /** Book landing page target used by the anchor + CTA cards. */
  bookHref: string;
  /** Book cover shown in the horizontal CTA strip. Omit to hide. */
  coverImageUrl?: string;
  coverAlt?: string;
  /** Author profile target for the tall card. Omit to hide. */
  authorHref?: string;
  authorName?: string;
  authorAvatarUrl?: string;
}

export default function StatsBento({
  bookHref,
  coverImageUrl,
  coverAlt,
  authorHref,
  authorName,
  authorAvatarUrl,
}: StatsBentoProps) {
  return (
    <div className="rhythm-gap grid grid-flow-dense grid-cols-1 gap-5 md:auto-rows-[15rem] md:grid-cols-3">
      {/* Primary stat — charcoal anchor with line texture */}
      <div className="md:col-span-2 md:row-span-2">
        <Link href={bookHref} className="group block h-full">
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-cream/10 bg-charcoal p-7 transition-colors duration-500 group-hover:border-cream/25 md:p-10">
            <BentoLines />
            <div className="relative">
              <BentoBadge tone="dark">The weekly cycle</BentoBadge>
              <p className="mt-6 max-w-md font-heading text-4xl font-bold leading-[0.98] tracking-tighter text-cream md:text-6xl">
                Friday is coming.{" "}
                <span className="text-gold">So is the crash.</span>
              </p>
            </div>
            <div className="relative mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xs text-sm leading-relaxed text-cream/60">
                Every Monday, it&apos;s gone. Every Friday, the cycle resets.
                The pattern doesn&apos;t break itself. It compounds.
              </p>
              <span className="group/btn inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-cream/25 px-5 py-3 text-xs font-bold uppercase tracking-wider text-cream transition-colors duration-300 group-hover:border-gold group-hover:text-gold">
                The Diagnosis
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Pattern tile 01 */}
      <PatternTile index="01" title="The Penny Candy Foundation">
        How a ten-dollar bill and a bag of quarters taught you to be broke
        before you could read.
      </PatternTile>

      {/* Pattern tile 02 */}
      <PatternTile index="02" title="First Paycheck Syndrome">
        Why every Monday feels like a financial hangover, and why the raise
        never fixes it.
      </PatternTile>

      {/* Secondary stat row — cover CTA with mini bars */}
      <div className="md:col-span-2">
        <Link href={bookHref} className="block h-full">
          <GlassCard surface="light" interactive radius="3xl" className="h-full">
            <div className="flex h-full items-center justify-between gap-6 p-5 md:p-6">
              <div className="flex min-w-0 items-center gap-5 md:gap-6">
                {coverImageUrl && (
                  <span className="relative hidden h-[7.5rem] w-20 shrink-0 overflow-hidden rounded-xl border border-charcoal/10 shadow-lg sm:block md:h-36 md:w-24">
                    <Image
                      src={coverImageUrl}
                      alt={coverAlt ?? ""}
                      fill
                      sizes="6rem"
                      className="object-cover"
                    />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-heading text-2xl font-bold leading-tight text-charcoal md:text-3xl">
                    The diagnosis is free.
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold-deep">
                    Read Chapter 1 Free
                    <ArrowRight className="size-4" />
                  </p>
                </div>
              </div>
              <MiniBars className="hidden shrink-0 pr-2 sm:flex" />
            </div>
          </GlassCard>
        </Link>
      </div>

      {/* Rating-style tile — author */}
      {authorHref && (
        <div className="md:row-span-2">
          <Link href={authorHref} className="block h-full">
            <GlassCard surface="light" interactive radius="3xl" className="h-full">
              <div className="flex h-full flex-col justify-between gap-6 p-7 md:p-8">
                <div className="flex items-center gap-4">
                  {authorAvatarUrl && (
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-gold bg-cream shadow-sm">
                      <Image
                        src={authorAvatarUrl}
                        alt=""
                        fill
                        sizes="3rem"
                        className="object-cover"
                      />
                    </span>
                  )}
                  {authorName && (
                    <p className="font-heading text-lg font-bold leading-tight text-charcoal">
                      {authorName}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold leading-tight text-charcoal md:text-3xl">
                    The Awakening
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    The moment you realize you&apos;re the debtor you&apos;ve been
                    calling. Written by a man who collected the debts he was living.
                  </p>
                </div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-deep">
                  Meet the Author
                  <ArrowUpRight className="size-3.5" />
                </p>
              </div>
            </GlassCard>
          </Link>
        </div>
      )}

      {/* Pattern tile 03 — wide format with pull-quote */}
      <div className="md:col-span-2">
        <GlassCard surface="light" interactive radius="3xl" className="h-full">
          <div className="flex h-full flex-col justify-between gap-5 p-7 md:flex-row md:items-center md:gap-8">
            <div className="flex min-w-0 items-start gap-5">
              <p className="font-heading text-2xl font-bold leading-none tracking-tighter text-gold-deep">
                03
              </p>
              <div>
                <h3 className="font-heading text-xl font-bold text-charcoal">
                  The Job Hopping Hustle
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
                  Chasing the next paycheck instead of building a foundation.
                </p>
              </div>
            </div>
            <p className="shrink-0 font-heading text-xl font-semibold italic text-gold-deep md:pb-1">
              &ldquo;Money will always come.&rdquo;
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
