# EverRise Press — Admin Panel Specification (Milestone 8)

> **Status:** Approved for build — 2026-08-25
> **Mandate:** All admin UI MUST be built with shadcn/ui components.
> **Audience:** Any agent (human or AI) building, extending, or reviewing the admin panel. This document is the single source of truth for scope, structure, and behavior.

---

## 1. Purpose & Goals

The admin panel is the internal control room for EverRise Press LLC. It must let a single publisher (Lamont McLeod) and future staff:

1. See funnel performance at a glance (referral clicks → leads → conversion).
2. Manage podcast referral partners (create, edit, deactivate, inspect per-partner performance).
3. Review and export captured leads.
4. Edit books, chapter 1 content, and retailer formats without code deploys.
5. Edit author profiles.

**Non-goals (v1):** Mailchimp push management (M6 deferred), R2 image upload (R2 disabled on account — image fields are URLs for now), user management UI, PostHog admin events (M9).

### 1.1 Analytics data sources (important clarification)

The admin dashboard is powered **entirely by first-party data in D1** — it does NOT depend on PostHog, GA4, or Google Search Console:

| Dashboard metric | Data source | Status |
|---|---|---|
| Referral clicks | `referral_clicks` (M7, live) | ✅ collecting |
| Leads | `leads` (M5, live) | ✅ collecting |
| Conversion rate | computed: leads / clicks | ✅ |
| Retailer exits | `retailer_clicks` (added in this milestone) | ✅ collecting after deploy |
| Clicks/leads time series | same tables, `GROUP BY date(created_at)` | ✅ |

PostHog / GA4 / Meta CAPI (Milestone 9) instrument the **public site** for session replay, ad attribution, and funnels. GSC is a standalone Google tool (no real-time API) and is out of scope for the admin panel entirely.

### 1.2 Appearance controls (REQUIRED)

Admin header must include two user-facing controls:

1. **Dark/Light theme toggle** — switch between the `.dark` charcoal theme and the light cream theme (both token sets live in `globals.css`). Default: dark. Persisted in `localStorage` (`everise-admin-theme`). Applies only inside `/admin` (class applied to admin wrapper element).
2. **UI scale control (A− / A+)** — steps document font-size on the admin wrapper between **90% and 150%** in 10% increments (rem-based shadcn components scale text AND UI chrome). Current % shown between buttons; reset to 100% on click of the label. Persisted in `localStorage` (`everise-admin-scale`). Applies only inside `/admin`.

Implementation: client component `AdminAppearanceControls` inside the admin header + `AdminThemeProvider` (React context) so the sonner `Toaster` can follow the active theme. Dark theme applied server-side by default (no flash); light preference hydrates client-side.

---

## 2. Tech Decisions (Locked)

| Decision | Choice | Rationale |
|---|---|---|
| UI library | **shadcn/ui** (new-york style, Tailwind v4 + React 19 compatible) | Mandated by project owner. Components are copied into the repo, fully customizable. |
| Admin theme | Dark charcoal shell, Ever Rise Gold primary | Distinct from cream marketing site; matches brand. Implemented via standard shadcn `.dark` token block. |
| Auth | Custom session: `jose` JWT in HttpOnly cookie `admin_session` (7 days) | `jose` already a dependency. No NextAuth — heavy for a single-admin D1-backed app on Workers. |
| Password hashing | Web Crypto PBKDF2-SHA256, 100k iterations, per-user random salt. Stored format: `pbkdf2$sha256$100000$<saltHex>$<hashHex>` | Zero new deps; Web Crypto is native in Workers runtime and Node 20+. |
| Data fetching | React Server Components (`force-dynamic`) reading D1 via Drizzle, exactly like existing marketing pages | Consistent with codebase pattern; zero-JS reads. |
| Mutations | Client components → `fetch` → admin API routes under `/api/admin/*` | Standard App Router pattern. |
| Charts | shadcn `chart` (recharts) in client components only | Keeps recharts out of the worker bundle; assets-only. |
| Forms | shadcn `form` (react-hook-form + zod) | Type-safe validation. New deps: `react-hook-form`, `zod`. |
| Toasts | shadcn `sonner` | Current shadcn standard (toast deprecated). |
| Tables | shadcn `table` + server-driven pagination via `searchParams` | D1 queries with `LIMIT/OFFSET`. |
| Routing | App Router route groups: `src/app/(admin)/admin/**` | Matches AGENTS.md architecture. |

---

## 3. Database Changes

### 3.1 New table: `retailer_clicks` (migration required)

The Dashboard must show "Retailer Exit Clicks" per AGENTS.md §7.1. Not currently tracked. Add:

```ts
export const retailerClicks = sqliteTable("retailer_clicks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookId: text("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  retailer: text("retailer").notNull(),       // distributor enum value string, e.g. "APPLE_BOOKS"
  formatType: text("format_type").notNull(),  // "EBOOK" | "PAPERBACK" | ...
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  country: text("country"),
  partnerId: text("partner_id").references(() => referralPartners.id), // via everise_ref cookie
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});
```

Migration via `npm run db:generate` then apply local + remote.

### 3.2 Instrumentation

- New public endpoint `POST /api/retailer-click` — fire-and-forget event logger. Body: `{ bookSlug, retailer, formatType }`. Reads `everise_ref` cookie for partner attribution. **No Turnstile** (not a lead event; low fraud value). Rate-limit future work.
- `MultiRetailerModal.tsx`: on each retailer button click, `fetch("/api/retailer-click", ...)` with `keepalive: true`, non-blocking (don't await before navigation).

### 3.3 No other schema changes

`users`, `authors`, `books`, `book_formats`, `referral_partners`, `referral_clicks`, `leads` stay as-is. Admin user bootstrapped via script (see §5.3).

---

## 4. Design System — Admin Overrides

shadcn semantic tokens are added to `src/app/globals.css` **without breaking marketing tokens**:

- Keep existing marketing vars (`--gold`, `--charcoal`, `--cream`, etc.) untouched.
- `:root` (light/cream) keeps `--background: #F8F5EE`, `--foreground: #1A1A1A` so the marketing site renders identically.
- Add the full shadcn token set in the standard `.dark` block scoped for admin: charcoal backgrounds, cream text, **gold as `--primary`**.
- Admin layout root uses `<html class="dark">`-equivalent scoping: the admin shell applies `.dark` on its wrapper element (CSS variables resolve per-element, so marketing pages are unaffected).
- `--radius: 0.5rem`; fonts: `--font-sans: Karla` (already loaded globally).
- Admin-specific accent mapping:
  - `--primary`: `#D4AF37` (gold), `--primary-foreground`: `#1A1A1A`
  - `--destructive`: `#B3452E`-ish red, `--muted`: warm gray-charcoal
  - `--chart-1`..`--chart-5`: gold, ink blue (`#284B75`), laurel (`#4E6B51`), muted gold, cream

**UI copy style:** Functional, short, precise. NOT System 4 voice (internal tooling — no provocative copy). Use proper labels: "Leads", "Conversion rate", "Deactivate partner".

---

## 5. Authentication & Authorization

### 5.1 Roles

| Role | Access |
|---|---|
| `ADMIN` | Everything, including referral partner management. |
| `EDITOR` | Everything **except** creating/deactivating referral partners. |
| `PARTNER` | No admin access (reserved for future partner login). |

Enforcement: route guard returns 403 for EDITOR on partner-mutation endpoints. v1 UI shows partner-management buttons to ADMIN only.

### 5.2 Files

- `src/lib/auth.ts`:
  - `hashPassword(password: string): Promise<string>` — PBKDF2, returns full `pbkdf2$...` string.
  - `verifyPassword(password: string, stored: string): Promise<boolean>`
  - `createSessionToken(userId: string): Promise<string>` — jose HS256, `sub` claim, 7d expiry.
  - `verifySessionToken(token: string): Promise<{ userId: string } | null>`
  - `getSessionUser(request: Request)` — reads `admin_session` cookie, verifies, loads user row from D1 (needs `D1Database`; callers pass `env.DB`).
  - `requireAdmin(request, db)` / `requireEditor(request, db)` — return user or `null` (callers respond 401/403).
- `src/app/api/admin/login/route.ts` — POST `{ email, password }` → verify → set `admin_session` cookie (`HttpOnly`, `SameSite=Lax`, `Secure` in prod, 7d, `Path=/`). Generic error "Invalid email or password." on failure (no user enumeration).
- `src/app/api/admin/logout/route.ts` — POST → clear cookie.

### 5.3 Bootstrap admin user

New npm script `admin:create` → `scripts/create-admin.mjs`:
- Args: `node scripts/create-admin.mjs <email> <name> [--role ADMIN|EDITOR] [--remote]`
- Generates salt + PBKDF2 hash (Node `crypto`), writes SQL `INSERT ... ON CONFLICT(email) DO UPDATE SET password_hash=..., role=...` to a temp file, executes via `npx wrangler d1 execute everrisepress-db --local|--remote --file`.
- Run locally AND remotely once during build verification.

### 5.4 Route protection

- `src/app/(admin)/admin/layout.tsx` — server component, `force-dynamic`; reads cookie via `cookies()` (next/headers), verifies JWT, loads user. Redirects to `/admin/login` if invalid; renders `<AdminShell>` otherwise. This is the single guard — no `middleware.ts` needed (keeps worker bundle small; middleware deferred since M7).
- `src/app/(admin)/admin/login/page.tsx` — public page; if already authed, redirect to `/admin/dashboard`.
- Every `/api/admin/*` route calls `requireAdmin`/`requireEditor` as its first step.

---

## 6. Information Architecture

### 6.1 Route map

> **IMPORTANT — route-group structure.** The auth guard lives in `(panel)/layout.tsx`, NOT in `admin/layout.tsx`. The login page sits OUTSIDE the guard. If you put the guard on `admin/layout.tsx` it will also protect `/admin/login`, causing an infinite redirect loop (`/admin/login` → `/admin/login`). Do not regress this.

```
src/app/(admin)/admin/
├── (panel)/                     # guarded + AdminShell (route group — no URL prefix)
│   ├── layout.tsx               # auth guard (getCurrentAdminUser) + AdminShell + noindex + no-flash script
│   ├── page.tsx                 # redirect → /admin/dashboard
│   ├── dashboard/page.tsx
│   ├── referrals, leads, books, authors (list + [id] + new)
└── login/page.tsx               # public, NOT under guard
```

| Route | Page | Auth |
|---|---|---|
|---|---|---|
| `/admin` | redirect → `/admin/dashboard` | guard |
| `/admin/login` | Login page | public |
| `/admin/dashboard` | KPI Dashboard | guard |
| `/admin/referrals` | Referral partners list | guard |
| `/admin/referrals/[id]` | Partner detail + breakdown | guard |
| `/admin/leads` | Leads table + CSV export | guard |
| `/admin/books` | Books list | guard |
| `/admin/books/new` | Book editor (create) | guard |
| `/admin/books/[id]` | Book editor (edit, incl. formats) | guard |
| `/admin/authors` | Authors list | guard |
| `/admin/authors/[id]` | Author editor | guard |

### 6.2 Navigation (sidebar)

Sidebar (desktop, `w-64`, collapsible via shadcn `sidebar` pattern; mobile: `sheet` drawer). Sections top→bottom:

1. **Dashboard** — LayoutDashboard icon → `/admin/dashboard`
2. **Books** — BookOpen icon → `/admin/books`
3. **Authors** — UserPen icon → `/admin/authors`
4. **Referrals** — Share2 icon → `/admin/referrals`
5. **Leads** — Mail icon → `/admin/leads`

Sidebar footer: logged-in user (avatar initials, name, role badge) + "View site" link (`/`) + Logout.

Header (top bar): current section title + breadcrumb, right side: user dropdown (avatar → View site / Logout).

### 6.3 Page hierarchy (what lives where)

```
Admin
├── Dashboard (stats + charts, read-only)
├── Books
│   ├── List
│   └── Editor (create/edit) → includes Formats sub-editor
├── Authors
│   ├── List
│   └── Editor
├── Referrals
│   ├── List + Create dialog
│   └── Detail (stats, charts, recent leads/clicks, edit, deactivate)
└── Leads
    └── List (filters, pagination, CSV export)
```

---

## 7. Page Specifications

### 7.1 Login (`/admin/login`)

**Purpose:** Authenticate admin users.

**Layout:** Centered card on charcoal background with gold accents. EverRise Press wordmark. No marketing nav.

**Blocks:**
- Card (`w-full max-w-sm`): title "EverRise Press — Admin", email input, password input, submit button (gold, full width, loading spinner while submitting).
- Error alert on failure (shadcn `alert`, destructive variant).
- Link back to public site ("← Back to website").

**Behavior:** Submit → `POST /api/admin/login`. Success → `router.push("/admin/dashboard")` + `router.refresh()`. Invalid → inline error. Turnstile: **not required v1** (login is low-frequency; add later if attacked).

**States:** idle, loading, error.

### 7.2 Dashboard (`/admin/dashboard`)

**Purpose:** High-level funnel KPIs.

**Data:** Server component queries (all time by default):
- `referral_clicks` count; `leads` count; conversion = leads/clicks %.
- Retailer exits: `retailer_clicks` count, grouped by retailer.
- Leads per partner (top 5).
- Time series: clicks and leads per day for last 30 days (SQL `date(created_at)` group by).

**Layout (top → bottom):**
1. Row of 4 KPI `card`s: **Total Clicks**, **Total Leads**, **Conversion Rate**, **Retailer Exits**. Each: big number, small label, delta vs previous 30 days (+/- %).
2. Chart card (span 2 cols): **"Leads vs Clicks — last 30 days"** line/area chart (2 series, gold + ink blue).
3. Card: **"Retailer exits"** — bar chart by retailer, or horizontal list with counts (fallback if <2 data points).
4. Card: **"Top partners"** — table: partner name, clicks, leads, conversion %, link to detail page.

**Components:** `card`, `chart` (recharts), `table`, `badge`, `skeleton` (loading states).

**Empty states:** Zero clicks → KPI cards show 0; chart cards show "No activity yet — share a /refer link to start collecting data." + button to `/admin/referrals`.

### 7.3 Referrals — List (`/admin/referrals`)

**Purpose:** Manage podcast partners.

**Layout:**
1. Header row: title + "New Partner" button (ADMIN only; opens `dialog`).
2. `table`: columns = Name | Slug (mono, with copy button) | Contact email | Status (`badge`: Active/Emerald, Inactive/Gray) | Clicks | Leads | Conversion % | Created | Actions.
3. Row actions (dropdown menu): **View detail**, **Edit**, **Deactivate/Reactivate** (ADMIN).
4. Copy button next to slug copies full URL `https://<domain>/refer/<slug>` (uses `window.location.origin`).

**Create dialog** (`dialog` + `form`): fields = Name*, Contact email*, Slug* (auto-suggested from name, lowercase-hyphens, must be unique — validated server-side), Custom UTM (optional). Submit → `POST /api/admin/referrals`.

**Edit dialog:** same fields prefilled → `PATCH /api/admin/referrals/[id]`.

**Deactivate:** `alert-dialog` confirm ("Deactivate this partner? Their links will redirect to the homepage.") → `PATCH` `isActive:false`. Reactivate reverses.

**Empty state:** "No partners yet. Create your first podcast partner." + button.

### 7.4 Referrals — Detail (`/admin/referrals/[id]`)

**Purpose:** Per-partner breakdown + management.

**Data:** partner row; counts: clicks, leads, conversion; clicks & leads per day (30d); recent leads (20, latest first); recent clicks (10).

**Layout:**
1. Header: partner name, status badge, edit + deactivate buttons, copy link button.
2. Row of 3 KPI cards: Clicks, Leads, Conversion Rate.
3. Chart card: 30-day clicks vs leads (same chart as dashboard, scoped).
4. Two-column grid: **Recent leads** table (email, book, date) | **Recent clicks** list (date, country, referer, IP hash prefix).
5. Danger zone card (ADMIN): "Deactivate partner" with explainer text.

**Empty state:** "No clicks yet. Share this link: `/refer/<slug>`" with copy button.

### 7.5 Leads (`/admin/leads`)

**Purpose:** Review + export lead capture data.

**Layout:**
1. Header: title + **Export CSV** button.
2. Filter bar (`input` search email + `select` book + `select` partner + `button` "Reset"). Filters sync to URL `searchParams` (server-driven).
3. `table`: columns = Email | Book | Partner (name or —) | Source UTM | Mailchimp (badge: "Pending"/"Synced" — v1 always Pending until M6; badge gray "Not connected" if M6 not configured) | Unlocked | Created.
4. Pagination footer: Prev / "Page X of Y" / Next (20/page). `searchParams.page`.

**Export:** `GET /api/admin/leads/export?book=&partner=&q=&format=csv` — streams CSV (auth-guarded). Columns: email, book_slug, partner_slug, source_utm, unlocked_at, created_at. Filename: `everrise-leads-YYYY-MM-DD.csv`. Uses `csv-safe` escaping (quote fields containing commas/quotes/newlines).

**Empty state:** "No leads captured yet. Leads appear here when readers unlock Chapter 1."

### 7.6 Books — List (`/admin/books`)

**Purpose:** Book catalog overview.

**Layout:** Header with "New Book" button → `table`: Cover (thumbnail `img` 40x60) | Title (+subtitle) | Slug | Published date | Formats (count badge) | Updated | Actions (dropdown: Edit, View live page, Delete).

**Delete:** `alert-dialog` confirm (destructive; cascades to formats/leads/clicks via FK cascade — message says so) → `DELETE /api/admin/books/[id]`.

### 7.7 Book Editor (`/admin/books/new` and `/admin/books/[id]`)

**Purpose:** Create/edit a book and its retailer formats.

**Layout:** Two-column: left `card` "Book details" (form), right column: cover preview card + "Retail formats" card.

**Fields (left):**
- Slug* (kebab-case, unique; disabled when editing)
- Title*, Subtitle
- Author* (`select` of authors)
- Synopsis* (`textarea`, 8 rows)
- Cover image URL* (`input` + live preview thumbnail; help text: "R2 uploads coming soon — use /images/... or absolute URL")
- Chapter 1 title*, Chapter 1 body* (`textarea`, 16 rows, accepts HTML; help text notes content comes from the gated reader)
- Published date (`input type="date"`)
- Save bar: sticky bottom `card` with "Save changes" (gold) + "Cancel" link.

**Retail formats card (right):** Repeater rows, one per format:
- Format type (`select`: EBOOK/PAPERBACK/HARDCOVER/AUDIOBOOK), Distributor (`select`: AMAZON_KDP, DRAFT2DIGITAL, INGRAMSPARK, APPLE_BOOKS, BARNES_AND_NOBLE, KOBO, BOOKSHOP_ORG), ISBN, Price (number, step 0.01), Currency (default USD), Purchase URL*.
- "Add format" button; trash button per row.
- Same ISBN may repeat across retailer rows (constraint removed in migration 0001 — do NOT re-add unique).

**Save semantics:** One "Save" submits both book + formats: `PATCH /api/admin/books/[id]` (or `POST /api/admin/books` for new) with `{ book: {...}, formats: [...] }` — server diffs and replaces formats rows (delete missing, upsert by id when present).

**Validation:** zod schema shared between client form and server route (`src/lib/admin/validation.ts`).

### 7.8 Authors — List (`/admin/authors`)

**Purpose:** Author roster.

**Layout:** Header + "New Author" button → `table`: Avatar (40px circle) | Name | Slug | Title | Books count | Actions (Edit, Delete with `alert-dialog`; delete blocked with message if author has books — FK cascade would wipe book attribution).

### 7.9 Author Editor (`/admin/authors/[id]`)

**Layout:** `card` form: Name*, Slug* (unique, disabled when editing), Title, Bio* (`textarea` 12 rows), Avatar URL (`input` + preview), Social links: 4 optional inputs (Website, LinkedIn, Facebook, X/Twitter) → stored as JSON `social_links`. Save → `POST/PATCH /api/admin/authors`.

---

## 8. API Route Specifications

All under `/api/admin/*`. All JSON unless noted. All start with `requireAdmin`/`requireEditor` (401 if no session, 403 if role insufficient).

| Method | Route | Body / Query | Returns | Role |
|---|---|---|---|---|
| POST | `/api/admin/login` | `{ email, password }` | `{ success }` + cookie | public |
| POST | `/api/admin/logout` | — | `{ success }` | any session |
| POST | `/api/admin/referrals` | `{ name, slug, contactEmail, customUtm? }` | partner row | ADMIN |
| PATCH | `/api/admin/referrals/[id]` | partial `{ name?, slug?, contactEmail?, customUtm?, isActive? }` | partner row | ADMIN |
| POST | `/api/admin/books` | `{ book, formats[] }` | book row | ADMIN/EDITOR |
| PATCH | `/api/admin/books/[id]` | `{ book, formats[] }` | book row | ADMIN/EDITOR |
| DELETE | `/api/admin/books/[id]` | — | `{ success }` | ADMIN |
| POST | `/api/admin/authors` | `{ name, slug, title?, bio, avatarUrl?, socialLinks? }` | author row | ADMIN/EDITOR |
| PATCH | `/api/admin/authors/[id]` | partial | author row | ADMIN/EDITOR |
| DELETE | `/api/admin/authors/[id]` | — | `{ success }` or 409 if has books | ADMIN |
| GET | `/api/admin/leads/export` | `?book=&partner=&q=` | CSV stream | ADMIN/EDITOR |
| POST | `/api/retailer-click` (public) | `{ bookSlug, retailer, formatType }` | `{ success }` | public |

Error convention: `{ error: string }` with 400 (validation), 401, 403, 404, 409, 500. Slug uniqueness violations → 409 "Slug already in use."

---

## 9. Shared Admin Components (`src/components/admin/`)

| Component | Purpose |
|---|---|
| `AdminShell.tsx` | Server-rendered shell: sidebar + header + `<main>` slot; receives current user for footer. |
| `AdminThemeProvider.tsx` | Client context: theme (dark/light) + scale (90–150%), localStorage persistence, applies `.dark` class + font-size on admin root. |
| `AdminAppearanceControls.tsx` | Client: theme toggle button + A− / % / A+ scale controls (header). |
| `SidebarNav.tsx` | Client nav (active state via `usePathname`), mobile sheet toggle. |
| `KpiCard.tsx` | Stat card: label, value, delta badge, icon. |
| `ActivityChart.tsx` | Client recharts wrapper (30-day clicks vs leads), themed to admin tokens. |
| `StatTable`-style primitives | Plain shadcn `table` composed inline per page — no extra wrapper needed. |
| `EmptyState.tsx` | Icon + message + optional CTA button. |
| `CopyLinkButton.tsx` | Copies string to clipboard, shows check icon 2s (sonner toast). |
| `PageHeader.tsx` | Section title + description + actions slot (used on every list page for consistency). |

Shadcn components to install (via `npx shadcn@latest add`): `button card input label form table dialog select badge separator dropdown-menu avatar tabs sonner checkbox textarea alert-dialog tooltip sheet skeleton chart sidebar`.

> If the `sidebar` component registry entry is unavailable in the installed CLI version, build the shell from `sheet` + plain nav instead — visual parity is the goal, not a specific registry item.

---

## 10. Security Rules (mandatory for every agent)

1. **Never trust the client:** every `/api/admin/*` route re-verifies the session cookie server-side.
2. **No secrets client-side:** JWT secret and DB access never reach client bundles.
3. **SQL via Drizzle only** (parameterized) — no string interpolation anywhere.
4. **CSRF posture:** session cookie `SameSite=Lax` + JSON-only mutating routes (no `GET` mutations) — acceptable for v1; document as known limitation.
5. **Rate limiting login:** out of scope v1; Cloudflare WAF rule recommended pre-launch (note in README).
6. **Logout clears cookie** with matching path/attributes.
7. **Sanitize nothing on input, escape on output:** chapter body is authored HTML stored as-is (publisher-owned content); React escapes by default — only render HTML via `dangerouslySetInnerHTML` in the public reader, which already does.
8. **Admin pages are `noindex`** — add `<meta name="robots" content="noindex,nofollow">` in admin layout metadata.

---

## 11. Build Order (agents MUST follow this sequence)

1. **shadcn init** — back up `globals.css` first; init CLI; then merge tokens per §4 (marketing vars stay intact; verify `/` renders unchanged).
2. **Add shadcn components** (§9 list).
3. **DB:** add `retailer_clicks` to `src/lib/db/schema.ts` → `npm run db:generate` → migrate local + remote.
4. **Auth:** `src/lib/auth.ts`, login/logout API, `scripts/create-admin.mjs` + npm script, create local admin user.
5. **Shell:** `(admin)` route group, `AdminShell`, `SidebarNav`, login page, guard in `layout.tsx`.
6. **Shared components:** `KpiCard`, `ActivityChart`, `EmptyState`, `CopyLinkButton`, `PageHeader`, `src/lib/admin/validation.ts`.
7. **Dashboard page.**
8. **Referrals:** list + create/edit dialogs + detail page + APIs.
9. **Leads:** list + filters + pagination + CSV export API.
10. **Books:** list + editor + formats repeater + APIs.
11. **Authors:** list + editor + APIs.
12. **Retailer click tracking:** public endpoint + `MultiRetailerModal` instrumentation.
13. **Verify** (see §12), update README + `memory/project-handoff.md`, deploy.

## 12. Acceptance / Verification Checklist

- [ ] `npm run dev` — marketing homepage, book page, preview flow all render unchanged (CSS merge safe).
- [ ] Admin defaults to dark; toggle switches to light and back; preference survives reload.
- [ ] Scale A−/A+ steps 90–150%, label resets to 100%, preference survives reload; does not affect public pages.
- [ ] `/admin` unauthenticated → redirects to `/admin/login`.
- [ ] Login with created admin user succeeds; wrong password shows generic error.
- [ ] Logout returns to login; back-button to `/admin` redirects again.
- [ ] Dashboard shows 0s gracefully + seeded referral data (create a test click/lead via `curl` or the public flow).
- [ ] Create partner → appears in list → `/refer/<slug>` redirects with cookie (reuse M7 verification).
- [ ] Partner detail shows click/lead rows after exercising `/refer/` + lead capture flow.
- [ ] Deactivate partner → `/refer/<slug>` redirects to homepage.
- [ ] Leads table filters by book/partner/search; CSV export downloads with correct columns.
- [ ] Book editor: change subtitle → public book page shows change (force-dynamic).
- [ ] Add format row → appears in public MultiRetailerModal.
- [ ] Author editor: change bio → author page reflects.
- [ ] Retailer click: open modal, click Apple Books → row in `retailer_clicks` + dashboard count increments.
- [ ] `npx tsc --noEmit` and `npx eslint .` clean.
- [ ] `npm run deploy` succeeds; repeat smoke test on `everrisepressllc-website.everrisepressdev.workers.dev`; remote admin user created.
- [ ] README progress updated (M8 complete, M6 deferred note stays).

## 13. Deferred / Future (do NOT build in v1)

### 13.1 Deferred from v1

- Mailchimp sync controls in Leads (M6) — column stays "Pending".
- R2 image uploader replacing URL fields (8.1 — blocked on R2 re-enable).
- User management UI (create more admins via script only).
- Middleware-level admin protection (layout guard suffices today).
- PostHog/GA4 admin events (M9).
- Settings page (change password) — script-only for now.
- Login rate limiting / brute-force protection (Cloudflare WAF pre-launch).

### 13.2 Future Admin Feature Wishlist (owner-approved 2026-08-25)

> The dashboard is functional. The owner wants a rich feature set here — these are tracked for future work, NOT for the current milestone. Add new ideas to this list rather than building them unscheduled.

**Analytics & reporting**
- PostHog session-replay deep links from the Leads table (watch a lead's exact reader session)
- GA4/PostHog acquisition reports embedded in the dashboard (campaign, source/medium breakdowns)
- Full funnel view: visit → chapter unlock → email lead → retailer click → purchase (PostHog funnels, M9+)
- Cohort segmentation: "read chapter 1 but didn't buy", "arrived via podcast X", "returning reader"
- Time-of-day / day-of-week heatmaps for clicks and leads
- Country breakdown tables + map for referral clicks
- UTM campaign reports (currently `utm_campaign=<partner-slug>` only; extend to full UTM capture in lead + click rows)
- Revenue estimates: retailer clicks × format price (probabilistic conversion multiplier)
- Scheduled email digest (daily/weekly funnel stats to the owner's inbox)
- More CSV exports: referral clicks, retailer clicks, per-partner rollups

**A/B testing & experimentation**
- Feature flags (PostHog) for landing page variants, CTA copy, reader modal designs — managed from admin
- CTA copy experiments on the book page with conversion tracking

**Referral partners**
- Partner self-serve portal (PARTNER role login: podcast hosts see only their own stats + link)
- Partner payout / commission tracking (if affiliates become paid)
- Bulk import of partners (CSV)
- Per-partner retailer exit attribution drill-down (already tracked via `retailer_clicks.partner_id` — just needs UI)
- Custom per-partner redirect destinations (partner-specific landing pages)

**Content management**
- R2-backed image uploader (AGENTS.md §8.1 — blocked until R2 is re-enabled on the Cloudflare account)
- Cover image optimizer (auto-generate webp/og sizes on upload)
- Chapter content version history / draft-publish workflow
- Multi-book author page management (already relational, just richer editor UX)

**Leads & lifecycle**
- Mailchimp resync controls: re-push failed syncs, tag editor, unsubscribe sync status (after M6)
- Lead scoring (clicks + retailer exits + repeat visits)
- Email sequence status per lead (which nurture email they're on)

**Security & account**
- 2FA (TOTP) for admin logins
- Settings page: change password, session list/revoke
- Full audit log (who edited what, when)

**SEO/GEO admin tools**
- `llms.txt` + schema.org validation status panel (after M9)
- Sitemap health / IndexNow submissions
- OG image preview generator UI (after M9 `/api/og` exists)

**Misc**
- In-app announcements/changelog
- Dark/light sync per-device (currently localStorage only)
- Mobile app-style navigation refinements (bottom nav on small screens)
- Dashboard "widget" customization (drag/reorder/hide KPI cards)
