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
  triggerText?: string;
}

const DISTRIBUTOR_LABELS: Record<string, { name: string; tagline: string }> = {
  AMAZON_KDP: { name: "Amazon Kindle", tagline: "For Kindle readers and Prime members" },
  DRAFT2DIGITAL: { name: "Books2Read", tagline: "Universal link — all retailers" },
  INGRAMSPARK: { name: "Bookshop.org", tagline: "Support independent bookstores" },
  APPLE_BOOKS: { name: "Apple Books", tagline: "For iPhone, iPad, and Mac readers" },
  BARNES_AND_NOBLE: { name: "Barnes & Noble", tagline: "For Nook readers" },
  KOBO: { name: "Rakuten Kobo", tagline: "For Kobo eReader users" },
  BOOKSHOP_ORG: { name: "Bookshop.org", tagline: "Support independent bookstores" },
};

const FORMAT_ICONS: Record<string, string> = {
  EBOOK: "📱",
  PAPERBACK: "📖",
  HARDCOVER: "📕",
  AUDIOBOOK: "🎧",
};

export default function MultiRetailerModal({
  formats,
  bookTitle,
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
            className="relative bg-cream rounded-lg shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-gold font-sans text-xs uppercase tracking-[0.2em] mb-1">
                    Choose Your Retailer
                  </p>
                  <h3 className="font-heading text-2xl font-bold text-charcoal">
                    {bookTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-charcoal/40 hover:text-charcoal transition-colors text-2xl leading-none p-1"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <p className="text-text-muted text-sm mb-6">
                Pick where you want to read. Every link takes you directly to the retailer.
              </p>

              <div className="space-y-3">
                {formats.map((format) => {
                  const dist = DISTRIBUTOR_LABELS[format.distributor] || {
                    name: format.distributor,
                    tagline: "",
                  };
                  const icon = FORMAT_ICONS[format.formatType] || "📖";

                  return (
                    <a
                      key={format.id}
                      href={format.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-lg border border-charcoal/10 hover:border-gold/50 hover:bg-white transition-all group"
                    >
                      <span className="text-2xl shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-charcoal text-sm uppercase">
                            {format.formatType}
                          </span>
                          <span className="text-gold font-bold">
                            ${format.retailPrice}
                          </span>
                        </div>
                        <p className="text-text-muted text-xs mt-0.5">
                          {dist.name} — {dist.tagline}
                        </p>
                      </div>
                      <span className="text-gold group-hover:translate-x-1 transition-transform text-lg">
                        &rarr;
                      </span>
                    </a>
                  );
                })}
              </div>

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
