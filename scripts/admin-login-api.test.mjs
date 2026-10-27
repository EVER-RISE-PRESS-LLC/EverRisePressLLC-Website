import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";
import * as jose from "jose";

const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
function loadTypeScript(path, injected = {}) {
  const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const compiledModule = { exports: {} };
  new Function("require", "module", "exports", compiled)(name => name in injected ? injected[name] : require(name), compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
async function harness() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../migrations/0003_admin_publishing.sql", import.meta.url), "utf8"));
  const DB = { prepare(query) {
    const statement = sqlite.prepare(query); let values = [];
    return { bind(...bindings) { values = bindings; return this; }, async first() { return statement.get(...values) ?? null; }, async run() { return { success: true, meta: statement.run(...values) }; } };
  } };
  const cloud = { async getCloudflareContext() { return { env: { DB, JWT_SECRET: "local-login-api-test-only-signing-secret" } }; } };
  let fixtureUser;
  const dbModule = { getDb() { return { select() { return { from() { return { where(value) { return { limit() { return Promise.resolve(fixtureUser?.email === value ? [fixtureUser] : []); } }; } }; } }; } }; } };
  const api = loadTypeScript("../src/lib/admin/api.ts");
  const auth = loadTypeScript("../src/lib/auth.ts", { "@/lib/cloudflare-context": cloud, "@/lib/admin/api": api, "@/lib/db": dbModule, "@/lib/db/schema": { users: { email: "email", id: "id" } }, "drizzle-orm": { eq(_column, value) { return value; } }, jose });
  const password = "disposable original fixture password";
  fixtureUser = { id: "fixture-admin", email: "staff@example.invalid", name: "Fixture Staff", role: "ADMIN", passwordHash: await auth.hashPassword(password) };
  const route = loadTypeScript("../src/app/api/admin/login/route.ts", { "@/lib/cloudflare-context": cloud, "@/lib/db": dbModule, "@/lib/db/schema": { users: { email: "email" } }, "drizzle-orm": { eq(_column, value) { return value; } }, "@/lib/admin/api": api, "@/lib/auth": auth });
  return { sqlite, DB, auth, route, password, fixtureUser, close() { sqlite.close(); } };
}
function request(body, headers = {}) {
  return new NextRequest("https://example.test/api/admin/login", { method: "POST", headers: { "content-type": "application/json", origin: "https://example.test", "cf-connecting-ip": "192.0.2.20", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });
}

test("login API rejects bad types, malformed/oversized JSON, unsupported media and cross-origin requests before database work", async () => {
  const context = await harness();
  try {
    const valid = { email: context.fixtureUser.email, password: context.password };
    for (const [body, headers, expected] of [
      [{ email: {}, password: context.password }, {}, 400], [{ email: [valid.email], password: context.password }, {}, 400],
      [{ email: valid.email, password: 42 }, {}, 400], ["broken json", {}, 400], ["x".repeat(4097), {}, 413],
      [valid, { origin: "https://untrusted.example" }, 403], [valid, { "sec-fetch-site": "cross-site" }, 403],
      [valid, { "content-type": "text/plain" }, 415], [valid, { "content-type": "application/json-bogus" }, 415],
    ]) assert.equal((await context.route.POST(request(body, headers))).status, expected);
    assert.equal(context.sqlite.prepare("SELECT count(*) AS total FROM admin_login_limits").get().total, 0);
  } finally { context.close(); }
});

test("login keeps existing PBKDF credentials and session cookie behavior and gives generic failures for missing, wrong-password and nonstaff identities", async () => {
  const context = await harness();
  try {
    for (const body of [{ email: "missing@example.invalid", password: context.password }, { email: context.fixtureUser.email, password: "incorrect fixture input" }]) {
      const response = await context.route.POST(request(body)); assert.equal(response.status, 401); assert.equal((await response.json()).error, "Invalid email or password.");
    }
    context.fixtureUser.role = "PARTNER";
    const partner = await context.route.POST(request({ email: context.fixtureUser.email, password: context.password }));
    assert.equal(partner.status, 401); assert.equal((await partner.json()).error, "Invalid email or password.");
    context.fixtureUser.role = "ADMIN";
    const signedIn = await context.route.POST(request({ email: "  STAFF@EXAMPLE.INVALID ", password: context.password }));
    assert.equal(signedIn.status, 200); assert.equal(signedIn.headers.get("cache-control"), "private, no-store");
    const cookie = signedIn.headers.get("set-cookie");
    assert.match(cookie, /admin_session=/); assert.match(cookie, /HttpOnly/i); assert.match(cookie, /SameSite=Lax/i); assert.match(cookie, /Max-Age=604800/i);
    const token = cookie.match(/admin_session=([^;]+)/)[1]; assert.equal((await context.auth.verifySessionToken(token)).userId, context.fixtureUser.id);
    assert.equal(context.sqlite.prepare("SELECT count(*) AS total FROM admin_login_limits").get().total, 0);
    context.fixtureUser.role = "EDITOR";
    assert.equal((await context.route.POST(request({ email: context.fixtureUser.email, password: context.password }))).status, 200);
  } finally { context.close(); }
});

test("login limits hashed client addresses atomically, returns retry headers, expires buckets and clears successful attempts", async () => {
  const context = await harness();
  try {
    const incorrect = { email: context.fixtureUser.email, password: "incorrect fixture input" };
    const valid = { email: context.fixtureUser.email, password: context.password };
    for (let index = 0; index < 9; index++) assert.equal((await context.route.POST(request(incorrect))).status, 401);
    const locked = await context.route.POST(request(incorrect)); assert.equal(locked.status, 429); assert.ok(Number(locked.headers.get("retry-after")) > 0);
    assert.equal((await context.route.POST(request(valid))).status, 429);
    const row = context.sqlite.prepare("SELECT * FROM admin_login_limits").get();
    assert.equal(row.attempts, 10); assert.match(row.key, /^[a-f0-9]{64}$/); assert.deepEqual(Object.keys(row).sort(), ["attempts", "key", "resets_at"]);
    assert.equal((await context.route.POST(request(valid, { "cf-connecting-ip": "192.0.2.21" }))).status, 200);
    context.sqlite.prepare("UPDATE admin_login_limits SET resets_at = ?").run(Math.floor(Date.now() / 1000) - 1);
    assert.equal((await context.route.POST(request(valid))).status, 200);
    assert.equal(context.sqlite.prepare("SELECT count(*) AS total FROM admin_login_limits").get().total, 0);
    const concurrent = await Promise.all(Array.from({ length: 12 }, () => context.route.POST(request(incorrect))));
    assert.ok(concurrent.every(response => response.status === 401 || response.status === 429));
    assert.equal(context.sqlite.prepare("SELECT attempts FROM admin_login_limits").get().attempts, 10);
    assert.equal((await context.route.POST(request(valid))).status, 429);
  } finally { context.close(); }
});

test("sign-in service failures fail closed without logging request credentials or detailed errors", async () => {
  const context = await harness();
  const originalPrepare = context.DB.prepare;
  const originalError = console.error;
  const logged = [];
  try {
    context.DB.prepare = () => { throw new Error(`Detailed service failure ${context.fixtureUser.email} ${context.password}`); };
    console.error = (...values) => logged.push(values.join(" "));
    const response = await context.route.POST(request({ email: context.fixtureUser.email, password: context.password }));
    assert.equal(response.status, 503);
    assert.equal(logged.length, 1); assert.doesNotMatch(logged.join(" "), /staff@example|disposable original|Detailed service failure/);
  } finally { context.DB.prepare = originalPrepare; console.error = originalError; context.close(); }
});
