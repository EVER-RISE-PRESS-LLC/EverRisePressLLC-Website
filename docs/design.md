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
