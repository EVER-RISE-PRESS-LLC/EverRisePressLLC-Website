import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { authors, books, bookFormats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { bookSaveSchema } from "@/lib/admin/validation";
import { cleanContentHtml } from "@/lib/content-html";
import { readBoundedJson } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const user = await getSessionUser(request, env.DB);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await readBoundedJson(request, 300_000);
    const parsed = bookSaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const db = getDb(env.DB);
    const { book, formats } = parsed.data;
    book.chapterOneBody = cleanContentHtml(book.chapterOneBody);
    if (book.chapterOneBody.replace(/<[^>]*>/g, "").trim().length < 10) {
      return NextResponse.json(
        { error: "Add the chapter text before saving this book." },
        { status: 400 },
      );
    }

    const existing = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.slug, book.slug))
      .limit(1)
      .then((rows) => rows[0]);
    if (existing) {
      return NextResponse.json(
        { error: "Slug already in use." },
        { status: 409 },
      );
    }

    const authorExists = await db
      .select({ id: authors.id })
      .from(authors)
      .where(eq(authors.id, book.authorId))
      .limit(1);
    if (!authorExists.length) {
      return NextResponse.json(
        { error: "Choose an existing author before saving this book." },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const savedFormats = formats.map((format) => ({
      id: crypto.randomUUID(),
      bookId: id,
      formatType: format.formatType,
      isbn: format.isbn || null,
      retailPrice: format.retailPrice,
      currency: format.currency,
      distributor: format.distributor,
      purchaseUrl: format.purchaseUrl,
    }));
    // D1 batches commit together: a retailer error cannot leave a half-created book.
    const [createdRows] = await db.batch([
      db
        .insert(books)
        .values({
          id,
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
        .returning(),
      ...(savedFormats.length
        ? [db.insert(bookFormats).values(savedFormats)]
        : []),
    ]);
    const created = createdRows[0];

    return NextResponse.json(
      { book: created, formats: savedFormats },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "REQUEST_TOO_LARGE")
      return NextResponse.json(
        {
          error:
            "This book is too large to save. Shorten the chapter content and try again.",
        },
        { status: 413 },
      );
    console.error("Create book error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 },
    );
  }
}
