# Staff and local browser tracking guard

27 October 2026. The shared root previously mounted analytics providers on staff routes as well as public pages. An already-loaded SDK could keep observing client-side navigation even after a component stopped rendering its script. Local browser QA could also send activity to the real analytics properties.

`src/lib/tracking-page.ts` centralizes eligibility: `/admin`, its nested paths, decoded admin paths, localhost/subdomains, IPv4 loopback, IPv6 loopback, and `0.0.0.0` are excluded. Browser consent and the privacy hook use this guard. Public pages retain the owner’s existing tracking default and honor saved analytics/advertising opt-outs independently; the guard does not rewrite the visitor’s saved privacy choice.

Providers subscribe to a small shared history guard that notifies them before `pushState`/`replaceState` enters a staff URL, and also observes browser back/forward/hash navigation. This sets Google’s disable flag, opts PostHog out, and revokes Meta consent before an already-loaded vendor’s history handler sees the new staff route. Next pathname effects keep the state synchronized after navigation. Public tracking resumes only when both page eligibility and the saved category choice allow it.

PostHog pageviews are emitted explicitly after the eligibility check, with a `before_send` check as a second guard; late event promises also check the current page. Meta’s event wrapper and the shared Google event helper use the guarded browser choice. Google’s resumed public pageview uses the public origin as its referrer so a staff URL is not passed along as the previous page. No extra third-party request is introduced on staff or local pages.

`scripts/tracking-page.test.mjs` verifies the route/host exclusions, unchanged public default and saved opt-outs, and suppression notification before a fake browser history mutation reaches a draft URL. Combined privacy/access/content tests pass without sending real emails, creating signups, or triggering purchases. Integrated browser QA owns the network check against actual loaded vendor scripts; the tests do not contact analytics services.
