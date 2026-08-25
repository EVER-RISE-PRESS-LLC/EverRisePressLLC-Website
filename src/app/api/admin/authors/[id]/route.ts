import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { authors, books } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { authorPatchSchema } from "@/lib/admin/validation";

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

    const body = await request.json().catch(() => null);
    const parsed = authorPatchSchema.safeParse(body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { error: parsed.success ? "Nothing to update." : (parsed.error.issues[0]?.message ?? "Invalid input.") },
        { status: 400 }
      );
    }

    const db = getDb(env.DB);

    if (parsed.data.slug) {
      const existing = await db
        .select({ id: authors.id })
        .from(authors)
        .where(eq(authors.slug, parsed.data.slug))
        .limit(1)
        .then((rows) => rows[0]);
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "Slug already in use." }, { status: 409 });
      }
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.slug !== undefined) updates.slug = parsed.data.slug;
    if (parsed.data.title !== undefined) updates.title = parsed.data.title || null;
    if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
    if (parsed.data.avatarUrl !== undefined) updates.avatarUrl = parsed.data.avatarUrl || null;
    if (parsed.data.socialLinks !== undefined) {
      updates.socialLinks =
        Object.keys(parsed.data.socialLinks).length > 0 ? parsed.data.socialLinks : null;
    }
    updates.updatedAt = new Date().toISOString();

    const [author] = await db
      .update(authors)
      .set(updates)
      .where(eq(authors.id, id))
      .returning();

    if (!author) {
      return NextResponse.json({ error: "Author not found." }, { status: 404 });
    }

    return NextResponse.json({ author });
  } catch (error) {
    console.error("Update author error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const db = getDb(env.DB);
    const [author] = await db
      .select({ id: authors.id, name: authors.name })
      .from(authors)
      .where(eq(authors.id, id))
      .limit(1);
    if (!author) {
      return NextResponse.json({ error: "Author not found." }, { status: 404 });
    }

    const bookCount = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.authorId, id))
      .then((rows) => rows.length);
    if (bookCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete ${author.name}: they have ${bookCount} book(s). Reassign the books first.` },
        { status: 409 }
      );
    }

    await db.delete(authors).where(eq(authors.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete author error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
