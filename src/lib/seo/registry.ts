import type { GraphEntity } from "@jdevalk/seo-graph-core";
import {
  buildArticle,
  buildBreadcrumbList,
  buildImageObject,
  buildPiece,
  buildWebPage,
  buildWebSite,
} from "@jdevalk/seo-graph-core";
import type {
  Blog,
  Book,
  BreadcrumbList,
  Organization,
  Person,
  WebSite,
  WithContext,
} from "schema-dts";
import { asc, eq } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { authors, bookFormats, books } from "@/lib/db/schema";
import { cleanDashes } from "@/lib/utils";
import { BRAND_NAME, seoIds, SITE_URL, type SeoIds } from "./ids";
import { AUTHOR_SITE, PUBLISHER_CONTACT, TRUST_REVIEW_DATE } from "../publisher";
import { FINANCIAL_HEART_ATTACK_SLUG, financialHeartAttackEditorial, FORMAT_LABELS, uniqueEditions } from "../book-editorial";

/* ------------------------------------------------------------------ */
/* Content data shapes                                                */
/* ------------------------------------------------------------------ */

export interface BookFormatSeoData {
  formatType: string;
  isbn: string | null;
  retailPrice: number;
  currency: string;
  purchaseUrl: string;
}

export interface BookAuthorRefData {
  slug: string;
  name: string;
}

export interface BookSeoData {
  slug: string;
  title: string;
  subtitle: string | null;
  synopsis: string;
  coverImageUrl: string;
  publishedAt: string | null;
  updatedAt?: string | null;
  formats: BookFormatSeoData[];
  author: BookAuthorRefData | null;
}

export interface AuthorSeoData {
  slug: string;
  name: string;
  title: string | null;
  bio: string;
  avatarUrl: string | null;
  socialLinks: Record<string, string> | null;
  updatedAt?: string | null;
}

export interface ArticleSeoData {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string | null;
  imageUrl?: string;
  section?: string;
  wordCount?: number;
  author: BookAuthorRefData;
}

/* ------------------------------------------------------------------ */
/* Registry contract                                                  */
/* ------------------------------------------------------------------ */

export type SeoPageType = "home" | "book" | "author" | "about" | "privacy" | "article";

export interface SeoCrumbs {
  name: string;
  url?: string;
}

export interface SeoMetadataInput {
  /** Raw page title — buildMetadata appends " | EverRise Press". */
  title: string;
  description: string;
  /** Absolute path on the canonical origin, e.g. "/books/slug". */
  canonicalPath: string;
  imageUrl?: string;
  imageAlt?: string;
  extraOgImages?: { url: string; width: number; height: number; alt: string }[];
  ogType?: "website" | "article" | "profile" | "book";
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  noindex?: boolean;
}

export interface SeoSitemapEntry {
  path: string;
  lastModified?: string;
  priority?: number;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
}

export interface RegistryEntry {
  buildPieces(data: unknown, ids: SeoIds): GraphEntity[];
  buildBreadcrumbs(data: unknown): SeoCrumbs[];
  metadata(data: unknown): SeoMetadataInput;
  sitemapEntries?(db: Database): Promise<SeoSitemapEntry[]>;
  llmsSection?(db: Database): Promise<string | null>;
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                     */
/* ------------------------------------------------------------------ */

const FORMAT_TYPE_MAP: Record<
  string,
  | "https://schema.org/EBook"
  | "https://schema.org/Paperback"
  | "https://schema.org/Hardcover"
  | "https://schema.org/AudiobookFormat"
> = {
  EBOOK: "https://schema.org/EBook",
  PAPERBACK: "https://schema.org/Paperback",
  HARDCOVER: "https://schema.org/Hardcover",
  AUDIOBOOK: "https://schema.org/AudiobookFormat",
};

/** Parse a D1 text timestamp into a Date, guarding against invalid values. */
function safeDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

const HOME_CRUMB: SeoCrumbs = { name: "Home", url: `${SITE_URL}/` };

/**
 * Every intermediate breadcrumb must resolve to a real page. Collection
 * pages are omitted until they exist; an unlinked middle crumb is invalid.
 */
function breadcrumbListPiece(pageUrl: string, crumbs: SeoCrumbs[]): GraphEntity {
  return buildPiece<WithContext<BreadcrumbList>>({
    "@type": "BreadcrumbList",
    "@id": seoIds.breadcrumb(pageUrl),
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.url ? { item: { "@id": crumb.url } } : {}),
    })),
  });
}

/* ------------------------------------------------------------------ */
/* Site-wide entities (stubs used by graph.ts + home + /schema.json)  */
/* ------------------------------------------------------------------ */

export function organizationPiece(): GraphEntity {
  return buildPiece<WithContext<Organization>>({
    "@type": "Organization",
    "@id": seoIds.organization,
    name: BRAND_NAME,
    legalName: "EverRise Press LLC",
    email: PUBLISHER_CONTACT,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description:
      "Independent publisher of books about money, spending habits, and personal experience.",
  });
}

export function websitePiece(): GraphEntity {
  return buildWebSite(
    {
      "@id": seoIds.website,
      url: `${SITE_URL}/`,
      name: BRAND_NAME,
      description:
        "Books, author profiles, and free first-chapter previews from EverRise Press.",
      publisher: { "@id": seoIds.organization },
      inLanguage: "en-US",
    },
    seoIds.factory
  );
}

export function blogPiece(): GraphEntity {
  return buildPiece<WithContext<Blog>>({
    "@type": "Blog",
    "@id": seoIds.blog,
    name: `${BRAND_NAME} Blog`,
    url: `${SITE_URL}/blog/`,
    publisher: { "@id": seoIds.organization },
    inLanguage: "en-US",
    hasPart: [],
  });
}

/** Full Person entity for an author (author page + /schema.json corpus). */
export function buildPersonPiece(author: AuthorSeoData): GraphEntity {
  const sameAs = [...new Set([
    ...(author.socialLinks ? Object.values(author.socialLinks).filter(Boolean) : []),
    ...(author.slug === "lamont-mcleod" ? [AUTHOR_SITE] : []),
  ])];

  return buildPiece<WithContext<Person>>({
    "@type": "Person",
    "@id": seoIds.person(author.slug),
    name: author.name,
    url: `${SITE_URL}/authors/${author.slug}`,
    image: author.avatarUrl ? new URL(author.avatarUrl, SITE_URL).href : undefined,
    jobTitle: author.title ?? undefined,
    description: cleanDashes(author.bio).split("\n\n")[0],
    worksFor: { "@id": seoIds.organization },
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  });
}

/** Full Book entity (book page + /schema.json corpus). */
export function buildBookPiece(book: BookSeoData): GraphEntity {
  return buildPiece<WithContext<Book>>({
    "@type": "Book",
    "@id": seoIds.book(book.slug),
    name: book.subtitle ? `${book.title}: ${book.subtitle}` : book.title,
    url: `${SITE_URL}/books/${book.slug}`,
    description: cleanDashes(book.synopsis),
    image: new URL(book.coverImageUrl, SITE_URL).href,
    inLanguage: "en-US",
    datePublished: book.publishedAt || undefined,
    // Confirmed edition credit; keep it distinct from the website's organization.
    publisher: book.slug === FINANCIAL_HEART_ATTACK_SLUG ? { "@type": "Organization", name: "HMD Publishing" } : undefined,
    author: book.author ? {
      "@type": "Person",
      "@id": seoIds.person(book.author.slug),
      name: book.author.name,
      url: `${SITE_URL}/authors/${book.author.slug}`,
    } : undefined,
    workExample: uniqueEditions(book.formats).map((format) => ({
      "@type": "Book" as const,
      name: book.title,
      bookFormat: FORMAT_TYPE_MAP[format.formatType] || ("https://schema.org/EBook" as const),
      isbn: format.isbn || undefined,
      inLanguage: "en-US",
    })),
  });
}

/* ------------------------------------------------------------------ */
/* Registry                                                           */
/* ------------------------------------------------------------------ */

export const seoRegistry: Record<SeoPageType, RegistryEntry> = {
  home: {
    buildPieces() {
      return [
        organizationPiece(),
        websitePiece(),
        buildWebPage(
          {
            url: `${SITE_URL}/`,
            name: BRAND_NAME,
            isPartOf: { "@id": seoIds.website },
            about: { "@id": seoIds.organization },
            mainEntity: { "@id": seoIds.organization },
            inLanguage: "en-US",
          },
          seoIds.factory
        ),
      ];
    },
    buildBreadcrumbs() {
      return [];
    },
    metadata() {
      return {
        title: `${BRAND_NAME} | Books on Money and Spending Habits`,
        description:
          "Explore How To Have a Financial Heart Attack by Lamont D. McLeod. Read about the book, meet the author, and try Chapter 1 free with email signup.",
        canonicalPath: "/",
        imageUrl: `${SITE_URL}/images/og/everrise-home-20261022.jpg`,
        imageAlt: "How To Have a Financial Heart Attack book cover with author Lamont D. McLeod. Read Chapter 1 free with email signup.",
        ogTitle: "How To Have a Financial Heart Attack | Read Chapter 1 Free",
        twitterTitle: "How To Have a Financial Heart Attack | Read Chapter 1 Free",
      };
    },
    sitemapEntries: async () => [
      {
        path: "/",
        changeFrequency: "weekly",
        priority: 1,
      },
    ],
  },

  book: {
    buildPieces(data) {
      const book = data as BookSeoData;
      const url = `${SITE_URL}/books/${book.slug}`;

      return [
        buildBookPiece(book),
        buildWebPage(
          {
            url,
            name: book.title,
            isPartOf: { "@id": seoIds.website },
            breadcrumb: { "@id": seoIds.breadcrumb(url) },
            mainEntity: { "@id": seoIds.book(book.slug) },
            author: book.author ? { "@id": seoIds.person(book.author.slug) } : undefined,
            datePublished: safeDate(book.publishedAt),
            dateModified: safeDate(book.updatedAt),
            inLanguage: "en-US",
          },
          seoIds.factory
        ),
        breadcrumbListPiece(url, this.buildBreadcrumbs(data)),
      ];
    },
    buildBreadcrumbs(data) {
      const book = data as BookSeoData;
      return [
        HOME_CRUMB,
        { name: book.title, url: `${SITE_URL}/books/${book.slug}` },
      ];
    },
    metadata(data) {
      const book = data as BookSeoData;
      const description = book.slug === FINANCIAL_HEART_ATTACK_SLUG
        ? financialHeartAttackEditorial.metaDescription
        : `Explore ${book.title}${book.author ? ` by ${book.author.name}` : ""}. Read about the book, compare editions, and try the first chapter.`;
      return {
        title: book.title,
        description,
        canonicalPath: `/books/${book.slug}`,
        imageUrl: book.slug === "how-to-have-a-financial-heart-attack"
          ? `${SITE_URL}/images/og/${book.slug}.png`
          : `${SITE_URL}/images/og/everrise-default.png`,
        imageAlt: book.title,
        extraOgImages: [
          {
            url: `${SITE_URL}/images/og/everrise-default.png`,
            width: 1200,
            height: 630,
            alt: BRAND_NAME,
          },
        ],
        ogType: "book",
        ogTitle: book.title,
        ogDescription: description,
        twitterTitle: book.title,
        twitterDescription: description,
      };
    },
    sitemapEntries: async (db) => {
      const rows = await db
        .select({ slug: books.slug, updatedAt: books.updatedAt })
        .from(books);
      return rows.map((book) => ({
        path: `/books/${book.slug}`,
        lastModified: book.updatedAt ?? undefined,
        changeFrequency: "weekly",
        priority: 0.9,
      }));
    },
    llmsSection: async (db) => {
      const [bookRows, formatRows] = await Promise.all([
        db
          .select({
            slug: books.slug,
            title: books.title,
            subtitle: books.subtitle,
            synopsis: books.synopsis,
          })
          .from(books)
          .orderBy(asc(books.publishedAt)),
        db
          .select({
            bookSlug: books.slug,
            formatType: bookFormats.formatType,
            isbn: bookFormats.isbn,
          })
          .from(bookFormats)
          .innerJoin(books, eq(bookFormats.bookId, books.id)),
      ]);

      const formatsByBook = new Map<string, typeof formatRows>();
      for (const format of formatRows) {
        const list = formatsByBook.get(format.bookSlug) ?? [];
        const isDuplicate = list.some(
          (f) => f.formatType === format.formatType && f.isbn === format.isbn
        );
        if (!isDuplicate) list.push(format);
        formatsByBook.set(format.bookSlug, list);
      }

      const bookLines = bookRows
        .map((book) => {
          const formatsList = formatsByBook.get(book.slug) ?? [];
          const formatsSummary = formatsList
            .map(
              (f) =>
                `${FORMAT_LABELS[f.formatType] ?? f.formatType}${f.isbn ? ` (ISBN ${f.isbn})` : ""}`
            )
            .join(", ");
          const synopsis = book.synopsis.split("\n\n")[0].replace(/\s+/g, " ").trim();
          return [
            `### ${book.title}${book.subtitle ? ` — ${book.subtitle}` : ""}`,
            `- Slug: ${book.slug}`,
            `- URL: ${SITE_URL}/books/${book.slug}`,
            `- Formats: ${formatsSummary || "Coming soon"}`,
            `- Free sample with email signup: ${SITE_URL}/books/${book.slug}/preview`,
            ...(book.slug === FINANCIAL_HEART_ATTACK_SLUG ? ["- Edition publisher credit: HMD Publishing. EverRise Press uses publishing and distribution services through HMD."] : []),
            `- About: ${synopsis}`,
          ].join("\n");
        })
        .join("\n\n");

      return `## Catalog\n\n${bookLines || "No books published yet."}`;
    },
  },

  author: {
    buildPieces(data) {
      const author = data as AuthorSeoData;
      const url = `${SITE_URL}/authors/${author.slug}`;

      return [
        buildPersonPiece(author),
        buildWebPage(
          {
            url,
            name: author.name,
            isPartOf: { "@id": seoIds.website },
            breadcrumb: { "@id": seoIds.breadcrumb(url) },
            about: { "@id": seoIds.person(author.slug) },
            mainEntity: { "@id": seoIds.person(author.slug) },
            dateModified: safeDate(author.updatedAt),
            inLanguage: "en-US",
          },
          seoIds.factory,
          "ProfilePage"
        ),
        breadcrumbListPiece(url, this.buildBreadcrumbs(data)),
      ];
    },
    buildBreadcrumbs(data) {
      const author = data as AuthorSeoData;
      return [
        HOME_CRUMB,
        { name: author.name, url: `${SITE_URL}/authors/${author.slug}` },
      ];
    },
    metadata(data) {
      const author = data as AuthorSeoData;
      const description = author.slug === "lamont-mcleod"
        ? "Meet Lamont D. McLeod, author of How To Have a Financial Heart Attack. Explore his background, book, and free first-chapter preview."
        : `Explore ${author.name}'s background, author profile, and books on EverRise Press.`;
      return {
        title: author.name,
        description,
        canonicalPath: `/authors/${author.slug}`,
        imageUrl: `${SITE_URL}/images/og/everrise-default.png`,
        imageAlt: BRAND_NAME,
        ogType: "profile",
        ogTitle: author.name,
      };
    },
    sitemapEntries: async (db) => {
      const rows = await db
        .select({ slug: authors.slug, updatedAt: authors.updatedAt })
        .from(authors);
      return rows.map((author) => ({
        path: `/authors/${author.slug}`,
        lastModified: author.updatedAt ?? undefined,
        changeFrequency: "monthly",
        priority: 0.7,
      }));
    },
    llmsSection: async (db) => {
      const authorRows = await db
        .select({ slug: authors.slug, name: authors.name, title: authors.title })
        .from(authors);

      const authorLines = authorRows
        .map(
          (author) =>
            `### ${author.name}${author.title ? `, ${author.title}` : ""}\n- URL: ${SITE_URL}/authors/${author.slug}`
        )
        .join("\n\n");

      return `## Authors\n\n${authorLines || "No authors listed."}`;
    },
  },

  about: {
    buildPieces() {
      const url = `${SITE_URL}/about`;
      return [
        { ...buildWebPage({ url, name: "About EverRise Press", isPartOf: { "@id": seoIds.website }, about: { "@id": seoIds.organization }, mainEntity: { "@id": seoIds.organization }, breadcrumb: { "@id": seoIds.breadcrumb(url) }, inLanguage: "en-US", dateModified: new Date(TRUST_REVIEW_DATE) }, seoIds.factory), "@type": "AboutPage" },
        breadcrumbListPiece(url, this.buildBreadcrumbs({})),
      ];
    },
    buildBreadcrumbs() {
      return [HOME_CRUMB, { name: "About and contact", url: `${SITE_URL}/about` }];
    },
    metadata() {
      return {
        title: "About & Contact | EverRise Press",
        description: "Meet Lamont D. McLeod and the press behind this site. Check book credits, explore the free chapter, and contact us with questions or corrections.",
        canonicalPath: "/about",
      };
    },
    sitemapEntries: async () => [{ path: "/about", lastModified: TRUST_REVIEW_DATE, changeFrequency: "monthly", priority: 0.5 }],
    llmsSection: async () => `## Publisher and contact\n- About: ${SITE_URL}/about\n- Contact: ${PUBLISHER_CONTACT}\n- Privacy: ${SITE_URL}/privacy`,
  },

  privacy: {
    buildPieces() {
      return [
        buildWebPage(
          {
            url: `${SITE_URL}/privacy`,
            name: "Privacy Policy",
            isPartOf: { "@id": seoIds.website },
            inLanguage: "en-US",
          },
          seoIds.factory
        ),
      ];
    },
    buildBreadcrumbs() {
      return [];
    },
    metadata() {
      return {
        title: "Privacy Policy",
        description:
          "Learn how this site uses chapter signup data, cookies, analytics, and advertising. Manage tracking settings or contact us about your data.",
        canonicalPath: "/privacy",
      };
    },
    sitemapEntries: async () => [
      {
        path: "/privacy",
        lastModified: TRUST_REVIEW_DATE,
        changeFrequency: "yearly",
        priority: 0.1,
      },
    ],
  },

  /**
   * PRE-WIRED for the future blog. No posts table exists yet — adding one
   * later is a data-query job, not schema work. See docs/seo-system.md.
   */
  article: {
    buildPieces(data) {
      const article = data as ArticleSeoData;
      const url = `${SITE_URL}/blog/${article.slug}`;
      const authorId = seoIds.person(article.author.slug);

      return [
        blogPiece(),
        buildWebPage(
          {
            url,
            name: article.title,
            isPartOf: { "@id": seoIds.website },
            breadcrumb: { "@id": seoIds.breadcrumb(url) },
            author: { "@id": authorId },
            datePublished: safeDate(article.publishedAt),
            dateModified: safeDate(article.updatedAt),
            primaryImage: article.imageUrl
              ? { "@id": seoIds.primaryImage(url) }
              : undefined,
            inLanguage: "en-US",
          },
          seoIds.factory
        ),
        buildArticle(
          {
            url,
            isPartOf: [{ "@id": seoIds.webPage(url) }, { "@id": seoIds.blog }],
            author: { "@id": authorId },
            publisher: { "@id": seoIds.organization },
            headline: article.title,
            description: article.description,
            datePublished: safeDate(article.publishedAt) ?? new Date(),
            dateModified: safeDate(article.updatedAt),
            image: article.imageUrl
              ? { "@id": seoIds.primaryImage(url) }
              : undefined,
            articleSection: article.section,
            wordCount: article.wordCount,
            inLanguage: "en-US",
          },
          seoIds.factory,
          "BlogPosting"
        ),
        ...(article.imageUrl
          ? [
              buildImageObject(
                {
                  pageUrl: url,
                  url: article.imageUrl,
                  width: 1200,
                  height: 630,
                },
                seoIds.factory
              ),
            ]
          : []),
        buildPiece<WithContext<Person>>({
          "@type": "Person",
          "@id": authorId,
          name: article.author.name,
          url: `${SITE_URL}/authors/${article.author.slug}`,
        }),
        buildBreadcrumbList(
          {
            url,
            items: [
              { name: "Home", url: `${SITE_URL}/` },
              { name: "Blog", url: `${SITE_URL}/blog/` },
              { name: article.title, url },
            ],
          },
          seoIds.factory
        ),
      ];
    },
    buildBreadcrumbs(data) {
      const article = data as ArticleSeoData;
      return [
        HOME_CRUMB,
        { name: "Blog", url: `${SITE_URL}/blog/` },
        { name: article.title, url: `${SITE_URL}/blog/${article.slug}` },
      ];
    },
    metadata(data) {
      const article = data as ArticleSeoData;
      return {
        title: article.title,
        description: article.description,
        canonicalPath: `/blog/${article.slug}`,
        imageUrl: article.imageUrl,
        ogType: "article",
        ogTitle: article.title,
      };
    },
    sitemapEntries: async () => [],
    llmsSection: async () => null,
  },
};

/** Iteration order for registry-driven routes (sitemap, llms.txt). */
export const seoPageTypes: SeoPageType[] = [
  "home",
  "book",
  "author",
  "about",
  "privacy",
  "article",
];
