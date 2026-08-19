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
- **Caching:** Cloudflare R2
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
  - R2 caching bucket configured
  - Environment variables structure ready
  - Build verified working

- [x] **Milestone 2: Database & Seed Data** (Completed: 2026-08-20)
  - Schema migrations applied to local and remote D1
  - Author record seeded: Lamont D. McLeod (Founder)
  - Book record seeded: "How To Have a Financial Heart Attack"
  - Chapter 1 content extracted from EPUB
  - eBook format configured: $4.99, ISBN 9781835567173, Draft2Digital
  - Purchase URL: https://books2read.com/u/4E6eD0

- [x] **Milestone 3: Publisher Homepage & Author Page** (Completed: 2026-08-20)
  - Homepage with System 4 "Wake-Up Call" voice
  - Hero section with pattern interrupt headline
  - Featured book section with CTAs
  - Author bio page with full System 4 bio
  - Book landing page with conversion-focused layout
  - Design system implemented (Ever Rise Gold, Deep Charcoal, Cream Vellum)
  - Spectral SC + Karla typography
  - Responsive design across all pages

- [x] **Milestone 4: Book Landing Page & Multi-Retailer Modal** (Completed: 2026-08-20)
  - Book detail page with System 4 conversion copy
  - MultiRetailerModal component — format/vendor selector (scales with new retailers)
  - JSON-LD Book schema injection on book page
  - JSON-LD Organization schema on homepage
  - JSON-LD Person schema on author page
  - Dynamic metadata (OpenGraph) per book
  - schema-dts typed structured data

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

---

**Last Updated:** 2026-08-20  
**Progress:** 4/10 milestones complete  
**Next:** Milestone 5 - Gated Chapter 1 Reader & Lead Capture
