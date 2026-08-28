# Prompt: Automated SEO System — seo-graph-core Integration (Phases 1+2+3)

Copy this entire block into a fresh session. It is self-contained.

---

```
You are working on the EverRise Press website (Next.js 16.3.1, App Router, TypeScript, Tailwind v4, Cloudflare Workers via @opennextjs/cloudflare, D1 + Drizzle ORM, schema-dts 2.0.0 already installed).

## Read these files first (in order):
1. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/AGENTS.md
2. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/README.md
3. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/src/lib/schema.ts
4. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/src/components/seo/JsonLd.tsx
5. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/src/app/sitemap.ts
6. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/src/app/llms.txt/route.ts
7. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/src/app/page.tsx (homepage)
8. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/src/app/books/[slug]/page.tsx
9. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/src/app/authors/[slug]/page.tsx
10. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/src/app/privacy/page.tsx
11. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/src/lib/env.ts

## Mission
Replace the current disconnected JSON-LD setup with an AUTOMATED SEO system built on Joost de Valk's `@jdevalk/seo-graph-core` (npm, MIT, depends only on schema-dts ^2.0.0 — already installed). One content-type registration must produce, for any future page type: JSON-LD knowledge graph, full Next metadata (title/description/canonical/OG/Twitter), breadcrumbs, sitemap entries, and llms.txt entries. The marketing site must look and read IDENTICALLY when done — this is a schema/metadata/data-layer refactor, not a visual change.

## Reference material (Joost's architecture)
- Library: https://github.com/jdevalk/seo-graph (read its README + AGENTS.md for the 14 site-type recipes)
- Core API surface: `makeIds({ siteUrl, personUrl? })`, `buildWebSite`, `buildWebPage`, `buildArticle`, `buildBreadcrumbList`, `buildImageObject`, `buildSiteNavigationElement`, `buildPiece<Type>` (generic for Person/Organization/Book/etc., schema-dts typed), `assembleGraph(pieces)` (dedupes by @id, validates dangling refs). Plus IndexNow helpers.
- Install exactly: `npm install @jdevalk/seo-graph-core@0.7.0` (pin it — alpha-quality library; never use ^).
- Key concept from his blog: every entity gets a stable `@id`; WebSite → hasPart Blog/Books; WebPage isPartOf WebSite; article/book isPartOf both WebPage and its collection; breadcrumbs link back to collection entities; Person is the author AND publisher with publishingPrinciples optional.

## Step 1 — Install & scaffold the SEO layer
Create `src/lib/seo/` with:

1. **`src/lib/seo/ids.ts`** — wrap `makeIds({ siteUrl: "https://everrisepress.com" })`; export a singleton ID factory plus constants for the site-wide node IDs. IMPORTANT: siteUrl must come from `process.env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_SITE_URL` (env.ts fallback pattern), not hardcoded twice.

2. **`src/lib/seo/registry.ts`** — THE automation core. A content-type registry:
   ```ts
   type SeoPageType = "home" | "book" | "author" | "privacy" | "article";
   interface RegistryEntry {
     // schema pieces for this page type, given the entity data + ids
     buildPieces(data: unknown, ids: IdFactory): GraphEntity[];
     // breadcrumb trail, given the entity
     buildBreadcrumbs(data: unknown): { name: string; url?: string }[];
     // metadata title/description templates
     metadata(data: unknown): { title: string; description: string; canonicalPath: string; imageUrl?: string; noindex?: boolean };
     // sitemap / llms.txt contributors
     sitemapEntries?(db: Database): Promise<{ path: string; lastModified?: string; priority?: number }[]>;
     llmsSection?(db: Database): Promise<string | null>;
   }
   ```
   Register these types NOW:
   - `home` — Organization (#organization), WebSite (#website), WebPage (mainEntity/about → #organization). Breadcrumbs: none.
   - `book` — Book entity via `buildPiece` typed as `WithContext<Book>` (keep ALL current properties: name, url, description, image, inLanguage, datePublished, workExample with ISBN/price/Offer/availability per format). Use `@id` REFS (not inline objects) for `publisher` → #organization and `author` → #person-<slug>. Add BreadcrumbList (Home → Books → Book) + WebPage (isPartOf #website, mainEntity → #book-<slug>, author ref, datePublished/dateModified).
   - `author` — Person via `buildPiece` (#person-<slug>, keep jobTitle, description, sameAs, worksFor → #organization ref) + WebPage ProfilePage subtype + BreadcrumbList (Home → Authors → Name).
   - `privacy` — WebPage only.
   - `article` — PRE-WIRED for the future blog: `buildArticle` (BlogPosting) + author ref + breadcrumbs + `#blog` collection entity (buildPiece<Blog>). No data yet (no table), but the registry entry + docs must exist so adding the table later is a data-query job, not schema work.
   Do NOT remove the old `src/lib/schema.ts` functions until every page has migrated (Step 3).

3. **`src/lib/seo/graph.ts`** — `getSeoGraph(type, data)` → looks up registry → `assembleGraph([...stubs, ...pieces])`. Always prepend Organization stub + WebSite stub when the page type isn't home (so refs resolve), mirroring Joost's pattern.

4. **`src/lib/seo/metadata.ts`** — `buildMetadata(type, data): Metadata` using the registry's metadata() — title template `"${title} | EverRise Press"`, description, `alternates: { canonical }` (absolute everrisepress.com URL), openGraph (type, title, description, images with width/height), twitter (summary_large_image), robots noindex support.

## Step 2 — SeoJsonLd component
Add `src/components/seo/SeoJsonLd.tsx`: server component `<SeoJsonLd type="book" data={...} />` that calls getSeoGraph and renders one `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />`. Use the existing JsonLd.tsx as the rendering reference (it may already accept arrays — reuse it internally if clean).

## Step 3 — Migrate pages (identical visible output)
- `src/app/page.tsx`: replace its JsonLd usage with `<SeoJsonLd type="home" .../>`; add canonical via buildMetadata in its metadata export.
- `src/app/books/[slug]/page.tsx`: generateMetadata → buildMetadata("book", {...}); body → SeoJsonLd. Keep the existing title/description content and OG image (static /images/og/...) as the imageUrl.
- `src/app/authors/[slug]/page.tsx`: same for "author" (check its current metadata; preserve copy).
- `src/app/privacy/page.tsx`: same for "privacy".
- Delete `src/lib/schema.ts` only after no imports remain. Keep `cleanDashes` usage where it exists in lib/utils.ts (do not remove).

## Step 4 — Agent-ready endpoints (Phase 2)
1. **`GET /schema.json`** (`src/app/schema.json/route.ts`) — corpus-wide graph: Organization, WebSite, all Persons, all Books, Blog collection (empty `hasPart` list ok) assembled with assembleGraph, served as `application/ld+json`, no-store cache.
2. **Schema map** — add a `## Schema` section at the bottom of `src/app/llms.txt/route.ts` listing `${baseUrl}/schema.json` and per-entity references. Keep existing llms.txt content working.
3. **IndexNow**:
   - Generate a random 32-char hex key ONCE; create `public/<key>.txt` containing the key (this file must be served at the root — no route needed, public/ is served).
   - Create `scripts/indexnow.mjs`: `node scripts/indexnow.mjs [url...]` — submits to `https://api.indexnow.org/indexnow` with host=everrisepress.com; with no args, fetches `${baseUrl}/sitemap.xml` and submits up to 100 URLs. Dry-run flag. Add npm script `"indexnow": "node scripts/indexnow.mjs"`.
   - Document the key location in docs (Step 5). Do NOT submit anything during this session (run with --dry-run only).
   - Note in docs: Google does not support IndexNow (Bing/Yandex/Seznam/Naver only).

## Step 5 — Sitemap + llms.txt automation (Phase 3)
- Refactor `src/app/sitemap.ts` to iterate the registry's `sitemapEntries` for each registered type, merging with the existing static entries (home, privacy). Output must remain a valid MetadataRoute.Sitemap with the same entries it has today.
- Refactor `src/app/llms.txt/route.ts` to append each registered type's `llmsSection` output. Same visible output today (Catalog + Authors + Publisher), plus the new Schema section.
- Write **`docs/seo-system.md`** — the runbook: how to add a new content type (create table → add registry entry → data query → done), the IndexNow key location + how to rotate, the @id naming convention table, and a "future content types" list (blog post = article type already wired, chapter pages, podcast pages) with which builders each should use per the seo-graph repo's recipes.
- Update README.md Milestone 10 checkbox: mark the SEO Graph item as done with a summary: "Automated SEO system on @jdevalk/seo-graph-core 0.7.0: registry-driven JSON-LD graph, metadata+canonicals, breadcrumbs, /schema.json, IndexNow script, sitemap+llms.txt automation. See docs/seo-system.md." Also update the `memory/project-handoff.md` SEO section briefly.

## Hard constraints
- New npm dependency: ONLY `@jdevalk/seo-graph-core@0.7.0`. Nothing else.
- Do NOT touch: admin panel, robots.txt route, analytics (PostHog/GA4/Meta), referral engine, styling/CSS, brand copy.
- Worker bundle must stay under 3000 KiB gzip (check with `npx opennextjs-cloudflare build` + `npx wrangler deploy --dry-run`; currently ~2200 KiB).
- Canonical base: https://everrisepress.com. No hardcoded duplicate URLs — route through env.ts/env pattern.
- The site has ONE book and ONE author today; the system must not assume more or fewer.

## Verification (all required)
1. `npm run dev` → curl the JSON-LD on `/`, `/books/how-to-have-a-financial-heart-attack`, `/authors/lamont-mcleod`, `/privacy`: valid JSON, `@id` refs resolve within the graph or to real URLs, book page has WebPage.mainEntity → #book + BreadcrumbList, author page has ProfilePage + Person.
2. `<link rel="canonical">` present in the head of book + author + privacy pages → everrisepress.com URLs.
3. `curl /schema.json` → 200 application/ld+json with @graph containing Organization + WebSite + Book + Person.
4. `curl /llms.txt` → contains existing sections plus Schema section with /schema.json.
5. `curl /sitemap.xml` → same entries as before (home, privacy, 1 book, 1 author), everrisepress.com URLs.
6. `ls public/*.txt` shows the IndexNow key file; `node scripts/indexnow.mjs --dry-run` prints the submission URLs without sending.
7. `npx tsc --noEmit` and `npx eslint src scripts --quiet` clean.
8. `npm run build` succeeds; opennext build + `wrangler deploy --dry-run` worker payload < 3000 KiB gzip.
9. Visual smoke (dev server): homepage, book page, author page, preview page, admin login all render unchanged.
10. Paste the book page JSON-LD into https://validator.schema.org/ → no errors.

## Report back with
- Files changed/created list
- Sample assembled @graph from the book page (truncated ok)
- The IndexNow key file name (do not paste the key value)
- Results of all 10 verification steps
```
