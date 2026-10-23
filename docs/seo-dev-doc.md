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
2. For day three, confirm the approved manuscript edition and supply one short approved personal example or excerpt that may be published. Book-page copy and original blog material will use that input rather than inventing author testimony.

The confirmed decisions are recorded as owner statements, alongside the independently checked sources. Google indexing of the new About page remains unconfirmed.


### Owner follow-up release verification

Applied the owner’s answers on 24 October 2026 and deployed Worker `3ac6f904-7e43-49b9-9c7b-005877185e75`. Build/TypeScript, lint (zero errors and four pre-existing warnings), Wrangler dry run, all five access/tracking tests, local server preference guards, and local/live five-page SEO checks pass. Live content checks confirm the approved biography, publishing-service wording, monitored contact and Organization email.

Browser verification confirms automatic GA, PostHog and Meta script loading for a fresh local visit, no initial banner, both settings enabled by default, and no vendor scripts after choosing Essential only. A pre-existing production opt-out remains off after this release. The footer notice was checked at 390 px and 1280 px; it follows the copyright on both. No real lead, purchase, CAPTCHA or outbound email was submitted.

The updated Word review document records the resolved decisions and two remaining inputs. Follow-up evidence is in `../seo-day2-2026-10-24/owner-followup/`; the original day-two evidence remains intact.
