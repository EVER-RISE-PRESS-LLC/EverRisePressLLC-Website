# Public UI and sharing refinement — 22 October 2026

The user requested coherent UI/animation behavior and a converting homepage social image featuring the book and author. This work refines the existing charcoal, cream and gold publishing identity. Impeccable's animate guidance and craft floor informed the interface work; the imagegen skill was used for the social-card composite.

## Direction and implementation

The focal interaction is a reader-controlled theme browser. Four manuscript-supported descriptions replace the repeated bento/scroll-stack presentation; choosing a theme changes its illustration. The original book and biography content remain in the database for the planned editorial review. The homepage retains its introduction, book, author and free-chapter conversion path.

Navigation has stable geometry and a clear current-page indicator. Magnetic controls, repeated scroll reveals, the canvas dot field, scroll capture, parallax and autoplay carousel are no longer mounted on the homepage. Shared cards use quiet solid surfaces. Body typography now consistently uses Karla rather than an overriding Geist variable.

Mobile navigation and the retailer chooser use the existing Radix dialog primitives for focus containment, Escape, outside dismissal, scroll locking and focus return. The book's text/actions come first on mobile. The author-page free-chapter action now reaches the preview. Forms expose errors and busy state, reset expired verification tokens, and use the shared button.

Motion uses 160 ms feedback, 240 ms dialog entry, 140 ms exit, and one 320 ms image crossfade. Reduced-motion rules substitute short opacity/color feedback without spatial movement. Text remains present and visible before JavaScript. Native details/summary controls provide the theme descriptions without JavaScript.

## Homepage social card

`public/images/og/everrise-home-20261022.jpg` is a 1200 × 630 JPEG, approximately 238 KiB. Open Graph and Twitter metadata use this versioned URL. The headline, legible book cover, author portrait and free-chapter action are designed to make the offer understandable in a feed; no conversion-rate claim is made.

Built-in image generation composed the provided cover and author portrait. The output was resized and JPEG-encoded with sips. Source inputs: `public/images/books/financial-heart-attack-cover.webp`, `public/images/authors/lamont-mcleod.jpg`, and the old `public/images/og/everrise-default.png` for color context. The master is retained in the adjacent workspace design-review-2026-10-22 folder.

### Generation prompt

Use case: compositing / ads-marketing. Create the final polished homepage Open Graph sharing image for EverRise Press, a horizontal 1200:630 composition (about 1.905:1). Input 1 is the ACTUAL published book cover; reproduce its artwork, title, spelling and author name faithfully with no redesign. Input 2 is the ACTUAL author Lamont D. McLeod photograph; preserve his facial identity, clothes, body and seated pose exactly, no beautification or invented likeness. Input 3 is the old social card, supplied only for brand colors. Replace its empty composition completely. Use a restrained editorial publishing aesthetic: deep charcoal #1A1A1A, warm cream #F8F5EE and muted gold #D4AF37. Left half: elegant large high-contrast literary serif headline exactly 'A money story.\nA place to start.' Below, legible sans-serif text exactly 'How To Have a Financial Heart Attack' then 'by Lamont D. McLeod'. At bottom-left a clean gold rectangular CTA area with exact text 'Read Chapter 1 Free' and below it smaller but readable 'with email signup'. Top-left small brand name exactly 'EverRise Press' without a decorative badge. Right half: prominent entire original book cover as a realistic upright book, large and readable, with the real author photo to its right as a naturally cropped portrait panel. Author and book must be recognizable even at social feed thumbnail sizes. The portrait should use the original white photographic background, or a clean background extraction preserving every identity detail. Do not repaint the person. Put 'everrisepress.com' subtly along bottom edge. Use generous safe margins at least 48px, crisp typography, strong hierarchy, deliberate alignment. No fabricated reviews, badges, stars, discounts, financial promises, glowing effects, floating particles, generic finance icons or extra text. The result is a finished share graphic, not a website screenshot. Opaque background.

## Validation

Evidence is retained in the adjacent `design-review-2026-10-22` workspace folder. The first review covered desktop and mobile layouts, theme selection via pointer/keyboard, menu focus trapping and return, retailer chooser, author page and chapter-signup entry. The only follow-up UI corrections were the mobile book order, consistent image framing, author portrait crop and the author-page preview link. The Impeccable mechanical detector returned no findings. Production build includes TypeScript; lint reports zero errors and four pre-existing warnings.

Reduced-motion rules were inspected; OS-level preference emulation is not exposed by the browser tool. No newsletter subscription, retailer purchase, or analytics-consent change was performed. The existing SEO smoke check remains the regression gate for canonicals, indexability, structured data, sitemap, redirects and real 404 responses.

The final production build and TypeScript checks passed. The second visual check confirmed the mobile book order, author portrait and preview destination; the 375 px content viewport had no horizontal overflow. The compressed Worker is 2,044.83 KiB, below the project's 3,072 KiB ceiling.

Deployed to `https://everrisepress.com` as Worker version `74a0e681-cffb-4f1e-8bdb-11fbcb55f756`. The live SEO regression check passed on 22 October 2026 at 15:24 UTC, including HTTP/apex/www redirects. Requests using Facebook and Twitter crawler user agents received HTTP 200 and the new 1200 × 630 social-image metadata. Both fetched JPEGs matched the local asset's SHA-256 hash; the file is 244,127 bytes. The published desktop screenshot is saved as `../design-review-2026-10-22/live-homepage.jpg` relative to the repository root.
