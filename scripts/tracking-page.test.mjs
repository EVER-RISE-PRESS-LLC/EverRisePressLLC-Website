import test from "node:test";
import assert from "node:assert/strict";
import { canTrackPage, subscribeTrackingPageGuard } from "../src/lib/tracking-page.ts";
import { browserConsent } from "../src/lib/privacy-consent.ts";

test("tracking excludes staff routes and local hosts while allowing public pages", () => {
  for (const hostname of ["localhost", "preview.localhost", "127.0.0.1", "127.0.0.2", "::1", "[::1]", "0.0.0.0"]) {
    assert.equal(canTrackPage({ hostname, pathname: "/blog/public-article" }), false, hostname);
  }
  for (const pathname of ["/admin", "/admin/login", "/admin/articles/private-draft", "/%61dmin/articles/private-draft"]) {
    assert.equal(canTrackPage({ hostname: "everrisepress.com", pathname }), false, pathname);
  }
  assert.equal(canTrackPage({ hostname: "everrisepress.com", pathname: "/blog/public-article" }), true);
  assert.equal(canTrackPage({ hostname: "everrisepress.com", pathname: "/administrator-not-a-staff-route" }), true);
});

test("public tracking defaults and saved opt-outs survive the staff/local guard", () => {
  const previousLocation = globalThis.location;
  const previousDocument = globalThis.document;
  try {
    globalThis.location = new URL("https://everrisepress.com/blog");
    globalThis.document = { cookie: "" };
    assert.deepEqual(browserConsent(), { analytics: true, advertising: true });
    document.cookie = "everrise_privacy=v1.0.1";
    assert.deepEqual(browserConsent(), { analytics: false, advertising: true });
    globalThis.location = new URL("https://everrisepress.com/admin/articles/private-draft");
    assert.deepEqual(browserConsent(), { analytics: false, advertising: false });
    globalThis.location = new URL("http://localhost:3000/blog");
    assert.deepEqual(browserConsent(), { analytics: false, advertising: false });
    globalThis.location = new URL("https://everrisepress.com/blog");
    assert.deepEqual(browserConsent(), { analytics: false, advertising: true });
    assert.equal(document.cookie, "everrise_privacy=v1.0.1");
  } finally {
    if (previousLocation === undefined) delete globalThis.location; else globalThis.location = previousLocation;
    if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument;
  }
});

test("history guard notifies SDKs before the browser enters a draft URL", () => {
  const previousWindow = globalThis.window;
  const browser = new EventTarget();
  browser.location = new URL("https://everrisepress.com/blog");
  const navigate = (_state, _unused, url) => { browser.location = new URL(url, browser.location); };
  browser.history = { pushState: navigate, replaceState: navigate };
  globalThis.window = browser;
  let unsubscribe;
  try {
    const changes = [];
    unsubscribe = subscribeTrackingPageGuard((page) => changes.push({ allowed: canTrackPage(page), current: browser.location.pathname, destination: page.pathname }));
    browser.history.pushState({}, "", "/admin/articles/private-draft");
    assert.deepEqual(changes.at(-1), { allowed: false, current: "/blog", destination: "/admin/articles/private-draft" });
    browser.history.replaceState({}, "", "/blog/public-article");
    assert.deepEqual(changes.at(-1), { allowed: true, current: "/admin/articles/private-draft", destination: "/blog/public-article" });
    unsubscribe();
    unsubscribe = undefined;
    assert.equal(browser.history.pushState, navigate);
    assert.equal(browser.history.replaceState, navigate);
  } finally {
    unsubscribe?.();
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
  }
});
