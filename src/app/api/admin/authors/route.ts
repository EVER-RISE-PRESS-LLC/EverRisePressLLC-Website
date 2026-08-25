import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { authorCreateSchema } from "@/lib/admin/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const user = await getSessionUser(request, env.DB);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = authorCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const db = getDb(env.DB);
    const existing = await db
      .select({ id: authors.id })
      .from(authors)
      .where(eq(authors.slug, parsed.data.slug))
      .limit(1)
      .then((rows) => rows[0]);
    if (existing) {
      return NextResponse.json({ error: "Slug already in use." }, { status: 409 });
    }

    const [author] = await db
      .insert(authors)
      .values({
        name: parsed.data.name,
        slug: parsed.data.slug,
        title: parsed.data.title || null,
        bio: parsed.data.bio,
        avatarUrl: parsed.data.avatarUrl || null,
        socialLinks: parsed.data.socialLinks && Object.keys(parsed.data.socialLinks).length > 0
          ? parsed.data.socialLinks
          : null,
      })
      .returning();

    return NextResponse.json({ author }, { status: 201 });
  } catch (error) {
    console.error("Create author error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
