import Image from "next/image";
import type { Metadata } from "next";
import { getDatabase } from "@/lib/db/client";
import { books, authors, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cleanDashes, cn } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo/metadata";
import SeoJsonLd from "@/components/seo/SeoJsonLd";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ReactiveButton from "@/components/ui/ReactiveButton";
import Reveal from "@/components/ui/Reveal";
import ScrubStatement from "@/components/ui/ScrubStatement";
import ScrollStack, { ScrollStackItem } from "@/components/ui/ScrollStack";
import CoverParallax from "@/components/ui/CoverParallax";
import StoryCarousel from "@/components/ui/StoryCarousel";
import StatsBento from "@/components/ui/stats-bento";
import DotGrid from "@/components/ui/DotGrid";
import {
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata("home");

interface StackCardData {
  label: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  position: string;
  tone: "cream" | "charcoal";
}

const STACK_CARDS: StackCardData[] = [
  {
    label: "The Payday Cycle",
    title: "Waiting for Next Friday",
    body: "McLeod reflects on spending an allowance before the next one arrived, and how that expectation followed him into working life.",
    image: "/images/stack/img3.jpg",
    alt: "Painting of a man seated in a backyard chair with his head on fire",
    position: "object-[50%_45%]",
    tone: "cream",
  },
  {
    label: "The Starting Point",
    title: "A Ten-Dollar Allowance",
    body: "Penny candy and arcade games are where the story begins. Chapter 1 explores what McLeod learned from spending his weekly allowance.",
    image: "/images/stack/img1.jpg",
    alt: "Grainy silhouette of a person whose head is consumed by orange and blue flame",
    position: "object-[50%_40%]",
    tone: "charcoal",
  },
  {
    label: "The Hustle",
    title: "Chasing Every Friday",
    body: "The book follows McLeod's experience of moving between jobs and expecting the next paycheck to solve the same recurring problems.",
    image: "/images/stack/img2.jpg",
    alt: "Painting of a figure slumped on a rooftop, head burning against a deep blue sky",
    position: "object-[50%_50%]",
    tone: "cream",
  },
  {
    label: "The Reflection",
    title: "The Awakening",
    body: "Working in debt collection led McLeod to reconsider his own choices. The book invites readers to reflect on their own money stories.",
    image: "/images/stack/img4.jpg",
    alt: "Classical painting of a collapsed figure whose body opens onto a blue sky with clouds",
    position: "object-[50%_45%]",
    tone: "charcoal",
  },
];

function StackCard({ card, flip }: { card: StackCardData; flip: boolean }) {
  const cream = card.tone === "cream";
  return (
    <div
      className={cn(
        "grid overflow-hidden rounded-3xl border md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]",
        cream ? "border-charcoal/10 bg-cream" : "border-cream/15 bg-[#221E18]"
      )}
    >
      <div className={cn("relative h-56 md:h-auto md:min-h-104", flip && "md:order-2")}>
        <Image
          src={card.image}
          alt={card.alt}
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          className={cn("object-cover", card.position)}
        />
      </div>
      <div className="flex flex-col justify-center p-7 md:p-12">
        <p
          className={cn(
            "text-xs font-bold uppercase tracking-[0.2em] md:text-sm",
            cream ? "text-gold-deep" : "text-gold"
          )}
        >
          {card.label}
        </p>
        <h3
          className={cn(
            "mt-4 font-heading text-2xl font-bold leading-snug md:text-4xl",
            cream ? "text-charcoal" : "text-cream"
          )}
        >
          {card.title}
        </h3>
        <p
          className={cn(
            "mt-4 text-base leading-relaxed md:text-lg",
            cream ? "text-text-body" : "text-cream/75"
          )}
        >
          {card.body}
        </p>
      </div>
    </div>
  );
}

export default async function Home() {
  const db = await getDatabase();

  const book = await db
    .select()
    .from(books)
    .where(eq(books.slug, "how-to-have-a-financial-heart-attack"))
    .limit(1)
    .then((rows) => rows[0]);

  const author = await db
    .select()
    .from(authors)
    .where(eq(authors.slug, "lamont-mcleod"))
    .limit(1)
    .then((rows) => rows[0]);

  const formats = book
    ? await db
        .select()
        .from(bookFormats)
        .where(eq(bookFormats.bookId, book.id))
    : [];

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-cream text-charcoal">
      <SeoJsonLd type="home" />
      <Navbar />

      {/* Attention - Hero */}
      <section className="bg-charcoal bg-grain relative overflow-hidden pb-20 pt-28 md:pb-28 md:pt-32" data-nav-surface="dark">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <DotGrid
            dotSize={2}
            gap={20}
            baseColor="#4A4438"
            activeColor="#D4AF37"
            proximity={200}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={2}
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
            <div>
              <Reveal>
                <h1 className="max-w-2xl font-heading text-[clamp(2.25rem,5.5vw,4.5rem)] font-bold leading-[1.06] text-cream text-balance">
                  <span className="block">Books About Money.</span>{" "}
                  <span className="block text-gold">Stories Behind the Habits.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-cream/80 md:text-xl">
                  EverRise Press publishes <em>How To Have a Financial Heart Attack</em>{" "}
                  by Lamont D. McLeod, a personal account of childhood spending,
                  payday habits, and working in debt collection. Start with Chapter 1,
                  free with email signup.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <ReactiveButton
                    href="/books/how-to-have-a-financial-heart-attack/preview"
                    size="lg"
                    surface="dark"
                  >
                    Read Chapter 1 Free
                    <ArrowRight className="size-4" />
                  </ReactiveButton>
                  {/* <ReactiveButton
                    href="#the-book"
                    variant="outline"
                    size="lg"
                    surface="dark"
                    pointerEffects={false}
                  >
                    See How Bad It Really Is
                  </ReactiveButton> */}
                </div>
              </Reveal>
            </div>

            {book && (
              <Reveal delay={0.18} className="relative z-10">
                <div className="mx-auto w-56 rotate-3 sm:w-64 lg:w-72 xl:w-80">
                  <span
                    aria-hidden
                    className="absolute -inset-6 rounded-full bg-gold/20 blur-3xl"
                  />
                  <div className="glass-dark relative overflow-hidden rounded-2xl p-2.5">
                    <span aria-hidden className="glass-sheen" />
                    <div className="relative aspect-2/3 overflow-hidden rounded-xl">
                      <Image
                        src={book.coverImageUrl}
                        alt={`${book.title} cover`}
                        fill
                        sizes="(max-width: 1024px) 16rem, 20rem"
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Interest - The Pattern Deck bento */}
      <section className="ambient-cream relative rhythm-section" data-nav-surface="light">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="max-w font-heading text-3xl font-bold leading-tight text-charcoal text-balance md:text-5xl">
              Inside <em>How To Have a Financial Heart Attack</em>.{" "}
              <span className="text-gold-deep">
                Three themes from McLeod&apos;s story.
              </span>
            </h2>
          </Reveal>

          <StatsBento
            bookHref="/books/how-to-have-a-financial-heart-attack/preview"
            coverImageUrl={book?.coverImageUrl}
            coverAlt={book ? `${book.title} cover` : undefined}
            authorHref="/authors/lamont-mcleod"
            authorName={author?.name}
            authorAvatarUrl={author?.avatarUrl || "/images/authors/lamont-mcleod.jpg"}
          />
        </div>
      </section>

      {/* Desire - scrub reveal + card stacking */}
      <section className="ambient-dark bg-grain relative overflow-hidden rhythm-section" data-nav-surface="dark">
        <div className="mx-auto max-w-5xl px-6">
          <ScrubStatement
            text="What did your first experiences with money teach you?"
            accentFrom={6}
            className="font-heading text-3xl font-bold leading-snug text-cream md:text-5xl"
          />
        </div>

        <div className="mt-14 md:mt-20">
          <div className="mx-auto max-w-6xl px-6">
            <ScrollStack
              useWindowScroll
              itemDistance={72}
              itemStackDistance={24}
              stackPosition="16%"
              scaleEndPosition="10%"
              baseScale={0.9}
              itemScale={0.03}
            >
              {STACK_CARDS.map((card, i) => (
                <ScrollStackItem
                  key={card.title}
                  itemClassName="overflow-hidden rounded-3xl shadow-[0_32px_64px_-24px_rgba(0,0,0,0.7)]"
                >
                  <StackCard card={card} flip={i % 2 === 1} />
                </ScrollStackItem>
              ))}
            </ScrollStack>
          </div>
        </div>

        {book && (
          <div id="the-book" className="mx-auto mt-32 max-w-6xl scroll-mt-32 px-6 md:mt-56">
            <div className="grid items-center gap-12 md:grid-cols-[auto_1fr] md:gap-20">
              <div className="mx-auto w-64 md:w-80">
                <div className="glass-dark relative overflow-hidden rounded-2xl p-2.5">
                  <span aria-hidden className="glass-sheen" />
                  <CoverParallax
                    src={book.coverImageUrl}
                    alt={`${book.title} cover`}
                    className="aspect-2/3 overflow-hidden rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Reveal>
                  <h2 className="font-heading text-3xl font-bold leading-tight text-cream md:text-5xl">
                    {book.title}
                  </h2>
                </Reveal>
                {book.subtitle && (
                  <Reveal delay={0.1}>
                    <p className="mt-4 font-heading text-lg italic text-cream/75 md:text-xl">
                      {book.subtitle}
                    </p>
                  </Reveal>
                )}
                <Reveal delay={0.18}>
                  <div className="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-cream/75">
                    {cleanDashes(book.synopsis)
                      .split("\n\n")
                      .slice(0, 3)
                      .map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                  </div>
                </Reveal>
                <Reveal delay={0.26}>
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <ReactiveButton
                      href="/books/how-to-have-a-financial-heart-attack/preview"
                      surface="dark"
                      pointerEffects={false}
                    >
                      Read Chapter 1 Free
                      <ArrowRight className="size-4" />
                    </ReactiveButton>
                    {formats.length > 0 && (
                      <ReactiveButton
                        href={formats[0].purchaseUrl}
                        external
                        variant="outline"
                        surface="dark"
                        pointerEffects={false}
                      >
                        Get the Book for ${formats[0].retailPrice}
                      </ReactiveButton>
                    )}
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Author + testimony */}
      <section className="ambient-cream relative rhythm-section" data-nav-surface="light">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-14 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-20">
            <div>
              <Reveal>
                <h2 className="font-heading text-3xl font-bold leading-tight text-charcoal text-balance md:text-5xl">
                  Meet the Author.{" "}
                  <span className="text-gold-deep">Lamont D. McLeod.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="mt-10 flex items-center gap-5">
                  {author && (
                    <div className="size-20 shrink-0 overflow-hidden rounded-2xl border-2 border-gold shadow-xl shadow-gold/15 md:size-24">
                      <Image
                        src={author.avatarUrl || "/images/authors/lamont-mcleod.jpg"}
                        alt={author.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-heading text-2xl font-bold text-charcoal">
                      {author?.name}
                    </p>
                    <p className="text-sm font-medium uppercase tracking-wider text-gold-deep">
                      {author?.title}
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-8 max-w-md text-base leading-relaxed text-text-body">
                  McLeod draws on his own experiences with an allowance, paychecks,
                  and debt collection. His author profile brings together his
                  background and the story behind the book.
                </p>
              </Reveal>
              <Reveal delay={0.28}>
                <div className="mt-8">
                  <ReactiveButton
                    href="/authors/lamont-mcleod"
                    variant="outline"
                    size="sm"
                    surface="light"
                  >
                    Read the Author Profile
                    <ArrowRight className="size-3.5" />
                  </ReactiveButton>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15}>
              <StoryCarousel />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Action - CTA with inline typography pill */}
      <section className="ambient-dark bg-grain relative overflow-hidden rhythm-section" data-nav-surface="dark">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <Reveal>
            <h2 className="mx-auto max-w-4xl font-heading text-4xl font-bold leading-tight text-cream text-balance md:text-6xl">
              Start with{" "}
              <span className="inline-block w-20 overflow-hidden rounded-full border border-gold/40 align-middle shadow-lg shadow-gold/20 md:w-28">
                {book && (
                  <Image
                    src={book.coverImageUrl}
                    alt=""
                    width={112}
                    height={56}
                    className="h-9 w-full object-cover object-top md:h-12"
                  />
                )}
              </span>{" "}
              <span className="text-gold">Chapter 1.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-cream/80">
              Read how McLeod&apos;s story begins with a ten-dollar allowance.
              Enter your email to read the chapter free, then decide whether the
              full book is for you.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-12 flex justify-center">
              <ReactiveButton
                href="/books/how-to-have-a-financial-heart-attack/preview"
                size="lg"
                surface="dark"
              >
                Read Chapter 1 Free
                <ArrowRight className="size-4" />
              </ReactiveButton>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
