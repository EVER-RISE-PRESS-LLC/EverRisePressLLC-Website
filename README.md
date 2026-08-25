# EverRise Press LLC Website

Official website for EverRise Press LLC — an independent digital publishing house founded by Lamont McLeod.

## Project Overview

High-converting, SEO-first digital publishing platform featuring:
- Gated Chapter 1 reading experience for email lead capture
- Multi-retailer distribution (Amazon, Draft2Digital, IngramSpark)
- Podcast referral engine with cookie attribution
- Admin dashboard for partner management and analytics

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Hosting:** Cloudflare Workers + Pages
- **Database:** Cloudflare D1 (SQLite) + Drizzle ORM
- **Caching:** Cloudflare Assets (R2 removed 2026-08-21 — product disabled on account; no ISR in use)
- **ESP:** Mailchimp Marketing API
- **Analytics:** PostHog, GA4, Meta CAPI

## Development

```bash
# Install dependencies
npm install

# Local development (Next.js dev server)
npm run dev

# Preview on Cloudflare Workers runtime
npm run preview

# Deploy to Cloudflare
npm run deploy

# Database migrations
npm run db:generate    # Generate migration files
npm run db:migrate:local  # Apply to local D1
npm run db:migrate:remote # Apply to remote D1
```

## Build Progress

- [x] **Milestone 1: Project Scaffold & Infrastructure** (Completed: 2026-08-19)
  - Next.js 16 + TypeScript + Tailwind CSS
  - Cloudflare Workers via @opennextjs/cloudflare adapter
  - D1 database (everrisepress-db) + Drizzle ORM with full schema
  - R2 caching bucket configured (later removed 2026-08-21: R2 disabled on account; adapter runs with no-op cache, fine for force-dynamic pages)
  - Environment variables structure ready
  - Build verified working

- [x] **Milestone 2: Database & Seed Data** (Completed: 2026-08-19)
  - Schema migrations applied to local and remote D1
  - Author record seeded: Lamont D. McLeod (Founder)
  - Book record seeded: "How To Have a Financial Heart Attack"
  - Chapter 1 content extracted from EPUB
  - eBook format configured: $4.99, ISBN 9781835567173, Draft2Digital
  - Purchase URL: https://books2read.com/u/4E6eD0

- [x] **Milestone 3: Publisher Homepage & Author Page** (Completed: 2026-08-19)
  - Homepage with System 4 "Wake-Up Call" voice
  - Hero section with pattern interrupt headline
  - Featured book section with CTAs
  - Author bio page with full System 4 bio
  - Book landing page with conversion-focused layout
  - Design system implemented (Ever Rise Gold, Deep Charcoal, Cream Vellum)
  - Spectral SC + Karla typography
  - Responsive design across all pages

- [x] **Milestone 4: Book Landing Page & Multi-Retailer Modal** (Completed: 2026-08-20, retailer links live 2026-08-22)
  - Book detail page with System 4 conversion copy
  - MultiRetailerModal component — format/vendor selector (scales with new retailers)
  - JSON-LD Book schema injection on book page
  - JSON-LD Organization schema on homepage
  - JSON-LD Person schema on author page
  - Dynamic metadata (OpenGraph) per book
  - schema-dts typed structured data
  - Retailer links added (2026-08-22): Apple Books + Kobo eBook ($4.99), IngramSpark paperback ($12.99, ISBN 9781835566930)
  - Modal redesigned (2026-08-22): official retailer logos, format grouping, book cover in header

- [x] **Milestone 5: Gated Chapter 1 Reader & Lead Capture** (Completed: 2026-08-20)
  - GatedReaderModal component with email capture gate
  - ChapterViewer component for distraction-free reading
  - /books/[slug]/preview route with gated access
  - Cloudflare Turnstile integration for bot protection
  - POST /api/lead endpoint (Turnstile verify → DB insert → JWT cookie)
  - 7-day chapter access cookie for returning readers

- [ ] **Milestone 6: Mailchimp Integration & Email Nurture** (deferred — awaiting Mailchimp account access)
  - Mailchimp API integration
  - Automated subscriber tagging
  - Webhook sync

- [x] **Milestone 7: Podcast Referral Engine** (Completed: 2026-08-25)
  - `/refer/[code]` edge redirect with slug normalization (`src/app/refer/[code]/route.ts`)
  - 30-day `everise_ref` HttpOnly attribution cookie (SameSite=Lax)
  - Click logging to `referral_clicks` (SHA-256 hashed IP, UA, referer, country via CF headers)
  - Redirect to latest published book with `utm_source=podcast&utm_medium=referral&utm_campaign=<slug>`; overridable via `REFERRAL_DEFAULT_BOOK_SLUG` var
  - Unknown/inactive codes 302 to homepage (no click logged)
  - `/api/lead` reads `everise_ref` cookie → attaches `partnerId` + `sourceUtm` to lead (and backfills existing leads missing partner attribution)
  - Seed partners: `growth-mindset-podcast`, `test-partner` (`src/lib/db/seed-referral-partners.sql`, local + remote)
  - Note: `middleware.ts` (admin route protection) deferred to Milestone 8 — cookie attribution handled directly in route + lead API

- [x] **Milestone 8: Admin Dashboard** (Completed: 2026-08-25)
  - shadcn/ui (v4, radix base) + dark charcoal / gold admin theme; Light/Dark toggle + UI scale (A−/A+, 90–150%) persisted to localStorage
  - Custom auth: PBKDF2 password hashing (Web Crypto) + `jose` JWT session cookie `admin_session` (7d); roles ADMIN / EDITOR / PARTNER
  - `/admin` route group with server-side auth guard; `/admin/login`; `scripts/create-admin.mjs` (`npm run admin:create`)
  - **Dashboard** — KPI cards (clicks / leads / conversion / retailer exits, with 30-day deltas), 30-day leads-vs-clicks chart (recharts), retailer exit breakdown, top-partners table
  - **Referrals** — list table (copy /refer link, click/lead/conv counts, active badge), create/edit dialogs, per-partner detail page (activity chart, recent leads, recent clicks, deactivate/reactivate)
  - **Leads** — filter by book/partner/email search, pagination, Mailchimp badge (Pending until M6), CSV export (`/api/admin/leads/export`)
  - **Books** — catalog list + full editor (book details, cover preview, chapter 1 HTML, retailer format repeater); create/edit/delete APIs
  - **Authors** — list + editor (bio, photo, social links)
  - Retailer exit tracking added: `retailer_clicks` table (migration 0002), `/api/retailer-click`, MultiRetailerModal instrumentation with referral-cookie attribution
  - Removed note: M7 middleware note superseded — admin protection now via layout guard
  - Spec doc: `docs/admin-panel-spec.md`
  - Future feature wishlist (analytics, A/B testing, partner portal, etc.) tracked in `docs/admin-panel-spec.md` §13.2 — not in current scope
  - Fix (2026-08-25): admin login redirect loop — auth guard moved to `(admin)/admin/(panel)/layout.tsx` so it no longer wraps `/admin/login`

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

### Polish Backlog (found during development)

- [ ] Fix broken icon paths in `src/app/manifest.json` — currently `/src/app/icon.png/web-app-manifest-*.png`, should be `/web-app-manifest-*.png` (files live in `public/`; found 2026-08-21)
- [x] Worker size limit fix (2026-08-21): archived 1.97 MB `src/app/icon0.svg` (raster PNG wrapped in SVG, inlined into worker bundle) to `Logo-and-images/icon0-archived-favicon.svg` — gzip dropped 3068 KiB → 1245 KiB, first deploy succeeded at `everrisepressllc-website.everrisepressdev.workers.dev`

---

**Last Updated:** 2026-08-25  
**Progress:** 7/10 milestones complete (Milestone 6 deferred)  
**Next:** Milestone 9 - SEO, GEO & Analytics
