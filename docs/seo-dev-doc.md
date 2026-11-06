# seo-dev-doc

Latest release: 29 October 2026. The remaining articles, publisher discussion guide, cover-image workflow, press page and performance work are recorded in [the completion and verification report](seo-completion-2026-10-29.md). The original schedule and historical results below are retained as an audit trail.

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

## Owner review from the original audit

Status updated 24 October: the owner confirmed the monitored privacy inbox, approved the biography and clarified HMD’s publishing/distribution role. The owner chose automatic tracking with a footer disclosure. The latest decisions and remaining inputs are recorded at the end of this document; the list below preserves the original audit questions.

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

## Day two implementation 24 October 2026

Day two was carried out on 24 October, rather than the original 23 October slot. The day numbers remain the work sequence. No future days have been scheduled automatically. The initial site changes are live. The owner subsequently confirmed the contact inbox, biography, publishing-service relationship and automatic tracking preference. The follow-up below records those decisions; retention and day-three editorial input remain open.

Published `/about` as one contact and publisher page. It explains the site, book, free chapter, author background, edition credits, and corrections route. It links to the book, preview, author, privacy policy, official author website and Apple Books record. The footer, sitemap and structured-data registry now include this page. AboutPage and valid two-level breadcrumbs identify its purpose. Following the owner’s clarification, the page explains that EverRise Press uses publishing and distribution services through HMD to list the book on Amazon and other retailers.

The biography uses a short account based on the manuscript and the author’s official website. The owner approved the November 2010 accident and his mother’s death thirteen days later; these facts are restored in the follow-up. The unsupported HMD founder claim, invented statements about his beliefs, and universal claims about readers being broke remain removed. The prior database row is backed up in the private workspace evidence folder. The seed biography is aligned with the change; `scripts/seo-day2-author.sql` records the targeted content update. The full book-page rewrite and an original author contribution remain day-three work.

### Verified facts and their limits

| Detail | Evidence checked | Public treatment |
| --- | --- | --- |
| Author name and EverRise founder role | Official author website and affiliations page | Lamont D. McLeod; author and founder of EverRise Press |
| Real estate, home care and speaking | Official author website | General background only; no invented qualifications or credentials |
| Allowance, payday and debt-collection subjects | Local EPUB manuscript, checked on day one and revisited on day two | Describe the contents as McLeod's experiences, not a diagnosis of every reader |
| HMD Publishing | Owner confirms publishing/distribution services through HMD; Apple Books names HMD as publisher; manuscript credits HMDPublishing.com for book design | Explain the service relationship and attribute edition credits; no HMD founder or business-ownership claim |
| Personal history | Owner approved the existing November 2010 accident and mother’s death thirteen days later | Publish the approved facts in the short biography without invented emotional quotations |
| Publication date | Apple Books and current site database both say July 20, 2026 | No date change needed. March 9 in EPUB metadata is an export timestamp, not proof of publication |
| ISBNs | Ebook 9781835567173; paperback 9781835566930; valid checksums and matching retailer records | Existing ISBNs retained; price/stock claims still require the retailer's current listing |
| Public contact | Cloudflare Email Routing enabled; active catch-all covers privacy@; owner confirms that inbox is monitored | Use privacy@everrisepress.com for reader questions, corrections and data requests. No test email was sent |

Sources: [official author website](https://lamontdmcleod.com/), [affiliations](https://lamontdmcleod.com/affiliations), [author story](https://lamontdmcleod.com/story), [Apple Books](https://books.apple.com/us/book/how-to-have-a-financial-heart-attack-a-new/id6793190934), [ebook ISBN record](https://www.adlibris.com/sv/bok/how-to-have-a-financial-heart-attack-a-new-standard-for-wealth-and-responsibility-9781835567173), [paperback ISBN record](https://www.akademibokhandeln.se/bok/how-to-have-a-financial-heart-attack/9781835566930). Retailer records corroborate edition facts; they do not establish the businesses' legal ownership.

### Privacy and chapter access

The old privacy text promised a Mailchimp email sequence and denied advertising tracking despite configured analytics and Meta code. The deployed policy now describes the actual signup record, admin viewing/export, service providers, optional tracking, cookie lifetimes and retention. The form explicitly says that the chapter opens on this site and links to the policy. No email series or Mailchimp integration has been added.

At the owner’s request, analytics and advertising run by default. The initial opt-in banner is removed. A notice directly below the footer copyright names Google Analytics, PostHog and Meta and explains their use of cookies and device information. Privacy choices remains available in the footer to turn either category off; previously saved preferences are honored. Browser GA4/PostHog and Meta, server PostHog/Meta events, referral logging and retailer-click logging respect those settings. Saving changes reloads the page and stops future tracking for disabled categories; it does not erase information already collected. Clearing site data removes the preferences and restores the default. Hashing IPs or emails is not described as making them anonymous.

PostHog no longer identifies signups by email or includes the email in lead-event properties. Existing browser identifiers from the previous setup are cleared when the visitor first chooses. Session recording remains disabled. The chapter works with optional tracking declined.

The reader previously tried to read an HttpOnly cookie in client JavaScript. It now verifies the signed cookie on the server, checks its book and expiry, and sends the chapter only after a successful check. New seven-day cookies hold the book identifier and token dates, without email. Existing correctly signed cookies remain valid until expiry; older email-containing cookies are disclosed in the policy. Production preview responses use private/no-store caching.

Signup and referral records currently have no automatic deletion schedule. The policy states this actual behavior. Choosing a retention period, implementing deletion jobs, or erasing existing records needs an explicit operational decision. No subscriber records were deleted or exported during this task.

### Editorial and metadata review

Working audience: readers checking the book, author, publisher and signup terms. Focus for About: EverRise Press; secondary intent: contact, book credits and corrections. These are branded service intents, not search-volume claims.

| Content SEO criterion | Result |
| --- | --- |
| Search intent | Pass: identifies the press and gives a direct contact route |
| Focus phrase | Pass: EverRise Press appears in title, H1 and opening; no forced repetition |
| Experience and trust | Pass: sourced background plus owner-approved personal history, publishing-service relationship and monitored contact |
| Original usefulness | Pass: manuscript and edition credits, precise signup terms, corrections and privacy contacts |
| Freshness and accuracy | Pass: visible review date and stable lastmod tied to this release; changing prices deferred to retailers |
| Internal linking | Pass: book, author, preview, privacy and About are connected; no empty blog page published |

| Readability criterion | Review |
| --- | --- |
| Structure and topic order | Pass: identity/book/credits/contact; privacy groups data by feature |
| Paragraph structure | Pass: one topic per paragraph; tracking defaults, saved choices and retention are explained separately |
| Opening | Pass: names the site and explains the page's purpose immediately |
| Sentence length | Pass: short connected sentences; technical details remain where needed for an accurate disclosure |
| Passive voice | Limited to factual states such as recording disabled; no hidden actor in signup handling |
| Difficult words | Caution: analytics, advertising, identifiers and provider names add complexity; hashing is explained in plain language |
| Filler and hedging | Pass: unsupported slogans and sweeping reader judgments removed from the biography |
| Transitions | Pass: descriptive headings carry changes of subject |
| Variation | Pass: connected short paragraphs and a cookie list suited to comparison |
| Heading hierarchy | Pass: one H1 and descriptive H2 sections |

Initial day-two draft Flesch Reading Ease estimates: About 56.8; privacy 44.7. These historical estimates precede the owner-requested tracking and publisher edits. Calculated with the standard formula and a heuristic vowel-group syllable count, so proper names, addresses and abbreviations affect the estimate. This is not a certified readability score. Technical terms remain where needed for accuracy; the copy uses short sentences and explains the data flows directly. The calculation and extracted prose are in the evidence folder.

Metadata review passes front-loading, concrete wording, active phrasing, distinct title/description purpose, and sensible search-result length. About title: 32 characters; description: 145. Privacy title: 31 characters; description: 138. Search engines may still rewrite or truncate snippets. No fabricated reviews, credentials or keyword-volume claims were added.

### Verification and release

Initial day-two release: Worker `af5fab53-1552-4451-bc31-9b6cd61d43e8`. The following checks describe that release; owner-follow-up verification is recorded separately below. Next.js/TypeScript and OpenNext builds passed. Lint has zero errors and four pre-existing warnings. Wrangler dry run passed. Five tests cover token scope/expiry/tampering/legacy access and independent consent categories. Local HTTP integration verifies locked versus authorized chapter output and consent guards without writing leads. Mobile (390 px) and desktop (1280 px) browser checks cover About/privacy layout, consent choices, withdrawal, and dialog dismissal. The initial dialog's outline-button contrast was corrected before release.

The live smoke test passes all five public pages, status/canonical/meta/social tags, JSON-LD, AboutPage, breadcrumb URLs, initial HTML visibility, sitemap stability, robots, preview noindex, missing-page 404s, manifest images and HTTP redirects. Live checks also confirm the revised biography and private/no-store preview responses. No real signup, CAPTCHA completion, purchase or outbound email was performed.

GSC MCP read access works as a Full user. Before resubmission, the registered sitemap had zero warnings/errors and a last download on October 22. The live sitemap now includes `/about`. The MCP resubmission call returned HTTP 403 Insufficient Permission; this does not remove the existing sitemap registration or prove an indexing failure. The new page's Google indexing has not yet been confirmed.

Evidence: `../seo-day2-2026-10-24/` contains source captures, the prior biography, sanitized email-routing checks, local/live smoke results, access tests, build/lint/deployment logs and document render checks. Runtime credentials are not included in this repository.

### Owner decisions received on 24 October

- **Contact confirmed:** use privacy@everrisepress.com for reader questions, corrections and privacy requests; the owner confirms it is monitored. The code’s publisher contact and Organization email use this address.
- **Biography approved:** the owner approved Lamont’s biography, including the November 2010 accident and his mother’s death thirteen days later. These facts are included without restoring unsupported beliefs or universal claims about readers.
- **Publishing relationship clarified:** EverRise Press uses publishing/distribution services through HMD to list the book on Amazon and other retailers. This is a service relationship; no HMD founder or company-ownership claim is inferred.
- **Tracking preference confirmed:** preserve automatic tracking and disclose it accurately after the copyright. The initial consent banner is removed; saved opt-outs and the footer settings remain functional.

### Remaining owner input

1. Choose how long signup/referral records should be kept and who handles deletion requests. The current policy discloses manual retention. Any future newsletter or automated series needs its own purpose and signup terms; the present chapter form does not add one.
2. Day three now uses a short sentence from the existing published Chapter 1 sample and the manuscript contents list. Before a new first-person article is published, supply or approve its personal example, quotations and byline. No new testimony will be invented.

The confirmed decisions are recorded as owner statements, alongside the independently checked sources. Google indexing of the new About page remains unconfirmed.


### Owner follow-up release verification

Applied the owner’s answers on 24 October 2026 and deployed Worker `3ac6f904-7e43-49b9-9c7b-005877185e75`. Build/TypeScript, lint (zero errors and four pre-existing warnings), Wrangler dry run, all five access/tracking tests, local server preference guards, and local/live five-page SEO checks pass. Live content checks confirm the approved biography, publishing-service wording, monitored contact and Organization email.

Browser verification confirms automatic GA, PostHog and Meta script loading for a fresh local visit, no initial banner, both settings enabled by default, and no vendor scripts after choosing Essential only. A pre-existing production opt-out remains off after this release. The footer notice was checked at 390 px and 1280 px; it follows the copyright on both. No real lead, purchase, CAPTCHA or outbound email was submitted.

The updated Word review document records the resolved decisions and two remaining inputs. Follow-up evidence is in `../seo-day2-2026-10-24/owner-followup/`; the original day-two evidence remains intact.


## Day three implementation — 24 October 2026

Day three rewrites the book and author pages using the existing EPUB, the already published Chapter 1 sample, retailer edition records, and the owner-approved biography. It also includes the owner's follow-up request to make the end-of-preview purchase section clearly distinct from the footer. No new interview answer or personal testimony has been invented. The original ten-day plan remains the work sequence; day four has not been started or scheduled automatically.

### Published content and buying path

- The book page now opens with the actual subject: a childhood allowance, payday spending, and work in debt collection. A new three-paragraph synopsis replaces the syndicated retailer blurb in D1 and both seed implementations; the homepage and author book section inherit it.
- Added a reader-fit explanation, a short quotation already present in the existing public sample, the full fifteen-chapter contents list, and six manuscript-based chapter notes. Corrected the former generic chapter label to the actual title, The Awakening Begins.
- Added a visible edition table: eBook ISBN 9781835567173 and paperback ISBN 9781835566930, English, July 20, 2026. The page attributes the HMD Publishing credit to the Apple Books record and links to the owner-confirmed service relationship on About.
- Added practical answers about the free sample, the kind of book, and where buying takes place. The page describes personal experience and reflection without promising a complete budgeting course, a financial cure, or results for every reader.
- The author page preserves the approved biography and improves the introduction, book section, official-site links and reading/contact routes. The official author website is also included in Person sameAs.
- The retailer chooser now works on light and dark sections and directs readers to each retailer for current price and availability. Repeated store records produce two editions in Book schema. Unverified fixed-price offers and the unpublished blog link are removed from machine-readable output.
- The end-of-preview CTA is a full gold section with the real cover, a large charcoal purchase button and a quieter all-formats link. The requested Get the Full Book for $4.99 button points to the checked Apple Books US eBook listing; the format, store and country-price qualification are visible beside the action. The price uses that format's database row, so future price changes must be checked and updated there.
- The free chapter keeps its existing email/Turnstile flow and server-verified access cookie. The signup explanation now states plainly that the chapter opens on the site. Existing tracking defaults and opt-outs remain in effect.

### Source ledger and editorial limits

| Claim or content | Evidence and treatment |
| --- | --- |
| All fifteen chapter titles | Exact match against the local EPUB table of contents, recorded with a manuscript SHA-256 in the evidence folder. No placeholder chapter names. |
| Six chapter notes and new synopsis | Read the relevant manuscript chapters, including allowance, parents' budgeting, first paycheck, job changes, debt collection and Craig. Describe the author's experiences; do not generalize them to every reader. |
| Selected quotation | “Friday was coming, and Friday meant money.” The same sentence appears in both the EPUB and the pre-existing public Chapter 1 sample. No additional private passage was released. |
| Author biography | Owner-approved facts from day two, preserved verbatim in D1. New introductory copy identifies the book and its subjects. |
| Edition facts | Apple Books and ebook/paperback ISBN retailer records agree with the existing database. HMD is an edition publisher credit, distinct from the website organization. |
| $4.99 primary CTA | Apple Books US showed $4.99 on this review. The action names the US eBook and opens that retailer; other retailers and countries may differ. No universal paperback or regional price claim. |

Sources: [Apple Books US listing](https://books.apple.com/us/book/how-to-have-a-financial-heart-attack-a-new/id6793190934), [ebook ISBN record](https://www.adlibris.com/sv/bok/how-to-have-a-financial-heart-attack-a-new-standard-for-wealth-and-responsibility-9781835567173), [paperback ISBN record](https://www.akademibokhandeln.se/bok/how-to-have-a-financial-heart-attack/9781835566930), [additional paperback record](https://www.buscalibre.com.ar/libro-how-to-have-a-financial-heart-attack/9781835566930/p/68522719), [official author website](https://lamontdmcleod.com/), [Book structured-data vocabulary](https://schema.org/Book). The official website and personal history also rely on the owner confirmation recorded on day two.

### Readability review

The working audience is a US English-speaking reader considering this book or checking the author. This is an assumption based on the book and USD retail links, not measured audience research. Prose-first review precedes metadata and content SEO checks.

| Criterion | Result |
| --- | --- |
| Structure and topic order | Pass: identify the book, explain the story and reader fit, show a sample and contents, then editions and questions. |
| Paragraph structure | Pass: one subject per short paragraph; edition data uses a table. |
| Opening paragraph | Pass: immediately describes what the book covers and whose experience it follows. |
| Sentence length | Pass: short or medium sentences; names and book titles account for some longer clauses. |
| Passive voice | Pass: McLeod, the reader, or the retailer is named when their action matters. |
| Difficult words | Caution: the exact title, subtitle, chapter names and approved biography include longer words. Retain accurate names; surrounding instructions use plain language. |
| Filler and hedging | Pass: removed universal judgments, medical metaphors and unsupported promises from the edited sales copy. |
| Transitions | Pass: descriptive headings and in-page links carry the reading sequence. |
| Variation | Pass: connected paragraphs, a quotation, contents list and edition table serve different reading tasks. |
| Heading hierarchy | Pass: one H1 per page, descriptive H2 sections, H3 chapter entries and book titles. |

Estimated Flesch Reading Ease for rendered paragraphs: book 55.7 (541 words); author 58.2 (257 words). These are heuristic estimates using the standard formula with vowel-group syllables, not certified scores. Names and abbreviations affect results. Headings, chapter titles and footer disclosures are excluded. Extracted prose and the calculation are saved in `content-review.json` and `content-review.py` in the evidence folder.

### Metadata review

| Page | Rendered title | Description characters |
| --- | --- | --- |
| Book | How To Have a Financial Heart Attack \| EverRise Press (53 characters) | 151 |
| Author | Lamont D. McLeod \| EverRise Press (33 characters) | 132 |

The metadata checks pass front-loading, concrete wording, filler removal, active phrasing, distinct title/description purpose, familiar language around proper titles, practical snippet length and one idea per field. The book description adds the chapter guide, editions and email sample; the author description explains the profile's purpose. Search engines may rewrite or truncate snippets. Person descriptions now end at a complete paragraph rather than being cut mid-sentence.

### Content SEO review

Derived focus queries: **How To Have a Financial Heart Attack** for branded book research and buying; **Lamont D. McLeod** for author navigation. No search-volume or ranking claim is made. Verdict: **Ready for these branded intents**, with original author contributions still needed for the upcoming articles.

| Criterion | Result |
| --- | --- |
| Search intent | Pass: book details and buying/sample routes for book search; identity and work for author search. |
| Focus phrase | Pass: exact title or author name in metadata, H1 and relevant copy; no forced repetition in every heading. |
| Experience and trust | Pass within scope: manuscript examples, approved biography, visible edition sources and contact route. No financial-adviser credential or invented review. External authority remains limited and is not fabricated. |
| Helpfulness and originality | Pass: fuller manuscript-based contents, reader-fit information, edition table and honest sample terms add information beyond the retailer blurb. |
| Freshness | Pass: visible review date and release-linked D1 timestamps. Store prices remain a maintenance item; the sole priced CTA names the checked retailer and market. |
| Internal linking | Pass: book, author, sample, editions and About connect with descriptive anchors. No empty blog collection is exposed. |

### Search Console check

GSC MCP read access works. The book and author URLs are still submitted and indexed with correct Google canonicals. Their last crawl times are October 11 and October 16 respectively, before the recent fixes. Their historical breadcrumb errors therefore do not demonstrate a regression in the current markup. The About URL is currently unknown to Google; it is present in the registered sitemap. A fresh crawl and increased search visibility have not yet been confirmed. The previously denied sitemap resubmission was not retried.

### Verification and release

Released as Worker `c8b79011-ca60-4ec3-827f-04200cbf547b` on October 24 in Asia/Dhaka. Next.js/TypeScript and OpenNext builds pass. Lint reports zero errors and four pre-existing warnings. Wrangler dry run passes; compressed deployed Worker is 1,895.76 KiB. All five chapter-access/tracking tests pass. The local reader integration verifies the locked page withholds chapter text, a valid local fixture unlocks it, the $4.99 Apple Books CTA is present, and preview responses remain private/no-store. No real signup, CAPTCHA, purchase, outbound message or lead write was performed.

Local and live five-page SEO smoke checks pass: canonical/status/metadata/social tags, one H1, valid JSON-LD, real breadcrumb URLs, all fifteen chapter titles, exactly two ISBN editions, HMD publisher credit, official author sameAs, stable sitemap dates, preview noindex, robots, missing-page 404s, manifest assets and HTTPS redirects. The schema endpoints agree with the page. The smoke test now consumes response bodies and exits cleanly.

Desktop (1280 px) and mobile (390 px) browser review covers the book, author, and unlocked preview CTA. The retailer dialog opens and closes with Escape, returns focus to its trigger, and fits the mobile viewport. In-page anchors and native question disclosures work. A final adjustment gives keyboard focus a dark outline on the gold CTA. Existing motion and reduced-motion rules remain shared. The Impeccable detector reported no findings. Visual inspection, rather than that detector alone, established the layout result.

Production D1 was backed up before the targeted two-row update. Post-update checks confirm the new synopsis and preserve the exact approved biography and original chapter body. The update script records an actual UTC timestamp (`2026-10-23T20:06:34Z`), corresponding to October 24 locally. No reader records were accessed. Both seed files now use the reviewed content. Evidence is in `../seo-day3-2026-10-24/`; no credentials are stored in Git.

### Next owner review and day four

The day-three selected excerpt uses a sentence already published in the existing sample, so an additional interview was not required to complete these page improvements. Please review the new synopsis and reader-fit wording in this document and on the live book page. Before a new article is published in Lamont's voice, supply or approve the personal example, quotation and byline; the proposed payday essay and discussion guide still need that editorial input. The retention-period decision from day two also remains open.

Day four is the blog foundation: article template, author/source/date fields, related reading, canonical and Article/Breadcrumb schema, draft exclusion and publication-aware sitemap/navigation. The two articles and reading guide remain later steps. No new article or empty index page was published as part of day three.

## Blog foundation implemented — 27 October 2026

The blog setup previously described as a proposed completion report is now implemented, tested and deployed. This completes the blog-foundation work item from the plan. It does not publish the two planned articles; both remain editorial briefs awaiting copy, sources, review and byline confirmation.

### Delivered

- `/blog` and `/blog/[slug]` extend the existing cream/charcoal/gold reading design, with Spectral/Karla, stable controls and responsive layouts. Articles support a byline, publication/update/review dates, reading time, in-page navigation, paragraphs, headings, lists, attributed quotations, accessible scrolling tables, sources and related reading.
- Article content is versioned in `src/content/blog/articles.json`. No CMS, new service, production database write or migration was required. Staff ADMIN/EDITOR sessions can review the two briefs through `/admin/articles` and `/admin/articles/<slug>`; both routes check access before accessing the brief.
- A validated publication gate is shared by routes, navigation, homepage, sitemap and discovery. Publication requires body copy, sources, a confirmed byline, actual dates and a recorded review covering the latest update. It rejects malformed tables, broken source/related links, duplicate identifiers and unsafe URLs. Future publication/update/review dates keep the item out of public output until those dates have passed.
- Published articles receive canonical, description and social metadata, Open Graph publication/update times, BlogPosting/WebPage/Image/author graph nodes and complete breadcrumbs. The byline can identify the real Person or publisher Organization. The old fallback that fabricated a publication date at render time is removed.
- The first published article enables the Blog/CollectionPage schema, public blog navigation, a homepage latest-reading section, sitemap entries and llms discovery. `/schema/articles.json`, the corpus, schema map and API catalog use the same publication set. JSON-LD now escapes less-than characters so source text cannot break out of the script element.

### What is public today

There are zero published articles. The blog URL returns a useful coming-soon page with book and sample links, `noindex, follow`, no canonical and no Blog schema. It is absent from the sitemap and main navigation. The two draft article URLs and unknown slugs return 404. Unauthenticated staff-review requests redirect to login and do not reveal the brief or emit Article schema.

The GitHub repository is public. Committed source and editorial notes can be read on GitHub, even when the website preview requires staff login. Only the non-sensitive planning briefs from the existing SEO plan are committed. Confidential source material should remain outside this repository until approved for source control. No new private first-person contribution has been published.

### Validation and release

Initial deployment: Worker `f1710454-9242-49c1-93f6-9d4015d2f46c`, compressed size 2,005.29 KiB. Next.js/TypeScript and OpenNext builds, deployment dry run and lint pass; lint has zero errors and three pre-existing warnings. Six new publication-model tests and five existing chapter-access/tracking tests pass.

Positive HTTP integration used two explicitly synthetic local articles to exercise both Person and Organization authors, indexed collection/article metadata, real date fields, all breadcrumb destinations, sources, related reading, table semantics, homepage/nav inclusion, sitemap and schema/llms discovery. A literal script-like fixture string rendered safely as text. A temporary local editor fixture could open the review list and unpublished preview; anonymous access redirected. Both synthetic articles and the local test account were removed before the production build. The production catalog was checked to contain only the original two drafts; a scan found no fixture or editorial-brief strings in browser assets.

Local production and live checks pass for both blog publication behavior and all five existing public pages. The existing chapter flow, tracking defaults and opt-outs remain in place. No real signup, CAPTCHA, purchase, production reader record or outbound message was created. Browser checks cover 1280 px desktop, 390 px mobile, 768 px navigation, table keyboard scrolling, in-page links and menu dismissal. Independent Impeccable review returned `ship` after the product brief was persisted; the detector reported no findings.

The blog metadata title is “Blog: Money, Books and Reading | EverRise Press”. Its description explains the articles, sources and reading ideas rather than repeating the title. The title/description and draft metadata were checked for specific opening words, concrete language, filler, active phrasing, distinct purpose, familiar words, snippet length and a single clear purpose. Full prose readability and content SEO review belong to each completed article before publication; incomplete briefs were not scored as finished articles.

The workflow and maintenance instructions are in [Blog publishing](blog-publishing.md). Evidence, local fixtures, build/test/deployment logs and captures are in `../seo-blog-setup-2026-10-27/`; screenshots used for the independent review are ignored under `.impeccable/review/`.

Sources: [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [Google Article guidance](https://developers.google.com/search/docs/appearance/structured-data/article), [Cloudflare Next.js deployment](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/). No claim is made that an unpublished or noindex page is indexed by Google.

### Next editorial input

Complete and review the payday article's personal example and byline, then the cash-flow guide's checked fictional example, worksheet and primary sources. Staff previews are ready for that review. Publishing a substantive article remains a separate step from completing this infrastructure. The retention decision recorded earlier also remains open.

## Admin publishing workspace — 27 October 2026

The owner requested direct writing and publishing plus a complete admin usability overhaul, using the existing Cloudflare resources without a paid-service dependency. This release supersedes the earlier file-based publishing instructions. Existing account credentials are unchanged.

### Daily publishing workflow

Open `/admin/login`, sign in with the existing staff account, and choose **Write article**. Write the title, short introduction and body in the visual editor. Formatting controls support headings, lists, quotes, links, tables, images, undo and redo. Drafts save automatically after a short pause; **Save draft** provides a manual save. The status distinguishes unsaved work, saved drafts, published versions and unpublished changes.

Under **Details & sharing**, choose the responsible author, confirm the approved byline, add supporting sources and choose a sharing image. **Preview** opens the last saved draft behind staff authentication. **Review & publish** checks the required details and asks the editor to approve the content. Publication records the signed-in reviewer and actual server dates. No source edit or deployment is needed for future article publication.

Saving edits to a live article keeps the approved public version unchanged. **Publish changes** replaces that snapshot after review. The first publication date and URL remain fixed. Re-publishing unchanged content or changing a private note does not advance the public modification date. Private editorial notes are excluded from public snapshots and schema. **Unpublish** keeps a private draft; **Archive** hides a retained article; **Archived → Restore** restores its previous visibility.

### Other management tools

The workspace has searchable articles, books, authors and images, clearer reader filters/CSV export, and partner links with retained history. Books and authors have consistent save states, field validation, image selection and unsaved-change protection. Chapter 1 uses the visual editor. Book and retailer saves are atomic and retain existing retailer identifiers. Deletion protects referenced books, authors and images.

The overview reports recorded referral clicks, chapter unlocks and retailer link clicks. It does not call retailer clicks purchases or imply that an email sequence is active. Staff routes and local development do not send optional Google, PostHog or Meta browser tracking. Public tracking defaults and saved opt-outs remain as previously approved.

Draft recovery uses versioned per-tab browser session storage, without changing history entries. A returning editor can restore the local copy explicitly; a changed server baseline receives a warning. Recovery is not a server save, does not publish, and may be unavailable when browser storage is blocked or the tab is permanently closed. Save before closing the tab.

### Cloudflare limits and owner review

The image library uses the existing D1 database. It accepts compressed JPEG/PNG/WebP images up to 500 KiB, 1600 pixels, 100 images and 20 MiB total stored image bytes. Limits are enforced atomically; referenced images cannot be deleted. Images are delivered directly, with no Images transformation binding, R2 bucket, paid image host, new CMS subscription or scheduled job.

The deployment is designed for the published Workers/D1 Free allocations. Account subscription and invoice status could not be read: the current Cloudflare session lacks Billing Read permission. No billing plan, subscription or payment setting was changed. Actual quotas still apply; large traffic or exports are not unlimited. The evidence and official limits are in `docs/admin-free-plan-verification.md`.

The two planned articles remain unpublished briefs. Review still needs the approved payday example/byline and the checked fictional cash-flow example, worksheet and primary sources. The earlier retention decision remains open. Use `docs/blog-publishing.md` for the current staff guide. Audit findings and corrections are recorded in the three admin audit documents; validation and deployment evidence is recorded below.


## Cloudflare deployment migration — 27 October 2026

Cloudflare’s current Next.js guide recommends vinext. The project passed its compatibility scan with zero blocking issues. The application now builds on Vite/vinext with native Workers bindings while preserving the existing Worker, D1 database, credentials, public URLs and admin work. The optional paid image/cache/storage integrations are disabled.

The production version `ff18926c-10d9-436f-b2f9-b4319455a4ea` was first tested through its version preview, then promoted to 100% traffic. Public SEO and blog checks passed on both the preview and everrisepress.com. The admin login returns 200, anonymous staff pages redirect, and unauthenticated publishing/media APIs return 401. The deployment bundle is 1,091.54 KiB compressed, compared with 2,484.16 KiB for the superseded OpenNext build. The earlier resource-limit error did not recur in these checks.

All 43 model/API/privacy/recovery tests and 74 isolated catalog/media assertions pass after migration. Local native-Workers checks also covered every admin page, actual sign-in, autosave, private preview navigation and approved-public-snapshot isolation. The independent design review returned ship. Lint has zero errors and one existing ScrollStack warning. Neither local fixtures nor editorial notes were published to production.

Workers Builds must use `npm run build` and `npm run deploy`, root `/`, and the existing build token. The owner confirmed both commands were updated. Node/npm are pinned in the repository. GitHub main commit `28d28e0` passed the automatic Workers Build and deployed version `c6034c70-b607-4bea-ab66-149691b2759a` at 100% traffic. Live SEO, blog, login and unauthorized-access checks passed again after that CI deployment. No further Cloudflare command changes are needed.

## Phase two Day 3 book discovery and conversion — 31 October 2026

The homepage now states that the free chapter opens on this site and offers a direct route to the existing reading resources. The book page explains that Book 1 ends by pointing ahead to Book 2, preserves its fifteen-chapter contents and edition facts, and separates free worksheets and discussion material from the email-gated chapter. The author and press pages now link to all three published reading resources with their purposes. The approved author biography and the publisher service relationship remain the factual basis for identity. The author search description includes the sample terms, and its sharing card uses the existing verified cover-and-portrait artwork.

The locked sample puts its heading, book identity and signup form before the large cover on mobile. The three chapter bullets describe the narrator's experience instead of asserting the reader has the same habits. The requested $4.99 Apple Books US eBook button remains at the end of the unlocked sample. It now calls the shared retailer-click helper used by the chooser, preserving article landing attribution and analytics opt-outs. Optional analytics and network errors cannot prevent the external link from opening.

The four live retailer rows were checked. Apple Books and Kobo identify the English eBook, ISBN 9781835567173, author Lamont D. McLeod, HMD Publishing and July 20, 2026. Bookshop.org identifies the paperback, ISBN 9781835566930, with the same author, language, publisher and date. The Kobo worldwide ISBN search returned no match, while the US product page exists; this is a market-specific search observation, not a claim that the book is unavailable everywhere. The Kobo link now uses HTTPS and directs its existing referral link to the verified US product page. The Bookshop search link now goes to the exact paperback listing. Seed SQL mirrors the two changes. Current prices and stock remain retailer-specific; no fixed-price schema Offer was added.

Sources: [Apple Books US](https://books.apple.com/us/book/how-to-have-a-financial-heart-attack-a-new/id6793190934), [Kobo US](https://www.kobo.com/us/en/ebook/how-to-have-a-financial-heart-attack-a-new-standard-for-wealth-and-responsibility), [Bookshop.org US paperback](https://bookshop.org/p/books/how-to-have-a-financial-heart-attack-a-new-standard-for-wealth-and-responsibility-lamont-d-mcleod/88ef718f56eda25c?ean=9781835566930), [Books2Read distributor page](https://books2read.com/u/4E6eD0), the existing approved biography and the manuscript's final chapter. The site does not promise a current Book 2 release or treat a syndicated blurb as independent review evidence.

Validation: 35 public tests and 25 admin tests pass, together with 74 isolated D1 assertions. TypeScript, the vinext build and local public SEO/blog checks pass. Lint has no errors and the existing ScrollStack warning. Local HTTP checks cover seven public pages, resource links, signed sample access, tampered access, private caching, noindex and invalid API payloads. Phone-width browser checks cover the homepage, book, author, locked sample and retailer chooser; Escape returns focus to its trigger. No valid production signup, test retailer event, purchase, outreach or future article publication is part of this release. Live release evidence and the detailed fact and link registers are saved with the Day 3 report outside the public repository.

## Phase two Day 4 reading notes and printable — 3 November 2026

The release adds a symbolic notebook cover and two publisher diagrams for the later-chapter reading note, Money Advice and Action in McLeod’s Story. Chapters 11, 13 and 14 supply the remembered scenes; Chapter 15 keeps the ending open. The private 959-word draft distinguishes manuscript recollections, publisher interpretation and research context. Its EverRise Press organization byline does not claim a new author interview or personal review. Primary sources are the CFPB financial-education principles and the Kaiser, Lusardi, Menkhoff and Urban research record at IZA. The research describes average effects across education trials, without asserting that it tests this book or the optional exercise.

The existing payday article has a private 259-word addition introducing an original printable, a labelled fictional lunch entry and three review questions. Its existing approved byline and first publication date are preserved. The book-club draft has one contextual paragraph linking to the new note and the printable, while retaining its ten discussion questions. All three drafts were saved under the repository’s Cloudflare profile for everrisepressdev@gmail.com, with published snapshots kept unchanged until the staff publication action.

The new `/downloads/payday-spending-reflection.html` is a standalone sheet with seven payment entries, an instruction to print extra copies, neutral context labels and room for three written reflections. It collects nothing and requires no signup. The seven-day record may miss monthly bills; the sheet points to the longer CFPB tracker and the existing cash-flow calendar. Its HTML and the existing downloads response header request noindex, so the payday article remains the search landing page. Actual Chrome Print proofs at default scale contain two complete pages on A4 and US Letter. The narrow print text-column limit was removed from payment fields to prevent Letter footer overflow. The 390-pixel screen view keeps labels and writing lines inside the viewport.

The three new WebP images total 378,024 bytes. Existing blog images are unchanged; provenance sidecars preserve their origin records and the exact generation prompt for the new symbolic cover. Pixel hashes were checked before and after provenance registration. All 35 public tests, 25 admin tests and 74 isolated D1 assertions pass, as do TypeScript, lint and the vinext build. Lint retains one existing ScrollStack warning. Local and live SEO/blog checks pass. The Day 4 check verifies four articles, 15 internal destinations, heading anchors, image descriptions and responses, canonical URLs, publication dates, schema, sitemap and the printable’s noindex header and metadata. Live new-image bytes match the reviewed source files.

Asset release `ecc9765` was pushed through the existing production path and its live files were checked before publication. The staff review flow published the new note at `2026-11-02T21:02:31.594Z`, the payday update at `2026-11-02T21:02:55.767Z`, and the book-club links at `2026-11-02T21:03:06.355Z`. These times fall on 3 November in Dhaka; the public template formats dates in UTC. D1 readback confirms published revisions 2, 18 and 6 respectively. The payday and club first publication timestamps remain 28 October, and their original bylines remain unchanged. Publishing used the existing staff session in the required Ever rise Chrome profile. New incoming links were activated after the new article became live.

Independent visual reviews returned ship for the printable and three direct assets, then for the complete 390-pixel local article layout and 1665-pixel live desktop rendering. Mobile layout fixtures are explicitly labelled LOCAL QA; live reviewer/date metadata is checked separately. Both inline graphics, their text equivalents, sources, CTA and footer are present. The design comparison preserved PRODUCT.md, docs/DESIGN.md and existing Impeccable files. No durable design-system change was made.

Published reading: [Money Advice and Action in McLeod’s Story](https://everrisepress.com/blog/money-advice-and-action), [updated payday exercise](https://everrisepress.com/blog/payday-spending-patterns#use-the-printable-sheet), [private printable](https://everrisepress.com/downloads/payday-spending-reflection.html), and [book-club guide](https://everrisepress.com/blog/financial-heart-attack-book-club-guide). Primary research: [CFPB principles](https://www.consumerfinance.gov/data-research/research-reports/effective-financial-education-five-principles-and-how-use-them/) and [IZA research record](https://www.iza.org/en/publications/dp/13178/financial-education-affects-financial-knowledge-and-downstream-behaviors). Review dates are 1 December, 29 December and 1 February 2027, at 28, 56 and 90 days after the local publication date. These are recorded review dates, not newly created automations. No ranking, traffic or conversion improvement is claimed from a release-day check.

## Phase two Day 5 housing comparison and cash flow ledger — 3 November 2026

The Day 5 release adds five WebP graphics and updates the existing cash flow worksheet downloads. The Chapter 12 reading note compares shared costs, private space and household routines using a blank comparison. It says the roommate paid his agreed half and gives no reason for his move. The publisher byline and sources distinguish the manuscript account from the University of Rhode Island student guide and the Monroe Housing Collaborative guide for NYSACRA. Neither provides a universal rent target or eligibility rule.

The calendar adds a daily trace to the existing fictional month: $200 remains on 5 November, the 9 November payment is short by $50, and the 10 November projection is −$200. A separate example ends a week at $150 after a $50 Monday gap. Both examples use accessible tables and original graphics. The two older example tables now use the same focusable scroll format. An independent visual review confirmed the mobile ending column can be reached with the keyboard. All existing first publication dates and bylines are preserved through the staff workflow.

The original printable and CSV URLs stay in place. Each includes five weekly rows and ten blank dated entries, with running balance and confirmed or estimated status. The worksheet remains manual and private, with no signup or submission. The browser print proofs show both pages and complete table edges on A4 and US Letter at default scale. The spreadsheet and printable remain out of search results through the downloads noindex rule. All 35 public tests, 25 admin tests, 74 isolated database assertions, TypeScript and the build passed; lint retains its existing ScrollStack warning. The final visual review returned ship for the two articles, worksheet and new graphics after the calendar table correction.

Asset commit `9cee6c4` deployed through the existing GitHub main to Workers build. Live responses matched all five reviewed WebPs and both worksheets before staff publication. The new housing article was published first at `2026-11-03T15:51:46.864Z`, followed by the calendar at `15:56:07.654Z`, the book club guide at `15:58:20.088Z`, and the payday link at `15:59:37.723Z` on the same UTC date. The staff workspace ran in the Ever rise Chrome profile for `everrisepressdev@gmail.com`. Database readback confirmed published revisions 2, 10, 8 and 20 respectively. The previous first publication dates, bylines and the Day 4 article were verified against their earlier records.

The live check covered five articles and 16 internal destinations, including the payday link to the new calendar anchor. Canonicals, BlogPosting metadata, sitemap, article schema and llms.txt contain the expected live entries. Both downloads retain their noindex response headers. An independent design comparison kept the existing product, design and shared component files. The Search Console connector reported that the new URL was unknown to Google at release. The existing sitemap was already registered and last read 1 November. The connector's earlier submission attempt returned insufficient permission, and it has no individual Request indexing action. No new submission or indexing is claimed.

Published work: [Roommates or Living Alone](https://everrisepress.com/blog/roommates-or-living-alone), [the calendar daily balance check](https://everrisepress.com/blog/weekly-cash-flow-calendar#check-the-dates-inside-each-week), [the printable worksheet](https://everrisepress.com/downloads/weekly-cash-flow-worksheet.html), and [the manual CSV](https://everrisepress.com/downloads/weekly-cash-flow-worksheet.csv). Check the housing article again on 1 December, 29 December and 1 February 2027, at 28, 56 and 90 days after publication. No rankings, visits or sales gains are inferred from release checks.

## Direct agent publishing API — 4 November 2026

The owner requested routine media and article work through the application instead of Chrome automation. `/api/agent/v1` now uses dedicated scoped bearer credentials, separate from staff cookies, and the existing article store and image library. `scripts/everrise.mjs` provides status, image upload/list/delete, article list/get/create/save/check/publish and visibility commands. `docs/agent-publishing.md`, PRODUCT.md and agents.md make this the default agent workflow; browser review remains available for actual visual or print checks.

Credential creation uses the established everrise Cloudflare profile for everrisepressdev@gmail.com. The client reads a private local file outside the public repository; only a SHA-256 hash is stored in D1. Credentials have explicit scopes, expiry, revocation and a 60-request-per-minute limit. The API has no reader-export, account-administration, referral or catalog-edit permissions. It records request metadata without credentials or content, retaining the most recent 5,000 rows. Changed publications identify the agent as reviewer; existing author bylines and first publication dates retain their existing protection.

Image upload checks and quotas are shared with the staff workspace. Agent uploads deduplicate identical bytes, including concurrent requests. Optional local Sharp preparation leaves the source intact and preserves embedded XMP provenance. Both API writes and the client preserve revision conflicts, draft/live isolation, required source/byline/image fields, truthful dates and referenced-image deletion protection. The client pins its destination and refuses redirects or automatically retried writes. No new CMS, storage account, paid plan or image transformation service was added.

The additive production migration 0005 completed successfully before release. Local validation passed 79 isolated agent assertions, 25 actual CLI/HTTP checks against the built Worker and separate credential rotation/revocation checks. These cover actual media byte delivery, source/provenance preservation, local article publication, private edit isolation and later updates, not just mocked responses. The 25 existing admin tests, 74 catalog/media D1 assertions and 35 public tests also passed. TypeScript and the vinext build passed; lint has only its pre-existing ScrollStack warning. Test publications and credentials stayed in a separate local database. Live release checks are recorded below after deployment.

Release `2a54db9` was pushed to GitHub main and deployed through the existing Workers Build. The live API passed 21 checks using the actual configured client. An approved housing cover was uploaded to `/media/a85bf300-58f1-4cff-ada1-75387bc92e7e`; its served bytes match the original, and a repeat upload reused that entry. The already reviewed housing article passed the production publication endpoint at revision 3 with no document changes. Readback hashes confirm all five published snapshots and first publication dates are identical to the pre-release records; unchanged publication also retained its original modification/review dates. The agent's publication action is separately recorded in its request audit.

Production rejected unauthenticated requests, browser-origin requests, insufficient scopes and use of the agent key on the staff reader export. A temporary read-only verification key was revoked, its rejection was verified and its local file removed. Exactly one configured Codex publishing credential remains active, with a 180-day lifetime. The production administration script was corrected for Wrangler's progress-prefixed SQL-file output and its aggregate-only import results; metadata reads/revocations now retrieve actual rows. Credential creation and listing were verified remotely after that correction. No credential was committed or printed. The local test server was stopped.

The existing live blog check also passes for all five articles, including canonical/schema/sitemap/discovery and anonymous staff access. Durable instructions now direct future agents to the API first. Release evidence is kept outside the public repository in the owner's `agent-publishing-2026-11-04` folder. Routine uploads and publishing no longer depend on the foreground Chrome profile or a browser session.

## Phase two Day 6 format comparison and discovery review — 4 November 2026

The owner asked to complete the 5 November schedule on 4 November. The repository skill in `.agents/skills/everrise-publishing/SKILL.md` passed the skill validator and was pushed in `15db3a2`. It directs agents to the scoped publishing client, authorized Chrome profile for visual review and Search Console connector.

The 978-word format comparison distinguishes a memoir, guide, workbook and hybrid. It discloses EverRise's role and the limits of its comparison. Chapters 1 and 15 establish McLeod's opening voice and unresolved ending. Hachette UK describes Clare Seal's memoir and guide and its separate workbook with twelve weeks of tracking space. Penguin Random House describes John Schwartz's mix of personal account and guidance. The article offers reading tests, a comparison table, a chapter sample with its signup terms, a discussion guide and a free worksheet. [New comparison](https://everrisepress.com/blog/money-memoir-or-budgeting-workbook).

The API uploaded one original cover and two explanatory diagrams, totaling 187,276 WebP bytes. SHA-256 verified each public response. The saved draft received a desktop and 390-pixel visual review in the Ever rise Chrome profile. The article's title including brand is 52 characters and its description is 140. The API published the reviewed comparison at revision 2 and the club guide at revision 10 on 4 November Dhaka time, in that order. Both action IDs appear in the API audit. The club addition helps groups select a scene or an exercise and links to the comparison. Its existing content, byline and first publication date were preserved. The book page, club guide, blog index and homepage link to the new article. [Club guide addition](https://everrisepress.com/blog/financial-heart-attack-book-club-guide#choose-a-money-book-for-your-group).

The Search Console connector inspected twelve URLs. Nine were indexed with the expected selected canonical. Google reported the new comparison, housing article and deliberately noindex Chapter 1 preview as unknown. The registered sitemap's latest read was 1 November with zero errors and warnings and 10 URLs in the stored record. The live sitemap contains 13 URLs. The author has a new crawl and a passing breadcrumb report. The book's missing item report refers to an October 12 Dhaka crawl. Current book and author breadcrumb items have named, reachable URLs and sequential positions. Review the book after Google reports a crawl later than October 22. Inspection is separate from requesting indexing. [Live sitemap](https://everrisepress.com/sitemap.xml).

Live post-publication checks found intermittent 503 resource-limit responses on pages and discovery routes. Commit `c83656e` removes duplicate validation and reuses a bounded validation result for identical published bytes. D1 still determines live visibility on every read. Existing tests and an archive check with a warmed cache cover draft separation, replacement, removal and restoration. With six snapshots in a local warm catalog benchmark, validation CPU work averaged 8.23 ms before and 0.012 ms after. That test isolates catalog processing. After the push, three consecutive rounds across eight live routes passed, followed by the public SEO and six-article checks. The separate release check covered 12 internal destinations, five breadcrumb graphs, exact reviewed publication readbacks, canonical tags, structured data, sitemap and llms.txt entries and all three image hashes. The build, TypeScript, 35 public tests, 25 admin tests, 74 catalog/media assertions and 79 agent assertions passed. Lint has its existing ScrollStack warning. [Cloudflare resource-limit reference](https://developers.cloudflare.com/workers/platform/limits/).

Review on 2 December, 30 December and 2 February 2027. Track the next crawls and observe queries, successful sample access and retailer exits separately. The dated discovery report, connector responses, artwork provenance, preview proofs and checks are saved in the owner workspace under `seo-phase2-day6-2026-11-04`.

## Phase two Days 7 and 8 — 5 November 2026

The owner brought the scheduled 6–7 November work forward. [Moving Out Budget: Costs Beyond the Rent](https://everrisepress.com/blog/moving-out-budget-beyond-rent) answers the fourth validated brief with an original nine-row inventory: cost group, amount, cash-leaving date, source and confirmation status. The roughly 1,000-word article separates upfront, recurring and irregular costs. A fictional USD 1,700 example is independently checked and clearly distinguished from market prices and McLeod's historical USD 400 rent. Full manuscript Chapters 9–10 and the Johns Hopkins and Northwestern primary pages support the discussion; local fee rules are not generalised.

The scoped API uploaded one original cover and two explanatory diagrams, 148,860 WebP bytes combined. Public file digests and dimensions match the upload records. The cover's generation prompt and all artwork provenance are retained. The title including brand is 57 characters and the description is 148. A readability pass produced an estimated Flesch score of 75.2 using the local heuristic. Desktop layout and the final 393 × 852 phone preview were inspected in the Ever rise Chrome profile. Both diagrams have adjacent text equivalents. The mobile inventory's final columns are accessible by horizontal scrolling and keyboard controls.

The API published the new article at revision 3, then the calendar and club guide at revision 12 and the housing comparison at revision 5. All four readbacks are live with no unpublished changes. The three existing articles retain their original bylines and first-publication dates. Their new paragraphs explain when to use the moving-cost list or discuss its Atlanta scene. The new destination was live before those incoming links were activated. Publication occurred at 22:45 UTC on 4 November, which is 5 November in the owner's Dhaka timezone.

The library map records 358 internal links, their wording and reader purpose across all 14 sitemap pages. Twenty-one distinct internal destinations and 26 local image URLs passed. The four new Phase Two articles have six, eight, six and eight distinct incoming reading-content sources respectively; none is orphaned. Three consecutive rounds across eight critical page/discovery routes returned 200. The existing seven-article blog check and public SEO check passed. Six campaign URLs return 200 and preserve their clean canonicals. The draft returned 404/noindex and was absent from the sitemap before release; private preview access redirected anonymous readers to the noindex staff login. A root-canonical trailing-slash flag was a checker normalisation issue, not a site defect, and was corrected in the local check.

Search Console's connector reports the new URL as unknown to Google. The live sitemap has 14 URLs; Google's saved sitemap record has 13 and was last downloaded on 3 November UTC, with zero errors or warnings. Inspection is not an indexing request, and no indexing success is claimed. Review the new article on 3 December, 31 December and 3 February 2027, calculated from its actual local publication date.

Day 8 expands the original High Point, Fulton County and Independent Book Review research to 20 prospects. Each has an audience fit, specific contribution, verified route, eligibility, cost and next action. Six individual drafts target High Point Readers Services, Independent Book Review, The Resilient Author, Journey to Launch, Northwestern Financial Wellness and the Georgia Center for the Book. Residency, review-copy rights, membership, author availability and personal form answers remain explicit prerequisites where applicable. The research distinguishes free consideration, paid review services, donated-copy costs and general routing enquiries.

Five identity records were reviewed: the official author site, current EverRise author page, Apple Books edition, Books2Read universal link and Books2Read author profile. The current EverRise biography is correct despite an older search snapshot. Exact replacement retailer-description wording and a biography/website/portrait request for the empty Books2Read profile are supplied for the relevant account holders. Verified HMD Publishing edition credit is retained. No external profile was edited.

The distribution pack includes four sourced social posts, two complete six-slide carousel scripts with image copy and alt text, and six campaign links. A two-tab Excel workbook contains all 20 prospects, editable assignments/status/replies/follow-up dates, primary sources and submission conditions. Its counts recalculate correctly, all records are restored to Not sent, and the rendered sheets and exported table/validation/freeze-pane features were checked. No outreach, external posting, new account, payment, shipment or appearance commitment occurred. The owner deliverables and evidence are saved under `seo-phase2-day7-2026-11-05` and `seo-phase2-day8-2026-11-05` outside the public repository.

## Phase two Days 9 and 10 — completed 6 November 2026

The nine-run mobile review exposed a concrete llms.txt format defect: Lighthouse did not recognize its bare URLs as Markdown links. The repair uses labelled links for books, author profiles, articles, publisher pages and schema discovery, preserving existing destinations and publication filtering. Build, TypeScript, 35 public tests and dry-run packaging pass; lint retains one existing ScrollStack warning. The connected build was delayed. With the owner’s explicit approval, the existing EverRise CLI profile gained Workers deployment and diagnostic-log access. The staged version passed before its promotion to production.

The pre-repair Day 9 measurement set contains nine PageSpeed runs: median mobile LCP 2.564 seconds (2.564–5.800) for home, 0.931 seconds (0.915–0.940) for the book and 2.701 seconds (2.551–3.001) for the moving-cost article. Median performance scores are 90, 98 and 94; all runs have zero CLS. Lighthouse 13.6, Moto G Power and Slow 4G were used. October used 13.5 and another article, so this is not a causal before/after claim. The homepage cover’s first-run render delay and TBT variability are assigned to a trace investigation; the later CPU repair addresses independently confirmed server failures, rather than assuming the cover needs more compression.

Six independent signed-out ChatGPT questions were repeated. Two contain a verified EverRise homepage link, the same count as baseline; the third question now returns an answer. General book and calendar recommendations omit EverRise, and the discussion-guide answer misses the live indexed guide. The first answer also displays an unrelated business card. These are recorded accuracy/discovery limitations, not site claims. Perplexity now answered a supplemental first question but could not identify the book. Copilot remains sign-in-only.

The initial live crawl passes 14 public canonicals, 358 internal link records, 21 distinct internal destinations and 26 local images. Seven articles are live with no saved unpublished changes. Local reader HTTP checks pass for absent, valid and tampered access cookies, with private/no-store responses; event and consent tests pass without synthetic production leads or retailer clicks.

Search Console’s October 7–November 3 property totals are 1 click and 18 impressions. Eleven of thirteen inspected pages are indexed; the comparison is discovered/not indexed and moving-out remains unknown. The stored sitemap last read is November 3, 13 entries, no errors or warnings; the live sitemap has 14. The old book breadcrumb report still belongs to an October 11 crawl. Inspection does not request indexing.

PostHog reporting is now accessible in the EverRise Chrome account. October 7–November 3 UTC contains four unlock acknowledgements and four lead events, all on October 7, plus two retailer clicks on October 31. The separate October 31-through-check query returns zero unlocks, zero leads, zero renewals and two retailer clicks. These are observed event counts, not verified unique customers or sales. The rolling seven-day overview reports zero Organic Search visitors/views, but has all domains and the test-account filter off, so its broader totals are provisional and may include QA. No retailer sales report is available.

The [next 30-day queue](seo-next-30-days-2026-11-06.md) contains 18 concrete actions with owners and dates, preserves November 12/26 reviews and calculates 28/56/90-day reviews for all seven articles from actual Dhaka publication dates. No new automations or outbound outreach were created. Full private evidence and the owner measurement report are in `seo-phase2-days9-10-2026-11-06` outside Git. Production discovery-file verification is complete: 23 labelled Markdown links are present, and all nine post-release Lighthouse runs pass the 3/3 agentic-browsing audit.

A later release check exposed intermittent timeouts on the existing production release. Cloudflare confirmed Worker CPU-limit errors. The deployed repair removes whole-library body validation from listing/discovery requests, validates only the requested article body and memoizes bounded pure HTML transformations. Publication visibility still comes from D1 on every read; drafts never substitute for public snapshots. New tests cover archive/restore, replacement, unsafe metadata, malformed JSON and sanitization after cache eviction. The owner approved adding Workers deployment and tail-log permissions to the existing EverRise CLI profile; that authorization is complete. Local checks pass, including 27 admin tests, 74 isolated D1 assertions and 35 public tests. The older nine-run performance set is a pre-repair diagnostic baseline, not a post-repair speed claim.

### Final release verification

Commit `5fe13fc` was uploaded as version `72d7809e-61e1-4db6-bc58-f802a9ce401b`, passed the public SEO and seven-article checks on its version URL, then received 100% of production traffic. Rollback version `a4125ecf-f172-4307-ab6a-fa0789d78370` remains available. The production crawl passes all 14 sitemap pages, 358 internal link records, 21 distinct destinations, 26 local images, six campaign canonicals and three rounds across eight critical routes. The separate metadata/JSON-LD check passes all 14 pages and ten distinct sharing images. Missing articles remain 404/noindex; staff access redirects to the private noindex login, and the anonymous sample withholds protected text. Fresh local signed/missing/tampered-cookie checks pass with private/no-store responses. No production test leads or retailer clicks were generated.

The filtered diagnostic sample records 47 successful invocations and no CPU failures during the release checks. This supports the immediate release check; it is not a guarantee that free-plan resource errors cannot recur. All 13 external article source destinations were verified: eight by direct HTTP and five through the web retrieval service after local 403 responses or a timeout. Those access restrictions were not treated as broken source links. Desktop Chrome rendering of the live article was also checked in the required Ever rise account.

Nine additional post-release mobile runs use the same three pages, Lighthouse 13.6.0, Moto G Power and Slow 4G. Home: median performance 97 (93–97), LCP 2.564s (2.564–3.017), TBT 77ms (60–140). Book: 99 (95–100), LCP 0.923s (0.916–0.937), TBT 110ms (83–251). Article: 93 (90–97), LCP 2.701s (2.551–3.001), TBT 196ms (51–239). All nine have zero CLS and scores of 100 for accessibility, best practices and SEO. The LCP medians are essentially unchanged; article blocking time varies upward. These observations do not establish a universal speed improvement or field Core Web Vitals pass. Eighteen mobile runs total, before and after, are retained with report URLs.

## Month two Days 1–4 — 7 November 2026

[Review record](seo-month2-days1-4-2026-11-07.md): Days 1–3 complete. Cloudflare shows 243 successes and zero errors in its one-hour window. Six outreach routes rechecked. Owner subsequently confirmed Johns Creek, Georgia and interest in interviews, library events and podcasts, with no review copies supplied. Day 4 qualification is complete; specific dates and financial commitments remain for later discussions. Nothing sent.

## Publishing-plan reset — 7 November 2026

The owner replaced the maintenance-led queue with the [30-day publishing plan](seo-next-30-days-2026-11-06.md): 24 new articles, six new pages, four resources, upgrades to seven existing articles and a tailored distribution pack. New Day 1 is November 8. Previous work remains complete; new production is planned, not yet delivered.


## Growth plan Day 1 — 7 November 2026

Published A01 biweekly bill calendar, P1 cash-flow topic page and R1 two-page payment planner; updated weekly calendar and payday article with contextual links. Original cover uploaded and all three article revisions published through the API. Chrome Ever rise verified desktop, 390px article layout and two-page A4/Letter printing. Production build, types, 35 public tests and live eight-article checks pass. [Full release, provenance, social draft and review dates](seo-growth-day1-2026-11-07.md). New indexing is not yet established.
