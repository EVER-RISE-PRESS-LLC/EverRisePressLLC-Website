# EverRise Press — Project Handoff (2026-08-20)

## Project Overview

**Organization:** EverRise Press LLC  
**Founder & Lead Author:** Lamont D. McLeod  
**Repo:** https://github.com/EVER-RISE-PRESS-LLC/EverRisePressLLC-Website  
**Local Path:** `/Users/iaevan/work/EverRise Press/EverRisePressLLC-Website`  
**Temporary Domain:** `everrisepressdev.workers.dev` (no custom domain yet)  
**Cloudflare Account ID:** `4bb86ba631de88ebffab0709d3e09c19`  
**Cloudflare Account Email:** `everrisepressdev@gmail.com`

---

## Current Progress: 5/10 Milestones Complete

| Milestone | Status | Notes |
|-----------|--------|-------|
| 1. Project Scaffold & Infrastructure | DONE | Next.js 16, Cloudflare Workers, D1, R2, Drizzle ORM |
| 2. Database & Seed Data | DONE | Author, book, chapter 1, eBook format seeded |
| 3. Publisher Homepage & Author Page | DONE | Homepage, author page, book landing page built |
| 4. Book Landing Page & Multi-Retailer Modal | DONE | MultiRetailerModal, JSON-LD schemas, dynamic metadata |
| 5. Gated Chapter 1 Reader & Lead Capture | DONE | Turnstile, email gate, JWT cookie, lead API |
| 6. Mailchimp Integration & Email Nurture | NEXT | Awaiting Mailchimp credentials from Lamont |
| 7. Podcast Referral Engine | PENDING | |
| 8. Admin Dashboard | PENDING | |
| 9. SEO, GEO & Analytics | PENDING | |
| 10. Polish, Privacy & Launch | PENDING | |

---

## Technology Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16.3.1 (App Router, TypeScript, Tailwind CSS v4) |
| Hosting | Cloudflare Workers via `@opennextjs/cloudflare` v1.20.2 |
| Database | Cloudflare D1 (SQLite) — `everrisepress-db` (ID: `a2082483-d085-44a8-b90c-48d5c9cd5c17`) |
| ORM | Drizzle ORM v0.45.2 |
| Caching | Cloudflare R2 — `everrisepress-website-opennext-cache` |
| Bot Protection | Cloudflare Turnstile (Managed mode) |
| Auth/Cookies | `jose` (JWT signing for chapter access) |
| Structured Data | `schema-dts` v2.0.0 |
| Turnstile UI | `@marsidev/react-turnstile` v1.6.0 |
| Wrangler | v4.124.0 |

---

## Key Commands

```bash
npm run dev          # Next.js dev server
npm run preview      # Build + preview on Cloudflare Workers runtime locally
npm run deploy       # Build + deploy to Cloudflare
npm run build        # Next.js build
npm run lint         # ESLint
npm run cf-typegen   # Regenerate Cloudflare env types
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate:local   # Apply migrations to local D1
npm run db:migrate:remote  # Apply migrations to remote D1
npm run db:seed      # Seed database
npm run db:studio    # Open Drizzle Studio
```

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                          # Homepage (System 4 voice)
│   ├── layout.tsx                        # Root layout (Spectral + Karla fonts)
│   ├── globals.css                       # Design tokens (Ever Rise Gold, Deep Charcoal, Cream Vellum)
│   ├── api/
│   │   └── lead/route.ts                 # POST: Turnstile verify → DB insert → JWT cookie
│   ├── authors/
│   │   └── [slug]/page.tsx               # Author bio page (System 4 voice)
│   └── books/
│       └── [slug]/
│           ├── page.tsx                  # Book landing page (System 4 voice)
│           └── preview/
│               ├── page.tsx              # Gated chapter preview route
│               └── GatedReaderClient.tsx  # Client wrapper for gated reader
├── components/
│   ├── forms/
│   │   └── TurnstileLeadForm.tsx          # Email + Turnstile widget form
│   ├── marketing/
│   │   └── MultiRetailerModal.tsx         # Format/vendor selector modal
│   ├── reader/
│   │   ├── GatedReaderModal.tsx           # Email gate → chapter unlock
│   │   └── ChapterViewer.tsx              # Distraction-free reading UI
│   └── seo/
│       └── JsonLd.tsx                     # JSON-LD script injector
└── lib/
    ├── db/
    │   ├── index.ts                       # Drizzle D1 client factory
    │   ├── client.ts                      # getDatabase() using getCloudflareContext
    │   ├── schema.ts                      # All Drizzle table definitions
    │   ├── seed.ts                        # TypeScript seed (unused, SQL version used)
    │   ├── seed.sql                       # SQL seed data for author/book/format
    │   └── update-bio-system4.sql         # Bio update to System 4 voice
    ├── schema.ts                          # JSON-LD generators (Book, Org, Person, WebSite)
    └── turnstile.ts                       # Server-side Turnstile token verification
```

---

## Database Schema (Drizzle/SQLite)

7 tables: `users`, `authors`, `books`, `book_formats`, `referral_partners`, `referral_clicks`, `leads`

### Seeded Data

**Author:** Lamont D. McLeod
- Slug: `lamont-mcleod`
- Title: Founder
- Bio: System 4 voice (financial autopsies, Nov 2010 accident, Client to CEO)
- Avatar: `/images/authors/lamont-mcleod.jpg`
- Social: Facebook (`realestatebroker.lamontmcleod`), LinkedIn (`afhcs`)

**Book:** How To Have a Financial Heart Attack
- Slug: `how-to-have-a-financial-heart-attack`
- Subtitle: A New Standard for Wealth and Responsibility
- Publisher: EverRise Press (imprint: HMD Publishing)
- Published: 2026-07-20
- Cover: `/images/books/financial-heart-attack-cover.jpg` (5.3MB — should compress)
- Chapter 1: "The Penny Candy Foundation" (extracted from EPUB)

**Book Format:** eBook
- Price: $4.99 USD
- ISBN: 9781835567173
- Distributor: DRAFT2DIGITAL
- Purchase URL: https://books2read.com/u/4E6eD0
- Note: User doesn't like the Books2Read UI. In Milestone 4, we built MultiRetailerModal to show direct retailer buttons on our site. When more retailer links are added (Amazon, Apple Books, Kobo, B&N), the modal will show them directly so users never see the D2D page.

**EPUB Source:** `/BOOK/how-to-have-a-financial-heart-attack-a-new-standard-for-wealth-and-responsibility.epub` (gitignored)
- 15 chapters total (The Penny Candy Foundation through The Reckoning)
- No embedded cover image in EPUB
- Chapter list from toc.ncx:
  1. The Penny Candy Foundation
  2. The Blueprint I Ignored
  3. The First Paycheck Syndrome
  4. Spring Break 1997: My First Real Financial Heart Attack
  5. The Job Hopping Hustle
  6. Black Bike Week and Borrowed Time
  7. The Gas Company Getaway
  8. Freaknik 1999: The Atlanta Awakening
  9. The Atlanta Decision
  10. Moving Day and New Beginnings
  11. College Life and Collections Calls
  12. The Roommate Lesson
  13. CompuCredit and the Man Who Changed Everything
  14. The Awakening Begins
  15. The Reckoning

---

## Brand Voice: System 4 — THE WAKE-UP CALL

**Reference Document:** `/BOOK/brand-voice-systems.md` (contains all 5 systems for future reference)

**Selected Voice:** System 4

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

**IMPORTANT — User may change the marketing tone later.** The `/BOOK/brand-voice-systems.md` file contains all 5 systems:
1. THE RECKONING — Clinical, diagnostic, medical metaphors
2. THE INHERITANCE — Narrative, generational, childhood patterns
3. THE MENTOR'S DESK — Conversational, Socratic, Craig from the book
4. THE WAKE-UP CALL — Provocative, jarring, pattern interrupts (SELECTED)
5. THE BLUEPRINT — Systematic, architectural, frameworks

If the user wants to switch voices, all copy across the site needs to be rewritten to match the new system. The 5 systems are documented in full in that file.

---

## Design System

**Colors (from `docs/design.md`):**
- Ever Rise Gold (Primary Accent): `#D4AF37`
- Deep Charcoal (Primary Dark): `#1A1A1A`
- Cream Vellum (Primary Light / Background): `#F8F5EE`
- Press Ink Blue (Secondary): `#284B75`
- Laurel Green (Success): `#5A7D5E`
- Highlight Warm Gold (Hover): `#EBC781`

**Typography:**
- Headings: Spectral SC (serif, small-caps) — weights 400, 600, 700
- Body: Karla (sans-serif) — weights 400, 500, 700

**Buttons:**
- Primary: Gold bg, charcoal text, uppercase, 4px radius
- Secondary: Transparent, gold border, uppercase

**Reader Mode:** Cream bg, 720px max-width, 48px padding

---

## Environment Variables (.dev.vars)

```
NEXTJS_ENV=development
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAEWC4iu22r4MiMkL
TURNSTILE_SECRET_KEY=0x4AAAAAAEWC4niv4o9W4WWNPXb8WvPAjtE
JWT_SECRET=everrisepress-jwt-secret-change-in-production
```

**Important:** The Turnstile site key is also hardcoded in `src/lib/env.ts` because Next.js with Turbopack doesn't properly inline `NEXT_PUBLIC_*` environment variables during SSR. This is a known issue with the @opennextjs/cloudflare adapter.

**Still needed (commented out in .dev.vars):**
- Mailchimp: `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID`, `MAILCHIMP_SERVER_PREFIX`
- PostHog: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- GA4: `NEXT_PUBLIC_GA_ID`
- Meta Pixel: `NEXT_PUBLIC_META_PIXEL_ID`

---

## Git & Deployment

- **Remote:** `https://github.com/EVER-RISE-PRESS-LLC/EverRisePressLLC-Website.git`
- **Branch:** `main`
- **Wrangler auth:** Logged in as `everrisepressdev@gmail.com` (account `4bb86ba631de88ebffab0709d3e09c19`)
- **Deploy command:** `npm run deploy`
- **NOT YET DEPLOYED** — no `wrangler deploy` has been run yet. The site is not live.
- **Worker name:** `everrisepressllc-website`
- **Worker URL (after deploy):** `everrisepressllc-website.everrisepressdev.workers.dev`

---

## What's Next: Milestone 6 — Mailchimp Integration & Email Nurture

**What to build:**
1. `lib/mailchimp.ts` — Mailchimp Marketing API v3.0 helper
2. Wire `POST /api/lead` to push subscribers with tags: `[book-slug, "chapter-one-lead", partner-slug]`
3. `POST /api/webhooks/mailchimp` — ESP unsubscribe/update sync
4. Automated 4-part nurture sequence (Mailchimp-side)

**What's needed from user:**
- Mailchimp account with an audience list created
- Mailchimp API key
- Mailchimp Audience ID
- Mailchimp server prefix (e.g., `us21`)
- Desired email tags/segments strategy

---

## Remaining Milestones Summary

**Milestone 7: Podcast Referral Engine**
- `/refer/[code]/route.ts` — Edge redirect with cookie attribution
- Referral click logging to database
- `middleware.ts` — Cookie attribution & admin route protection
- Needs: List of podcast partner names, contact emails, vanity slugs

**Milestone 8: Admin Dashboard**
- `/admin` layout with auth guard
- KPI dashboard (clicks, leads, conversion rates)
- Referral partner management
- Leads table with CSV export
- Book & format editor
- Needs: Admin user credentials

**Milestone 8.1: Image Management (R2-backed)**
- Upload/replace/delete images without code deploys
- R2 bucket `everrisepress-images`
- Admin UI: ImageUploader, ImageGallery, ImageField components
- See AGENTS.md Section 8.1 for full spec

**Milestone 9: SEO, GEO & Analytics**
- `app/sitemap.ts` and `app/robots.ts`
- `app/llms.txt/route.ts` — GEO plain text index
- `app/api/og/route.tsx` — Dynamic OpenGraph card generator
- PostHog analytics provider
- GA4 / GTM snippet
- Needs: PostHog project, GA4 property ID, GTM container ID, Meta Pixel ID

**Milestone 10: Polish, Privacy & Launch**
- `/privacy` page (GDPR / CAN-SPAM)
- Responsive QA
- Performance audit (Lighthouse, Core Web Vitals)
- SEO audit and schema validation
- Deploy to production
- Connect custom domain + DNS
- Needs: Privacy policy text, DNS records, retailer link confirmation

---

## Important Notes

1. **Book cover image is 5.3MB** — should be compressed for faster builds
2. **No custom domain yet** — using `everrisepressdev.workers.dev` temporarily
3. **Only eBook format exists** — paperback/hardcover to be added later
4. **Only D2D/Books2Read retailer link** — Amazon, Apple Books, Kobo, B&N to be added later
5. **The site has NOT been deployed** — `npm run deploy` has not been run
6. **User has a second Cloudflare account** (OBSEON-host, ID: `71e42a055d9f95bde3317d2f55c023ff`) — wrangler was re-authenticated to the EverRise Press account
7. **README.md must be updated** after each milestone completion — supervisors check it on GitHub
8. **AGENTS.md** contains the full project blueprint (10 sections) including database schema, directory architecture, core systems, SEO/GEO strategy, admin portal specs, and milestone details
9. **The EPUB is gitignored** (`/BOOK/` in .gitignore) but the brand voice doc at `/BOOK/brand-voice-systems.md` is tracked
10. **User may want to change the marketing tone** — all 5 voice systems are documented in `/BOOK/brand-voice-systems.md`
