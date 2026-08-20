# Quick Start Guide — Resuming Work

## How to Resume in a New Chat

Copy and paste this prompt into a new chat session:

```
I'm working on the EverRise Press website. Please read the following files to get up to speed:

1. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/memory/project-handoff.md
2. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/AGENTS.md
3. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/README.md
4. /Users/iaevan/work/EverRise Press/EverRisePressLLC-Website/BOOK/brand-voice-systems.md

We're currently at Milestone 6 (Mailchimp Integration). I need to provide Mailchimp credentials before we can continue.

Please confirm you've read these files and are ready to continue.
```

---

## Current State Summary

**What's Done:**
- ✅ Next.js 16 + Cloudflare Workers infrastructure
- ✅ Cloudflare D1 database with full schema
- ✅ Author profile (Lamont D. McLeod) seeded
- ✅ Book (How To Have a Financial Heart Attack) seeded with Chapter 1
- ✅ Homepage, author page, book landing page built
- ✅ Multi-retailer modal (scales with new formats)
- ✅ JSON-LD structured data (Book, Organization, Person, WebSite schemas)
- ✅ Gated chapter reader with email capture
- ✅ Cloudflare Turnstile integration
- ✅ Lead capture API with JWT cookies
- ✅ Brand voice selected: System 4 (THE WAKE-UP CALL)

**What's Next:**
- ⏳ Milestone 6: Mailchimp integration (waiting for credentials)
- ⏳ Milestone 7: Podcast referral engine
- ⏳ Milestone 8: Admin dashboard
- ⏳ Milestone 9: Advanced SEO + analytics
- ⏳ Milestone 10: Polish + launch

**Immediate Blocker:**
Need Mailchimp credentials:
- API key
- Audience ID
- Server prefix (e.g., `us21`)

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `AGENTS.md` | Full project blueprint (10 sections) |
| `README.md` | Progress checklist (supervisors check this) |
| `memory/project-handoff.md` | Detailed handoff notes |
| `BOOK/brand-voice-systems.md` | All 5 voice systems (System 4 selected) |
| `wrangler.jsonc` | Cloudflare Workers config |
| `.dev.vars` | Local environment variables |
| `src/lib/db/schema.ts` | Database schema (7 tables) |
| `src/app/page.tsx` | Homepage |
| `src/app/books/[slug]/page.tsx` | Book landing page |
| `src/app/api/lead/route.ts` | Lead capture API |

---

## Commands Cheat Sheet

```bash
# Development
npm run dev              # Next.js dev server
npm run preview          # Build + preview on Cloudflare Workers locally
npm run deploy           # Build + deploy to Cloudflare

# Database
npm run db:generate      # Generate migrations
npm run db:migrate:local   # Apply to local D1
npm run db:migrate:remote  # Apply to remote D1
npm run db:seed          # Seed database
npm run db:studio        # Open Drizzle Studio

# Other
npm run build            # Next.js build
npm run lint             # ESLint
npm run cf-typegen       # Regenerate Cloudflare types
```

---

## Important Context

1. **Brand Voice:** System 4 (THE WAKE-UP CALL) — provocative, punchy, pattern interrupts
2. **Design:** Ever Rise Gold (#D4AF37), Deep Charcoal (#1A1A1A), Cream Vellum (#F8F5EE)
3. **Fonts:** Spectral SC (headings), Karla (body)
4. **Database:** Cloudflare D1 (SQLite) with Drizzle ORM
5. **Hosting:** Cloudflare Workers via @opennextjs/cloudflare
6. **Domain:** `everrisepressdev.workers.dev` (temporary, no custom domain yet)
7. **Git:** https://github.com/EVER-RISE-PRESS-LLC/EverRisePressLLC-Website
8. **Status:** 5/10 milestones complete, site NOT YET DEPLOYED

---

## If User Wants to Change Marketing Tone

All 5 voice systems are documented in `/BOOK/brand-voice-systems.md`:
1. THE RECKONING — Clinical, diagnostic
2. THE INHERITANCE — Narrative, generational
3. THE MENTOR'S DESK — Conversational, Socratic
4. THE WAKE-UP CALL — Provocative, jarring (CURRENT)
5. THE BLUEPRINT — Systematic, architectural

If switching voices, all copy needs rewriting:
- Homepage hero + sections
- Author bio
- Book landing page
- Email sequences (when built)
- Ad copy (when built)
