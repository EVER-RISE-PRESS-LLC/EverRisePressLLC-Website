import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { leads, books, referralPartners } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { REFERRAL_COOKIE_NAME, normalizePartnerSlug } from "@/lib/referral";
import { captureServerEvent, getAnonymousId } from "@/lib/posthog";
import { sendMetaLeadEvent } from "@/lib/meta";
import { SignJWT } from "jose";

export const runtime = "nodejs";

interface LeadRequestBody {
  email: string;
  bookSlug: string;
  turnstileToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LeadRequestBody;
    const { email, bookSlug, turnstileToken } = body;

    if (!email || !bookSlug || !turnstileToken) {
      return NextResponse.json(
        { error: "Email, book slug, and verification token are required." },
        { status: 400 }
      );
    }

    const { env, ctx } = await getCloudflareContext({ async: true });
    const secretKey = env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error("TURNSTILE_SECRET_KEY not configured");
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

    const existingLead = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email))
      .limit(1)
      .then((rows) => rows[0]);

    const referralSlug = request.cookies.get(REFERRAL_COOKIE_NAME)?.value ?? null;
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

    if (!existingLead) {
      await db.insert(leads).values({
        email,
        bookId: book.id,
        partnerId: partner?.id ?? null,
        sourceUtm: partner?.slug ?? null,
      });
    } else if (partner && !existingLead.partnerId) {
      await db
        .update(leads)
        .set({ partnerId: partner.id })
        .where(eq(leads.id, existingLead.id));
    }

    const { distinctId } = getAnonymousId(request.headers.get("cookie"));

    const phCapture = captureServerEvent(distinctId, "lead_generated", {
      email,
      book_slug: book.slug,
      partner_slug: partner?.slug ?? null,
      source_utm: partner?.slug ?? null,
    });
    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(phCapture);
    }

    const metaCapture = sendMetaLeadEvent({
      email,
      ip: request.headers.get("CF-Connecting-IP"),
      userAgent: request.headers.get("user-agent"),
      eventSourceUrl: request.nextUrl?.origin
        ? `${request.nextUrl.origin}/books/${book.slug}/preview`
        : "",
      fbc: request.cookies.get("_fbc")?.value ?? null,
      fbp: request.cookies.get("_fbp")?.value ?? null,
    });
    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(metaCapture);
    }

    const jwtSecret = new TextEncoder().encode(
      env.JWT_SECRET ||
        process.env.JWT_SECRET ||
        "everrisepress-jwt-secret-change-in-production"
    );

    const token = await new SignJWT({ email, bookSlug })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(jwtSecret);

    const response = NextResponse.json({ success: true });

    response.cookies.set("chapter_access", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
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
