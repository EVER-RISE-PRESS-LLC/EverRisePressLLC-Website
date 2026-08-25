"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ReactiveButton from "@/components/ui/ReactiveButton";
import { gtagEvent } from "@/lib/gtag";
import { ArrowUpRight } from "lucide-react";

interface BookFormat {
  id: string;
  formatType: string;
  retailPrice: number;
  currency: string;
  distributor: string;
  purchaseUrl: string;
  isbn: string | null;
}

interface MultiRetailerModalProps {
  formats: BookFormat[];
  bookTitle: string;
  bookSlug?: string;
  coverImageUrl?: string;
  triggerText?: string;
}

interface RetailerMeta {
  name: string;
  tagline: string;
  logo: string;
  logoAlt: string;
}

const RETAILER_META: Record<string, RetailerMeta> = {
  AMAZON_KDP: {
    name: "Amazon Kindle",
    tagline: "For Kindle readers and Prime members",
    logo: "/images/retailers/amazon.png",
    logoAlt: "Amazon",
  },
  DRAFT2DIGITAL: {
    name: "Books2Read",
    tagline: "Universal link, all retailers",
    logo: "/images/retailers/books2read.png",
    logoAlt: "Books2Read",
  },
  INGRAMSPARK: {
    name: "Bookshop.org",
    tagline: "Support independent bookstores",
    logo: "/images/retailers/bookshop-org.png",
    logoAlt: "Bookshop.org",
  },
  APPLE_BOOKS: {
    name: "Apple Books",
    tagline: "For iPhone, iPad, and Mac readers",
    logo: "/images/retailers/apple-books.png",
    logoAlt: "Apple Books",
  },
  BARNES_AND_NOBLE: {
    name: "Barnes & Noble",
    tagline: "For Nook readers",
    logo: "/images/retailers/barnes-and-noble.png",
    logoAlt: "Barnes & Noble",
  },
  KOBO: {
    name: "Rakuten Kobo",
    tagline: "For Kobo eReader users",
    logo: "/images/retailers/kobo.png",
    logoAlt: "Rakuten Kobo",
  },
  BOOKSHOP_ORG: {
    name: "Bookshop.org",
    tagline: "Support independent bookstores",
    logo: "/images/retailers/bookshop-org.png",
    logoAlt: "Bookshop.org",
  },
};

const FORMAT_LABELS: Record<string, string> = {
  EBOOK: "eBook",
  PAPERBACK: "Paperback",
  HARDCOVER: "Hardcover",
  AUDIOBOOK: "Audiobook",
};

const FORMAT_ORDER = ["EBOOK", "PAPERBACK", "HARDCOVER", "AUDIOBOOK"];

export default function MultiRetailerModal({
  formats,
  bookTitle,
  bookSlug,
  coverImageUrl,
  triggerText = "Choose Your Format",
}: MultiRetailerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  function trackRetailerClick(format: BookFormat) {
    gtagEvent("retailer_redirect_click", {
      book_slug: bookSlug,
      retailer: format.distributor,
      format_type: format.formatType,
    });
    if (!bookSlug) return;
    try {
      fetch("/api/retailer-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookSlug,
          retailer: format.distributor,
          formatType: format.formatType,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // tracking must never block navigation
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (formats.length === 0) return null;

  if (formats.length === 1) {
    return (
      <ReactiveButton
        href={formats[0].purchaseUrl}
        external
        variant="outline"
        surface="dark"
        onClick={() => trackRetailerClick(formats[0])}
      >
        Buy Now for ${formats[0].retailPrice}
        <ArrowUpRight className="size-4" />
      </ReactiveButton>
    );
  }

  const grouped = FORMAT_ORDER.map((formatType) => ({
    formatType,
    items: formats.filter((f) => f.formatType === formatType),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <ReactiveButton
        onClick={() => setIsOpen(true)}
        variant="outline"
        surface="dark"
      >
        {triggerText}
        <ArrowUpRight className="size-4" />
      </ReactiveButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-charcoal/80 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="glass-light relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl"
            >
              <span aria-hidden className="glass-sheen" />
              <div className="relative p-6 md:p-8">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    {coverImageUrl && (
                      <Image
                        src={coverImageUrl}
                        alt={bookTitle}
                        width={56}
                        height={84}
                        className="w-14 shrink-0 rounded-md shadow-md"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">
                        Choose Your Retailer
                      </p>
                      <h3 className="font-heading text-xl font-bold leading-snug text-charcoal">
                        {bookTitle}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="shrink-0 p-1 text-2xl leading-none text-charcoal/60 transition-colors hover:text-charcoal"
                    aria-label="Close modal"
                  >
                    &times;
                  </button>
                </div>

                {/* Format groups */}
                {grouped.map((group) => (
                  <div key={group.formatType} className="mb-6 last:mb-0">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
                      {FORMAT_LABELS[group.formatType] || group.formatType}
                    </p>
                    <div className="space-y-2">
                      {group.items.map((format) => {
                        const meta = RETAILER_META[format.distributor] || {
                          name: format.distributor,
                          tagline: "",
                          logo: "",
                          logoAlt: format.distributor,
                        };

                        return (
                          <a
                            key={format.id}
                            href={format.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackRetailerClick(format)}
                            className="group flex items-center gap-4 rounded-xl border border-charcoal/10 bg-white/60 p-3 transition-all duration-300 hover:border-gold hover:bg-white hover:shadow-lg"
                          >
                            {meta.logo ? (
                              <span className="flex h-11 w-20 shrink-0 items-center justify-center rounded-md border border-charcoal/10 bg-white px-2">
                                <Image
                                  src={meta.logo}
                                  alt={meta.logoAlt}
                                  width={80}
                                  height={44}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </span>
                            ) : (
                              <span className="h-11 w-20 shrink-0" />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold text-charcoal">
                                {meta.name}
                              </span>
                              {meta.tagline && (
                                <span className="mt-0.5 block truncate text-xs text-text-muted">
                                  {meta.tagline}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 text-sm font-bold text-gold-deep">
                              ${format.retailPrice}
                            </span>
                            <span className="shrink-0 text-lg text-gold-deep transition-transform duration-300 group-hover:translate-x-1">
                              &rarr;
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <p className="mt-6 text-center text-xs text-text-muted">
                  You don&apos;t need another app. You need a pattern interrupt.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
