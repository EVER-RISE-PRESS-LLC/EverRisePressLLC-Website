import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import {
  authors,
  books,
  bookFormats,
  leads,
  referralClicks,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { bookSaveSchema } from "@/lib/admin/validation";
import { cleanContentHtml } from "@/lib/content-html";
import { readBoundedJson } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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
        return NextResponse.json(
          { error: "Slug already in use." },
          { status: 409 },
        );
      }
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
    const currentFormats = await db
      .select()
      .from(bookFormats)
      .where(eq(bookFormats.bookId, id));
    const currentFormatsById = new Map(
      currentFormats.map((format) => [format.id, format]),
    );
    const suppliedIds = formats.flatMap((format) =>
      format.id ? [format.id] : [],
    );
    if (
      new Set(suppliedIds).size !== suppliedIds.length ||
      suppliedIds.some((formatId) => !currentFormatsById.has(formatId))
    ) {
      return NextResponse.json(
        {
          error:
            "The retailer links have changed since this editor opened. Reload this page before saving again.",
        },
        { status: 409 },
      );
    }
    const savedFormats = formats.map((format) => ({
      id: format.id || crypto.randomUUID(),
      bookId: id,
      formatType: format.formatType,
      isbn: format.isbn || null,
      retailPrice: format.retailPrice,
      currency: format.currency,
      distributor: format.distributor,
      purchaseUrl: format.purchaseUrl,
      createdAt:
        (format.id
          ? currentFormatsById.get(format.id)?.createdAt
          : undefined) ?? new Date().toISOString(),
    }));
    // Keep retailer IDs and creation dates, and roll back the whole save if any write fails.
    const [updatedRows] = await db.batch([
      db
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
        .returning(),
      db.delete(bookFormats).where(eq(bookFormats.bookId, id)),
      ...(savedFormats.length
        ? [db.insert(bookFormats).values(savedFormats)]
        : []),
    ]);
    const updated = updatedRows[0];

    return NextResponse.json({ book: updated, formats: savedFormats });
  } catch (error) {
    if (error instanceof Error && error.message === "REQUEST_TOO_LARGE")
      return NextResponse.json(
        {
          error:
            "This book is too large to save. Shorten the chapter content and try again.",
        },
        { status: 413 },
      );
    console.error("Update book error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { env } = await getCloudflareContext({ async: true });
    const user = await getSessionUser(request, env.DB);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 },
      );
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

    const [readerHistory, referralHistory] = await Promise.all([
      db
        .select({ id: leads.id })
        .from(leads)
        .where(eq(leads.bookId, id))
        .limit(1),
      db
        .select({ id: referralClicks.id })
        .from(referralClicks)
        .where(eq(referralClicks.bookId, id))
        .limit(1),
    ]);
    if (readerHistory.length || referralHistory.length) {
      return NextResponse.json(
        {
          error:
            "This book has reader signups or referral activity and cannot be deleted. You can still update its details and retailer links.",
        },
        { status: 409 },
      );
    }

    await db.delete(books).where(eq(books.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "REQUEST_TOO_LARGE")
      return NextResponse.json(
        {
          error:
            "This book is too large to save. Shorten the chapter content and try again.",
        },
        { status: 413 },
      );
    console.error("Delete book error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 },
    );
  }
}
