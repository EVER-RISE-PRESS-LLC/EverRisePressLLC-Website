# Speed Optimization Plan

**Baseline (PageSpeed Insights, 2026-08-28, mobile / desktop):**

| Metric | Mobile | Desktop |
| :--- | :--- | :--- |
| Performance | 70 | 92 |
| FCP | 1.7 s | 0.5 s |
| LCP | **7.8 s** | 1.6 s |
| TBT | 140 ms | 70 ms |
| CLS | 0 | 0.008 |
| SI | 4.8 s | 1.5 s |

The mobile score is dominated by one problem: **LCP element render delay of 2,640 ms** (mobile) / 2,550 ms (desktop). The hero heading and paragraph are wrapped in `Reveal` (framer-motion), which renders them at `opacity: 0` and only animates them in after JavaScript hydrates. On slow 4G the JS bundle (GSAP + Lenis + framer-motion + PostHog) takes seconds to arrive and execute, so the largest visible text stays invisible. Everything below is ordered by impact on the mobile score, with risk ratings. Nothing here changes the design.

---

## P1 — Remove the LCP render delay (est. mobile 70 -> 85+)

**Root cause:** `src/components/ui/Reveal.tsx` sets `initial={{ opacity: 0, y: 32 }}` and animates in via `whileInView`. Elements already in the first viewport (hero H1, hero paragraph, CTA, book cover) start invisible and must wait for hydration + animation. Lighthouse counts the moment they appear as LCP. This is the 2.6 s "Element render delay".

**Fix (low risk):**
1. Add an `immediate?: boolean` prop to `Reveal`. When set, render `initial={false}` — the content is visible in the server-rendered HTML immediately; no entrance animation for that element.
2. Apply `immediate` only to above-the-fold elements:
   - `src/app/page.tsx` — hero `<h1>`, hero paragraph, hero CTA row, hero cover image, and the "Three patterns" `<h2>` (first section below the fold can keep its animation).
   - `src/app/books/[slug]/page.tsx` and the preview page — any `Reveal` wrapping the title/cover/CTA above the fold.
3. Keep every other `Reveal` untouched — below-the-fold scroll reveals are the design and stay exactly as they are.

**Why it can't break things:** `initial={false}` is the documented framer-motion escape hatch; it only removes the entrance animation for those specific elements. Reduced-motion users already get this behavior today.

---

## P2 — Trim third-party JavaScript (~150-200 KiB, TBT + main-thread wins)

Current 3rd-party load (mobile): gtag.js 166 KiB, fbevents.js 110 KiB, PostHog 52 KiB.

### 2a. PostHog: disable unused extensions (low risk)

`src/components/providers/PostHogProvider.tsx` — `posthog.init()` currently pulls surveys (34 KiB), dead-clicks (8 KiB), exception-autocapture (6 KiB), and web-vitals (3 KiB). None are used. Add to the init config:

```ts
posthog.init(key, {
  api_host: host,
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true,
  disable_session_recording: true,
  disable_surveys: true,
  capture_dead_clicks: false,
  disable_exception_autocapture: true,
  person_profiles: "always",
});
```

**Risk:** none to analytics — event capture, identify, and feature flags are unaffected.

### 2b. Meta Pixel: replace custom provider with `@next/third-parties` (low risk)

`src/components/providers/MetaPixelProvider.tsx` injects fbevents.js manually and currently logs `Uncaught ReferenceError: fbq is not defined` in the console (flagged under Best Practices). `@next/third-parties` is already installed. Swap to:

```tsx
import { FacebookPixel } from "@next/third-parties/facebook";

<FacebookPixel pixelId={env.NEXT_PUBLIC_META_PIXEL_ID} />
```

Keep the existing `trackMetaEvent()` helper signature so the lead form and retailer-click code don't change. `FacebookPixel` also exports `sendFacebookPixelEvent` if needed.

**Risk:** low — verify a Meta Events Manager test event fires after deploy. This also clears the console error.

### 2c. GA4 (accepted cost)

gtag.js at 166 KiB is the heaviest third party but is core to ad attribution. Keep `@next/third-parties/google` as-is. Optional later: move to server-side GA4 measurement to remove the client script entirely (out of scope).

### 2d. Preconnect to PostHog (low risk)

PSI reports ~90 ms LCP saving on desktop. Add to `src/app/layout.tsx` head:

```tsx
<link rel="preconnect" href="https://us-assets.i.posthog.com" />
```

---

## P3 — Image delivery (est. 271 KiB mobile savings + cache headers)

### 3a. Compress source images (low risk, biggest byte win)

`public/images/stack/` is 1.2 MB of JPEGs; `img2.jpg` alone is 574 KB. Convert all four to WebP (quality ~70) — expected ~300 KB total. Same for:

- `public/images/logo.png` — 172 KB PNG rendered at 32-48 px. Convert to WebP (~15-25 KB). Keep the PNG name/extension in `Navbar` if possible, or update the single reference.
- `public/images/carousel/*.webp` (86 KB, 67 KB, 59 KB) — re-encode at quality ~70 and, if larger than 600 px, cap width to their displayed size.
- `public/images/authors/lamont-mcleod.jpg` (54 KB) — fine after WebP re-encode, optional.

`next/image` on this deployment is a pass-through (Cloudflare Image Resizing is a paid feature and the IMAGES binding is inactive on the free plan), so the optimized file sizes ARE what users download. Compressing source files directly fixes "Improve image delivery" and "This image file is larger than it needs to be".

### 3b. Cache headers for `/_next/image` (low risk, dashboard only)

All `/_next/image?*` responses currently have no `Cache-Control`, so Lighthouse reports 466-633 KiB of uncacheable image bytes. Add a Cloudflare **Cache Rule** (available on free plan):

- **When:** URI path starts with `/_next/image/`
- **Then:** Cache eligibility: `Eligible for cache`; Edge TTL: `Ignore cache-control header and use this TTL` = 1 day; Browser TTL: `Respect existing headers` -> `Override` = 1 year.

No code change, no deploy risk. Documented in the Cloudflare dashboard so it survives redeploys.

---

## P4 — SEO / Agentic audits (score 92 -> 100, zero risk)

### 4a. robots.txt — 2 errors

`src/app/robots.txt/route.ts` lines 51-52 use `Schemamap:` and `Agentmap:`, which are not standard directives and are flagged as errors by Lighthouse. Convert to comments:

```
# Schemamap: ${baseUrl}/schemamap.xml
# Agentmap: ${baseUrl}/.well-known/api-catalog
```

**Risk:** none — non-standard directives are ignored by crawlers anyway; the endpoints remain discoverable via `llms.txt`.

### 4b. llms.txt — "File does not appear to contain any links"

`src/app/llms.txt/route.ts` emits bare URLs in the entity list. The audit requires Markdown link syntax. Change to:

```
- Book "[Title]": [${SITE_URL}/books/${slug}](url)
```

i.e. wrap each entity reference in `[label](url)` form. Same for the Publisher, Schema, and entity lines.

---

## P5 — Client-side JS on mobile (phase 2, medium risk — do after P1-P4 are shipped)

These trim main-thread work (2.4 s) and TBT but touch animation code, so they get separate QA:

1. **DotGrid** (`src/components/ui/DotGrid.tsx`): runs a continuous requestAnimationFrame physics loop. On coarse-pointer/small viewports, render the static grid once and skip the RAF loop (matchMedia `(pointer: coarse)` or `window.innerWidth < 768`).
2. **ScrollStack** (`src/components/ui/ScrollStack.tsx`): Lenis smooth scroll is pointless on touch. On mobile, skip Lenis and let cards scroll natively (stacking transforms still work off native scroll).
3. **StoryCarousel / CoverParallax**: verify they respect `useReducedMotion`; optionally lazy-mount the carousel only when it enters the viewport (it is below the fold on mobile).
4. If TBT remains above 100 ms after P2, lazy-load framer-motion via `LazyMotion` with only the `m`/`useReducedMotion` features imported.

---

## P6 — HTML caching (phase 3, optional)

The homepage is `force-dynamic` and the OpenNext incremental cache is disabled (R2 not enabled on the account). First-visit performance is what the PSI audit measures, so this does not affect the score — it improves repeat visits and Worker CPU cost. Options when ready:

1. Enable R2 and configure `open-next.config.ts` incremental cache (see `opennextjs.org/cloudflare/caching`), then switch stable pages to ISR with short revalidation.
2. Or add a Cloudflare Cache Rule for HTML with Edge TTL ~60 s and purge on deploy (`wrangler deploy` + cache purge script).

Do not attempt either until P1-P4 are verified in production.

---

## Execution order & expected results

1. P4 (robots.txt, llms.txt) — 15 min, immediate SEO 100.
2. P1 (Reveal `immediate`) — 1-2 h incl. review. **Biggest single win**: LCP 7.8 s -> ~2-3 s on mobile.
3. P2 (PostHog flags, FacebookPixel, preconnect) — 1 h.
4. P3 (image compression + Cache Rule) — 1-2 h.
5. Re-run PSI mobile; target >= 85. Then schedule P5 as a separate QA'd change.

**Verification after each step:** `npm run lint`, local `npm run dev` visual check of the homepage above the fold, then `npm run deploy` and a fresh PSI run (use a URL query param to bypass Cloudflare cache: `?psicheck=<timestamp>`).

**Regression guards for P1:** confirm the hero heading and paragraph are visible with JavaScript disabled (view-source / `curl`), and that scroll-reveal sections below the fold still animate.
