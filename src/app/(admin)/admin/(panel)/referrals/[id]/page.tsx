import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, MousePointerClick, Share2, UserCheck } from "lucide-react";
import { getDatabase } from "@/lib/db/client";
import { referralPartners } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { PageHeader } from "@/components/admin/PageHeader";
import { KpiCard } from "@/components/admin/KpiCard";
import { ActivityChart } from "@/components/admin/ActivityChart";
import { EmptyState } from "@/components/admin/EmptyState";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PartnerDetailActions } from "@/components/admin/referrals/PartnerDetailActions";
import { formatDate } from "@/lib/admin/format";
import { getDailySeries } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

export default async function AdminReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDatabase();

  const partner = await db
    .select()
    .from(referralPartners)
    .where(eq(referralPartners.id, id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!partner) notFound();

  const [clicks, leads, series, recentLeads, recentClicks] = await Promise.all([
    db.all<{ count: number }>(
      sql`SELECT count(*) AS count FROM referral_clicks WHERE partner_id = ${id}`
    ).then((r) => Number(r[0]?.count ?? 0)),
    db.all<{ count: number }>(
      sql`SELECT count(*) AS count FROM leads WHERE partner_id = ${id}`
    ).then((r) => Number(r[0]?.count ?? 0)),
    db.all<{ day: string; clicks: number; leads: number }>(
      sql`SELECT d.day AS day,
             (SELECT count(*) FROM referral_clicks c WHERE c.partner_id = ${id} AND date(c.created_at) = d.day) AS clicks,
             (SELECT count(*) FROM leads l WHERE l.partner_id = ${id} AND date(l.created_at) = d.day) AS leads
          FROM (
            WITH RECURSIVE days(day) AS (
              SELECT date('now', '-30 days')
              UNION ALL
              SELECT date(day, '+1 day') FROM days WHERE day < date('now')
            )
            SELECT day FROM days
          ) d
          ORDER BY d.day`
    ),
    db.all<{ email: string; bookTitle: string; createdAt: string }>(
      sql`SELECT l.email, b.title AS bookTitle, l.created_at AS createdAt
          FROM leads l JOIN books b ON b.id = l.book_id
          WHERE l.partner_id = ${id}
          ORDER BY l.created_at DESC LIMIT 20`
    ),
    db.all<{ createdAt: string; country: string | null; referer: string | null; ipHash: string | null }>(
      sql`SELECT created_at AS createdAt, country, referer, ip_hash AS ipHash
          FROM referral_clicks WHERE partner_id = ${id}
          ORDER BY created_at DESC LIMIT 10`
    ),
  ]);

  const conversion = clicks > 0 ? ((leads / clicks) * 100).toFixed(1) : "0.0";
  const hasActivity = clicks > 0 || leads > 0;

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/referrals"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All partners
        </Link>
      </div>

      <PageHeader title={partner.name} description={`/refer/${partner.slug}`}>
        <div className="flex items-center gap-2">
          <Badge variant={partner.isActive ? "default" : "secondary"}>
            {partner.isActive ? "Active" : "Inactive"}
          </Badge>
          <CopyLinkButton
            text={`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/refer/${partner.slug}`}
            label="Copy referral link"
          />
          <PartnerDetailActions
            partner={{
              id: partner.id,
              name: partner.name,
              slug: partner.slug,
              contactEmail: partner.contactEmail,
              customUtm: partner.customUtm,
              isActive: partner.isActive,
            }}
          />
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Clicks" value={clicks.toLocaleString()} icon={MousePointerClick} />
        <KpiCard label="Leads" value={leads.toLocaleString()} icon={UserCheck} />
        <KpiCard label="Conversion" value={`${conversion}%`} icon={Share2} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Clicks vs leads — last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {hasActivity ? (
              <ActivityChart data={series} />
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No clicks yet"
                message={`Share this link with ${partner.name}: /refer/${partner.slug}`}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Latest 20 email captures</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No leads attributed to this partner yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((lead) => (
                    <TableRow key={`${lead.email}-${lead.createdAt}`}>
                      <TableCell className="font-mono text-xs">{lead.email}</TableCell>
                      <TableCell className="text-sm">{lead.bookTitle}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Clicks</CardTitle>
          <CardDescription>Latest 10 referral visits</CardDescription>
        </CardHeader>
        <CardContent>
          {recentClicks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clicks recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Referer</TableHead>
                  <TableHead>IP (hashed)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentClicks.map((click) => (
                  <TableRow key={click.createdAt}>
                    <TableCell className="text-sm">
                      {formatDate(click.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">{click.country ?? "—"}</TableCell>
                    <TableCell className="max-w-48 truncate font-mono text-xs text-muted-foreground">
                      {click.referer ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {click.ipHash ? `${click.ipHash.slice(0, 12)}…` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
