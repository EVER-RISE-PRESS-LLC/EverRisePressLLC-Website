# Shared costs and first apartment batch — released 13 November 2026

Released at the owner's request as one batch. Dates use Asia/Dhaka; the application keeps real UTC timestamps (November 12, 19:20 UTC for all three new articles). Plan mapping for internal reference: A08, A09, R2 and A10, with the matching link and distribution work, in the [30-day publishing plan](seo-next-30-days-2026-11-06.md).

## Delivered

- [Questions to Ask a Roommate About Shared Expenses](https://everrisepress.com/blog/roommate-money-questions). Target query: roommate money questions. A six-topic conversation script (rent, utilities, shared supplies, guests, who pays providers, late shares) with fictional scenarios and a summary table. Worked rent split: $1,200 as 60/40 by room is $720 and $480, a $120 difference from an equal $600 split.
- [How to Track Shared Household Expenses](https://everrisepress.com/blog/shared-household-expense-tracker). Target query: shared household expense tracker. An original ledger with separate paid-by, share and repayment columns and one running balance. A fictional month of $1,570 shared spending ends at $0 after $535 of repayments.
- [Free shared household expense ledger](https://everrisepress.com/downloads/shared-household-expense-ledger.html) and [manual CSV](https://everrisepress.com/downloads/shared-household-expense-ledger.csv). Two pages: the fictional month and a blank twelve-line ledger with payer and repayment fields. No signup or upload; noindex like the other printables. Headless Chrome print proofs produce two pages on both US Letter and A4.
- [First Apartment Essentials: What to Buy Now or Later](https://everrisepress.com/blog/first-apartment-essentials-checklist). Target query: first apartment essentials checklist. A need-now / borrow-or-share / postpone matrix with a fictional $725 list reduced to $225 before move-in and $500 moved to later paydays. No claimed typical prices.
- The [moving-out resource guide](https://everrisepress.com/topics/moving-out) now links the ledger and CSV, the roommate questions and the tracker in its shared-housing section.
- Contextual links, preserving bylines and first publication dates: [roommates or living alone](https://everrisepress.com/blog/roommates-or-living-alone) → roommate questions, tracker and ledger; [moving out budget](https://everrisepress.com/blog/moving-out-budget-beyond-rent) → essentials; [utilities checklist](https://everrisepress.com/blog/first-apartment-utilities-checklist) → essentials; tracker → roommate questions. The roommate questions article links the tracker and ledger; the essentials article links roommate questions, the moving budget, utilities and the irregular-expenses calendar.
- Three social drafts, carousel 2 (essentials matrix) and two library discussion pitches (Georgia Center for the Book; Northeast/Spruill Oaks Library in Johns Creek): see [distribution assets](seo-growth-shared-costs-distribution-assets.md). Nothing posted or sent.

### Images

| Article | Media URL | Bytes |
| --- | --- | --- |
| Roommate questions | `/media/feaa1dd8-5025-43ef-b0ed-403a0469c671` | 24,886 |
| Shared expense tracker | `/media/5241dfa6-6b85-4b55-96d9-2f08074f7023` | 23,790 |
| Essentials checklist | `/media/5ca8af01-6a25-4bd9-a0da-214f6af376a7` | 28,278 |

Each is an original 1200 × 630 SVG diagram rendered to WebP and uploaded through the publishing API.

## Editorial and release review

All names (Jordan, Sam) and amounts are fictional and labelled. Arithmetic was asserted in scripts before publication: the ledger's running balance (480, 0, 45, 15, 90, 55, 0), share totals ($905 + $665 = $1,570), payments versus shares ($1,440 − $905 = $535 = $480 + $55), the 60/40 rent split, and the essentials totals ($225 + $500 = $725). The roommate and tracker articles state that a housemate arrangement does not change lease or provider obligations; neither offers legal advice. Sources are the Johns Hopkins off-campus budgeting page, the University of Rhode Island roommates page and Northwestern's common-expenses page, all already cited elsewhere on the site.

The ledger and hub update were committed as `c1ce7f4`, deployed through the normal Cloudflare build and confirmed live (HTTP 200, `X-Robots-Tag: noindex`) before any article linked to them. The API then published the tracker, roommate questions and essentials articles in that order at reviewed revision 1, so no link pointed at an unpublished page, followed by four reviewed link updates. TypeScript, production build and all 35 public tests passed; lint has the one existing ScrollStack warning and no errors. The live blog check passes all 17 published articles, the sitemap lists the three new articles, and rendered pages contain every new link. Evidence is kept outside the repository in `seo-growth-shared-costs-2026-11-13/evidence`.

## Scoreboard

Plan totals after this batch: 10/24 new articles, 2/6 pages, 2/4 resources, 10/24 social drafts, 2/6 carousel scripts and 2/12 discussion pitches. Review dates for the three new articles (28/56/90 days from November 13): 2026-12-11, 2027-01-08 and 2027-02-11. No outreach or social messages were sent.
