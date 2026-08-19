# AGENTS.md - Everise LLC Development Blueprint

## 1. Project Overview & Objectives
- **Organization:** Everise LLC (Founder & Lead Author: Lamont McLeod)
- **Primary Goal:** High-converting, SEO-first, and GEO-first (Generative Engine Optimization) digital publishing website.
- **Core Value Mechanism:** Gated Chapter 1 reading experience for email lead capture into Mailchimp nurture sequences, routing buyers to Amazon, Draft2Digital, and IngramSpark retail endpoints.
- **Affiliate/Referral Engine:** Dynamic podcast partner referral endpoints (`/refer/[code]`), cookie attribution, and admin management dashboard.

---

## 2. Technology Stack & Infrastructure

| Layer | Provider / Tool  | Architectural Role |
| :--- | :--- | :--- |
| **Framework** | Next.js 16+ (App Router, TypeScript, Tailwind CSS) | React Server Components (RSC) for zero-JS landing pages, Static Site Generation (SSG), and Edge API Routes. |
| **Hosting & Edge CDN** | Cloudflare Pages & Workers | Serverless global deployment, edge caching, and DNS management. |
| **Database** | Cloudflare D1 or Supabase (PostgreSQL) | Persistence for authors, books, leads, podcast affiliates, and referral telemetry. |
| **ORM** | Prisma or Drizzle ORM | Type-safe queries with edge runtime compatibility. |
| **Lead Engine / ESP** | Mailchimp Marketing API v3.0 | Audience segmentation, automated lead tagging, and drip onboarding sequences. |
| **Bot Mitigation** | Cloudflare Turnstile | Privacy-friendly, zero-friction CAPTCHA for email opt-in forms. |
| **SEO / GEO & Schema** | `schema-dts` + Custom JSON-LD | Advanced semantic schema, OpenGraph edge generation, and AI crawler discovery (`llms.txt`). |
| **Product Analytics** | PostHog | Product analytics, session replay, user identification, feature flags, funnel analysis, and cohort segmentation. |
| **Ad Attribution & Tagging** | GA4, GTM, and Meta CAPI | Client event triggers, server-side conversion logging, and ad attribution with UTM / Referral tracking. |

---

## 3. Scalable Database Schema (Prisma Blueprint)

```prisma
datasource db {
  provider = "postgresql" // Or "sqlite" for Cloudflare D1
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  EDITOR
  PARTNER
}

enum BookFormatType {
  EBOOK
  PAPERBACK
  HARDCOVER
  AUDIOBOOK
}

enum RetailerPlatform {
  AMAZON_KDP
  DRAFT2DIGITAL
  INGRAMSPARK
  APPLE_BOOKS
  BARNES_AND_NOBLE
  KOBO
  BOOKSHOP_ORG
}

model User {
  id           String           @id @default(cuid())
  email        String           @unique
  passwordHash String
  name         String
  role         Role             @default(PARTNER)
  partner      ReferralPartner?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}

model Author {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  title       String?  // e.g., "Founder & Publisher"
  bio         String   @db.Text
  avatarUrl   String?
  socialLinks Json?    // { twitter, linkedin, website, etc. }
  books       Book[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Book {
  id              String            @id @default(cuid())
  slug            String            @unique
  title           String
  subtitle        String?
  synopsis        String            @db.Text
  coverImageUrl   String
  chapterOneTitle String            @default("Chapter 1")
  chapterOneBody  String            @db.Text // Markdown / Sanitized HTML
  authorId        String
  author          Author            @relation(fields: [authorId], references: [id], onDelete: Cascade)
  formats         BookFormat[]
  leads           Lead[]
  referralClicks  ReferralClick[]
  publishedAt     DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

model BookFormat {
  id             String           @id @default(cuid())
  bookId         String
  book           Book             @relation(fields: [bookId], references: [id], onDelete: Cascade)
  formatType     BookFormatType
  isbn           String?          @unique
  retailPrice    Decimal          @db.Decimal(10, 2)
  currency       String           @default("USD")
  distributor    RetailerPlatform
  purchaseUrl    String
  createdAt      DateTime         @default(now())
}

model ReferralPartner {
  id          String          @id @default(cuid())
  userId      String?         @unique
  user        User?           @relation(fields: [userId], references: [id])
  name        String          // e.g., "The Growth Mindset Podcast"
  slug        String          @unique // Used in /refer/[slug]
  contactEmail String
  customUtm   String?
  clicks      ReferralClick[]
  leads       Lead[]
  isActive    Boolean         @default(true)
  createdAt   DateTime        @default(now())
}

model ReferralClick {
  id         String           @id @default(cuid())
  partnerId  String
  partner    ReferralPartner  @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  bookId     String?
  book       Book?            @relation(fields: [bookId], references: [id])
  ipHash     String?          // Anonymized SHA-256 for fraud prevention
  userAgent  String?
  referer    String?
  country    String?
  createdAt  DateTime         @default(now())
}

model Lead {
  id          String           @id @default(cuid())
  email       String
  bookId      String
  book        Book             @relation(fields: [bookId], references: [id])
  partnerId   String?
  partner     ReferralPartner? @relation(fields: [partnerId], references: [id])
  sourceUtm   String?
  isSyncedEsp Boolean          @default(false)
  unlockedAt  DateTime         @default(now())
  createdAt   DateTime         @default(now())

  @@unique([email, bookId])
}
```

## 4. Application Directory Architecture

```
everise-web/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                    # Publisher Home (Lamont McLeod intro, Catalog)
│   │   ├── authors/
│   │   │   └── [slug]/page.tsx         # Author Bio & Books (Lamont McLeod Profile)
│   │   ├── books/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx            # High-conversion Book Landing / Retail Hub
│   │   │       └── preview/page.tsx    # Gated Chapter 1 Reading Interface
│   │   ├── refer/
│   │   │   └── [code]/route.ts         # Edge redirect & referral cookie logger
│   │   └── privacy/page.tsx            # Privacy Policy (GDPR / CAN-SPAM compliant)
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx              # Auth Guard & Admin Navigation
│   │       ├── page.tsx                # High-level KPIs & Conversion metrics
│   │       ├── referrals/
│   │       │   ├── page.tsx            # Referral links table & creation modal
│   │       │   └── [id]/page.tsx       # Podcast breakdown & conversion charts
│   │       ├── leads/page.tsx          # Exportable Leads & Mailchimp sync status
│   │       └── books/page.tsx          # Multi-retailer book & format editor
│   ├── api/
│   │   ├── lead/route.ts               # Turnstile verify -> DB -> Mailchimp API -> JWT Cookie
│   │   ├── referrals/create/route.ts   # Admin link generator endpoint
│   │   ├── webhooks/mailchimp/route.ts # ESP unsubscribe / update sync
│   │   └── og/route.tsx                # Dynamic Edge OpenGraph card generator
│   ├── robots.ts                       # Dynamic robots.txt
│   ├── sitemap.ts                      # Dynamic XML sitemap
│   └── llms.txt/route.ts               # GEO (Generative Engine Optimization) plain text index
├── components/
│   ├── reader/
│   │   ├── GatedReaderModal.tsx        # Email capture lock before Chapter 1
│   │   └── ChapterViewer.tsx           # Distraction-free typography reader
│   ├── marketing/
│   │   ├── MultiRetailerModal.tsx      # Amazon vs. IngramSpark vs. D2D selector
│   │   ├── AuthorBioCard.tsx           # Lamont McLeod profile block
│   │   └── HeroBookSection.tsx         # LCP-optimized cover & CTA
│   ├── forms/
│   │   └── TurnstileLeadForm.tsx       # Cloudflare Turnstile + React Hook Form
│   ├── seo/
│   │   └── JsonLd.tsx                  # schema-dts structured data injector
│   └── providers/
│       └── PostHogProvider.tsx         # PostHog JS SDK React context provider
├── lib/
│   ├── db.ts                           # Database client instance
│   ├── mailchimp.ts                    # Mailchimp Marketing API helper
│   ├── turnstile.ts                    # Server-side token validation
│   ├── posthog.ts                      # PostHog client & server-side initialization
│   ├── schema.ts                       # Structured data generator functions
│   └── auth.ts                         # NextAuth or session token handler
├── public/
└── middleware.ts                       # Edge cookie attribution & admin route protection
```

---

## 5. Core Systems & Workflows

### 5.1 Gated Chapter 1 Lead Engine Flow

1. **User Landing:** Visitor arrives on `/books/[slug]` (or via podcast referral).
2. **Read Request:** Clicks "Read Chapter 1 for Free".
3. **Turnstile Validation:** User enters email; Cloudflare Turnstile verifies interaction client-side.
4. **Backend Processing (`POST /api/lead`):**
   - Validates Turnstile token against Cloudflare API.
   - Upserts record in database with associated `bookId`, `partnerId` (from cookie), and UTM parameters.
   - Pushes subscriber to Mailchimp with tags: `[slug, "chapter-one-lead", partnerSlug]`.
   - Fires PostHog event: `posthog.capture('lead_generated', { bookId, partnerId, utm_source, utm_medium, utm_campaign })`.
   - Generates a signed, short-lived `HttpOnly` JWT cookie (`chapter_access=valid`).
5. **Reader Unlock:** Modal reveals `ChapterViewer.tsx` or unlocks `/books/[slug]/preview`.
6. **ESP Automated Drip:** Mailchimp triggers an automated 4-part nurture sequence linking to Amazon/IngramSpark purchasing options.

### 5.2 Podcast Referral Engine (`/refer/[code]`)

1. **Entrypoint:** Listener visits `domain.com/refer/PODCAST-NAME`.
2. **Edge Execution (`app/refer/[code]/route.ts`):**
   - Extracts partner slug from parameters.
   - Logs asynchronous click to database (`ReferralClick`).
   - Sets a 30-day attribution cookie: `everise_ref=PODCAST-NAME; Path=/; Max-Age=2592000; SameSite=Lax`.
   - Issues a `302 Redirect` to `/books/[primary-book-slug]?utm_source=podcast&utm_medium=referral&utm_campaign=PODCAST-NAME`.
3. **Downstream Attribution:** When the visitor submits the lead form or clicks a retailer link, the cookie value attaches to the database lead entry.

### 5.3 Multi-Retailer Distribution Engine (Amazon + D2D + IngramSpark)

The frontend `MultiRetailerModal.tsx` handles customer preferences based on format and vendor:

- **Direct Amazon/Kindle:** Targeted link for Kindle readers and Amazon prime buyers.
- **Draft2Digital (Wide eBook):** Feeds Apple Books, Barnes & Noble Nook, and Kobo links (or Universal Book Link via Books2Read).
- **IngramSpark (Wide Print/Hardcover):** Feeds Bookshop.org and indie bookstore distribution channels.

---

## 6. Advanced SEO & GEO (Generative Engine Optimization)

### 6.1 Semantic Schema Implementation (`schema-dts`)

Every page injects strongly typed JSON-LD:

- **Publisher Home (`/`):** `PublishingHouse`, `Organization`, `WebSite`.
- **Author Page (`/authors/lamont-mcleod`):** `Person`, `ProfilePage` (with `sameAs` pointing to official social profiles and publisher authority).
- **Book Page (`/books/[slug]`):** `Book`, `Offer`, `AggregateRating`, and `workExample` instances for each ISBN format.

```typescript
// lib/schema.ts
import { WithContext, Book, Organization, Person } from "schema-dts";

export function getBookSchema(book: any, author: any): WithContext<Book> {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `https://everisepress.com/books/${book.slug}#book`,
    name: book.title,
    url: `https://everisepress.com/books/${book.slug}`,
    description: book.synopsis,
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: "Everise LLC",
      url: "https://everisepress.com",
    },
    author: {
      "@type": "Person",
      name: author.name,
      url: `https://everisepress.com/authors/${author.slug}`,
    },
    workExample: book.formats.map((f: any) => ({
      "@type": "Book",
      bookFormat: f.formatType === "EBOOK"
        ? "https://schema.org/EBook"
        : "https://schema.org/Paperback",
      isbn: f.isbn,
      offers: {
        "@type": "Offer",
        price: f.retailPrice.toString(),
        priceCurrency: f.currency,
        availability: "https://schema.org/InStock",
        url: f.purchaseUrl,
      },
    })),
  };
}
```

### 6.2 GEO Engine (`llms.txt`)

Deploy `app/llms.txt/route.ts` returning markdown summaries formatted specifically for AI search engines (Perplexity, ChatGPT Search, Gemini):

```plaintext
# Everise LLC
> Modern independent publishing house founded by Lamont McLeod.

## Catalog
- Title: [Book Title]
- Author: Lamont McLeod
- Formats: eBook (Amazon, Apple, Kobo), Paperback (Amazon, IngramSpark), Hardcover
- Free Sample: https://everisepress.com/books/[slug]/preview

## Authors
- Lamont McLeod: Founder, publisher, and author.
```

---

## 7. Admin Portal & Telemetry Specifications

### 7.1 Admin Portal Features

- **Partner Generator:** Form to input podcast title, contact email, and vanity slug (`/refer/[slug]`).
- **Real-Time Funnel Metrics:**
  - Total Clicks per Partner.
  - Email Leads Captured per Partner.
  - Conversion Rate (`Leads / Clicks * 100`).
  - Retailer Exit Clicks (`Buy on Amazon`, `Buy on B&N`, `Buy on Bookshop`).
- **Lead Management:** Filter leads by book, affiliate source, and date; export to CSV.

### 7.2 Analytics Pipeline

- **Google Tag Manager & GA4:** Native client event triggers on `generate_lead`, `chapter_unlock_modal_open`, and `retailer_redirect_click`.
- **Meta Conversions API (CAPI):** Server-side POST from `/api/lead` forwarding email hash (SHA-256), IP address, and browser user agent for ad attribution.
- **PostHog (Product Analytics):**
  - **Event Tracking:** Custom events on `generate_lead`, `chapter_unlock_modal_open`, `retailer_redirect_click`, and `referral_link_visited`.
  - **User Identification:** Ties anonymous session IDs to identified leads via `posthog.identify()` for cross-session tracking.
  - **Funnel Analysis:** Visualizes the full conversion path — visit → chapter unlock → email lead → retailer click → purchase.
  - **Session Replay:** UX debugging of the gated reader flow and multi-retailer modal.
  - **Cohort Segmentation:** Groups users by behavior (e.g., "read chapter 1 but didn't buy", "arrived via podcast X") for retargeting and analysis.
  - **Feature Flags:** A/B testing for landing page variants, CTA copy, and reader modal designs.
