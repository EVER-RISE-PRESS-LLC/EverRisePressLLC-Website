import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import { buildLeadWhere, csvCell, parseLeadFilters } from "../src/lib/admin/lead-filters.ts";
import { referralPartnerSchema, referralPartnerPatchSchema } from "../src/lib/admin/referral-validation.ts";

test("reader dates reject rollover and reversed ranges without throwing", () => {
  const invalid = parseLeadFilters({ from: "2026-02-30", to: "not-a-date" });
  assert.equal(invalid.filters.from, "");
  assert.equal(invalid.filters.to, "");
  assert.ok(invalid.notice);
  const reversed = parseLeadFilters({ from: "2026-10-27", to: "2026-10-01" });
  assert.equal(reversed.filters.from, "");
  assert.equal(reversed.filters.to, "");
  assert.ok(reversed.notice);
  assert.equal(parseLeadFilters({ from: "2024-02-29" }).filters.from, "2024-02-29");
});

test("reader filters tolerate repeated URL values and trim searches", () => {
  const parsed = parseLeadFilters({ q: "  person@example.test  ", book: ["unexpected", "repeated"] });
  assert.equal(parsed.filters.q, "person@example.test");
  assert.equal(parsed.filters.book, "");
});

test("reader query searches percent and underscore literally and includes the entire end day", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("CREATE TABLE leads (id TEXT, email TEXT, book_id TEXT, partner_id TEXT, created_at TEXT)");
    const insert = db.prepare("INSERT INTO leads VALUES (?, ?, ?, ?, ?)");
    insert.run("first", "reader_100%@example.test", "book-one", "partner-one", "2026-10-01 00:00:00");
    insert.run("last", "reader_100%@example.test", "book-one", "partner-one", "2026-10-27 23:59:59");
    insert.run("outside", "reader_100%@example.test", "book-one", "partner-one", "2026-10-28 00:00:00");
    insert.run("wildcard", "readerX100other@example.test", "book-one", "partner-one", "2026-10-15 12:00:00");
    insert.run("different-book", "reader_100%@example.test", "book-two", "partner-one", "2026-10-15 12:00:00");
    const { filters } = parseLeadFilters({ q: "reader_100%", book: "book-one", partner: "partner-one", from: "2026-10-01", to: "2026-10-27" });
    const query = new SQLiteSyncDialect().sqlToQuery(buildLeadWhere(filters));
    const rows = db.prepare(`SELECT l.id FROM leads l ${query.sql} ORDER BY l.id`).all(...query.params);
    assert.deepEqual(rows.map((row) => row.id), ["first", "last"]);
  } finally {
    db.close();
  }
});

test("CSV neutralizes spreadsheet formulas and escapes quotes and line breaks", () => {
  assert.equal(csvCell("=1+1"), "'=1+1");
  assert.equal(csvCell("  +SUM(1)"), "'  +SUM(1)");
  assert.equal(csvCell("@formula"), "'@formula");
  assert.equal(csvCell("\tvalue"), "'\tvalue");
  assert.equal(csvCell('a,"quoted"\r\nvalue'), '"a,""quoted""\r\nvalue"');
  assert.equal(csvCell("person@example.test"), "person@example.test");
  assert.equal(csvCell(null), "");
});

test("partner validation normalizes names and requires a usable, bounded link", () => {
  const valid = referralPartnerSchema.parse({ name: "  Example Podcast  ", slug: " EXAMPLE-PODCAST ", contactEmail: " HOST@EXAMPLE.TEST ", customUtm: " Launch " });
  assert.equal(valid.slug, "example-podcast");
  assert.equal(valid.contactEmail, "host@example.test");
  assert.equal(valid.name, "Example Podcast");
  assert.equal(valid.customUtm, "Launch");
  assert.equal(referralPartnerSchema.safeParse({ ...valid, slug: "broken--link" }).success, false);
  assert.equal(referralPartnerSchema.safeParse({ ...valid, slug: "a".repeat(101) }).success, false);
  assert.equal(referralPartnerSchema.safeParse({ ...valid, contactEmail: "not an email" }).success, false);
  assert.equal(referralPartnerPatchSchema.safeParse({ isActive: false }).success, true);
  assert.equal(referralPartnerPatchSchema.safeParse({ isActive: "false" }).success, false);
});
