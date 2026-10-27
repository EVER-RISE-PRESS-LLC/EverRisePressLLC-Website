import Link from "next/link";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ArrowLeft, ArrowRight, BarChart3, MousePointerClick, Share2, UserCheck } from "lucide-react";
import { getDatabase } from "@/lib/db/client";
import { referralPartners } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentAdminUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { KpiCard } from "@/components/admin/KpiCard";
import { ActivityChart } from "@/components/admin/ActivityChart";
import { EmptyState } from "@/components/admin/EmptyState";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnerDetailActions } from "@/components/admin/referrals/PartnerDetailActions";
import { formatDate } from "@/lib/admin/format";
import { lastNDaysUtc } from "@/lib/admin/stats";
import { SITE_URL } from "@/lib/seo/ids";

export const dynamic = "force-dynamic";

function sourceLabel(value: string | null): string {
  if (!value) return "No referring page recorded";
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

export default async function AdminReferralDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDatabase();
  const partner = await db.select().from(referralPartners).where(eq(referralPartners.id, id)).limit(1).then((rows) => rows[0]);
  if (!partner) notFound();

  const { env } = await getCloudflareContext({ async: true });
  const user = await getCurrentAdminUser(env.DB);
  const isAdmin = user?.role === "ADMIN";
  const [clicks, leads, dailyRows, recentLeads, recentClicks] = await Promise.all([
    db.all<{ count: number }>(sql`SELECT count(*) AS count FROM referral_clicks WHERE partner_id = ${id}`).then((rows) => Number(rows[0]?.count ?? 0)),
    db.all<{ count: number }>(sql`SELECT count(*) AS count FROM leads WHERE partner_id = ${id}`).then((rows) => Number(rows[0]?.count ?? 0)),
    db.all<{ day: string; clicks: number; leads: number }>(
      sql`SELECT date(created_at) AS day, count(*) AS clicks, 0 AS leads
          FROM referral_clicks WHERE partner_id = ${id} AND created_at >= datetime('now', 'start of day', '-29 days')
          GROUP BY date(created_at)
          UNION ALL
          SELECT date(created_at) AS day, 0 AS clicks, count(*) AS leads
          FROM leads WHERE partner_id = ${id} AND created_at >= datetime('now', 'start of day', '-29 days')
          GROUP BY date(created_at)`
    ),
    db.all<{ id: string; email: string; bookTitle: string; createdAt: string }>(
      sql`SELECT l.id, l.email, b.title AS bookTitle, l.created_at AS createdAt
          FROM leads l JOIN books b ON b.id = l.book_id WHERE l.partner_id = ${id}
          ORDER BY l.created_at DESC, l.id DESC LIMIT 20`
    ),
    db.all<{ id: string; createdAt: string; country: string | null; referer: string | null }>(
      sql`SELECT id, created_at AS createdAt, country, referer FROM referral_clicks
          WHERE partner_id = ${id} ORDER BY created_at DESC, id DESC LIMIT 10`
    ),
  ]);

  const series = lastNDaysUtc(30).map((day) => ({
    day,
    clicks: dailyRows.filter((row) => row.day === day).reduce((sum, row) => sum + Number(row.clicks), 0),
    leads: dailyRows.filter((row) => row.day === day).reduce((sum, row) => sum + Number(row.leads), 0),
  }));
  const hasRecentActivity = series.some((point) => point.clicks > 0 || point.leads > 0);
  const rate = clicks > 0 ? `${((leads / clicks) * 100).toFixed(1)}%` : "—";
  const referralUrl = `${SITE_URL}/refer/${partner.slug}`;

  return (
    <>
      <Link href="/admin/referrals" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"><ArrowLeft className="size-4" />All partners</Link>
      <PageHeader title={partner.name} description={partner.contactEmail}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={partner.isActive ? "default" : "secondary"}>{partner.isActive ? "Active link" : "Inactive link"}</Badge>
          {isAdmin && <PartnerDetailActions partner={{ id: partner.id, name: partner.name, slug: partner.slug, contactEmail: partner.contactEmail, customUtm: partner.customUtm, isActive: partner.isActive }} />}
        </div>
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div className="min-w-0"><h2 className="text-sm font-semibold">Partner referral link</h2><p className="mt-1 break-all text-sm text-muted-foreground">{referralUrl}</p></div>
        <div className="flex shrink-0 items-center gap-2 text-sm [&_button]:size-11"><span>Copy link</span><CopyLinkButton text={referralUrl} label={`Copy referral link for ${partner.name}`} /></div>
        {!partner.isActive && <p className="w-full text-sm text-muted-foreground">This link currently sends visitors to the homepage without recording new referral visits. Reactivate it to start recording again.</p>}
      </div>

      <h2 className="mb-3 text-base font-semibold">All-time activity</h2>
      <div className="grid gap-4 sm:grid-cols-3"><KpiCard label="Recorded visits" value={clicks.toLocaleString()} icon={MousePointerClick} /><KpiCard label="Saved readers" value={leads.toLocaleString()} icon={UserCheck} /><KpiCard label="Readers per visit" value={rate} icon={Share2} /></div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Visits may include repeat visits. The rate compares saved reader emails with recorded visits; it does not measure book purchases. Referral activity is recorded only when the visitor has analytics enabled.</p>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Last 30 days</CardTitle><CardDescription>Recorded visits and saved readers, including today. Dates use UTC.</CardDescription></CardHeader><CardContent>{hasRecentActivity ? <ActivityChart data={series} /> : <EmptyState icon={BarChart3} title="No activity in the last 30 days" message={partner.isActive ? "Copy this partner’s link and share it with them. New activity will appear here." : "This partner’s link is inactive. Reactivate it when you are ready to share it again."} />}</CardContent></Card>
        <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>Recent readers</CardTitle><CardDescription className="mt-1">Latest 20 reader emails attributed to this partner.</CardDescription></div><Link href={`/admin/leads?partner=${encodeURIComponent(partner.id)}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">View all<ArrowRight className="size-4" /></Link></div></CardHeader><CardContent>{recentLeads.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No reader emails have been attributed to this partner yet.</p> : <ul className="divide-y">{recentLeads.map((lead) => <li key={lead.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="break-all text-sm font-medium">{lead.email}</p><p className="mt-1 text-sm text-muted-foreground">{lead.bookTitle}</p></div><span className="shrink-0 text-sm text-muted-foreground">{formatDate(lead.createdAt)}</span></li>)}</ul>}</CardContent></Card>
      </div>

      <Card className="mt-5"><CardHeader><CardTitle>Recent visits</CardTitle><CardDescription>Latest 10 recorded visits. A referring page or country may be unavailable.</CardDescription></CardHeader><CardContent>{recentClicks.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No visits have been recorded for this partner yet.</p> : <ul className="divide-y">{recentClicks.map((click) => <li key={click.id} className="grid gap-x-5 gap-y-1 py-3 text-sm first:pt-0 last:pb-0 sm:grid-cols-[9rem_8rem_minmax(0,1fr)]"><span>{formatDate(click.createdAt)}</span><span className="text-muted-foreground">{click.country ? `Country: ${click.country}` : "Country not recorded"}</span><span className="break-all text-muted-foreground" title={click.referer ?? undefined}>{sourceLabel(click.referer)}</span></li>)}</ul>}</CardContent></Card>

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm"><div><dt className="text-muted-foreground">Partner added</dt><dd className="mt-1">{formatDate(partner.createdAt)}</dd></div>{partner.customUtm && <div><dt className="text-muted-foreground">Internal label</dt><dd className="mt-1 break-words">{partner.customUtm}</dd></div>}</dl>
    </>
  );
}
