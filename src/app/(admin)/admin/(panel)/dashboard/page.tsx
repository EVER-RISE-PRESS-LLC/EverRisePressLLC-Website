import Link from "next/link";
import { BarChart3, MousePointerClick, Share2, Store, UserCheck } from "lucide-react";
import { getDatabase } from "@/lib/db/client";
import { sql } from "drizzle-orm";
import { PageHeader } from "@/components/admin/PageHeader";
import { KpiCard } from "@/components/admin/KpiCard";
import { ActivityChart } from "@/components/admin/ActivityChart";
import { EmptyState } from "@/components/admin/EmptyState";
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
import { retailerLabel } from "@/lib/admin/format";
import { countSince, getDailySeries, percentDelta } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const db = await getDatabase();

  const [clicksTotal, leadsTotal, exitsTotal, clicks30, leads30, exits30, clicksPrev, leadsPrev, exitsPrev, series] =
    await Promise.all([
      countSince(db, "referral_clicks"),
      countSince(db, "leads"),
      countSince(db, "retailer_clicks"),
      countSince(db, "referral_clicks", 30),
      countSince(db, "leads", 30),
      countSince(db, "retailer_clicks", 30),
      countSince(db, "referral_clicks", 60),
      countSince(db, "leads", 60),
      countSince(db, "retailer_clicks", 60),
      getDailySeries(db, 30),
    ]);

  const clicksPrev30 = clicksPrev - clicks30;
  const leadsPrev30 = leadsPrev - leads30;
  const exitsPrev30 = exitsPrev - exits30;
  const conversion =
    clicksTotal > 0 ? ((leadsTotal / clicksTotal) * 100).toFixed(1) : "0.0";

  const topPartners = await db.all<{
    id: string;
    name: string;
    slug: string;
    clicks: number;
    leads: number;
  }>(
    sql`SELECT p.id, p.name, p.slug,
          (SELECT count(*) FROM referral_clicks c WHERE c.partner_id = p.id) AS clicks,
          (SELECT count(*) FROM leads l WHERE l.partner_id = p.id) AS leads
        FROM referral_partners p
        ORDER BY clicks DESC, leads DESC
        LIMIT 5`
  );

  const retailerExits = await db.all<{ retailer: string; count: number }>(
    sql`SELECT retailer, count(*) AS count FROM retailer_clicks GROUP BY retailer ORDER BY count DESC`
  );

  const hasData = clicksTotal > 0 || leadsTotal > 0 || exitsTotal > 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Referral funnel: clicks → chapter unlock → retailer exit."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Referral Clicks"
          value={clicksTotal.toLocaleString()}
          delta={{ value: percentDelta(clicks30, clicksPrev30) }}
          icon={MousePointerClick}
        />
        <KpiCard
          label="Leads Captured"
          value={leadsTotal.toLocaleString()}
          delta={{ value: percentDelta(leads30, leadsPrev30) }}
          icon={UserCheck}
        />
        <KpiCard
          label="Conversion Rate"
          value={`${conversion}%`}
          delta={{ value: percentDelta(leads30, clicks30) }}
          icon={Share2}
        />
        <KpiCard
          label="Retailer Exits"
          value={exitsTotal.toLocaleString()}
          delta={{ value: percentDelta(exits30, exitsPrev30) }}
          icon={Store}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Leads vs Clicks</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <ActivityChart data={series} />
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No activity yet"
                message="Share a /refer link to start collecting clicks and leads."
                action={
                  <Link href="/admin/referrals" className="text-sm text-primary hover:underline">
                    Manage referral partners →
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retailer Exits</CardTitle>
            <CardDescription>Buy-button clicks by retailer</CardDescription>
          </CardHeader>
          <CardContent>
            {retailerExits.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No retailer clicks tracked yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {retailerExits.map((row) => (
                  <li key={row.retailer} className="flex items-center justify-between">
                    <span className="text-sm">{retailerLabel(row.retailer)}</span>
                    <Badge variant="secondary">{Number(row.count).toLocaleString()}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Top Partners</CardTitle>
          <CardDescription>Ranked by referral clicks</CardDescription>
        </CardHeader>
        <CardContent>
          {topPartners.length === 0 ? (
            <p className="text-sm text-muted-foreground">No partners yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Conversion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPartners.map((p) => {
                  const clicks = Number(p.clicks);
                  const leads = Number(p.leads);
                  const conv = clicks > 0 ? ((leads / clicks) * 100).toFixed(1) : "0.0";
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link
                          href={`/admin/referrals/${p.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {p.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{leads.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{conv}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
