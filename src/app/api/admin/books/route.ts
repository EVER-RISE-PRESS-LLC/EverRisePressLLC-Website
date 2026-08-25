import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { books, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { bookSaveSchema } from "@/lib/admin/validation";

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
    const parsed = bookSaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const db = getDb(env.DB);
    const { book, formats } = parsed.data;

    const existing = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.slug, book.slug))
      .limit(1)
      .then((rows) => rows[0]);
    if (existing) {
      return NextResponse.json({ error: "Slug already in use." }, { status: 409 });
    }

    const [created] = await db
      .insert(books)
      .values({
        slug: book.slug,
        title: book.title,
        subtitle: book.subtitle || null,
        synopsis: book.synopsis,
        coverImageUrl: book.coverImageUrl,
        chapterOneTitle: book.chapterOneTitle,
        chapterOneBody: book.chapterOneBody,
        authorId: book.authorId,
        publishedAt: book.publishedAt || null,
      })
      .returning();

    if (formats.length > 0) {
      await db.insert(bookFormats).values(
        formats.map((f) => ({
          bookId: created.id,
          formatType: f.formatType,
          isbn: f.isbn || null,
          retailPrice: f.retailPrice,
          currency: f.currency,
          distributor: f.distributor,
          purchaseUrl: f.purchaseUrl,
        }))
      );
    }

    return NextResponse.json({ book: created }, { status: 201 });
  } catch (error) {
    console.error("Create book error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
