// Real handlers and SQL, disposable Miniflare D1 only. Never reads live credentials.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { checkedOrigin, publishingClient } from "./lib/publishing-client.mjs";

const require = createRequire(import.meta.url);
const { build } = require("esbuild"), { Miniflare, convertV4MiniflareOptions } = require("miniflare");
const project = fileURLToPath(new URL("..", import.meta.url));
let checks = 0;
const check = Object.fromEntries(["equal", "deepEqual", "ok", "match", "throws", "rejects"].map(method => [method, (...args) => { checks++; return assert[method](...args); }]));
const folder = await mkdtemp(project + "/.agent-check-");
let mf;
try {
  await build({ absWorkingDir: project, entryPoints: ["src/lib/agent/handler.ts"], outfile: folder + "/handler.cjs", bundle: true, platform: "node", format: "cjs", packages: "external", logLevel: "silent" });
  const { handleAgentRequest } = require(folder + "/handler.cjs");
  mf = new Miniflare((typeof convertV4MiniflareOptions === "function" ? convertV4MiniflareOptions : v => v)({ name: "agent-fixture", modules: true, script: 'export default {fetch(){return new Response("fixture")}}', d1Databases: ["DB"] }));
  const DB = await mf.getD1Database("DB");
  for (const file of (await readdir(project + "/migrations")).filter(name => name.endsWith(".sql")).sort()) await DB.exec((await readFile(project + "/migrations/" + file, "utf8")).replace(/--[^\n]*/g, "").replace(/\n/g, " "));
  const scopes = ["articles:read", "articles:write", "articles:publish", "media:read", "media:write", "media:delete"];
  async function credential(permissions = scopes, expires = new Date(Date.now() + 86_400_000).toISOString()) {
    const id = randomUUID(), token = `erp_${id}.${randomBytes(32).toString("base64url")}`;
    await DB.prepare("INSERT INTO agent_credentials (id,name,token_hash,scopes,created_at,expires_at) VALUES (?,?,?,?,?,?)")
      .bind(id, "Local QA publishing agent", createHash("sha256").update(token).digest("hex"), JSON.stringify(permissions), new Date().toISOString(), expires).run();
    return { id, token };
  }
  const main = await credential();
  async function call(path, { method = "GET", json, body, headers = {}, key = main } = {}) {
    const request = new Request("http://localhost/api/agent/v1" + path, { method, headers: { ...(key ? { authorization: "Bearer " + key.token } : {}), ...(json !== undefined ? { "content-type": "application/json" } : {}), ...headers }, body: json !== undefined ? JSON.stringify(json) : body });
    const response = await handleAgentRequest(request, DB, path.split("?")[0].slice(1).split("/"));
    return { status: response.status, headers: response.headers, body: await response.json() };
  }
  check.equal((await call("/me", { key: null })).status, 401);
  check.equal((await call("/me", { key: null, headers: { cookie: "admin_session=fixture" } })).status, 401);
  check.equal((await call("/me", { key: { token: main.token.slice(0, -1) + (main.token.endsWith("a") ? "b" : "a") } })).status, 401);
  check.equal((await call("/me", { key: await credential(scopes, "2020-01-01T00:00:00.000Z") })).status, 401);
  const revoked = await credential(); await DB.prepare("UPDATE agent_credentials SET revoked_at = ? WHERE id = ?").bind(new Date().toISOString(), revoked.id).run();
  check.equal((await call("/me", { key: revoked })).status, 401);
  check.equal((await call("/me", { headers: { origin: "https://everrisepress.com" } })).status, 403);
  check.equal((await call("/me", { headers: { "sec-fetch-site": "cross-site" } })).status, 403);
  const me = await call("/me"); check.equal(me.status, 200); check.equal(me.body.agent.name, "Local QA publishing agent");
  check.equal(me.headers.get("cache-control"), "private, no-store"); check.match(me.headers.get("x-robots-tag"), /noindex/);
  check.equal(me.body.agent.token, undefined); check.equal(me.body.agent.token_hash, undefined);
  check.equal((await call("/leads")).status, 404); check.equal((await call("/credentials")).status, 404);
  check.equal((await call("/schema")).status, 200);
  const readOnly = await credential(["articles:read", "media:read"]);
  check.equal((await call("/articles", { method: "POST", key: readOnly, json: { document: {} } })).status, 403);
  check.equal((await call("/media", { method: "POST", key: readOnly })).status, 403);
  check.equal((await call("/articles", { method: "POST", json: { document: {} } })).body.code, "SLUG_REQUIRED");
  check.equal((await call("/articles", { method: "POST", body: "{}" })).status, 415);
  check.equal((await call("/articles", { method: "POST", body: "x".repeat(250_001), headers: { "content-type": "application/json" } })).status, 413);
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aYoQAAAAASUVORK5CYII=", "base64");
  const imageRequest = { method: "POST", body: png, headers: { "content-type": "image/png", "x-file-name": "local-qa.png" } };
  const uploads = await Promise.all([call("/media", imageRequest), call("/media", imageRequest)]);
  check.deepEqual(uploads.map(result => result.status).sort(), [200, 201]);
  const image = uploads[0].body.image; check.equal(image.id, uploads[1].body.image.id);
  check.equal((await call("/media", imageRequest)).body.reused, true);
  check.equal((await call("/media")).body.images.length, 1);
  check.equal((await call("/media", { ...imageRequest, body: "<svg/>" })).status, 400);
  check.equal((await call("/media", { ...imageRequest, headers: { "content-type": "image/jpeg" } })).status, 400);
  check.equal((await call("/media", { ...imageRequest, body: Buffer.alloc(512001) })).status, 413);
  const actualBytes = await DB.prepare("SELECT data FROM media WHERE id = ?").bind(image.id).first();
  check.deepEqual(Buffer.from(actualBytes.data), png);
  const document = {
    slug: "local-agent-article", title: "Local agent article", description: "This is an isolated publishing test with enough description text to meet the editorial gate.", section: "Local QA",
    author: { type: "Organization", name: "EverRise Press", url: "/about", confirmed: true }, imageUrl: image.url, imageAlt: "Local QA image", blocks: [{ type: "richtext", html: "<p>This article is a local test. It checks the actual draft and publication behavior, including safe content and exact revisions.</p><script>bad()</script>" }],
    sources: [{ id: "fixture", title: "Local fixture source", url: "https://example.invalid/source" }], editorialNotes: "PRIVATE LOCAL QA NOTE",
  };
  const created = await call("/articles", { method: "POST", json: { document } });
  check.equal(created.status, 201); let article = created.body.article;
  check.equal(article.isLive, false); check.equal(article.blocks[0].html.includes("<script>"), false);
  check.equal((await call("/articles", { method: "POST", json: { document } })).body.code, "SLUG_CONFLICT");
  check.equal((await call(`/media/${image.id}`, { method: "DELETE" })).status, 409);
  const checked = await call(`/articles/${article.id}/validate`, { method: "POST" });
  check.equal(checked.body.valid, true); check.equal(checked.body.revision, article.revision);
  check.equal((await call(`/articles/${article.id}`, { method: "PATCH", key: readOnly, json: { action: "publish", revision: article.revision, reviewConfirmed: true } })).status, 403);
  const draftOnly = await credential(["articles:read", "articles:write"]);
  for (const action of ["publish", "archive", "restore", "unpublish"]) check.equal((await call(`/articles/${article.id}`, { method: "PATCH", key: draftOnly, json: { action, revision: article.revision, reviewConfirmed: true } })).status, 403);
  check.equal((await call(`/articles/${article.id}`, { method: "PATCH", json: { action: "publish", revision: article.revision } })).status, 422);
  const live = await call(`/articles/${article.id}`, { method: "PATCH", json: { action: "publish", revision: article.revision, reviewConfirmed: true } });
  check.equal(live.status, 200); article = live.body.article;
  check.equal(article.isLive, true); check.equal(article.review.by, "Local QA publishing agent");
  const originalPublication = article.publishedAt;
  const rowBefore = await DB.prepare("SELECT published_document FROM articles WHERE id = ?").bind(article.id).first();
  check.equal(JSON.parse(rowBefore.published_document).editorialNotes, "");
  check.equal((await call(`/articles/${article.id}`, { method: "PATCH", json: { action: "save", revision: 1, document } })).body.code, "REVISION_CONFLICT");
  const saved = await call(`/articles/${article.id}`, { method: "PATCH", key: draftOnly, json: { action: "save", revision: article.revision, document: { ...document, title: "Updated local draft" } } });
  check.equal(saved.status, 200); article = saved.body.article; check.equal(article.hasUnpublishedChanges, true);
  check.equal((await DB.prepare("SELECT published_document FROM articles WHERE id = ?").bind(article.id).first()).published_document, rowBefore.published_document);
  check.equal((await call(`/articles/${article.id}`, { method: "PATCH", json: { action: "publish", revision: article.revision - 1, reviewConfirmed: true } })).status, 409);
  article = (await call(`/articles/${article.id}`, { method: "PATCH", json: { action: "publish", revision: article.revision, reviewConfirmed: true } })).body.article;
  check.equal(article.publishedAt, originalPublication); check.equal(article.title, "Updated local draft");
  const republished = await call(`/articles/${article.id}`, { method: "PATCH", json: { action: "publish", revision: article.revision, reviewConfirmed: true } });
  check.equal(republished.body.article.updatedAt, article.updatedAt); article = republished.body.article;
  check.equal((await call(`/articles/${article.id}`, { method: "PATCH", json: { action: "save", revision: article.revision, document: { ...document, slug: "changed-address" } } })).status, 409);
  article = (await call(`/articles/${article.id}`, { method: "PATCH", json: { action: "archive", revision: article.revision } })).body.article;
  check.equal(article.isLive, false); check.ok(article.archivedAt);
  check.equal((await call(`/media/${image.id}`, { method: "DELETE" })).status, 409);
  check.equal((await call(`/articles/${article.id}/validate`, { method: "POST" })).body.valid, false);
  article = (await call(`/articles/${article.id}`, { method: "PATCH", json: { action: "restore", revision: article.revision } })).body.article;
  check.equal(article.isLive, true);
  article = (await call(`/articles/${article.id}`, { method: "PATCH", json: { action: "unpublish", revision: article.revision } })).body.article;
  check.equal(article.isLive, false); check.equal(article.everPublishedAt, originalPublication);
  // Two production articles have legacy IDs from the original brief importer.
  await DB.prepare("UPDATE articles SET id = 'brief-local-test' WHERE id = ?").bind(article.id).run();
  check.equal((await call("/articles/brief-local-test")).status, 200);
  check.equal((await call("/articles?slug=brief-local-test")).body.articles[0].id, "brief-local-test");
  const audit = await call("/audit"); check.equal(audit.status, 200);
  check.ok(audit.body.requests.some(row => row.action === "articles.publish" && row.status === 200));
  check.ok(audit.body.requests.some(row => row.status === 409));
  const storedAudit = JSON.stringify((await DB.prepare("SELECT * FROM agent_audit_log").all()).results);
  check.equal(storedAudit.includes(main.token), false); check.equal(storedAudit.includes("PRIVATE LOCAL QA NOTE"), false);
  check.equal(storedAudit.includes("Updated local draft"), false);
  await DB.prepare("DELETE FROM articles WHERE id = 'brief-local-test'").run();
  check.equal((await call(`/media/${image.id}`, { method: "DELETE", key: readOnly })).status, 403);
  check.equal((await call(`/media/${image.id}`, { method: "DELETE" })).status, 200);
  const rateKey = await credential();
  await DB.prepare("UPDATE agent_credentials SET rate_window = ?, rate_count = 59 WHERE id = ?").bind(Math.floor(Date.now() / 60_000), rateKey.id).run();
  const limited = await Promise.all([call("/me", { key: rateKey }), call("/me", { key: rateKey })]);
  check.deepEqual(limited.map(row => row.status).sort(), [200, 429]);
  check.equal(limited.find(row => row.status === 429).headers.get("retry-after"), "60");
  check.throws(() => checkedOrigin("https://attacker.invalid")); check.throws(() => checkedOrigin("https://everrisepress.com@attacker.invalid"));
  check.throws(() => checkedOrigin("http://everrisepress.com")); check.equal(checkedOrigin("https://everrisepress.com"), "https://everrisepress.com");
  await check.rejects(publishingClient({ baseUrl: "http://localhost", token: "fixture" })("//attacker.invalid"));
  console.log(`PASS: ${checks} isolated publishing assertions (authentication, scopes, revocation, expiry, real D1 writes, deduplication, editorial gates, live/draft isolation, legacy IDs, audit, rate limits and credential origin protection).`);
} finally {
  if (mf) await mf.dispose();
  await rm(folder, { recursive: true, force: true });
}
