# EverRise Press LLC Website

Official website for EverRise Press LLC — an independent digital publishing house founded by Lamont McLeod.

## Project Overview

The site helps readers learn about the book, open Chapter 1 and choose a retailer. It includes:
- Gated Chapter 1 reading experience for email lead capture
- Multi-retailer distribution (Amazon, Draft2Digital, IngramSpark)
- Podcast referral engine with cookie attribution
- A staff publishing workspace for articles, images, books, authors, readers and referral partners

## Tech Stack

- **Framework:** Next.js 16 APIs on vinext 1.3.1, React 19.3.1, TypeScript and Tailwind CSS
- **Hosting:** Cloudflare Workers through vinext and the Cloudflare Vite plugin; native D1/runtime bindings
- **Database:** Cloudflare D1 (SQLite) + Drizzle ORM
- **Assets and images:** Existing Cloudflare static assets plus bounded D1 image storage and immutable media responses; no R2 bucket or paid image transformations
- **Publishing:** D1 article drafts and published versions, a Tiptap visual editor, and the existing authenticated ADMIN/EDITOR workspace
- **Email behavior:** Signup unlocks Chapter 1 on the website. Newsletter/email-series delivery remains deferred; Mailchimp is not an active sending integration.
- **Analytics:** PostHog, GA4, Meta CAPI

## Development

```bash
# Install dependencies
npm install

# Local development (Vite and native Workers bindings)
npm run dev

# Build and preview on Cloudflare Workers runtime
npm run build
npm run start

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
    - Third-party script tuning — PostHog/GA4/Meta run automatically at the owner’s request and honor saved opt-outs; further bundle and loading work remains
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
- [x] **Day two implementation and fact checks** (Completed: 2026-10-24)
  - Published `/about` with contact/corrections routes, verified book credits, AboutPage schema, sitemap and internal links.
  - Replaced unsupported biography assertions with a short, sourced profile; owner-approved personal-history facts are included. Saved production biography backups outside Git. Repeatable content update: `scripts/seo-day2-author.sql`.
  - Rewrote privacy around actual D1, Turnstile, analytics and Meta processing. Tracking runs automatically at the owner’s request, with disclosure below the footer copyright and separate opt-out controls; signup does not automatically send email or subscribe to a series.
  - Verified chapter cookies on the server, withheld locked chapter HTML, and removed email from new access tokens and PostHog lead properties.
  - Build/TypeScript, lint (zero errors; four existing warnings), dry run, five security/consent tests, local reader integration, and five-page live SEO checks passed. Worker version `af5fab53-1552-4451-bc31-9b6cd61d43e8`.
  - Cloudflare routing verified. Owner confirmed privacy@everrisepress.com is monitored, approved the biography, and clarified HMD’s publishing/distribution services. Retention and day-three editorial input remain open. See [seo-dev-doc](docs/seo-dev-doc.md).
- [x] **Day two owner decisions received** — contact, biography, HMD service wording and automatic tracking confirmed on 2026-10-24; the review document records these decisions and the remaining retention/editorial input.
  - Follow-up deployed as Worker `3ac6f904-7e43-49b9-9c7b-005877185e75`; build, five access/tracking tests, local/live SEO checks and desktop/mobile footer verification passed. Saved opt-outs remain honored.
- [x] **Day three book, author and preview improvements** (Completed: 2026-10-24)
  - Rewrote the book synopsis from the manuscript, added all 15 actual chapter titles, six notes, reader-fit guidance, a quotation from the existing sample, and a verified two-edition ISBN table.
  - Improved author introduction, book presentation and internal links; retained the approved biography and added the official website to Person sameAs. Aligned both seed files with reviewed content.
  - Rebuilt the end-of-preview CTA as a separate gold section with the cover, a prominent $4.99 Apple Books US eBook button, and a secondary all-formats link. Other retailers show current prices at their own sites.
  - Updated metadata, edition schema and discovery text; removed duplicate edition entries, unverified fixed-price schema offers and an unpublished blog link. Targeted D1 update: `scripts/seo-day3-content.sql`.
  - Build/TypeScript, lint (zero errors; four existing warnings), dry run, five access/tracking tests, local reader integration and local/live SEO checks passed. Desktop/mobile UI and retailer dialog verified. Worker `c8b79011-ca60-4ec3-827f-04200cbf547b`.
  - GSC still reports book and author indexed on older crawls; About is unknown to Google. No fresh indexing or traffic gain is claimed. Review sources, limits and next inputs in [seo-dev-doc](docs/seo-dev-doc.md).
- [x] **Blog and article foundation** (Completed: 2026-10-27)
  - Built `/blog` and `/blog/[slug]` using the existing reading design, plus staff review pages at `/admin/articles`.
  - Added validated file-based content, source/byline/review/date fields, accessible content blocks, related reading and publication-aware homepage/navigation/sitemap/schema discovery.
  - Both planned articles remain unpublished briefs. Public draft URLs return 404; the empty blog is noindex and excluded from navigation and sitemap. No new CMS or D1 migration.
  - Six publishing-model tests, existing chapter/tracking tests, positive/negative HTTP integration, authenticated local staff preview and responsive browser checks passed. Publishing workflow: [Blog runbook](docs/blog-publishing.md).
- [x] **Publisher workspace and visual CMS implementation** (2026-10-27)
  - Rebuilt the staff workspace around a readable light-first Karla interface, clearer navigation and actionable overview states. Existing dark mode remains available.
  - Added visual article writing, automatic private draft saves, staff preview, byline/source/image checks, explicit review and publication, unpublished changes, archive/restore and revision conflict protection.
  - Moved the live article catalog to the existing D1 database. The earlier file-based blog foundation above is historical; repository JSON now supplies the original briefs for explicit import.
  - Added a shared image library and upload picker using the existing D1 binding, with image resizing, 500 KiB per-image and 100-image/20 MiB library limits, and protection for images used in saved content. No paid service or billing change.
  - Reworked book/author search and editing, added a visual Chapter 1 editor, made book/retailer saves atomic, and clarified reader history and destructive actions. Improved reader filters/CSV export and partner-link management.
  - Current operating guide: [Publish an article](docs/blog-publishing.md). Detailed findings: [Catalog and images](docs/admin-catalog-audit.md), [Readers and referrals](docs/admin-readers-referrals-audit.md), and [Workspace shell](docs/admin-shell-audit.md).
  - Release validation: 43 tests and 74 isolated D1/API assertions pass. OpenNext/TypeScript and lint pass with one pre-existing warning. Desktop, mobile, tablet, dark mode and 90–150% workspace checks passed; independent Impeccable review returned ship. Production release evidence is recorded separately.
- [ ] **Remaining content and measurement work** — continue the four researched article assignments and resource improvements, then review performance and GSC after recrawling. The payday, calendar and discussion-guide articles are already published. See the dated plan; these are not automated runs.

### Interface and sharing refinement

- [x] **Coherent public UI and motion** (Completed: 2026-10-22) — steady navigation and controls, reader-controlled book themes, accessible mobile and retailer dialogs, visible server-rendered text, and reduced-motion alternatives. Preserved the existing palette and publishing identity.
- [x] **Homepage Open Graph card** — real cover and Lamont portrait references, a clear free-chapter call to action, and the email requirement. Versioned 1200 × 630 JPEG: `public/images/og/everrise-home-20261022.jpg`.
- [x] **Production verification** — deployed Worker `74a0e681-cffb-4f1e-8bdb-11fbcb55f756`; build, TypeScript, lint, live SEO smoke checks and social crawler image checks passed. Compressed Worker: 2,044.83 KiB.
- Direction, generation prompt and validation notes: [Visual refinement](docs/visual-refinement.md).

**Last Updated:** 2026-10-31
**Progress:** 8/10 milestones complete (Milestone 6 deferred)  
**Domain:** `https://everrisepress.com` (live, canonical — site URL via `NEXT_PUBLIC_SITE_URL`)  
**Next:** Milestone 10 - Polish, Privacy & Launch


### Current Cloudflare deployment

The active deployment path is vinext, following Cloudflare’s current Next.js guide. Build with `npm run build` and deploy with `npm run deploy`. Workers Builds uses those same commands, root `/`, the existing build token and no new build variables. `.node-version` and `packageManager` pin the build tools. The existing Worker and D1 database are retained; no R2, Images transformation, KV, Durable Object or paid cache binding is configured. See [Deployment runbook](docs/cloudflare-vinext-deployment.md).

### Phase two book discovery and conversion

- [x] **Day 3 page and reader-path improvements** (Completed: 2026-10-31) — clarified on-site sample access, added the Book 1 continuation detail and useful reading-resource links on the homepage, book, author and press pages. The mobile sample shows the form before its large cover. The author sharing card uses the verified portrait and cover artwork.
- [x] **Retailer verification and measurement** — checked the US Apple, Kobo and Bookshop records; replaced the Kobo ISBN search with its specific HTTPS book destination while retaining the referral identifier, and replaced the paperback store search with its exact matching listing. The end-of-chapter Apple purchase action now uses the same consent-aware retailer measurement as the chooser.
- [x] **Validation** — 35 public tests, 25 admin tests and 74 isolated D1 assertions pass. TypeScript, build and local SEO/blog checks pass; lint has one existing ScrollStack warning and no errors. Signed local fixtures verify locked, unlocked and tampered sample access without creating production leads. See the dated release record in [SEO work log](docs/seo-dev-doc.md).
