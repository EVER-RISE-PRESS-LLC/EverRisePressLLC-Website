import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getDb } from "@/lib/db";
import { books, referralClicks, referralPartners } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import {
  REFERRAL_COOKIE_MAX_AGE,
  REFERRAL_COOKIE_NAME,
  hashIp,
  normalizePartnerSlug,
} from "@/lib/referral";
import { captureServerEvent, getAnonymousId } from "@/lib/posthog";
import { readPrivacyConsent } from "@/lib/privacy-consent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const slug = normalizePartnerSlug(code);

  const { env, ctx } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const partner = await db
    .select()
    .from(referralPartners)
    .where(and(eq(referralPartners.slug, slug), eq(referralPartners.isActive, true)))
    .limit(1)
    .then((rows) => rows[0]);

  if (!partner) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const defaultBookSlug =
    (env.REFERRAL_DEFAULT_BOOK_SLUG as string | undefined) ||
    process.env.REFERRAL_DEFAULT_BOOK_SLUG;

  const book = defaultBookSlug
    ? await db
        .select()
        .from(books)
        .where(eq(books.slug, defaultBookSlug))
        .limit(1)
        .then((rows) => rows[0])
    : await db
        .select()
        .from(books)
        .orderBy(desc(books.publishedAt))
        .limit(1)
        .then((rows) => rows[0]);

  const cookieHeader = request.headers.get("cookie");
  if (!readPrivacyConsent(cookieHeader).analytics) {
    const destination = book ? `/books/${book.slug}` : "/";
    return NextResponse.redirect(new URL(destination, request.url), 302);
  }
  const ip = request.headers.get("CF-Connecting-IP");

  await db.insert(referralClicks).values({
    partnerId: partner.id,
    bookId: book?.id ?? null,
    ipHash: await hashIp(ip),
    userAgent: request.headers.get("user-agent"),
    referer: request.headers.get("referer"),
    country: request.headers.get("CF-IPCountry"),
  });

  const { distinctId } = getAnonymousId(request.headers.get("cookie"));

  const phCapture = captureServerEvent(cookieHeader, distinctId, "referral_link_visited", {
    partner_slug: partner.slug,
    partner_name: partner.name,
    book_slug: book?.slug ?? null,
  });
  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(phCapture);
  }

  const destination = book
    ? `/books/${book.slug}?utm_source=podcast&utm_medium=referral&utm_campaign=${encodeURIComponent(partner.slug)}&_phid=${encodeURIComponent(distinctId)}`
    : `/?utm_source=podcast&utm_medium=referral&utm_campaign=${encodeURIComponent(partner.slug)}&_phid=${encodeURIComponent(distinctId)}`;

  const response = NextResponse.redirect(new URL(destination, request.url), 302);

  response.cookies.set(REFERRAL_COOKIE_NAME, partner.slug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
