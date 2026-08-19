import type { WithContext, Book, Organization, Person, WebSite } from "schema-dts";

const SITE_URL = "https://everrisepressdev.workers.dev";
const PUBLISHER_NAME = "EverRise Press";

interface BookFormatData {
  formatType: string;
  isbn: string | null;
  retailPrice: number;
  currency: string;
  purchaseUrl: string;
}

interface BookData {
  slug: string;
  title: string;
  subtitle: string | null;
  synopsis: string;
  coverImageUrl: string;
  publishedAt: string | null;
  formats: BookFormatData[];
}

interface AuthorData {
  slug: string;
  name: string;
  title: string | null;
  bio: string;
  avatarUrl: string | null;
  socialLinks: Record<string, string> | null;
}

const FORMAT_TYPE_MAP: Record<string, "https://schema.org/EBook" | "https://schema.org/Paperback" | "https://schema.org/Hardcover" | "https://schema.org/AudiobookFormat"> = {
  EBOOK: "https://schema.org/EBook",
  PAPERBACK: "https://schema.org/Paperback",
  HARDCOVER: "https://schema.org/Hardcover",
  AUDIOBOOK: "https://schema.org/AudiobookFormat",
};

export function getBookSchema(book: BookData, author: AuthorData): WithContext<Book> {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${SITE_URL}/books/${book.slug}#book`,
    name: book.subtitle ? `${book.title}: ${book.subtitle}` : book.title,
    url: `${SITE_URL}/books/${book.slug}`,
    description: book.synopsis,
    image: `${SITE_URL}${book.coverImageUrl}`,
    inLanguage: "en-US",
    datePublished: book.publishedAt || undefined,
    publisher: {
      "@type": "Organization",
      name: PUBLISHER_NAME,
      url: SITE_URL,
    },
    author: {
      "@type": "Person",
      name: author.name,
      url: `${SITE_URL}/authors/${author.slug}`,
    },
    workExample: book.formats.map((f) => ({
      "@type": "Book" as const,
      bookFormat: FORMAT_TYPE_MAP[f.formatType] || ("https://schema.org/EBook" as const),
      isbn: f.isbn || undefined,
      offers: {
        "@type": "Offer" as const,
        price: f.retailPrice.toString(),
        priceCurrency: f.currency,
        availability: "https://schema.org/InStock" as const,
        url: f.purchaseUrl,
      },
    })),
  };
}

export function getOrganizationSchema(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: PUBLISHER_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description:
      "Independent digital publishing house. We don't do financial advice. We do financial autopsies.",
  };
}

export function getPersonSchema(author: AuthorData): WithContext<Person> {
  const sameAs: string[] = [];
  if (author.socialLinks) {
    Object.values(author.socialLinks).forEach((url) => {
      if (url) sameAs.push(url);
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `${SITE_URL}/authors/${author.slug}`,
    image: author.avatarUrl ? `${SITE_URL}${author.avatarUrl}` : undefined,
    jobTitle: author.title || undefined,
    description: author.bio.slice(0, 500),
    worksFor: {
      "@type": "Organization",
      name: PUBLISHER_NAME,
      url: SITE_URL,
    },
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

export function getWebSiteSchema(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: PUBLISHER_NAME,
    url: SITE_URL,
    description:
      "Independent digital publishing house delivering transformative financial and personal development content.",
  };
}
