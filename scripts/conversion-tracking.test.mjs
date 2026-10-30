import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";
const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
function load(path, injected = {}) {
  const output = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const m = { exports: {} };
  new Function("require", "module", "exports", output)(n => n in injected ? injected[n] : require(n), m, m.exports);
  return m.exports;
}
let analytics = true;
const attribution = load("../src/lib/conversion-attribution.ts", { "./privacy-consent": { browserConsent: () => ({ analytics }) } });
const { recordChapterLead } = load("../src/lib/lead-record.ts");
function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("CREATE TABLE leads (id TEXT PRIMARY KEY, email TEXT, book_id TEXT, partner_id TEXT, source_utm TEXT)");
  const DB = { prepare(query) { const statement = sqlite.prepare(query); let values = [];
    return { bind(...params) { values = params; return this; }, async run() { const r = statement.run(...values); return { success: true, meta: { changes: Number(r.changes) } }; } };
  } };
  return { sqlite, DB };
}

test("lead insertion is atomic, case insensitive, book scoped and preserves existing records", async () => {
  const { sqlite, DB } = database();
  try {
    const input = { email: "  Reader@Example.invalid  ", bookId: "book-a", partnerId: null, sourceUtm: null };
    const outcomes = await Promise.all(Array.from({ length: 20 }, () => recordChapterLead(DB, input)));
    assert.equal(outcomes.filter(Boolean).length, 1);
    assert.equal(sqlite.prepare("SELECT count(*) AS n FROM leads").get().n, 1);
    assert.equal(await recordChapterLead(DB, { ...input, email: "reader@example.invalid", partnerId: "partner-one" }), false);
    assert.equal(sqlite.prepare("SELECT partner_id FROM leads").get().partner_id, "partner-one");
    await recordChapterLead(DB, { ...input, partnerId: "partner-two" });
    assert.equal(sqlite.prepare("SELECT partner_id FROM leads").get().partner_id, "partner-one");
    assert.equal(await recordChapterLead(DB, { ...input, bookId: "book-b" }), true);
    sqlite.prepare("INSERT INTO leads VALUES (?, ?, ?, NULL, NULL)").run("legacy", " Mixed@Example.invalid ", "book-a");
    assert.equal(await recordChapterLead(DB, { ...input, email: "mixed@example.invalid" }), false);
    assert.equal(sqlite.prepare("SELECT email FROM leads WHERE id = 'legacy'").get().email, " Mixed@Example.invalid ");
  } finally { sqlite.close(); }
});

test("attribution discards sensitive query strings, private routes and cross-site fallback referrers", () => {
  assert.equal(attribution.publicTrackingPath("/blog/payday-spending-patterns?email=reader@example.invalid#private"), "/blog/payday-spending-patterns");
  for (const value of [null, {}, "/admin/articles/private", "/api/lead", "/blog/reader@example.invalid", "/books/book/preview/secret", "x".repeat(2049)]) assert.equal(attribution.publicTrackingPath(value), null);
  assert.deepEqual(attribution.conversionAttribution({}, "https://elsewhere.test/blog/private", "https://everrisepress.com"), { landing_path: null, conversion_path: null });
  assert.deepEqual(attribution.conversionAttribution({ landing_path: "/blog/a?token=secret" }, "https://everrisepress.com/books/book/preview?email=x", "https://everrisepress.com"), { landing_path: "/blog/a", conversion_path: "/books/book/preview" });
});

test("first landing survives navigation, clears on withdrawal and tolerates unavailable storage", () => {
  const before = globalThis.window;
  const values = new Map();
  try {
    globalThis.window = { location: { pathname: "/blog/a" }, sessionStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } };
    analytics = true;
    assert.equal(attribution.rememberLandingPath(), "/blog/a");
    window.location.pathname = "/books/book/preview";
    assert.deepEqual(attribution.browserConversionAttribution(), { landing_path: "/blog/a", conversion_path: "/books/book/preview" });
    analytics = false;
    assert.equal(attribution.rememberLandingPath(), null);
    assert.equal(values.size, 0);
    assert.deepEqual(attribution.browserConversionAttribution(), {});
    analytics = true;
    Object.defineProperty(window, "sessionStorage", { get() { throw new Error("blocked"); } });
    assert.equal(attribution.rememberLandingPath(), null);
  } finally { analytics = true; if (before === undefined) delete globalThis.window; else globalThis.window = before; }
});

test("retailer API records one event per intentional click, preserves attribution and respects opt-out", async () => {
  const records = [], events = [], pending = [];
  let permitted = true;
  const route = load("../src/app/api/retailer-click/route.ts", {
    "@/lib/cloudflare-context": { async getCloudflareContext() { return { env: { DB: {} }, ctx: { waitUntil(promise) { pending.push(promise); } } }; } },
    "@/lib/db": { getDb() { return {
      select() { return { from() { return { where() { return { limit() { return Promise.resolve([{ id: "book-a" }]); } }; } }; } }; },
      insert() { return { async values(value) { records.push(value); } }; },
    }; } },
    "@/lib/db/schema": { books: { id: "id", slug: "slug" }, referralPartners: {}, retailerClicks: {} },
    "drizzle-orm": { eq: () => true, and: () => true },
    "@/lib/referral": { REFERRAL_COOKIE_NAME: "partner", normalizePartnerSlug: x => x, hashIp: async () => "fixture-hash" },
    "@/lib/posthog": { getAnonymousId: () => ({ distinctId: "fixture-anonymous" }), async captureServerEvent(...args) { events.push(args); } },
    "@/lib/privacy-consent": { readPrivacyConsent: () => ({ analytics: permitted }) },
    "@/lib/conversion-attribution": attribution,
  });
  const request = overrides => new NextRequest("https://everrisepress.com/api/retailer-click", { method: "POST", headers: { "content-type": "application/json", referer: "https://everrisepress.com/books/book-a?email=private" }, body: JSON.stringify({ bookSlug: "book-a", retailer: "APPLE_BOOKS", formatType: "EBOOK", attribution: { landing_path: "/blog/a?email=private" }, ...overrides }) });
  assert.equal((await route.POST(request())).status, 200);
  await Promise.all(pending);
  assert.equal(records.length, 1); assert.equal(events.length, 1);
  assert.equal(events[0][2], "retailer_redirect_click");
  assert.equal(events[0][3].landing_path, "/blog/a");
  assert.equal(events[0][3].conversion_path, "/books/book-a");
  assert.doesNotMatch(JSON.stringify(events), /email=|private/);
  await route.POST(request()); await Promise.all(pending);
  assert.equal(records.length, 2); assert.equal(events.length, 2);
  assert.equal((await route.POST(request({ retailer: {} }))).status, 400);
  permitted = false;
  assert.equal((await route.POST(request())).status, 204);
  assert.equal(records.length, 2); assert.equal(events.length, 2);
});

test("lead API reports new versus returning readers without duplicate new-lead or advertising events", async () => {
  const { sqlite, DB } = database();
  const events = [], advertising = [], pending = [];
  let verified = true, failToken = false;
  const route = load("../src/app/api/lead/route.ts", {
    "@/lib/cloudflare-context": { async getCloudflareContext() { return { env: { DB, TURNSTILE_SECRET_KEY: "fixture", JWT_SECRET: "fixture" }, ctx: { waitUntil(promise) { pending.push(promise); } } }; } },
    "@/lib/db": { getDb() { return { select() { return { from() { return { where() { return { limit() { return Promise.resolve([{ id: "book-a", slug: "book-a" }]); } }; } }; } }; } }; } },
    "@/lib/db/schema": { books: { slug: "slug" }, referralPartners: {} },
    "drizzle-orm": { eq: () => true, and: () => true },
    "@/lib/turnstile": { verifyTurnstileToken: async () => verified },
    "@/lib/referral": { REFERRAL_COOKIE_NAME: "partner", normalizePartnerSlug: x => x },
    "@/lib/posthog": { getAnonymousId: () => ({ distinctId: "fixture-anonymous" }), async captureServerEvent(...args) { events.push(args); } },
    "@/lib/meta": { async sendMetaLeadEvent(input) { advertising.push(input); } },
    "@/lib/chapter-access": { CHAPTER_ACCESS_COOKIE: "chapter", CHAPTER_ACCESS_MAX_AGE: 604800, async createChapterAccessToken() { if (failToken) throw new Error("fixture signing failure"); return "fixture-token"; } },
    "@/lib/privacy-consent": { readPrivacyConsent: () => ({ analytics: true, advertising: true }) },
    "@/lib/conversion-attribution": attribution, "@/lib/lead-record": { recordChapterLead },
  });
  const request = overrides => new NextRequest("https://everrisepress.com/api/lead", { method: "POST", headers: { "content-type": "application/json", referer: "https://everrisepress.com/books/book-a/preview" }, body: JSON.stringify({ email: "reader@example.invalid", bookSlug: "book-a", turnstileToken: "fixture-token", attribution: { landing_path: "/blog/a?email=private" }, ...overrides }) });
  const originalError = console.error;
  try {
    const first = await route.POST(request());
    assert.deepEqual(await first.json(), { success: true, isNewLead: true });
    assert.match(first.headers.get("set-cookie"), /chapter=fixture-token/);
    const second = await route.POST(request({ email: "READER@example.invalid" }));
    assert.deepEqual(await second.json(), { success: true, isNewLead: false });
    await Promise.all(pending);
    assert.deepEqual(events.map(x => x[2]), ["lead_generated", "chapter_access_renewed"]);
    assert.equal(advertising.length, 1);
    assert.equal(events[0][3].landing_path, "/blog/a");
    assert.equal(events[0][3].conversion_path, "/books/book-a/preview");
    assert.doesNotMatch(JSON.stringify(events), /reader@|email=|private/);
    verified = false;
    assert.equal((await route.POST(request({ email: "other@example.invalid" }))).status, 403);
    verified = true; failToken = true; console.error = () => {};
    assert.equal((await route.POST(request({ email: "other@example.invalid" }))).status, 500);
    assert.equal(sqlite.prepare("SELECT count(*) AS n FROM leads").get().n, 1);
    assert.equal(events.length, 2);
    assert.equal((await route.POST(request({ email: {} }))).status, 400);
  } finally { console.error = originalError; sqlite.close(); }
});
