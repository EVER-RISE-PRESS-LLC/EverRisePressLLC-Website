# seo-dev-doc

Audit date: 22 October 2026, Asia/Dhaka. Site: https://everrisepress.com. This plan was written before day-one implementation. Execution results will be appended after validation.

## Diagnosis

The GSC MCP is connected and authenticated as a Full user of sc-domain:everrisepress.com. All four submitted canonical pages pass URL Inspection as submitted and indexed. The older Page indexing summary (16 October) shows three indexed and privacy discovered; privacy was crawled and indexed on 18 October. This is primarily a visibility and content problem, with specific technical faults, rather than a site-wide indexing exclusion.

The most recent complete 28-day window used here (21 September–18 October) has 6 property-level impressions and 0 clicks. The previous 28 days have 15 impressions and 1 click. These samples cannot support reliable trend or ranking conclusions. Page-level impressions are not additive to property totals. Query data excludes anonymized searches.

Confirmed issues: invalid intermediate breadcrumbs on book and author; HTTP apex serves 200; HTTP www robots returns 522; robots Content-Signal warning; changing sitemap lastmod on unchanged pages; preview lacks noindex; missing author social image; typo in inherited title; broken manifest icon paths; homepage copy assumes facts about every reader; biography needs author verification; privacy text conflicts with installed analytics. The only external linking domain reported is lamontdmcleod.com. No manual actions detected. GSC field Core Web Vitals has no data. Mobile PageSpeed lab: performance 59, LCP 7.9s, FCP 1.7s, TBT 430ms, CLS 0. Main text has 3500ms render delay in the breakdown. A lab result is not field performance or proof of a ranking cause.

## Ten day work plan

| Day and date | Work and owner | Completion evidence |
| --- | --- | --- |
| 1 — Oct 22 | Codex: baseline audit, breadcrumb and robots corrections, truthful sitemap dates, preview noindex, metadata, primary text visible before JS, HTTPS delivery, factual homepage opening, test and deploy. | Build and lint pass; live pages return correct status/canonical/schema; primary content is present and visible in HTML; before/after evidence recorded. |
| 2 — Oct 23 | Owner + editor: answer the review questions; verify biography, imprint relationship, book facts, contact address and privacy behavior. Codex: draft About/contact and revise privacy to reflect approved actual processing. | Every biographical claim has a source or is removed; working contact route; accurate consent/data explanation; no invented credentials. |
| 3 — Oct 24 | Codex + author: rewrite book and author pages around the real reader, topics, edition details, selected excerpt and limits. Keep the email chapter flow. | Clear first paragraph; book title/author/formats/ISBNs match retailers; useful visible description beyond syndicated blurb; author sign-off. |
| 4 — Oct 25 | Codex: implement /blog and article template with author, sources, publication/update dates, related reading, canonical, Article and Breadcrumb schema, sitemap entries and navigation. | Drafts excluded from indexing; published articles link from homepage/blog; real dates and valid schema; no empty indexed category pages. |
| 5 — Oct 26 | Author + editor + Codex: publish article 1, Why payday feels like a reset, using an approved allowance/payday story and a concrete reflection exercise. | Original author contribution; factual claims sourced; approved byline; link to book, author and next relevant reading. |
| 6 — Oct 27 | Editor + Codex: publish article 2, A weekly cash flow calendar for uneven bill dates, with a worked fictional example and a usable worksheet. | Math checked; example clearly fictional; CFPB source linked; accessible table/download; scope and reviewer identified. |
| 7 — Oct 28 | Codex: performance pass on image sizing, animation JS, fonts and analytics; verify lead and retailer event definitions with owner. | Repeat comparable mobile lab runs on home/book/article; record median and variance; aim LCP <=2.5s, TBT <=200ms, CLS <=0.1; no functionality loss. |
| 8 — Oct 29 | Owner + Codex: prepare a verified media/book information page and a short list of relevant podcasts, libraries and finance reading communities. Owner approves and sends outreach. | Correct owned profiles link to canonical book/author pages; outreach drafts are reviewed; no purchased links or fabricated reviews. |
| 9 — Oct 30 | Author + editor + Codex: publish a book club discussion guide using the actual chapter titles and author-approved prompts. Link the guide, the two articles, and the book. | Manuscript and approved prompts on file; no invented quote or chapter summary; guide serves reading groups rather than duplicating the payday article. If author input is absent, hold publication and improve existing pages. |
| 10 — Oct 31 | Codex + owner: recrawl all published URLs, inspect status and selected canonical, review GSC coverage/breadcrumb validation and content engagement; choose next month’s topics from evidence. | Technical errors closed or assigned; source/measurement log complete; next review dates agreed; report impressions/clicks and real conversions without promising rankings. |

These dates are a work schedule, not autonomous scheduled runs. No daily automation or outreach is authorized by this plan alone. Ten days can improve publication quality and crawl eligibility; Google may take days or weeks to recrawl, and rankings are not guaranteed.

## Editorial briefs

1. **Why payday feels like a reset** — Intent: understand repeating payday spending. Proposed URL /blog/payday-spending-patterns. Reader: US English-speaking adults reflecting on their spending. Include Lamont’s approved story, distinguish habits from low income and unavoidable costs, a seven-day reflection worksheet, and one next action. Use book/author/CFPB links. Do not promise to cure debt. Query targets are hypotheses, not measured search volumes.
2. **A weekly cash flow calendar for uneven bill dates** — Intent: learn how to map income dates against bill dates. Proposed URL /blog/weekly-cash-flow-calendar. Include a labeled fictional month, negative-balance week, irregular-income limits, printable accessible worksheet and primary CFPB resources. Identify editorial review; do not impersonate a financial adviser.
3. **Book club discussion guide** — Intent: reading groups choosing or discussing this specific title. Proposed URL /reading-guides/financial-heart-attack. Use the local EPUB table of contents, author-approved discussion prompts, verified edition details and links to the book and related articles. Publish on day nine after author review.
4. **The questions I ignored at my first collection job** — Later author interview, only with direct answers or an approved transcript. This is a possible follow-on essay, not a third generic payday post. Choose its final angle from reader questions and avoid duplicating article one.
5. **Meet the publisher and contact** — One useful About page identifying EverRise Press, the verified relationship to HMD Publishing, editorial standards, contact and corrections process. Avoid an unverified address or qualifications.

## Owner review needed

- Confirm primary country/audience and whether the desired reader is a first-time budgeter, a reflective memoir reader, or a book-club reader. Working assumption: US English-speaking adults; USD retailers support this assumption but do not prove demand.
- An EPUB manuscript is already in BOOK/ and was checked for the day-one descriptions. Confirm it is the approved edition and identify passages that can be quoted publicly.
- Verify Lamont’s biography, dates, founder roles, debt-collection experience and how he wants sensitive personal history described. Confirm approved name, photo rights and profile links.
- Confirm EverRise Press versus HMD Publishing imprint roles. Apple Books lists HMD Publishing and release date July 20, 2026; reconcile with the website database before changing publication facts.
- Verify edition prices, ISBNs, retailer availability and publication date. Do not claim in-stock inventory or a future book date without confirmation.
- Confirm monitored public contact/privacy addresses, data retention, actual Mailchimp setup and intended analytics consent. Existing policy says no advertising/cross-site cookies while GA4, PostHog and Meta are configured; chapter JWT also includes email, contradicting access-status-only wording.
- Approve the shift to direct but respectful copy: concrete book information and real examples, without universal claims such as all money problems being learned before age ten.

## Sources and evidence

- GSC raw snapshots and crawl evidence: ../seo-audit-2026-10-22 (workspace folder outside this repository).
- Google AI content guidance: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Google recrawl guidance: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- Google breadcrumbs: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Google sitemap lastmod: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google noindex: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- PageSpeed baseline: https://pagespeed.web.dev/analysis/https-everrisepress-com/oc4vhqgmll?form_factor=mobile
- CFPB toolkit: https://www.consumerfinance.gov/consumer-tools/educator-tool/your-money-your-goals/toolkit/
- Apple Books listing: https://books.apple.com/us/book/how-to-have-a-financial-heart-attack-a-new/id6793190934

## Day one completed

Released on 22 October 2026 as Worker version 880c78a4-12d5-44dc-8a44-1cf23b141075. Build, TypeScript, lint, OpenNext packaging, a deployment dry run, and local and live integration checks passed. Compressed Worker size is 2221.69 KiB. Both HTTP hosts now redirect to HTTPS, including the previously failing www robots path. The shared smoke script is scripts/seo-check.mjs.

Lint finishes with zero errors and 14 existing warnings. Generated `.wrangler/` bundles are excluded, matching the existing `.next/` and `.open-next/` exclusions; linting the temporary 10 MB preview bundle had exhausted Node's default heap. This lint configuration change does not affect the deployed runtime.

The live checks cover four public pages, canonical destinations, descriptions, social cards, one H1 per page, valid JSON-LD, real breadcrumb destinations, initial HTML visibility, preview noindex, true 404s, stable sitemap dates, manifest assets and HTTP host redirects. Browser checks confirm the chapter signup entry; no subscriber or purchase was submitted.

Google's live Rich Results Test detected one valid Breadcrumbs item on the book page after deployment, with a successful crawl at 20:32 on 22 October. This verifies the live correction; historical Search Console reports still await a recrawl. Result: https://search.google.com/test/rich-results/result?id=WYiS2-pnDuzaL7h0mbnAvg

A post-release mobile PageSpeed run scored 82, with LCP 3.9 seconds, FCP 1.7 seconds, TBT 60 ms and CLS 0.078. Before: performance 59, LCP 7.9 seconds, TBT 430 ms, CLS 0. These are individual lab runs with variation, not a controlled causal experiment or a field Core Web Vitals pass. LCP still needs work. Report: https://pagespeed.web.dev/analysis/https-everrisepress-com/uzvui5kvwm?form_factor=mobile

Remaining review items: database biography and retailer synopsis; publisher/imprint/date reconciliation; privacy and actual email processing; new article/guide approval. The old invalid homepage sitemap submission is still an administrative cleanup item. Source and evidence are retained in the adjacent seo-audit-2026-10-22 workspace folder. A formatted review copy is ../seo-dev-doc.docx relative to the repository root.
