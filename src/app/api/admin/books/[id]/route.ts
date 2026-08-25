import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { books, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { bookSaveSchema } from "@/lib/admin/validation";

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
    const parsed = bookSaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const db = getDb(env.DB);
    const { book, formats } = parsed.data;

    const current = await db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1)
      .then((rows) => rows[0]);
    if (!current) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    if (book.slug !== current.slug) {
      const existing = await db
        .select({ id: books.id })
        .from(books)
        .where(eq(books.slug, book.slug))
        .limit(1)
        .then((rows) => rows[0]);
      if (existing) {
        return NextResponse.json({ error: "Slug already in use." }, { status: 409 });
      }
    }

    const [updated] = await db
      .update(books)
      .set({
        slug: book.slug,
        title: book.title,
        subtitle: book.subtitle || null,
        synopsis: book.synopsis,
        coverImageUrl: book.coverImageUrl,
        chapterOneTitle: book.chapterOneTitle,
        chapterOneBody: book.chapterOneBody,
        authorId: book.authorId,
        publishedAt: book.publishedAt || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(books.id, id))
      .returning();

    await db.delete(bookFormats).where(eq(bookFormats.bookId, id));

    if (formats.length > 0) {
      await db.insert(bookFormats).values(
        formats.map((f) => ({
          bookId: id,
          formatType: f.formatType,
          isbn: f.isbn || null,
          retailPrice: f.retailPrice,
          currency: f.currency,
          distributor: f.distributor,
          purchaseUrl: f.purchaseUrl,
        }))
      );
    }

    return NextResponse.json({ book: updated });
  } catch (error) {
    console.error("Update book error:", error);
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
    const current = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.id, id))
      .limit(1)
      .then((rows) => rows[0]);
    if (!current) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    await db.delete(books).where(eq(books.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete book error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
