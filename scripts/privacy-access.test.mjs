import { test } from "node:test";
import assert from "node:assert/strict";
import { SignJWT, decodeJwt } from "jose";
import { createChapterAccessToken, hasChapterAccess, CHAPTER_ACCESS_MAX_AGE } from "../src/lib/chapter-access.ts";
import { readPrivacyConsent, consentCookieValue } from "../src/lib/privacy-consent.ts";

const secret = "local-test-only-not-a-production-secret";
const key = new TextEncoder().encode(secret);

test("chapter access is scoped to a book, expires in seven days, and contains no email", async () => {
  const token = await createChapterAccessToken("book-one", secret);
  const payload = decodeJwt(token);
  assert.deepEqual(Object.keys(payload).sort(), ["bookSlug", "exp", "iat"]);
  assert.equal(payload.exp - payload.iat, CHAPTER_ACCESS_MAX_AGE);
  assert.equal(await hasChapterAccess(token, "book-one", secret), true);
  assert.equal(await hasChapterAccess(token, "other-book", secret), false);
  assert.equal(await hasChapterAccess(token, "book-one", "wrong-secret"), false);
});

test("missing, forged, expired, and non-expiring access cookies fail closed", async () => {
  const expired = await new SignJWT({ bookSlug: "book-one" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime(1).sign(key);
  const noExpiry = await new SignJWT({ bookSlug: "book-one" }).setProtectedHeader({ alg: "HS256" }).sign(key);
  for (const token of [undefined, "valid", "not.a.jwt", expired, noExpiry]) {
    assert.equal(await hasChapterAccess(token, "book-one", secret), false);
  }
  const token = await createChapterAccessToken("book-one", secret);
  const parts = token.split(".");
  parts[1] = Buffer.from(JSON.stringify({ ...decodeJwt(token), bookSlug: "other-book" })).toString("base64url");
  assert.equal(await hasChapterAccess(parts.join("."), "other-book", secret), false);
  assert.equal(await hasChapterAccess(token, "book-one", undefined), false);
  await assert.rejects(createChapterAccessToken("book-one", ""));
});

test("existing signed cookies continue to work without using their legacy email field", async () => {
  const legacy = await new SignJWT({ bookSlug: "book-one", email: "fixture@example.invalid" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(key);
  assert.equal(await hasChapterAccess(legacy, "book-one", secret), true);
});

test("tracking defaults off for missing, malformed, or lookalike consent cookies", () => {
  for (const header of [null, undefined, "", "everrise_privacy=true", "everrise_privacy=v1.1.1extra", "everrise_privacy=v2.1.1", "other_everrise_privacy=v1.1.1", "everrise_privacy=v1.2.1"]) {
    assert.deepEqual(readPrivacyConsent(header), { analytics: false, advertising: false });
    assert.equal(consentCookieValue(header), "");
  }
});

test("analytics and advertising choices are independent and survive unrelated cookies", () => {
  assert.deepEqual(readPrivacyConsent("one=x; everrise_privacy=v1.1.0; two=y"), { analytics: true, advertising: false });
  assert.deepEqual(readPrivacyConsent("everrise_privacy=v1.0.1"), { analytics: false, advertising: true });
  assert.deepEqual(readPrivacyConsent("everrise_privacy=v1.0.0"), { analytics: false, advertising: false });
  assert.deepEqual(readPrivacyConsent("everrise_privacy=v1.1.1"), { analytics: true, advertising: true });
});
