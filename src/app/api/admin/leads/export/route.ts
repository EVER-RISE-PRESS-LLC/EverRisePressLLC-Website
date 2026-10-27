import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { buildLeadWhere, csvCell, parseLeadFilters } from "@/lib/admin/lead-filters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
  const { env } = await getCloudflareContext({ async: true });
  const user = await getSessionUser(request, env.DB);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const { filters, notice } = parseLeadFilters(Object.fromEntries(searchParams));
  if (notice) return NextResponse.json({ error: notice }, { status: 400 });
  const where = buildLeadWhere(filters);

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
        ORDER BY l.created_at DESC, l.id DESC`
  );

  const header = ["email", "book_slug", "partner_slug", "source_utm", "email_sync_recorded", "unlocked_at", "created_at"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        csvCell(row.email),
        csvCell(row.bookSlug),
        csvCell(row.partnerSlug),
        csvCell(row.sourceUtm),
        row.isSyncedEsp ? "yes" : "no",
        csvCell(row.unlockedAt),
        csvCell(row.createdAt),
      ].join(",")
    ),
  ];

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(`\uFEFF${lines.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="everrise-leads-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
  } catch (error) {
    console.error("Reader export failed:", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "The reader export could not be prepared. Try again." }, { status: 500 });
  }
}
