# Ever Rise Press — Design System & Style Guide

## 1. Brand Color Palette

### Primary Palette
* **Ever Rise Gold (Primary Accent):** `#D4AF37` | `rgb(212, 175, 55)`
  * *Usage:* Primary CTAs, key accent borders, active highlights, decorative rules, premium badges.
* **Deep Charcoal (Primary Dark / Surface):** `#1A1A1A` | `rgb(26, 26, 26)`
  * *Usage:* Dark section backgrounds, header/footer backgrounds, hero cards, dark UI containers.
* **Cream Vellum (Primary Light / Reading Surface):** `#F8F5EE` | `rgb(248, 245, 238)`
  * *Usage:* Main page background, book preview reader canvas, light content blocks.

### Secondary & Accent Palette
* **Press Ink Blue:** `#284B75` | `rgb(40, 75, 117)`
  * *Usage:* Secondary buttons, informative badges, link hover states, author metadata tags.
* **Laurel Green:** `#5A7D5E` | `rgb(90, 125, 94)`
  * *Usage:* Success states, "In Stock" indicators, sample available badges, secondary accent elements.
* **Highlight Warm Gold:** `#EBC781` | `rgb(235, 199, 129)`
  * *Usage:* Soft hover states, star ratings, subtle border outlines on dark backgrounds.

---

## 2. Text & Content Colors

### Text on Light Backgrounds (`#F8F5EE` / `#FFFFFF`)
* **Heading Text:** `#1A1A1A` (Deep Charcoal)
* **Body Text:** `#2D2D2D` (Soft Charcoal — optimal contrast for long reading)
* **Muted / Secondary Text:** `#666666` (Metadata, publish dates, ISBN, category tags)
* **Link / Interactive Text:** `#284B75` (Press Ink Blue)
* **Link Hover:** `#D4AF37` (Ever Rise Gold)

### Text on Dark Backgrounds (`#1A1A1A` / `#111111`)
* **Heading Text (Primary):** `#D4AF37` (Ever Rise Gold)
* **Heading Text (Secondary):** `#FFFFFF` (Pure White)
* **Body Text:** `#E0E0E0` (Off-White)
* **Muted / Subtitle Text:** `#A0A0A0` (Medium Grey)
* **Active / Accent Text:** `#EBC781` (Highlight Warm Gold)

---

## 3. Typography System

### Primary Heading Font: Spectral SC (Serif)
* **Google Fonts Import:** `family=Spectral+SC:ital,wght@0,400;0,600;0,700;1,400`
* **CSS Font Family:** `'Spectral SC', serif`
* **Text Transform:** Native small-caps styling
* **Hierarchy:**
  * **H1 (Hero / Page Title):** `36px` - `44px` | Weight: `700` | Line Height: `1.2` | Letter Spacing: `0.05em`
  * **H2 (Section Titles, Book Titles):** `28px` - `32px` | Weight: `600` | Line Height: `1.25` | Letter Spacing: `0.04em`
  * **H3 (Subsections, Card Headers):** `20px` - `24px` | Weight: `600` | Line Height: `1.3` | Letter Spacing: `0.03em`
  * **H4 (Small Labels / Category Titles):** `15px` - `16px` | Weight: `600` | Line Height: `1.4` | Letter Spacing: `0.06em`

### Body & UI Font: Karla (Sans-Serif)
* **Google Fonts Import:** `family=Karla:ital,wght@0,400;0,500;0,700;1,400`
* **CSS Font Family:** `'Karla', sans-serif`
* **Hierarchy:**
  * **Lead Paragraph:** `18px` | Weight: `400` | Line Height: `1.6`
  * **Body Text (Standard):** `16px` | Weight: `400` | Line Height: `1.65`
  * **Free Chapter Reader Body:** `17px` | Weight: `400` | Line Height: `1.75` (Optimized for extended reading comfort)
  * **UI / Meta / Button Text:** `14px` - `15px` | Weight: `700` | Line Height: `1.4` | Letter Spacing: `0.03em`
  * **Small / Caption:** `12px` - `13px` | Weight: `500` | Line Height: `1.4`

---

## 4. UI Component Styling

### Primary Button ("Read First Chapter" / "Order Book")
* **Background:** `#D4AF37`
* **Text Color:** `#1A1A1A`
* **Font:** Karla, `14px`, Bold (`700`), Uppercase
* **Padding:** `12px 28px`
* **Border Radius:** `4px` (Sharp, elegant)
* **Hover State:** Background `#EBC781`, Text `#1A1A1A`

### Secondary Button ("Preview Sample" / "View Press Services")
* **Background:** Transparent
* **Border:** `1.5px solid #D4AF37`
* **Text Color (on light):** `#1A1A1A`
* **Text Color (on dark):** `#D4AF37`
* **Font:** Karla, `14px`, Bold (`700`), Uppercase
* **Padding:** `11px 26px`
* **Hover State:** Background `#D4AF37`, Text `#1A1A1A`

### Free Chapter Reader Mode Container
* **Background:** `#F8F5EE`
* **Container Max Width:** `720px` (Centered column)
* **Border:** `1px solid #E2DCCF`
* **Text Color:** `#2D2D2D`
* **Padding:** `48px 40px`


## 5. Public-site motion and interaction — 22 October 2026

The existing charcoal, cream and gold identity remains. Public interfaces use the installed Spectral heading face and Karla body face consistently. The landing page leads with the book, introduces four reader-selected themes, provides edition details, introduces the author, and ends at the free-chapter action.

- Keep navigation geometry fixed. A slim gold underline identifies the current destination. Never resize the navigation in response to scroll.
- One focal interaction: selecting a book theme changes its supporting illustration with a 320 ms crossfade. Native details/summary elements remain operable without JavaScript. Do not autoplay or pin reading content.
- Controls stay under the pointer. Use 160 ms color feedback and a 1 px pressed offset; arrow travel is limited to 3 px. No magnetic movement, decorative sheen, or button glow.
- Dialogs use 240 ms ease-out entrance and 140 ms exit. Keyboard focus is contained, Escape closes, and focus returns to the trigger.
- Reduced motion uses brief fades and color changes, with no spatial transforms or smooth scrolling. Reading text always renders visible.
- Use 6 px control radii and 12 px reading/dialog surfaces. Gold primary actions on dark sections; charcoal primary actions on light sections. Borders or soft offset shadows serve separation; no decorative glass.
- At small widths, show book information and actions before its large cover. Keep touch targets at least 44 px.

Tokens and implementations live in src/app/globals.css and the shared Navbar, ReactiveButton, GlassCard and BookStories components. Legacy animation components remain available in source but are not mounted by the homepage.
