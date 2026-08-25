import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { referralPartners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, requireAdmin } from "@/lib/auth";
import { partnerCreateSchema } from "@/lib/admin/validation";

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
    const parsed = partnerCreateSchema.safeParse(body);
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
        { error: "Slug already in use." },
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
    console.error("Create partner error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
