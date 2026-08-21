"use client";

import { useState, useEffect, useRef } from "react";

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
    tagline: "Universal link — all retailers",
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
  coverImageUrl,
  triggerText = "Choose Your Format",
}: MultiRetailerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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
      <a
        href={formats[0].purchaseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-8 py-4 border-2 border-gold text-gold font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold hover:text-charcoal transition-colors"
      >
        Buy Now — ${formats[0].retailPrice}
      </a>
    );
  }

  const grouped = FORMAT_ORDER.map((formatType) => ({
    formatType,
    items: formats.filter((f) => f.formatType === formatType),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center px-8 py-4 border-2 border-gold text-gold font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold hover:text-charcoal transition-colors"
      >
        {triggerText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm" />
          <div
            ref={modalRef}
            className="relative bg-cream rounded-lg shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
          >
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex justify-between items-start gap-4 mb-6">
                <div className="flex items-start gap-4 min-w-0">
                  {coverImageUrl && (
                    <img
                      src={coverImageUrl}
                      alt={bookTitle}
                      className="w-14 h-auto rounded shadow-md shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-gold font-sans text-xs uppercase tracking-[0.2em] mb-1">
                      Choose Your Retailer
                    </p>
                    <h3 className="font-heading text-xl font-bold text-charcoal leading-snug">
                      {bookTitle}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-charcoal/40 hover:text-charcoal transition-colors text-2xl leading-none p-1 shrink-0"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              {/* Format groups */}
              {grouped.map((group) => (
                <div key={group.formatType} className="mb-6 last:mb-0">
                  <p className="text-text-muted font-sans text-xs uppercase tracking-[0.2em] mb-2">
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
                          className="flex items-center gap-4 p-3 rounded-lg border border-charcoal/10 bg-white/60 hover:border-gold hover:bg-white hover:shadow-md transition-all group"
                        >
                          {meta.logo ? (
                            <span className="flex items-center justify-center w-20 h-11 bg-white rounded-md border border-charcoal/10 px-2 shrink-0">
                              <img
                                src={meta.logo}
                                alt={meta.logoAlt}
                                className="max-w-full max-h-full object-contain"
                              />
                            </span>
                          ) : (
                            <span className="w-20 h-11 shrink-0" />
                          )}
                          <span className="flex-1 min-w-0">
                            <span className="block font-sans font-bold text-charcoal text-sm">
                              {meta.name}
                            </span>
                            {meta.tagline && (
                              <span className="block text-text-muted text-xs mt-0.5 truncate">
                                {meta.tagline}
                              </span>
                            )}
                          </span>
                          <span className="text-gold font-bold text-sm shrink-0">
                            ${format.retailPrice}
                          </span>
                          <span className="text-gold group-hover:translate-x-1 transition-transform text-lg shrink-0">
                            &rarr;
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}

              <p className="text-text-muted text-xs text-center mt-6">
                You don&apos;t need another app. You need a pattern interrupt.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
