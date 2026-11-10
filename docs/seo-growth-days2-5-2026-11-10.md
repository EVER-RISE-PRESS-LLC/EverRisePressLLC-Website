# Growth plan Days 2–5 — released 10 November 2026

The owner asked for Days 2 through 5 of the [30-day publishing plan](seo-next-30-days-2026-11-06.md) at once. All six articles, the second topic page, their images and their contextual links were drafted, checked and published through the scoped agent API in one working session on November 10. Dates below use Asia/Dhaka for narrative purposes; the application retains the real UTC publication timestamp, which is November 10 for every item in this release — not spread across the plan's original November 9–12 slots. This is a scheduling note, not a correction to the plan: all six articles, the topic page and the contextual-link work the plan assigned to Days 2–5 are delivered.

## Delivered

### Day 2 — A02 + A03

- A02: [Monthly Budget vs Cash Flow Calendar: Which Do You Need?](https://everrisepress.com/blog/budget-vs-cash-flow-calendar). Target query: budget vs cash flow calendar. One fictional household shown as both a category budget (a $375 monthly surplus) and a dated cash flow calendar (a $755 balance before the mid-month payday) — the same numbers, two different questions answered.
- A03: [What to Put in a Spending Tracker](https://everrisepress.com/blog/spending-tracker-categories). Target query: spending tracker categories. A six-category decision tree with two worked fictional receipts (a $69 superstore receipt and a $45 pharmacy receipt) showing how to split a mixed purchase.
- Three contextual links added to existing live articles, preserving their bylines and first publication dates: [weekly cash flow calendar](https://everrisepress.com/blog/weekly-cash-flow-calendar) → A02, [biweekly bill calendar](https://everrisepress.com/blog/biweekly-bill-calendar) → A02, [payday spending patterns](https://everrisepress.com/blog/payday-spending-patterns) → A03.
- Two social drafts prepared (A02, A03); see [distribution assets](seo-growth-days2-5-distribution-assets.md). Not posted.

### Day 3 — A04

- A04: [How to Record Irregular Expenses on a Calendar](https://everrisepress.com/blog/irregular-expenses-calendar). Target query: irregular expenses list. A fictional three-item annual-cost inventory (vehicle registration, pet vaccination, holiday gifts) with a per-payday set-aside amount for each, recalculated as each due date passes. No claimed typical costs — the figures are fictional and chosen only to keep the division exact.
- Expanded the [cash flow and spending topic page](https://everrisepress.com/topics/cash-flow-and-spending) with three new pathways: a "not sure which tool you need" section routing to A02, a spending-tracker-category pointer added to the existing record section, and a new "what about a cost that isn't monthly" section routing to A04.
- Carousel 1 prepared, using the annual-cost inventory; see [distribution assets](seo-growth-days2-5-distribution-assets.md). Not posted.

### Day 4 — A05 + A06

- A05: [A Payday Checklist for Reviewing Upcoming Payments](https://everrisepress.com/blog/payday-payment-checklist). Target query: payday checklist. A six-item before/after-payday checklist, kept distinct from the existing payday spending reflection, with a worked $610-balance, $540-due, $70-cushion example.
- A06: [How to Compare Planned and Actual Spending](https://everrisepress.com/blog/planned-vs-actual-spending). Target query: planned vs actual spending. A seven-category fictional variance table (+$45 total variance) with guidance on reading a gap neutrally before deciding whether to act on it.
- Both linked from appropriate existing resources: [payday spending patterns](https://everrisepress.com/blog/payday-spending-patterns) → A05, [weekly cash flow calendar](https://everrisepress.com/blog/weekly-cash-flow-calendar) → A06, and A06 → A05 reciprocally. This completes a fully cross-linked cash-flow set across A01–A06, all routed through the cash-flow topic page.
- Two more social drafts prepared (A05, A06); see [distribution assets](seo-growth-days2-5-distribution-assets.md). Not posted.

### Day 5 — P2 + A07

- P2: [Moving out resources](https://everrisepress.com/topics/moving-out). Routes readers from upfront moving costs to utility setup to the roommates-or-alone decision, each with original routing guidance rather than a copy of the linked articles.
- A07: [First Apartment Utilities Checklist: Questions Before Moving](https://everrisepress.com/blog/first-apartment-utilities-checklist). Target query: first apartment utilities checklist. Five provider questions plus a worked request-by date planner for a fictional June 1 move-in (internet, gas, electric and water, each with a different lead time).
- Connected existing moving and housing articles: [moving out budget: costs beyond the rent](https://everrisepress.com/blog/moving-out-budget-beyond-rent) and [roommates or living alone](https://everrisepress.com/blog/roommates-or-living-alone) both now link to A07 and the new topic page.
- One more social draft prepared (A07); see [distribution assets](seo-growth-days2-5-distribution-assets.md). Not posted.

### Images

Six original 1200 × 630 WebP covers, each an original SVG diagram illustrating its article's worked example (budget-vs-calendar comparison, category decision tree, annual-expense timeline, before/after checklist, planned-vs-actual bars, utilities request-by timeline), uploaded through the publishing API:

| Article | Media URL | Bytes |
| --- | --- | --- |
| A02 | `/media/dd2763c4-dca5-4157-80c0-cb27c5be5a7e` | 32,560 |
| A03 | `/media/51cecf33-def2-4f57-808e-3b09cedfb19e` | 25,442 |
| A04 | `/media/07a52e4c-0a70-4c55-886f-df1aa1324ade` | 25,670 |
| A05 | `/media/4bc3f603-38b7-47d9-9b79-70133b58f1c3` | 30,812 |
| A06 | `/media/aa347f04-f453-4ab1-ab4d-f4e0187ea5b2` | 20,820 |
| A07 | `/media/c9cd2bb1-cd89-4c49-9637-231bdd605e89` | 23,602 |

## Editorial and release review

Every worked example above is fictional and labelled as such; arithmetic for each (A02's budget/calendar reconciliation, A03's two split receipts, A04's three division checks, A05's before-payday cushion, A06's seven-category variance table, A07's four request-by dates) was verified with an assertion script before publication — see `build_a02.py` through `build_a07.py` and `link_day2.py`/`link_day4.py`/`link_day5.py` in the working folder. No invented typical costs, search-volume estimates or ranking claims were added, consistent with the plan's sourcing rules. Sources are the CFPB (cash-flow and spending articles) and Johns Hopkins off-campus budgeting (A07), both already in use elsewhere on the site.

Each article answers its target question in the opening paragraph, uses the publisher byline with `confirmed: true`, and is distinguishable from its closest sibling article per the plan's brief (A02 vs. A01/A04's calendar focus; A05 vs. the existing payday-spending-patterns reflection; A06 vs. A05's shorter before/after check). All new inter-article and topic-page links point to already-live destinations; the two existing-article updates linking to the new `/topics/moving-out` page (moving-out-budget-beyond-rent, roommates-or-living-alone) were held until the topic page's code was built, verified and deployed, then published — see the deployment note below.

The scoped API created and published all six articles at reviewed revision 1, and saved/republished eight existing-article updates (three Day 2 links, three Day 4 reciprocal links, two Day 5 links) while preserving each article's original byline and first-publication date. Website code changes — the expanded cash-flow topic page, the new moving-out topic page, its registry/sitemap/llms.txt wiring, and the blog index link — were committed to the repository and released through the normal Cloudflare deploy.

TypeScript (`npx tsc --noEmit`), lint (one pre-existing ScrollStack hook-dependency warning, no errors) and the production build (`npm run build`) all passed, as did all 35 `npm run test:public` assertions. Evidence snapshots (article JSON, upload responses, check/publish responses, SVG sources and build/lint/test output) are kept outside the public repository in `seo-growth-days2-5-2026-11-10/`.

## Scoreboard

This release adds 6/24 new articles (7/24 counting Day 1's A01), 1/6 remaining topic pages (2/6 counting P1), and zero new downloadable resources (R1 remains the only one delivered so far; R2–R4 are scheduled for later days). Eight contextual link updates were made across six existing articles. Six of 24 social drafts are ready for Days 2–5 (seven counting Day 1), and one of six carousel scripts is ready. No outreach or social messages were sent. Review dates for each new article (28/56/90 days from their November 10 Dhaka-equivalent publication) are: December 8, January 5, 2027 and February 8, 2027 — added to the article review calendar in the main plan document.
