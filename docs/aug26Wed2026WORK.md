# Work Plan — Aug 26 (Wed) 2026

Scope: everything except Mailchimp (Milestone 6 stays on hold until account access is available).

---

## Delivered (Aug 26)

- [x] **Schemamap + Agentmap (agent discovery)** — per-type schema endpoints (`/schema/site.json`, `/schema/books.json`, `/schema/authors.json`), `/schemamap.xml`, `/.well-known/api-catalog` (RFC 9727), robots.txt `Schemamap:`/`Agentmap:` lines, llms.txt entries, docs rule in `docs/seo-system.md` (new endpoint types = one `SCHEMA_ENDPOINTS` entry → both maps auto-update).

---

## 1. Performance Pass (recommended first — biggest real-world win)

Every marketing page is `force-dynamic`, so each request currently hits D1. Warm render cost is ~100–160ms; edge caching + fewer round-trips is the main lever.

- [ ] **D1 query batching** — homepage, book page, and author page each run 2–3 sequential `await db.select()` calls; parallelize with `Promise.all` and use D1 `batch()` where possible. Zero risk, ship first.
- [ ] **HTML edge caching** — add Cloudflare Cache API / stale-while-revalidate caching for mostly-static marketing pages (`/`, `/books/[slug]`, `/authors/[slug]`, `/privacy`), invalidated when admin edits touch books/authors/formats. Leave `/preview` and `/admin` uncached.
- [ ] **Third-party script tuning** — PostHog, GA4, and Meta load client-side on every page; defer/prioritize them and keep them off the gated reader hot path.
- [ ] **LCP polish** — fix the dev LCP candidate warning on scroll-stack images, confirm hero cover keeps `priority`, audit `public/images/stack/*` file sizes.
- [ ] **Worker bundle diet** — recheck size after any new dependency (currently 2226 KiB gzip; budget 3000 KiB).

## 2. WQR Audit

Run Joost de Valk's Web Quality Rating checklist against all pages (home, book, author, privacy, preview). Mostly copy/metadata tweaks — small effort.

- [ ] Run checklist page by page
- [ ] Fix findings (titles, descriptions, structured data, trust signals)

## 3. Deploy & Domain

- [ ] Final deploy to production
- [ ] Connect `everrisepress.com` (DNS records in Cloudflare — only blocker)
- [ ] Verify HTTPS, redirects, sitemap, robots, llms.txt, /schema.json live

## 4. Polish Backlog

- [ ] Fix `src/app/manifest.json` icon paths — `/src/app/icon.png/web-app-manifest-*.png` → `/web-app-manifest-*.png`
- [ ] Retailer links: swap Bookshop.org search placeholder for direct product URL once listed
- [ ] Add Amazon / Barnes & Noble retailer rows when enrolled via D2D
- [ ] (Optional) publish IndexNow once the key file is live in production (`npm run indexnow` after deploy — dry-run first)

## Deferred (NOT in this plan)

- Milestone 6 — Mailchimp integration (awaiting API key + audience ID)
