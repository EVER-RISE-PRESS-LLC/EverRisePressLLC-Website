"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "The Book", href: "/books/how-to-have-a-financial-heart-attack" },
  { label: "Author", href: "/authors/lamont-mcleod" },
];

const DEFAULT_CTA = {
  label: "Read Chapter 1 Free",
  href: "/books/how-to-have-a-financial-heart-attack/preview",
};

type NavSurface = "dark" | "light";

interface NavbarProps {
  /** Overrides the default CTA pill for contextual pages. */
  cta?: { label: string; href: string };
  /**
   * Change this value to make the navbar re-scan `[data-nav-surface]`
   * sections — needed on pages whose sections mount conditionally
   * (e.g. the gated reader swapping locked/unlocked views).
   */
  refreshKey?: string | number;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar({ cta, refreshKey }: NavbarProps) {
  const activeCta = cta ?? DEFAULT_CTA;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [surface, setSurface] = useState<NavSurface>("dark");
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-surface]")
    );
    if (sections.length === 0) return;

    let observer: IntersectionObserver | null = null;

    const observe = () => {
      const bottom = -(window.innerHeight - 88);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const value = entry.target.getAttribute("data-nav-surface");
              if (value === "dark" || value === "light") {
                setSurface(value);
              }
            }
          }
        },
        { rootMargin: `-72px 0px ${bottom}px 0px`, threshold: 0 }
      );
      sections.forEach((section) => observer?.observe(section));
    };

    observe();
    window.addEventListener("resize", observe);
    return () => {
      window.removeEventListener("resize", observe);
      observer?.disconnect();
    };
  }, [pathname, refreshKey]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const isLight = surface === "light";

  return (
    <>
      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
        className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
      >
        <motion.nav
          layout
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          animate={{
            maxWidth: scrolled ? "72rem" : "46rem",
            paddingTop: scrolled ? "0.625rem" : "0.875rem",
            paddingBottom: scrolled ? "0.625rem" : "0.875rem",
            paddingLeft: scrolled ? "1.5rem" : "1.25rem",
            paddingRight: scrolled ? "1.5rem" : "1.25rem",
            borderRadius: scrolled ? "1.25rem" : "9999px",
          }}
          className={cn(
            "flex w-full items-center justify-between gap-6",
            isLight ? "glass-light" : "glass-dark"
          )}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="EverRise Press home"
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-500",
                isLight ? "bg-charcoal" : "bg-cream/10"
              )}
            >
              <Image
                src="/images/logo.png"
                alt=""
                width={24}
                height={24}
                className="size-6 rounded-full object-contain"
              />
            </span>
            <span
              className={cn(
                "font-heading text-lg font-semibold transition-colors duration-500",
                isLight ? "text-charcoal" : "text-cream"
              )}
            >
              EverRise Press
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-500",
                    active
                      ? isLight
                        ? "text-gold-deep"
                        : "text-gold"
                      : isLight
                        ? "text-charcoal/80 hover:text-charcoal"
                        : "text-cream/80 hover:text-cream"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      className={cn(
                        "absolute inset-0 rounded-full transition-colors duration-500",
                        isLight ? "bg-charcoal/10" : "bg-cream/10"
                      )}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block">
            <Link
              href={activeCta.href}
              className="group inline-flex items-center gap-1.5 rounded-full bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-charcoal transition-colors duration-300 hover:bg-gold-hover"
            >
              {activeCta.label}
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className={cn(
              "rounded-full p-2.5 transition-colors duration-500 md:hidden",
              isLight
                ? "text-charcoal hover:bg-charcoal/10"
                : "text-cream hover:bg-cream/10"
            )}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="size-5" />
          </button>
        </motion.nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] md:hidden"
          >
            <div
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="glass-dark absolute inset-x-3 top-3 overflow-hidden rounded-3xl p-6"
            >
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream/10">
                    <Image
                      src="/images/logo.png"
                      alt=""
                      width={24}
                      height={24}
                      className="size-6 rounded-full object-contain"
                    />
                  </span>
                  <span className="font-heading text-lg font-semibold text-cream">
                    EverRise Press
                  </span>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full p-2.5 text-cream transition-colors hover:bg-cream/10"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-4 font-heading text-2xl font-semibold transition-colors",
                        isActive(pathname, link.href)
                          ? "text-gold"
                          : "text-cream hover:bg-cream/10"
                      )}
                    >
                      {link.label}
                      <ArrowUpRight className="size-5 text-cream/50" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.3 }}
                className="mt-6"
              >
                <Link
                  href={activeCta.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gold px-6 py-4 text-sm font-bold uppercase tracking-wider text-charcoal"
                >
                  {activeCta.label}
                  <ArrowUpRight className="size-4" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
