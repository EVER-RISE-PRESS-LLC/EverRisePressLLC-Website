"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import ReactiveButton from "@/components/ui/ReactiveButton";
import { gtagEvent } from "@/lib/gtag";
import { browserConsent } from "@/lib/privacy-consent";
import { ArrowUpRight, X, ArrowRight } from "lucide-react";

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

  function trackRetailerClick(format: BookFormat) {
    if (!browserConsent().analytics) return;
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
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <ReactiveButton variant="outline" size="lg" surface="dark">{triggerText}<ArrowUpRight className="size-4"/></ReactiveButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="press-dialog-overlay"/>
        <Dialog.Content className="press-retailer-dialog">
          <div className="p-6 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                {coverImageUrl && <Image src={coverImageUrl} alt="" width={56} height={84} className="w-14 shrink-0 rounded-sm"/>}
                <div className="min-w-0">
                  <Dialog.Title className="font-heading text-xl font-semibold leading-snug text-charcoal">{bookTitle}</Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-text-muted">Choose a format and retailer.</Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild><button className="flex size-11 shrink-0 items-center justify-center rounded-md text-charcoal hover:bg-charcoal/10" aria-label="Close retailer chooser"><X size={20}/></button></Dialog.Close>
            </div>
            {grouped.map(group => <div key={group.formatType} className="mb-6 last:mb-0">
              <h3 className="mb-3 text-sm font-bold text-text-body">{FORMAT_LABELS[group.formatType] || group.formatType}</h3>
              <div className="space-y-2">
                {group.items.map(format => {
                  const meta = RETAILER_META[format.distributor] || {name:format.distributor,tagline:"",logo:"",logoAlt:format.distributor};
                  return <a key={format.id} href={format.purchaseUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackRetailerClick(format)} className="flex items-center gap-3 rounded-md border border-charcoal/20 bg-white p-3 text-charcoal transition-colors hover:border-gold-deep hover:bg-cream">
                    {meta.logo && <Image src={meta.logo} alt={meta.logoAlt} width={64} height={40} className="h-10 w-16 shrink-0 object-contain"/>}
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{meta.name}</span><span className="mt-1 block text-xs text-text-muted">{meta.tagline}</span></span>
                    <span className="shrink-0 text-sm font-bold">${format.retailPrice}</span><ArrowRight size={16} aria-hidden/>
                  </a>;
                })}
              </div>
            </div>)}
            <p className="mt-6 text-xs text-text-muted">Opens the retailer in a new tab.</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
