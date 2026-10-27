import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { adminJson, readBoundedJson, sameOrigin } from "@/lib/admin/api";
import { SESSION_COOKIE_NAME, createSessionToken, sessionCookieOptions, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FAILURES = 10;
const WINDOW_SECONDS = 15 * 60;
// Spend the same password-verification work when an email does not exist.
const DUMMY_HASH = `pbkdf2$sha256$100000$${"00".repeat(16)}$${"00".repeat(32)}`;
type LoginLimit = { attempts: number; resets_at: number };

async function clientKey(request: NextRequest) {
  // Cloudflare sets CF-Connecting-IP at the edge. Do not trust arbitrary
  // forwarded headers or store a raw address/account email in the limit table.
  const address = request.headers.get("cf-connecting-ip")?.trim().slice(0, 128) || "local";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`everrise-admin-login:${address}`));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function limitedResponse(resetsAt: number, now: number) {
  const response = adminJson({ error: "Too many sign-in attempts. Wait a few minutes, then try again." }, 429);
  response.headers.set("Retry-After", String(Math.max(1, Math.ceil(resetsAt - now))));
  return response;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return adminJson({ error: "Open the EverRise Press sign-in page and try again." }, 403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return adminJson({ error: "Send the email and password as JSON." }, 415);
  }
  let input: unknown;
  try { input = await readBoundedJson(request, 4096); }
  catch (error) {
    if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") return adminJson({ error: "This sign-in request is too large." }, 413);
    return adminJson({ error: "Could not read this sign-in request. Please try again." }, 400);
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) return adminJson({ error: "Enter your email and password." }, 400);
  const body = input as Record<string, unknown>;
  if (typeof body.email !== "string" || typeof body.password !== "string") return adminJson({ error: "Enter your email and password." }, 400);
  const email = body.email.trim().toLowerCase();
  const password = body.password;
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length > 2048) {
    return adminJson({ error: "Enter a valid email address and your password." }, 400);
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const now = Math.floor(Date.now() / 1000);
    const key = await clientKey(request);
    await env.DB.prepare("DELETE FROM admin_login_limits WHERE resets_at <= ?").bind(now).run();
    const limit = await env.DB.prepare("SELECT attempts, resets_at FROM admin_login_limits WHERE key = ?").bind(key).first<LoginLimit>();
    if (limit && Number(limit.attempts) >= MAX_FAILURES) return limitedResponse(Number(limit.resets_at), now);

    const db = getDb(env.DB);
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1).then(rows => rows[0]);
    const passwordValid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !passwordValid || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      // The upsert increments in D1, so concurrent failures cannot overwrite
      // one another or perpetually move the end of an active lockout window.
      const failed = await env.DB.prepare(`INSERT INTO admin_login_limits (key, attempts, resets_at) VALUES (?, 1, ?)
        ON CONFLICT(key) DO UPDATE SET
          attempts = CASE WHEN resets_at <= ? THEN 1 ELSE MIN(attempts + 1, ?) END,
          resets_at = CASE WHEN resets_at <= ? THEN excluded.resets_at ELSE resets_at END
        RETURNING attempts, resets_at`).bind(key, now + WINDOW_SECONDS, now, MAX_FAILURES, now).first<LoginLimit>();
      if (failed && Number(failed.attempts) >= MAX_FAILURES) return limitedResponse(Number(failed.resets_at), now);
      return adminJson({ error: "Invalid email or password." }, 401);
    }

    const token = await createSessionToken(user.id);
    await env.DB.prepare("DELETE FROM admin_login_limits WHERE key = ?").bind(key).run();
    const response: NextResponse = adminJson({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    return response;
  } catch (error) {
    // Never log the request body, password, email, database row, or error text.
    console.error("Admin sign-in service failure", error instanceof Error ? error.name : "UnknownError");
    return adminJson({ error: "Sign-in is temporarily unavailable. Please try again in a moment." }, 503);
  }
}
