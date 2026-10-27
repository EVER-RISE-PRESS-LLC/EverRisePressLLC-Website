import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getDb } from "@/lib/db";
import { referralPartners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, requireAdmin } from "@/lib/auth";
import { referralPartnerPatchSchema } from "@/lib/admin/referral-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { env } = await getCloudflareContext({ async: true });
    const user = await getSessionUser(request, env.DB);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = referralPartnerPatchSchema.safeParse(body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { error: parsed.success ? "Nothing to update." : (parsed.error.issues[0]?.message ?? "Invalid input.") },
        { status: 400 }
      );
    }

    const db = getDb(env.DB);

    if (parsed.data.slug) {
      const existing = await db
        .select()
        .from(referralPartners)
        .where(eq(referralPartners.slug, parsed.data.slug))
        .limit(1)
        .then((rows) => rows[0]);
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "This referral link is already in use. Choose a different link name.", field: "slug" }, { status: 409 });
      }
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.slug !== undefined) updates.slug = parsed.data.slug;
    if (parsed.data.contactEmail !== undefined) updates.contactEmail = parsed.data.contactEmail;
    if (parsed.data.customUtm !== undefined) updates.customUtm = parsed.data.customUtm || null;
    if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;

    const [partner] = await db
      .update(referralPartners)
      .set(updates)
      .where(eq(referralPartners.id, id))
      .returning();

    if (!partner) {
      return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    }

    return NextResponse.json({ partner });
  } catch (error) {
    const message = error instanceof Error ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}` : "";
    if (message.includes("UNIQUE constraint failed: referral_partners.slug")) {
      return NextResponse.json({ error: "This referral link is already in use. Choose a different link name.", field: "slug" }, { status: 409 });
    }
    console.error("Update partner failed:", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
