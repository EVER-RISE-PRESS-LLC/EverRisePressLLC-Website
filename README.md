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

- [x] **Milestone 9: SEO, GEO & Analytics** (Completed: 2026-08-26)
  - PostHog: client provider (autocapture ON, session replay OFF per owner, pageview/pageleave, identify on lead, `usePostHogFlag` hook), server-side capture via `/batch/` (`referral_link_visited`, `lead_generated`, `retailer_redirect_click`) with `_phid` ID unification on /refer redirects — project token verified against capture API
  - GA4 via `@next/third-parties` (`G-WPN7FBMPXZ`): `generate_lead`, `chapter_unlock_modal_open`, `retailer_redirect_click` client events
  - Meta: client Pixel loader (`2855054114869901`) + server-side CAPI `Lead` event from `/api/lead` (SHA-256 hashed email/IP/UA, fbc/fbp; token as Cloudflare secret)
  - `app/sitemap.ts` (home, privacy, books, authors) + `app/robots.ts` (blocks /admin, /api, preview) + `app/llms.txt/route.ts` (GEO index for AI crawlers)
  - OG images: **static** pre-generated cards in `public/images/og/` (book + default) wired into book page + homepage metadata — dynamic `/api/og` (next/og Satori) was built, tested, then removed: its wasm/font payload pushed the worker to 2985/3072 KiB; static cards recovered 876 KiB of budget
  - PostHog-side setup (funnels, cohorts, alerts, survey creation) = owner actions in PostHog UI — click-paths documented in `docs/admin-panel-spec.md` §13.2

- [ ] **Milestone 10: Polish, Privacy & Launch**
  - Privacy policy page
  - Performance audit
  - Production deployment
  - Custom domain setup
  - **WQR (Web Quality Rating) audit** — run Joost de Valk's Web Quality Rating checklist against all pages (added 2026-08-26, part of M10)
  - [x] **SEO Graph / automated SEO system** (Completed: 2026-08-26) — Automated SEO system on @jdevalk/seo-graph-core 0.7.0: registry-driven JSON-LD graph, metadata+canonicals, breadcrumbs, /schema.json, IndexNow script, sitemap+llms.txt automation. See docs/seo-system.md.
  - **Speed & performance optimization plan** (added 2026-08-26, part of M10):
    - HTML edge caching for mostly-static marketing pages (all pages are force-dynamic → every request hits D1; use Cloudflare Cache API / stale-while-revalidate with DB-triggered invalidation)
    - D1 query batching — homepage/book/author pages run 2–3 sequential awaits; parallelize and use D1 `batch()` to cut round-trips
    - Third-party script tuning — PostHog/GA4/Meta load client-side on every page; defer/prioritize, keep them off the reader modal hot path
    - LCP polish — fix dev LCP candidate warning on scroll-stack images, confirm hero cover `priority`, audit `public/images/stack/*` file sizes
    - Worker bundle diet — 2226 KiB gzip today; recheck after any new dep (R2 ISR unavailable on account)

### Polish Backlog (found during development)

- [x] Fix broken manifest icon paths (Completed: 2026-10-22) — both icons resolve from public root paths.
- [x] Worker size limit fix (2026-08-21): archived 1.97 MB `src/app/icon0.svg` (raster PNG wrapped in SVG, inlined into worker bundle) to `Logo-and-images/icon0-archived-favicon.svg` — gzip dropped 3068 KiB → 1245 KiB, first deploy succeeded at `everrisepressllc-website.everrisepressdev.workers.dev`

---

### SEO recovery work

- [x] **Day one audit and technical corrections** (Completed: 2026-10-22)
  - Verified GSC MCP and all four submitted canonical pages as indexed; baseline 6 impressions and 0 clicks for Sep 21–Oct 18.
  - Fixed invalid book/author breadcrumbs, robots warnings, preview noindex, artificial sitemap dates, metadata and social images, and manifest icons.
  - Made marketing text and navigation visible before hydration; replaced unsupported homepage claims with descriptions grounded in the local EPUB.
  - Enabled Cloudflare Always Use HTTPS; HTTP apex/www now reach the canonical HTTPS site.
  - Build, lint, OpenNext build, deployment dry run, and local/live SEO smoke checks passed. Run `node scripts/seo-check.mjs [base-url]` to repeat the checks.
  - Deployed Worker version `880c78a4-12d5-44dc-8a44-1cf23b141075`. Audit, ten-day plan and owner review inputs: [seo-dev-doc](docs/seo-dev-doc.md).
- [ ] **Days two through ten** — verify biography/imprint/privacy, revise book and author content, publish two reviewed articles and a discussion guide, improve measured performance and evaluate GSC after recrawling. See the dated plan; these are not automated runs.

### Interface and sharing refinement

- [x] **Coherent public UI and motion** (Completed: 2026-10-22) — steady navigation and controls, reader-controlled book themes, accessible mobile and retailer dialogs, visible server-rendered text, and reduced-motion alternatives. Preserved the existing palette and publishing identity.
- [x] **Homepage Open Graph card** — real cover and Lamont portrait references, a clear free-chapter call to action, and the email requirement. Versioned 1200 × 630 JPEG: `public/images/og/everrise-home-20261022.jpg`.
- [x] **Production verification** — deployed Worker `74a0e681-cffb-4f1e-8bdb-11fbcb55f756`; build, TypeScript, lint, live SEO smoke checks and social crawler image checks passed. Compressed Worker: 2,044.83 KiB.
- Direction, generation prompt and validation notes: [Visual refinement](docs/visual-refinement.md).

**Last Updated:** 2026-10-22
**Progress:** 8/10 milestones complete (Milestone 6 deferred)  
**Domain:** `https://everrisepress.com` (live, canonical — site URL via `NEXT_PUBLIC_SITE_URL`)  
**Next:** Milestone 10 - Polish, Privacy & Launch
