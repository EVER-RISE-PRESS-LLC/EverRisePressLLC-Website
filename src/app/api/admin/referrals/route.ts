import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { referralPartners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, requireAdmin } from "@/lib/auth";
import { referralPartnerSchema } from "@/lib/admin/referral-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const user = await getSessionUser(request, env.DB);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = referralPartnerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const db = getDb(env.DB);
    const existing = await db
      .select()
      .from(referralPartners)
      .where(eq(referralPartners.slug, parsed.data.slug))
      .limit(1)
      .then((rows) => rows[0]);

    if (existing) {
      return NextResponse.json(
        { error: "This referral link is already in use. Choose a different link name.", field: "slug" },
        { status: 409 }
      );
    }

    const [partner] = await db
      .insert(referralPartners)
      .values({
        name: parsed.data.name,
        slug: parsed.data.slug,
        contactEmail: parsed.data.contactEmail,
        customUtm: parsed.data.customUtm || null,
      })
      .returning();

    return NextResponse.json({ partner }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}` : "";
    if (message.includes("UNIQUE constraint failed: referral_partners.slug")) {
      return NextResponse.json({ error: "This referral link is already in use. Choose a different link name.", field: "slug" }, { status: 409 });
    }
    console.error("Create partner failed:", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
