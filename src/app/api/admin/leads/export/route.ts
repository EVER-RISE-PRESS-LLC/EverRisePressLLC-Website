import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: string | null | undefined): string {
  const s = value ?? "";
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const user = await getSessionUser(request, env.DB);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || null;
  const bookId = searchParams.get("book")?.trim() || null;
  const partnerId = searchParams.get("partner")?.trim() || null;

  const conditions = [];
  if (q) conditions.push(sql`l.email LIKE ${`%${q}%`}`);
  if (bookId) conditions.push(sql`l.book_id = ${bookId}`);
  if (partnerId) conditions.push(sql`l.partner_id = ${partnerId}`);
  const where = conditions.length > 0 ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;

  const db = getDb(env.DB);
  const rows = await db.all<{
    email: string;
    bookSlug: string | null;
    partnerSlug: string | null;
    sourceUtm: string | null;
    isSyncedEsp: boolean;
    unlockedAt: string;
    createdAt: string;
  }>(
    sql`SELECT l.email, b.slug AS bookSlug, p.slug AS partnerSlug,
          l.source_utm AS sourceUtm, l.is_synced_esp AS isSyncedEsp,
          l.unlocked_at AS unlockedAt, l.created_at AS createdAt
        FROM leads l
        JOIN books b ON b.id = l.book_id
        LEFT JOIN referral_partners p ON p.id = l.partner_id
        ${where}
        ORDER BY l.created_at DESC`
  );

  const header = ["email", "book_slug", "partner_slug", "source_utm", "mailchimp_synced", "unlocked_at", "created_at"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        csvEscape(row.email),
        csvEscape(row.bookSlug),
        csvEscape(row.partnerSlug),
        csvEscape(row.sourceUtm),
        row.isSyncedEsp ? "yes" : "no",
        csvEscape(row.unlockedAt),
        csvEscape(row.createdAt),
      ].join(",")
    ),
  ];

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(`\uFEFF${lines.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="everrise-leads-${date}.csv"`,
    },
  });
}
