# Month two: Days 1–4 review

7 November 2026, Asia/Dhaka. Days 1–4 completed early; Day 4 qualification updated with owner-confirmed facts. No outreach sent.

## Day 1: priorities

1. Keep the November 12 indexing review: comparison and moving-cost articles need discovery follow-up. November 6 measurements are a baseline, not fresh growth evidence.
2. Maintain reliability checks after the CPU repair; current short-window checks pass.
3. Investigate homepage render-blocking CSS/fonts before another speed change. Current Lighthouse estimates 290ms render-blocking savings and 78KiB image opportunity; these estimates are not demonstrated savings. Four font files and a stylesheet preload appear in the response. Trace tools are unavailable, so no causal script-removal claim is made.
4. Prioritize discussion-based interviews, podcasts and library events using the owner-confirmed Johns Creek, Georgia location. Exclude review-copy submissions under the current policy.
5. Retain November 26 article reviews; avoid rewriting based on a tiny search sample.

## Day 2: reliability and mobile

The existing SEO check and seven-article check pass. Nine critical page/discovery routes passed three rounds: 27 HTTP 200 responses. Python urllib received 403 responses, while Node checks, curl and remote Lighthouse succeeded; the Python result is a client-specific access limitation, not evidence of general downtime. Cloudflare's Last 1 hour view shows 243 successes and zero errors. This does not establish the entire post-release period is error-free.

Fresh single-run mobile checks used Lighthouse 13.6.0, Moto G Power and Slow 4G:

| Page | Score | LCP | TBT | CLS |
| --- | --- | --- | --- | --- |
| Home | 94 | 3.017s | 78ms | 0 |
| Book | 94 | 1.690s | 133ms | 0 |
| Moving-cost article | 96 | 2.701s | 108ms | 0 |

These are spot checks against the saved November 6 nine-run baseline, not new medians or proof of improvement. Keep homepage rendering and article long tasks in the follow-up queue. No production code change was justified by this check.

## Day 3: discovery and privacy

The live sitemap contains 14 pages, including seven articles. llms.txt contains 23 Markdown links. robots.txt permits public crawling and blocks admin/API paths. SEO and article schema checks pass. The llms file deliberately links the public sample landing page with its email-signup label; that page is noindex/private and withholds chapter text for anonymous visitors. The missing-article probe returns 404/noindex. Staff articles redirect to the private noindex login. No private chapter text appeared in those probes.

## Day 4: six outreach routes

| Prospect | Verified route and conditions | Next dependency |
| --- | --- | --- |
| [High Point Readers Services](https://www.highpointnc.gov/1167/Contact) | Readers Services number and library email route exist. This is a routing enquiry, not guaranteed collection acceptance. | Secondary discussion enquiry. Johns Creek residency does not establish North Carolina local-author eligibility. |
| [Independent Book Review](https://independentbookreview.com/submission-guidelines/) | Submission form requests author, genre, publication date, description and cover; file route supports books under 20MB. | Hold review submission: EverRise does not supply review copies. A general discussion is possible, but no alternative review arrangement is confirmed. |
| [The Resilient Author](https://www.theresilientauthor.com/be-a-guest) | Published lived-experience authors may apply; no appearance fee; editorial selection. | Priority interview prospect. Owner confirms interest; propose an exploratory discussion, with dates to be agreed. |
| [Journey to Launch](https://journeytolaunch.com/contact/) | Guest requests must use its inquiry form; personal listening/history questions are included. | Eligible for pitch preparation. Personal listening/history answers and specific dates remain to be supplied when needed. |
| [Northwestern Financial Wellness](https://www.northwestern.edu/financial-wellness/financial-planning/living-off-campus/common-expenses.html) | Relevant costs resource remains live. No confirmed external-placement programme. | Keep a routing enquiry; do not claim resource acceptance. |
| [Georgia Center for the Book](https://georgiacenterforthebook.org/contact) | Executive and programming contacts are published. Contact access does not establish event eligibility. | Priority Georgia programme enquiry: Johns Creek location and interest confirmed. Agree dates, format and any travel terms during discussion. |

Owner confirmation, 7 November: Lamont lives in Johns Creek, Georgia, and is interested in interviews, library events and podcasts. He is open to discussing opportunities. EverRise does not supply review copies. No specific dates, travel commitments or spending budget were supplied; do not promise them. Review-copy/shipping budget is unnecessary for the selected discussion-only approach. Day 4 qualification is complete; individual booking details belong to later discussions. All six messages remain unsent; no payment, shipment or appearance was committed.

Evidence: owner workspace folder `seo-month2-days1-4-2026-11-07/evidence`, including raw performance report URLs, discovery responses, privacy probes and the Cloudflare observation. Existing November 6 search/conversion data was reviewed without presenting it as a new measurement.
