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

---

## 8. Build Milestones

### Milestone 1: Project Scaffold & Infrastructure
- Initialize Next.js 16+ (App Router, TypeScript, Tailwind CSS)
- Set up Cloudflare Pages project + wrangler config
- Set up Cloudflare D1 database + Drizzle ORM
- Configure environment variables structure (`.env.local`, `.env.production`)
- **Accounts needed:** Cloudflare account
- **Info needed:** Desired domain name (e.g., `everisepress.com`)

### Milestone 2: Database & Seed Data
- Run Prisma/Drizzle schema migrations (all models from Section 3)
- Seed Author record for Lamont McLeod
- Seed first Book record with Chapter 1 content
- Seed BookFormat records (eBook, Paperback, Hardcover) with retailer URLs
- **Info needed:**
  - Lamont McLeod bio text, title, social links (Twitter, LinkedIn, website)
  - Author avatar/headshot image
  - Book title, subtitle, synopsis, cover image
  - Chapter 1 title and full body text (Markdown or HTML)
  - ISBN numbers per format
  - Retail prices per format
  - Purchase URLs (Amazon, Draft2Digital/Books2Read, IngramSpark/Bookshop.org)

### Milestone 3: Publisher Homepage & Author Page
- Build `/` — Hero section, featured book, catalog grid, author intro
- Build `/authors/[slug]` — Full bio page with book list
- Responsive design, LCP-optimized images
- **Info needed:**
  - Publisher tagline / hero headline
  - Any brand colors or logo files (check `Logo-and-images/`)
  - Social profile URLs for `sameAs` schema

### Milestone 4: Book Landing Page & Multi-Retailer Modal
- Build `/books/[slug]` — High-conversion book page with synopsis, cover, CTAs
- Build `MultiRetailerModal.tsx` — Format/vendor selector (Amazon, B&N, Kobo, Bookshop.org)
- JSON-LD Book schema injection
- **Info needed:** All retailer purchase URLs and pricing (from Milestone 2)

### Milestone 5: Gated Chapter 1 Reader & Lead Capture
- Build `GatedReaderModal.tsx` — Email capture gate
- Build `ChapterViewer.tsx` — Distraction-free reading interface
- Build `/books/[slug]/preview` route
- Integrate Cloudflare Turnstile for bot protection
- Build `POST /api/lead` endpoint (Turnstile verify → DB insert → JWT cookie)
- **Accounts needed:**
  - Cloudflare Turnstile site key + secret key (created in Cloudflare dashboard)

### Milestone 6: Mailchimp Integration & Email Nurture
- Build `lib/mailchimp.ts` — Mailchimp Marketing API v3.0 helper
- Wire lead API to push subscribers with tags (`[book-slug, "chapter-one-lead", partner-slug]`)
- Build `/api/webhooks/mailchimp` for unsubscribe/update sync
- **Accounts needed:**
  - Mailchimp account with an audience list created
  - Mailchimp API key
  - Mailchimp Audience ID
  - Mailchimp server prefix (e.g., `us21`)
- **Info needed:** Desired email tags/segments strategy

### Milestone 7: Podcast Referral Engine
- Build `/refer/[code]/route.ts` — Edge redirect with cookie attribution
- Build referral click logging to database
- Build `middleware.ts` — Cookie attribution & admin route protection
- **Info needed:**
  - List of initial podcast partner names and contact emails
  - Vanity slugs for each partner (e.g., `growth-mindset-podcast`)

### Milestone 8: Admin Dashboard
- Build `/admin` layout with auth guard
- Build admin KPI dashboard (clicks, leads, conversion rates)
- Build referral partner management (create/edit/deactivate partners)
- Build leads table with CSV export and Mailchimp sync status
- Build book & format editor
- **Accounts needed:** Admin user credentials (email + password for first admin)

#### 8.1 Image Management System (R2-backed)

**Goal:** Upload, replace, and delete images without code deploys. Use Cloudflare R2 for storage.

**Backend Setup:**
1. Create a new R2 bucket named `everrisepress-images`.
2. Enable public read access on the bucket.
3. Add the bucket binding to `wrangler.jsonc`:
   ```json
   {
     "binding": "IMAGES_BUCKET",
     "bucket_name": "everrisepress-images"
   }
   ```
4. Run `npm run cf-typegen` to regenerate `cloudflare-env.d.ts`.
5. Create `lib/r2.ts` with helper functions:
   - `uploadImage(file: File, path: string): Promise<string>` — uploads to R2, returns public URL.
   - `deleteImage(path: string): Promise<void>` — removes from R2.
   - `listImages(prefix?: string): Promise<string[]>` — lists all images or by folder.
6. Build API route `POST /api/admin/images/upload`:
   - Accept `multipart/form-data` with `file` and `folder` fields.
   - Validate auth (admin only).
   - Generate unique filename: `{folder}/{timestamp}-{originalname}`.
   - Call `uploadImage()`.
   - Return `{ url, path }` in JSON response.
7. Build API route `DELETE /api/admin/images/[path]`:
   - Validate auth.
   - Call `deleteImage()`.
   - Return `{ success: true }`.

**Admin UI Components:**
1. Create `components/admin/ImageUploader.tsx`:
   - Drag-and-drop zone for file selection.
   - Preview thumbnail before upload.
   - Upload button triggers `POST /api/admin/images/upload`.
   - Shows progress bar during upload.
   - Displays public URL after success.
2. Create `components/admin/ImageGallery.tsx`:
   - Grid view of all uploaded images.
   - Filter by folder (books, authors, misc).
   - Click image to copy URL to clipboard.
   - Delete button with confirmation modal.
3. Create `components/admin/ImageField.tsx`:
   - Reusable form field for any image input.
   - Shows current image preview if URL exists.
   - "Change Image" button opens `ImageUploader` modal.
   - "Remove" button clears the field.
   - Stores the public URL as the field value.

**Integration with Book/Author Forms:**
1. Update book editor form (`/admin/books/[id]`):
   - Replace `coverImageUrl` text input with `<ImageField />`.
   - Label: "Book Cover Image".
   - Folder: `books`.
2. Update author editor form (`/admin/authors/[id]`):
   - Replace `avatarUrl` text input with `<ImageField />`.
   - Label: "Author Photo".
   - Folder: `authors`.
3. On form save, the image URL is already in state. No extra logic needed.

**Migration from `public/` images:**
1. Upload existing `public/images/books/*` to R2 under `books/` prefix.
2. Upload existing `public/images/authors/*` to R2 under `authors/` prefix.
3. Update D1 records:
   ```sql
   UPDATE books SET cover_image_url = 'https://pub-xxx.r2.dev/books/cover.webp' WHERE slug = 'how-to-have-a-financial-heart-attack';
   UPDATE authors SET avatar_url = 'https://pub-xxx.r2.dev/authors/lamont-mcleod.jpg' WHERE slug = 'lamont-mcleod';
   ```
4. Delete old files from `public/images/`.
5. Remove `public/images/` from git tracking.

**Usage Workflow:**
1. Admin logs in to `/admin`.
2. Navigates to Books > Edit "How To Have a Financial Heart Attack".
3. Sees current cover image preview.
4. Clicks "Change Image".
5. Drags new `.webp` file into uploader.
6. Uploads automatically.
7. New URL populates the form field.
8. Admin clicks "Save".
9. Book page now shows new cover. No deploy needed.

**Security:**
- All `/api/admin/*` routes require auth middleware.
- Validate file type: only allow `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`.
- Max file size: 5MB.
- Sanitize filenames: remove special chars, lowercase, replace spaces with hyphens.

**Cost:**
- R2 storage: $0.015/GB/month.
- R2 operations: $0.36/million writes, $0.18/million reads.
- Estimated monthly cost for 100 images: ~$0.05.

### Milestone 9: SEO, GEO & Analytics
- Build `lib/schema.ts` — JSON-LD generator for all page types
- Build `app/sitemap.ts` and `app/robots.ts`
- Build `app/llms.txt/route.ts` — GEO plain text index
- Build `app/api/og/route.tsx` — Dynamic OpenGraph card generator
- Integrate PostHog analytics provider
- Integrate GA4 / GTM snippet
- **Accounts needed:**
  - PostHog project (API key + host URL)
  - Google Analytics 4 property ID
  - Google Tag Manager container ID
- **Info needed:** Meta Pixel ID (if running Meta ads for CAPI)

### Milestone 10: Polish, Privacy & Launch
- Build `/privacy` page (GDPR / CAN-SPAM compliant)
- Responsive QA across all pages
- Performance audit (Lighthouse, Core Web Vitals)
- SEO audit and schema validation
- Deploy to production on Cloudflare Pages
- Connect custom domain + DNS
- **Info needed:**
  - Privacy policy text (or use a generator)
  - Final DNS records to configure
  - Confirmation of all retailer links being live and correct

---

## 9. Brand Voice & Marketing Systems

**Reference Document:** `/BOOK/brand-voice-systems.md`

**Selected Voice:** System 4 — THE WAKE-UP CALL

**Core Philosophy:** "This is your intervention. You didn't ask for it, but you needed it."

**Tone Markers:**
- Provocative and punchy — Short sentences. Hard truths. No softening.
- Dark humor — "You're not living paycheck to paycheck. You're living crisis to crisis."
- Pattern interrupts — Unexpected comparisons, shocking statistics, uncomfortable questions
- Conversational profanity (light) — "You're fucking this up. Let me show you how."

**Copy Principles:**
1. Lead with the uncomfortable truth
2. Use contrast and juxtaposition
3. Create cognitive dissonance
4. End with a challenge

**Approved Phrases:**
- "You're practicing poverty until you're an expert"
- "Your financial heart attack is already in progress"
- "Friday is coming. So is the crash."
- "You don't have a money problem. You have a pattern problem."

**Banned Words:**
- "Journey" (too soft)
- "Empowerment" (too generic)
- "Financial freedom" (overused)
- "Tips and tricks" (too light)

**Status:** Approved and active for all website copy, email sequences, and ad content.

---

## 10. Progress Tracking & README Updates

**MANDATORY:** After completing each milestone, the `README.md` file MUST be updated with a progress checklist. This file is monitored by project supervisors and stakeholders.

### Update Process
1. When a milestone is completed, mark it with `[x]` in the README checklist
2. Add the completion date next to the milestone name
3. Include a brief summary of what was delivered
4. Commit the README update as part of the milestone completion

### README Progress Checklist Template

The `README.md` should contain this section (update as milestones complete):

```markdown
## Build Progress

- [x] **Milestone 1: Project Scaffold & Infrastructure** (Completed: 2026-08-19)
  - Next.js 16 + TypeScript + Tailwind CSS
  - Cloudflare Workers + D1 database + Drizzle ORM
  - R2 caching bucket configured
  - Environment variables structure ready

- [ ] **Milestone 2: Database & Seed Data**
  - Schema migrations applied
  - Author and book records seeded
  - Retailer URLs configured

- [ ] **Milestone 3: Publisher Homepage & Author Page**
  - Homepage with hero section and catalog
  - Author bio page
  - Responsive design

- [ ] **Milestone 4: Book Landing Page & Multi-Retailer Modal**
  - Book detail pages
  - Format/vendor selector modal
  - JSON-LD schema injection

- [ ] **Milestone 5: Gated Chapter 1 Reader & Lead Capture**
  - Email capture gate
  - Chapter reader interface
  - Cloudflare Turnstile integration
  - Lead capture API

- [ ] **Milestone 6: Mailchimp Integration & Email Nurture**
  - Mailchimp API integration
  - Automated subscriber tagging
  - Webhook sync

- [ ] **Milestone 7: Podcast Referral Engine**
  - Referral redirect system
  - Cookie attribution
  - Click tracking

- [ ] **Milestone 8: Admin Dashboard**
  - KPI dashboard
  - Partner management
  - Lead export
  - Book editor

- [ ] **Milestone 9: SEO, GEO & Analytics**
  - JSON-LD structured data
  - Sitemap and robots.txt
  - PostHog analytics
  - GA4 integration

- [ ] **Milestone 10: Polish, Privacy & Launch**
  - Privacy policy page
  - Performance audit
  - Production deployment
  - Custom domain setup
```

### Current Status
**Last Updated:** 2026-08-20  
**Progress:** 5/10 milestones complete  
**Next:** Milestone 6 - Mailchimp Integration & Email Nurture
