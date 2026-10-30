import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getDb } from "@/lib/db";
import { books, referralPartners } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { REFERRAL_COOKIE_NAME, normalizePartnerSlug } from "@/lib/referral";
import { captureServerEvent, getAnonymousId } from "@/lib/posthog";
import { sendMetaLeadEvent } from "@/lib/meta";
import { CHAPTER_ACCESS_COOKIE, CHAPTER_ACCESS_MAX_AGE, createChapterAccessToken } from "@/lib/chapter-access";
import { readPrivacyConsent } from "@/lib/privacy-consent";
import { conversionAttribution } from "@/lib/conversion-attribution";
import { recordChapterLead } from "@/lib/lead-record";

export const runtime = "nodejs";

interface LeadRequestBody {
  email: string;
  bookSlug: string;
  turnstileToken: string;
  attribution?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LeadRequestBody;
    const { email, bookSlug, turnstileToken } = body;

    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || typeof bookSlug !== "string" || !bookSlug || typeof turnstileToken !== "string" || !turnstileToken) {
      return NextResponse.json(
        { error: "Email, book slug, and verification token are required." },
        { status: 400 }
      );
    }

    const { env, ctx } = await getCloudflareContext({ async: true });
    const secretKey = env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;
    const jwtSecret = env.JWT_SECRET || process.env.JWT_SECRET;

    if (!secretKey || !jwtSecret) {
      console.error("Chapter verification or signing key is not configured");
      return NextResponse.json(
        { error: "Verification service unavailable." },
        { status: 500 }
      );
    }

    const isValid = await verifyTurnstileToken(turnstileToken, secretKey);

    if (!isValid) {
      return NextResponse.json(
        { error: "Verification failed. Try again." },
        { status: 403 }
      );
    }

    const db = getDb(env.DB);

    const book = await db
      .select()
      .from(books)
      .where(eq(books.slug, bookSlug))
      .limit(1)
      .then((rows) => rows[0]);

    if (!book) {
      return NextResponse.json(
        { error: "Book not found." },
        { status: 404 }
      );
    }

    const cookieHeader = request.headers.get("cookie");
    const consent = readPrivacyConsent(cookieHeader);
    const referralSlug = consent.analytics ? request.cookies.get(REFERRAL_COOKIE_NAME)?.value ?? null : null;
    const partner = referralSlug
      ? await db
          .select()
          .from(referralPartners)
          .where(
            and(
              eq(referralPartners.slug, normalizePartnerSlug(referralSlug)),
              eq(referralPartners.isActive, true)
            )
          )
          .limit(1)
          .then((rows) => rows[0])
      : null;

    const token = await createChapterAccessToken(bookSlug, jwtSecret);
    const isNewLead = await recordChapterLead(env.DB, {
      email, bookId: book.id, partnerId: partner?.id ?? null, sourceUtm: partner?.slug ?? null,
    });
    const attribution = conversionAttribution(body.attribution, request.headers.get("referer"), request.nextUrl.origin);

    const { distinctId } = getAnonymousId(request.headers.get("cookie"));

    const phCapture = captureServerEvent(cookieHeader, distinctId, isNewLead ? "lead_generated" : "chapter_access_renewed", {
      book_slug: book.slug,
      partner_slug: partner?.slug ?? null,
      source_utm: partner?.slug ?? null,
      ...attribution,
    });
    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(phCapture);
    } else await phCapture;

    const metaCapture = isNewLead ? sendMetaLeadEvent({
      cookieHeader,
      email,
      ip: request.headers.get("CF-Connecting-IP"),
      userAgent: request.headers.get("user-agent"),
      eventSourceUrl: request.nextUrl?.origin
        ? `${request.nextUrl.origin}/books/${book.slug}/preview`
        : "",
      fbc: request.cookies.get("_fbc")?.value ?? null,
      fbp: request.cookies.get("_fbp")?.value ?? null,
    }) : Promise.resolve();
    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(metaCapture);
    } else await metaCapture;

    const response = NextResponse.json({ success: true, isNewLead });

    response.cookies.set(CHAPTER_ACCESS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: CHAPTER_ACCESS_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
