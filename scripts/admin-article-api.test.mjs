import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";
import * as jose from "jose";
import * as store from "../src/lib/blog/store.ts";
import { createEmptyArticle } from "../src/lib/blog/model.ts";

const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
function loadTypeScript(path, injected = {}) {
  const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const compiledModule = { exports: {} };
  new Function("require", "module", "exports", compiled)(name => name in injected ? injected[name] : require(name), compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
function harness() {
  const sqlite = new DatabaseSync(":memory:");
  for (const migration of ["0003_admin_publishing.sql", "0004_article_publication_history.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
  const DB = { prepare(query) {
    const statement = sqlite.prepare(query); let values = [];
    return { bind(...bindings) { values = bindings; return this; }, async first() { return statement.get(...values) ?? null; }, async all() { return { results: statement.all(...values), success: true }; }, async run() { return { success: true, meta: statement.run(...values) }; } };
  } };
  const cloud = { async getCloudflareContext() { return { env: { DB, JWT_SECRET: "local-article-api-test-only-signing-secret" } }; } };
  const identities = new Map(["ADMIN", "EDITOR", "PARTNER"].map(role => [role.toLowerCase(), { id: role.toLowerCase(), name: `${role} fixture`, email: `${role.toLowerCase()}@example.invalid`, role }]));
  const dbModule = { getDb() { return { select() { return { from() { return { where(id) { return { limit() { return Promise.resolve(identities.has(id) ? [identities.get(id)] : []); } }; } }; } }; } }; } };
  const api = loadTypeScript("../src/lib/admin/api.ts");
  // Exercise actual session/JWT/role checks. Only the fixture-user lookup is
  // substituted; the article store runs its real SQL against disposable SQLite.
  const auth = loadTypeScript("../src/lib/auth.ts", { "@opennextjs/cloudflare": cloud, "@/lib/admin/api": api, "@/lib/db": dbModule, "@/lib/db/schema": { users: { id: "id" } }, "drizzle-orm": { eq(_column, id) { return id; } }, jose });
  const injected = { "@opennextjs/cloudflare": cloud, "@/lib/auth": auth, "@/lib/admin/api": api, "@/lib/blog/store": store };
  return { sqlite, auth, collection: loadTypeScript("../src/app/api/admin/articles/route.ts", injected), item: loadTypeScript("../src/app/api/admin/articles/[id]/route.ts", injected), close() { sqlite.close(); } };
}
async function request(context, method, payload, { role = "admin", headers = {}, query = "" } = {}) {
  const token = role ? await context.auth.createSessionToken(role) : null;
  return new NextRequest(`https://example.test/api/admin/articles${query}`, { method, headers: { "content-type": "application/json", origin: "https://example.test", ...(token ? { cookie: `admin_session=${token}` } : {}), ...headers }, ...(method === "GET" ? {} : { body: typeof payload === "string" ? payload : JSON.stringify(payload) }) });
}

test("article API enforces actual sessions, staff roles, same-origin mutations, and bounded typed JSON", async () => {
  const context = harness();
  try {
    for (const role of [null, "partner", "missing-user"]) {
      assert.equal((await context.collection.GET(await request(context, "GET", undefined, { role }))).status, 401);
      assert.equal((await context.collection.POST(await request(context, "POST", { document: createEmptyArticle() }, { role }))).status, 401);
    }
    assert.equal((await context.collection.GET(await request(context, "GET", undefined, { headers: { cookie: "admin_session=forged" } }))).status, 401);
    for (const options of [{ headers: { origin: "https://untrusted.example" } }, { headers: { "sec-fetch-site": "cross-site" } }]) assert.equal((await context.collection.POST(await request(context, "POST", { document: createEmptyArticle() }, options))).status, 403);
    assert.equal((await context.collection.POST(await request(context, "POST", "not json"))).status, 422);
    assert.equal((await context.collection.POST(await request(context, "POST", { document: { title: {} } }))).status, 422);
    assert.equal((await context.collection.POST(await request(context, "POST", { document: createEmptyArticle() }, { headers: { "content-type": "text/plain" } }))).status, 415);
    assert.equal((await context.collection.POST(await request(context, "POST", "x".repeat(250_001)))).status, 413);
    assert.equal(context.sqlite.prepare("SELECT count(*) AS count FROM articles").get().count, 0);
    for (const role of ["admin", "editor"]) assert.equal((await context.collection.POST(await request(context, "POST", { document: { ...createEmptyArticle(), slug: `${role}-draft` } }, { role }))).status, 201);
    const listed = await context.collection.GET(await request(context, "GET"));
    assert.equal(listed.status, 200); assert.equal(listed.headers.get("cache-control"), "private, no-store"); assert.equal((await listed.json()).articles.length, 2);
  } finally { context.close(); }
});

test("article API distinguishes address conflicts from stale revision and supports archived recovery", async () => {
  const context = harness();
  try {
    const document = { ...createEmptyArticle(), slug: "api-draft", title: "API draft" };
    const created = await context.collection.POST(await request(context, "POST", { document }));
    let article = (await created.json()).article;
    const duplicate = await context.collection.POST(await request(context, "POST", { document }));
    assert.equal(duplicate.status, 409); assert.equal((await duplicate.json()).code, "SLUG_CONFLICT");
    const params = { params: Promise.resolve({ id: article.id }) };
    assert.equal((await context.item.GET(await request(context, "GET", undefined, { role: null }), params)).status, 401);
    assert.equal((await context.item.PATCH(await request(context, "PATCH", { action: "save", revision: 1, document }, { headers: { origin: "https://other.example" } }), params)).status, 403);
    assert.equal((await context.item.PATCH(await request(context, "PATCH", { action: "save", revision: "1", document }), params)).status, 422);
    assert.equal((await context.item.PATCH(await request(context, "PATCH", "broken"), params)).status, 422);
    assert.equal((await context.item.PATCH(await request(context, "PATCH", "x".repeat(250_001)), params)).status, 413);
    const saved = await context.item.PATCH(await request(context, "PATCH", { action: "save", revision: article.revision, document: { ...document, title: "Revised API draft" } }, { role: "editor" }), params);
    assert.equal(saved.status, 200); article = (await saved.json()).article;
    const stale = await context.item.PATCH(await request(context, "PATCH", { action: "save", revision: 1, document }), params);
    assert.equal(stale.status, 409); assert.equal((await stale.json()).code, "REVISION_CONFLICT");
    const publication = await context.item.PATCH(await request(context, "PATCH", { action: "publish", revision: article.revision, reviewConfirmed: true }), params);
    assert.equal(publication.status, 422); assert.ok((await publication.json()).issues.length > 1);
    const archived = await context.item.PATCH(await request(context, "PATCH", { action: "archive", revision: article.revision }), params);
    assert.equal(archived.status, 200); article = (await archived.json()).article; assert.ok(article.archivedAt);
    assert.equal((await (await context.collection.GET(await request(context, "GET"))).json()).articles.length, 0);
    assert.equal((await (await context.collection.GET(await request(context, "GET", undefined, { query: "?includeArchived=true" }))).json()).articles.length, 1);
    const restored = await context.item.PATCH(await request(context, "PATCH", { action: "restore", revision: article.revision }), params);
    assert.equal(restored.status, 200); assert.equal((await restored.json()).article.archivedAt, null);
  } finally { context.close(); }
});
