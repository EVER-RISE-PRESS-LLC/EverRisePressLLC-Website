# Blog publishing

The blog is maintained in `src/content/blog/articles.json`, validated by `src/lib/blog/model.ts`. It uses the existing Next.js/OpenNext Worker. No CMS, database migration, new service, or storage account is required.

## Current state

Two non-sensitive editorial briefs are present: `payday-spending-patterns` and `weekly-cash-flow-calendar`. Neither contains article body copy or has an approved byline/review. Both remain drafts. Public draft URLs return 404. Staff with an existing ADMIN or EDITOR session can use `/admin/articles` and `/admin/articles/<slug>` to review them.

This GitHub repository is public. Draft source and editorial notes committed here can be read on GitHub; staff authentication protects the website preview routes, not the repository. Keep sensitive or not-yet-approved-for-source-control material outside this repository. The two committed briefs contain only planning information already in the SEO plan.

With no published articles, `/blog` offers a short coming-soon page and book/chapter links. It has `noindex, follow`, no canonical, no Blog schema, and no sitemap or main-navigation entry. This avoids advertising an empty collection to search engines. The first published article enables the blog index, header/mobile/footer links, a latest-reading section on the homepage, sitemap entries, Blog/BlogPosting schema and article discovery automatically.

## Add and review an article

1. Create an entry with a unique lowercase slug, title, description, section, image path/alt, byline, sources, related slugs and content blocks. Start with `status: "draft"`, `author.confirmed: false`, null dates/review. Reuse the existing default OG image until an approved article-specific image is available.
2. Write the body using paragraph, heading, list, quote and table blocks. Paragraphs are plain text, escaped by React. A heading needs a unique anchor ID. Quote blocks need an attribution and a source ID from the sources list. Tables need a caption and equal cell/column counts. Source URLs must use HTTPS. Related slugs must exist and cannot link to the article itself.
3. Check the copy against source material. Obtain actual approval before attributing a first-person contribution to Lamont. A book author profile does not establish a financial-adviser qualification. Verify calculations and label fictional examples. The two planned articles still need their editorial input, source review and byline confirmation.
4. Set `author.confirmed: true` only after confirming the responsible author. Person bylines link to the real author profile; the publisher byline uses Organization, name EverRise Press and URL `/about`.
5. Record actual ISO timestamps with offsets, for example `2026-10-27T10:30:00Z`: `publishedAt` for first publication, `updatedAt` for the latest material edit, and `review: { "by": "Actual reviewer name", "at": "..." }`. The review must cover the latest update. Do not change dates on unchanged pages. For an edit, retain the first publication date and record a fresh review/update.
6. Set `status: "published"` after review. The validator rejects missing dates, missing sources/body, unconfirmed bylines, stale reviews, invalid links, duplicate slugs/anchors and broken references. Future publication, update or review dates keep the article out of all public selectors until those dates have passed; no scheduler was added.
7. Run `npm run test:blog`, lint and the existing OpenNext build. Test a local production preview with `npm run check:blog -- http://localhost:8788` and `node scripts/seo-check.mjs http://localhost:8788`. Verify the actual article layout, source links, dates and sharing metadata.
8. Commit, push to main, and verify Cloudflare Workers Builds plus live checks. Articles are versioned with the deployed app; editing a file alone does not update production.

## Reader and SEO behavior

The same publication selector drives the public article route, related-reading links, index, navigation, homepage, sitemap, llms.txt, `/schema/articles.json`, `/schema/site.json` and `/schema.json`. Drafts do not receive public Article schema. Admin previews inherit `noindex, nofollow` and check the staff session before accessing the brief. They emit no public Article schema.

Published articles have a canonical URL, title/description, large sharing card, visible byline and dates, Open Graph publication/update times, BlogPosting/WebPage/author/image nodes and three-level breadcrumbs. The Blog hasPart list and corpus endpoint include only published articles. All graph links use the canonical site origin. Publication dates are required rather than fabricated at render time.

The reading template supports in-page navigation, a restrained reading column, accessible lists/quotes, named keyboard-scrollable table regions, source links, published related articles, and book/free-chapter links. Existing signup, tracking defaults, saved opt-outs and shared motion behavior are preserved.

## Validation performed for this setup

Six model tests cover publication/review gates, future dates, stale edits, invalid links, source references, duplicate identifiers, table shape, related reading and catalog validity. Five existing chapter/tracking tests also pass. HTTP integration was exercised with two clearly labeled local fixture articles: Organization and Person bylines, index/nav/homepage visibility, canonical and social dates, breadcrumbs, structured-data endpoints, sitemap and llms discovery, safe script-like text rendering, related reading and table semantics.

Unauthenticated draft-review requests redirect to login. A temporary local EDITOR fixture successfully opened both the review list and a draft preview with noindex and no public Article schema. That local test user and the two synthetic articles were removed before the production build. The production catalog contains only the original two unpublished briefs. No production database record, subscriber, real signup, CAPTCHA, purchase or outbound message was created.

Desktop (1280 px), mobile (390 px), tablet navigation (768 px), keyboard table scrolling, in-page links and menu Escape dismissal were checked. The independent Impeccable finish review returned `ship`. Captures and logs are in the adjacent `seo-blog-setup-2026-10-27` evidence folder and ignored `.impeccable/review/` directory.

Technical references: [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [Google Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), [Cloudflare Next.js deployment](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/).
