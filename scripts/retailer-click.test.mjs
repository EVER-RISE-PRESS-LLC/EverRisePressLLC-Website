import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = ts.transpileModule(readFileSync(new URL("../src/lib/retailer-click.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

function fixture({ analytics = true, clientFails = false } = {}) {
  const events = [], m = { exports: {} };
  const injected = {
    "./privacy-consent": { browserConsent: () => ({ analytics }) },
    "./conversion-attribution": { browserConversionAttribution: () => ({ landing_path: "/blog/payday-spending-patterns", conversion_path: "/books/book-a/preview" }) },
    "./gtag": { gtagEvent(...args) { if (clientFails) throw new Error("Optional analytics unavailable"); events.push(args); } },
  };
  new Function("require", "module", "exports", source)(name => injected[name], m, m.exports);
  return { track: m.exports.trackRetailerClick, events };
}

test("the shared retailer action retains the book, edition and article landing attribution", async () => {
  const originalFetch = globalThis.fetch, requests = [];
  globalThis.fetch = async (url, init) => { requests.push({ url, ...init }); return { ok: true }; };
  try {
    const { track, events } = fixture();
    track({ bookSlug: "book-a", distributor: "APPLE_BOOKS", formatType: "EBOOK" });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "/api/retailer-click");
    assert.equal(requests[0].keepalive, true);
    assert.deepEqual(JSON.parse(requests[0].body), { bookSlug: "book-a", retailer: "APPLE_BOOKS", formatType: "EBOOK", attribution: { landing_path: "/blog/payday-spending-patterns", conversion_path: "/books/book-a/preview" } });
    assert.equal(events.length, 1);
    assert.equal(events[0][0], "retailer_redirect_click");
    assert.equal(events[0][1].landing_path, "/blog/payday-spending-patterns");
    assert.equal(events[0][1].format_type, "EBOOK");
  } finally { globalThis.fetch = originalFetch; }
});

test("an analytics opt-out suppresses both retailer measurement destinations", () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("Opted-out request must not be sent"); };
  try {
    const { track, events } = fixture({ analytics: false });
    track({ bookSlug: "book-a", distributor: "APPLE_BOOKS", formatType: "EBOOK" });
    assert.equal(events.length, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test("failed optional measurement never throws into the retailer navigation", async () => {
  const originalFetch = globalThis.fetch;
  try {
    const { track } = fixture({ clientFails: true });
    const click = { bookSlug: "book-a", distributor: "APPLE_BOOKS", formatType: "EBOOK" };
    globalThis.fetch = () => { throw new Error("Browser network unavailable"); };
    assert.doesNotThrow(() => track(click));
    globalThis.fetch = async () => { throw new Error("Rejected network request"); };
    assert.doesNotThrow(() => track(click));
    await new Promise(resolve => setImmediate(resolve));
  } finally { globalThis.fetch = originalFetch; }
});
