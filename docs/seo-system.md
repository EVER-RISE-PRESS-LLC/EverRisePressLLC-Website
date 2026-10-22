# SEO System Runbook

Automated SEO layer built on [`@jdevalk/seo-graph-core@0.7.0`](https://github.com/jdevalk/seo-graph) (pinned exact — alpha-quality library, never use `^`). One content-type registration drives **everything** for a page type: the JSON-LD knowledge graph, Next metadata (title/description/canonical/OG/Twitter), breadcrumbs, sitemap entries, and llms.txt sections.

## Architecture

```
src/lib/seo/
├── ids.ts        # SITE_URL (env pattern, single source) + @id factory/constants
├── registry.ts   # THE automation core — content-type registry + piece builders
├── graph.ts      # getSeoGraph(type, data) → assembleGraph([...stubs, ...pieces])
└── metadata.ts   # buildMetadata(type, data) → Next Metadata

src/components/seo/
├── JsonLd.tsx        # low-level <script type="application/ld+json"> injector
└── SeoJsonLd.tsx     # <SeoJsonLd type="book" data={...} /> — registry-driven

src/app/schema.json/route.ts   # corpus-wide graph endpoint (GET /schema.json)
scripts/indexnow.mjs           # IndexNow submitter (npm run indexnow)
public/<32-char-hex>.txt       # IndexNow ownership key (served at site root)
```

Data flow for a page: page component fetches its entity → passes it to
`<SeoJsonLd type="book" data={...} />` (graph) and
`buildMetadata("book", data)` (head). Everything else is automatic.

## Adding a new content type

1. **Create the table** (Drizzle migration), e.g. `posts`.
2. **Add a registry entry** in `src/lib/seo/registry.ts`:
   - add the key to the `SeoPageType` union,
   - define a `XxxSeoData` interface,
   - implement `buildPieces`, `buildBreadcrumbs`, `metadata`, and
     (for content types) `sitemapEntries` + `llmsSection`.
3. **Wire the page** (`app/xxx/[slug]/page.tsx`): query the row, map it to
   the `XxxSeoData` shape, return `buildMetadata("xxx", data)` from
   `generateMetadata`, render `<SeoJsonLd type="xxx" data={data} />`.
4. **Register an agent endpoint** (if the type needs one): add one entry to
   `SCHEMA_ENDPOINTS` in `src/lib/seo/endpoints.ts` — `{ path, schemaType,
   build }`. `/schemamap.xml` and `/.well-known/api-catalog` are derived
   from this list, so both maps pick the new endpoint up automatically.
   Content *within* an existing type (new books/authors) needs nothing —
   the endpoints query D1 live on every request.
5. **Done.** Sitemap and llms.txt pick up the new type automatically via
   `sitemapEntries` / `llmsSection`; the schemamap/agentmap via
   `SCHEMA_ENDPOINTS`; `/schema.json` gets the new entities by adding them
   to its piece list.

Minimal entry template:

```ts
"post": {
  buildPieces(data) { /* pieces for this page */ },
  buildBreadcrumbs(data) { return [HOME_CRUMB, { name: "Blog", url: `${SITE_URL}/blog/` }, { name: post.title, url }]; },
  metadata(data) { return { title, description, canonicalPath: `/blog/${post.slug}` }; },
  sitemapEntries: async (db) => rows.map((r) => ({ path: `/blog/${r.slug}`, priority: 0.8, changeFrequency: "weekly" })),
  llmsSection: async (db) => "## Blog\n\n...",
},
```

Graph rules (from the seo-graph recipes):

- Every page type except `home` gets Organization + WebSite stubs prepended
  automatically (`src/lib/seo/graph.ts`) so `publisher`/`isPartOf` refs resolve.
- Always reference entities by `{ "@id": ... }` — never inline them.
- `WebPage` → `isPartOf: #website`; `Book`/`BlogPosting` → `isPartOf: WebPage`
  (article also `isPartOf: #blog`); breadcrumbs link back to collection entities.
- All URLs in the graph must be absolute.

## @id naming convention

| Entity | @id | Node |
| ------ | --- | ---- |
| Organization | `https://everrisepress.com/#organization` | site-wide singleton |
| WebSite | `https://everrisepress.com/#website` | site-wide singleton |
| Blog collection | `https://everrisepress.com/blog/#blog` | site-wide singleton |
| Book | `https://everrisepress.com/books/<slug>#book` | per-entity |
| Person | `https://everrisepress.com/authors/<slug>#person` | per-entity |
| WebPage | the canonical URL itself | per-page |
| BreadcrumbList | `<url>#breadcrumb` | per-page |
| Article/BlogPosting | `<url>#article` | per-page |
| Primary ImageObject | `<url>#primaryimage` | per-page |

Site-wide singletons are fragments on the site/collection root; per-entity
nodes are fragments on their canonical page URL. Library builders compute
WebPage/Breadcrumb/Article/Image ids automatically via `seoIds.factory`.

## Metadata

`buildMetadata(type, data)` emits: title template `"${title} | EverRise Press"`
(skipped when the title already contains the brand), description, canonical
(absolute), OpenGraph (type/title/description/1200x630 images), Twitter
(`summary_large_image`), and robots noindex when the registry entry sets
`noindex: true`.

## /schema.json

Corpus-wide knowledge graph (Organization, WebSite, Blog, all Persons, all
Books) assembled with `assembleGraph`, served as `application/ld+json`,
`Cache-Control: no-store`. AI crawlers can fetch the whole entity corpus in
one request. Keep it in sync with new content types by adding their entities
to the piece list in `src/lib/seo/endpoints.ts` (`getCorpusPieces`).

## Agent discovery endpoints

Three discovery documents for AI crawlers and agents, wired together:

| Endpoint | Format | Purpose |
| -------- | ------ | ------- |
| `/schema.json` | `application/ld+json` | Corpus-wide knowledge graph (all entities) |
| `/schema/site.json` | `application/ld+json` | Site entities only (Organization, WebSite, Blog) |
| `/schema/books.json` | `application/ld+json` | Every book as a full page graph (Book + WebPage + BreadcrumbList) |
| `/schema/authors.json` | `application/ld+json` | Every author (Person + ProfilePage + BreadcrumbList) |
| `/schemamap.xml` | `application/xml` | Schemamap — sitemap-style list of all schema endpoints |
| `/.well-known/api-catalog` | `application/linkset+json` | API catalog per RFC 9727 — schema endpoints typed by schema.org type |

- `robots.txt` advertises them via `Schemamap:` and `Agentmap:` lines.
- `llms.txt` lists them under `## Schema`.
- **Both maps are derived from `SCHEMA_ENDPOINTS`** in
  `src/lib/seo/endpoints.ts` — adding a new content type's endpoint there
  updates `/schemamap.xml` and `/.well-known/api-catalog` automatically.
  Adding new *content* (books, authors) needs nothing — endpoints query D1
  live per request.
- **Crawler support caveat:** `Schemamap:` / `Agentmap:` robots.txt
  directives are non-standard. Google ignores them; the target audience is
  AI/agent crawlers (Perplexity, GPTBot, ClaudeBot, etc.). Google continues
  to be served by the regular `Sitemap:` line and per-page JSON-LD.

## IndexNow

- **Key location:** `public/be36e0cfbb430e6abf5e599a7c5f3c0e.txt`
  (committed; served at `https://everrisepress.com/<key>.txt`).
- **Supported engines:** Bing, Yandex, Seznam, Naver. **Google does not
  support IndexNow** (relies on its own crawling).
- **Usage:** `npm run indexnow` (fetches the live sitemap, submits up to
  100 URLs) or `npm run indexnow <url...>` for explicit URLs. Always
  `--dry-run` first: `npm run indexnow -- --dry-run`.
- **Rotation:** if a submission is ever rejected with HTTP 403 (e.g. the
  key file wasn't live yet), generate a new key
  (`node -e "console.log(require('node:crypto').randomBytes(16).toString('hex'))"`),
  create `public/<new-key>.txt` containing the key, delete the old key file,
  deploy the key file, confirm it loads over HTTPS, then submit.
- The script uses `submitToIndexNow` from `@jdevalk/seo-graph-core`
  (host-filtering, dedupe, chunking).

## Future content types

| Content type | Builders to use (per seo-graph recipes) |
| ------------ | --------------------------------------- |
| **Blog post** | `article` registry type already wired: `buildArticle(..., 'BlogPosting')` + `Blog` collection + WebPage + BreadcrumbList + author Person ref. Adding a `posts` table + data query is all that remains. |
| **Chapter pages** (`/books/<slug>/preview`) | WebPage (`isPartOf: #website`, `isPartOf`-link the page to the Book entity) + BreadcrumbList (Home → Books → Book → Chapter). No new registry type needed — could extend `book` with a `variant` or add a `chapter` type. |
| **Podcast pages** | `buildPiece<PodcastSeries>` (site-wide) + `buildPiece<PodcastEpisode>` (`partOfSeries`, `associatedMedia`, `author`) per the seo-graph "Podcast / video site" recipe; `buildVideoObject` if video. |
| **Contact page** | WebPage + BreadcrumbList (Home → Contact); optionally `ContactPage` subtype via `buildWebPage`. |
| **About page** | `buildWebPage(..., 'ProfilePage')` + Person entity (`about` ref). |

## Constraints

- New dependency policy: only `@jdevalk/seo-graph-core@0.7.0` (pinned).
- Never hardcode `https://everrisepress.com` — route through
  `process.env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_SITE_URL`
  (`SITE_URL` in `src/lib/seo/ids.ts`).
- Works with any number of books/authors (one today; none or many tomorrow).
- Worker bundle budget: < 3000 KiB gzip (verify with
  `npx opennextjs-cloudflare build && npx wrangler deploy --dry-run`).
- Validate graph changes with https://validator.schema.org/ and
  https://search.google.com/test/rich-results.

## October 22 2026 audit corrections

- Breadcrumbs include only existing Home and detail routes until real collection pages are published. Intermediate items require destinations.
- Unknown modification times are omitted from the sitemap. Do not use request time as content freshness.
- Robots is served by `src/app/robots.txt/route.ts`. One group preserves `/admin` and `/api/` exclusions across crawlers. The gated preview is crawlable with `noindex, follow`, so Google can read the indexing directive.
- Blog schema remains available for future articles but is not emitted by site/corpus endpoints before the blog exists.
- Book edition publisher and stock availability must come from verified edition/retailer data; do not infer them from the website owner or purchase URL.
- Shared metadata provides canonical OG URLs and fallback social cards. The layout does not impose a homepage canonical on unrelated routes.
- `node scripts/seo-check.mjs [base-url]` verifies built/live SEO behavior. Production runs also test both HTTP hosts and their robots paths.
- Cloudflare Always Use HTTPS was enabled at the zone, separate from the Worker deployment. Keep this in rollback considerations.
