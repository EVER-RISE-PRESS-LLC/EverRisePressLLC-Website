import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDatabase } from "@/lib/db/client";
import { sql } from "drizzle-orm";
import { getCurrentAdminUser } from "@/lib/auth";
import { ReferralsClient } from "@/components/admin/referrals/ReferralsClient";
import { SITE_URL } from "@/lib/seo/ids";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  const db = await getDatabase();

  const rows = await db.all<{
    id: string;
    name: string;
    slug: string;
    contactEmail: string;
    customUtm: string | null;
    isActive: boolean;
    clicks: number;
    leads: number;
    createdAt: string;
  }>(
    sql`SELECT p.id, p.name, p.slug, p.contact_email AS contactEmail,
          p.custom_utm AS customUtm, p.is_active AS isActive, p.created_at AS createdAt,
          (SELECT count(*) FROM referral_clicks c WHERE c.partner_id = p.id) AS clicks,
          (SELECT count(*) FROM leads l WHERE l.partner_id = p.id) AS leads
        FROM referral_partners p
        ORDER BY p.created_at DESC`
  );

  const { env } = await getCloudflareContext({ async: true });
  const user = await getCurrentAdminUser(env.DB);
  const isAdmin = user?.role === "ADMIN";

  const partners = rows.map((row) => ({
    ...row,
    isActive: Boolean(row.isActive),
  }));

  return <ReferralsClient partners={partners} isAdmin={isAdmin} siteUrl={SITE_URL} />;
}
