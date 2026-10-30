import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getDb } from "@/lib/db";
import { books, referralPartners, retailerClicks } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { REFERRAL_COOKIE_NAME, hashIp, normalizePartnerSlug } from "@/lib/referral";
import { captureServerEvent, getAnonymousId } from "@/lib/posthog";
import { readPrivacyConsent } from "@/lib/privacy-consent";
import { conversionAttribution } from "@/lib/conversion-attribution";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_FORMATS = new Set(["EBOOK", "PAPERBACK", "HARDCOVER", "AUDIOBOOK"]);

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  if (!readPrivacyConsent(cookieHeader).analytics) return new NextResponse(null, { status: 204 });
  try {
    const body = (await request.json().catch(() => null)) as {
      bookSlug?: string;
      retailer?: string;
      formatType?: string;
      attribution?: unknown;
    } | null;

    const bookSlug = typeof body?.bookSlug === "string" ? body.bookSlug.trim() : "";
    const retailer = typeof body?.retailer === "string" ? body.retailer.trim() : "";
    const formatType = typeof body?.formatType === "string" ? body.formatType.trim() : "";

    if (!bookSlug || !retailer || !formatType || !VALID_FORMATS.has(formatType)) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const { env, ctx } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const book = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.slug, bookSlug))
      .limit(1)
      .then((rows) => rows[0]);

    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    const referralSlug = request.cookies.get(REFERRAL_COOKIE_NAME)?.value ?? null;
    const partner = referralSlug
      ? await db
          .select({ id: referralPartners.id })
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

    const ip = request.headers.get("CF-Connecting-IP");

    await db.insert(retailerClicks).values({
      bookId: book.id,
      retailer,
      formatType,
      ipHash: await hashIp(ip),
      userAgent: request.headers.get("user-agent"),
      country: request.headers.get("CF-IPCountry"),
      partnerId: partner?.id ?? null,
    });

    const { distinctId } = getAnonymousId(request.headers.get("cookie"));
    const phCapture = captureServerEvent(cookieHeader, distinctId, "retailer_redirect_click", {
      book_slug: bookSlug,
      retailer,
      format_type: formatType,
      partner_slug: referralSlug,
      ...conversionAttribution(body?.attribution, request.headers.get("referer"), request.nextUrl.origin),
    });
    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(phCapture);
    } else await phCapture;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Retailer click logging error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
