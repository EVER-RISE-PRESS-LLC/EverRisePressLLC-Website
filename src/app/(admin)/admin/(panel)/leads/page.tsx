import { getDatabase } from "@/lib/db/client";
import { books, referralPartners } from "@/lib/db/schema";
import { asc, sql } from "drizzle-orm";
import { LeadsClient } from "@/components/admin/leads/LeadsClient";
import { buildLeadWhere, parseLeadFilters } from "@/lib/admin/lead-filters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; book?: string; partner?: string; from?: string; to?: string; page?: string }>;
}) {
  const params = await searchParams;
  const db = await getDatabase();

  const { filters, notice } = parseLeadFilters(params);
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const where = buildLeadWhere(filters);

  const countRow = await db
    .all<{ count: number }>(sql`SELECT count(*) AS count FROM leads l ${where}`)
    .then((rows) => rows[0]);
  const total = Number(countRow?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const leads = await db.all<{
    id: string;
    email: string;
    bookTitle: string;
    partnerName: string | null;
    sourceUtm: string | null;
    isSyncedEsp: boolean;
    unlockedAt: string;
    createdAt: string;
  }>(
    sql`SELECT l.id, l.email, b.title AS bookTitle, p.name AS partnerName,
          l.source_utm AS sourceUtm, l.is_synced_esp AS isSyncedEsp,
          l.unlocked_at AS unlockedAt, l.created_at AS createdAt
        FROM leads l
        JOIN books b ON b.id = l.book_id
        LEFT JOIN referral_partners p ON p.id = l.partner_id
        ${where}
        ORDER BY l.created_at DESC, l.id DESC
        LIMIT ${PAGE_SIZE} OFFSET ${(safePage - 1) * PAGE_SIZE}`
  );

  const bookOptions = await db
    .select({ id: books.id, title: books.title })
    .from(books)
    .orderBy(asc(books.title));

  const partnerOptions = await db
    .select({ id: referralPartners.id, name: referralPartners.name })
    .from(referralPartners)
    .orderBy(asc(referralPartners.name));

  return (
    <LeadsClient
      leads={leads.map((l) => ({ ...l, isSyncedEsp: Boolean(l.isSyncedEsp) }))}
      bookOptions={bookOptions}
      partnerOptions={partnerOptions}
      filters={filters}
      notice={notice}
      page={safePage}
      totalPages={totalPages}
      total={total}
    />
  );
}
