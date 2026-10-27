import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, MousePointerClick, PenLine, Share2, Store, UserCheck } from "lucide-react";
import { sql } from "drizzle-orm";
import { getDatabase } from "@/lib/db/client";
import { getAllArticles } from "@/lib/blog/catalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { KpiCard } from "@/components/admin/KpiCard";
import { ActivityChart } from "@/components/admin/ActivityChart";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { retailerLabel } from "@/lib/admin/format";
import { getDailySeries } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

type Metrics = { clicks: number; unlocks: number; referredUnlocks: number; retailerClicks: number; allClicks: number; allUnlocks: number; allRetailerClicks: number };

function savedDate(value: string) {
  const date = new Date(value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value) ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? "Saved draft" : `Saved ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`;
}

export default async function AdminDashboardPage() {
  const db = await getDatabase();
  const [articles, catalogRows, metricRows, series, partnerRows, retailerExits] = await Promise.all([
    getAllArticles(),
    db.all<{ books: number; authors: number; partners: number }>(sql`SELECT
      (SELECT count(*) FROM books) AS books,
      (SELECT count(*) FROM authors) AS authors,
      (SELECT count(*) FROM referral_partners WHERE is_active = 1) AS partners`),
    db.all<Metrics>(sql`SELECT
      (SELECT count(*) FROM referral_clicks WHERE created_at >= datetime('now', 'start of day', '-29 days')) AS clicks,
      (SELECT count(*) FROM leads WHERE created_at >= datetime('now', 'start of day', '-29 days')) AS unlocks,
      (SELECT count(*) FROM leads WHERE partner_id IS NOT NULL AND created_at >= datetime('now', 'start of day', '-29 days')) AS referredUnlocks,
      (SELECT count(*) FROM retailer_clicks WHERE created_at >= datetime('now', 'start of day', '-29 days')) AS retailerClicks,
      (SELECT count(*) FROM referral_clicks) AS allClicks,
      (SELECT count(*) FROM leads) AS allUnlocks,
      (SELECT count(*) FROM retailer_clicks) AS allRetailerClicks`),
    getDailySeries(db, 30),
    db.all<{ id: string; name: string; clicks: number; unlocks: number }>(sql`SELECT p.id, p.name,
      (SELECT count(*) FROM referral_clicks c WHERE c.partner_id = p.id AND c.created_at >= datetime('now', 'start of day', '-29 days')) AS clicks,
      (SELECT count(*) FROM leads l WHERE l.partner_id = p.id AND l.created_at >= datetime('now', 'start of day', '-29 days')) AS unlocks
      FROM referral_partners p ORDER BY clicks DESC, unlocks DESC, p.name LIMIT 5`),
    db.all<{ retailer: string; count: number }>(sql`SELECT retailer, count(*) AS count FROM retailer_clicks
      WHERE created_at >= datetime('now', 'start of day', '-29 days') GROUP BY retailer ORDER BY count DESC`),
  ]);
  const catalog = catalogRows[0] ?? { books: 0, authors: 0, partners: 0 };
  const metrics = metricRows[0] ?? { clicks: 0, unlocks: 0, referredUnlocks: 0, retailerClicks: 0, allClicks: 0, allUnlocks: 0, allRetailerClicks: 0 };
  const recentArticles = [...articles].sort((a, b) => b.savedAt.localeCompare(a.savedAt)).slice(0, 4);
  const liveCount = articles.filter(article => article.isLive).length;
  const draftCount = articles.filter(article => !article.isLive || article.hasUnpublishedChanges).length;
  const activePartners = partnerRows.filter(partner => Number(partner.clicks) > 0 || Number(partner.unlocks) > 0);
  const hasActivity = series.some(point => point.clicks > 0 || point.leads > 0);
  const ratio = Number(metrics.clicks) > 0 ? `${((Number(metrics.referredUnlocks) / Number(metrics.clicks)) * 100).toFixed(1)}%` : "—";

  return <>
    <PageHeader title="Your publishing workspace" description="A clear place to create, keep things current, and see what readers are doing." />
    <section className="admin-workbench" aria-labelledby="admin-next-article">
      <div><h2 id="admin-next-article">Start with your next article</h2><p>Capture an idea, add your words and images, then publish when you are ready.</p></div>
      <div className="admin-workbench-actions"><Button asChild><Link href="/admin/articles/new"><PenLine className="size-4" aria-hidden="true" />Write article</Link></Button><Button asChild variant="outline"><Link href="/admin/articles">All articles</Link></Button></div>
    </section>
    <div className="admin-dashboard-grid">
      <Card><CardHeader><CardTitle>Pick up where you left off</CardTitle><CardDescription>{draftCount === 0 ? "Your most recently saved articles." : `${draftCount} ${draftCount === 1 ? "article has" : "articles have"} unpublished work. Open one to keep writing.`}</CardDescription></CardHeader><CardContent>
        {recentArticles.length ? <div className="admin-article-list">{recentArticles.map(article => <Link key={article.id} href={`/admin/articles/${article.slug}`}>
          <div className="min-w-0"><strong>{article.title || "Untitled article"}</strong><small>{savedDate(article.savedAt)}</small></div><span className={`admin-status-tag ${article.isLive ? "admin-status-tag-live" : ""}`}>{article.isLive ? article.hasUnpublishedChanges ? "Changes saved" : "Published" : "Draft"}</span>
        </Link>)}</div> : <EmptyState icon={PenLine} title="Your first article starts with an idea" message="Draft privately in this workspace. You choose when an article is ready for readers." action={<Button asChild><Link href="/admin/articles/new">Create your first draft<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>} />}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Keep everything connected</CardTitle><CardDescription>Your catalog and audience tools.</CardDescription></CardHeader><CardContent>
        <ul className="admin-workspace-list">
          <li><Link href="/admin/books"><div><strong>Books</strong><small>Descriptions, chapters, and retailer links</small></div><span className="admin-list-count">{Number(catalog.books)}<span className="sr-only"> books</span></span></Link></li>
          <li><Link href="/admin/authors"><div><strong>Authors</strong><small>Biographies and profile photos</small></div><span className="admin-list-count">{Number(catalog.authors)}<span className="sr-only"> authors</span></span></Link></li>
          <li><Link href="/admin/leads"><div><strong>Readers</strong><small>Chapter signups and CSV exports</small></div><ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" /></Link></li>
          <li><Link href="/admin/referrals"><div><strong>Links &amp; partners</strong><small>{Number(catalog.partners)} active {Number(catalog.partners) === 1 ? "partner" : "partners"} sharing the book</small></div><ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" /></Link></li>
        </ul>
        <p className="admin-dashboard-note">{liveCount} published {liveCount === 1 ? "article" : "articles"} on the website. Changes to books and author profiles appear after saving.</p>
      </CardContent></Card>
    </div>
    <div className="admin-section-heading"><div><h2>Reader activity</h2><p>Today and the previous 29 days · UTC</p></div><Link href="/admin/leads" className="admin-inline-link">View readers<ArrowRight className="size-4" aria-hidden="true" /></Link></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Referral link clicks" value={Number(metrics.clicks).toLocaleString()} icon={MousePointerClick} sublabel={`${Number(metrics.allClicks).toLocaleString()} all time`} />
      <KpiCard label="Chapter unlocks" value={Number(metrics.unlocks).toLocaleString()} icon={UserCheck} sublabel={`${Number(metrics.allUnlocks).toLocaleString()} all time · all sources`} />
      <KpiCard label="Retailer link clicks" value={Number(metrics.retailerClicks).toLocaleString()} icon={Store} sublabel={`${Number(metrics.allRetailerClicks).toLocaleString()} all time · clicks, not purchases`} />
      <KpiCard label="Referral unlock ratio" value={ratio} icon={Share2} sublabel={Number(metrics.clicks) > 0 ? `${Number(metrics.referredUnlocks).toLocaleString()} referred unlocks ÷ ${Number(metrics.clicks).toLocaleString()} clicks` : "No referral clicks in this period"} />
    </div>
    <p className="admin-dashboard-note">The referral ratio compares referred chapter unlocks with referral clicks in this period. Events can come from different visits; it does not measure purchases or individual reader conversion.</p>
    <div className="admin-dashboard-grid mt-6">
      <Card><CardHeader><CardTitle>Clicks and chapter unlocks</CardTitle><CardDescription>Daily referral clicks and chapter signups from all sources.</CardDescription></CardHeader><CardContent>
        {hasActivity ? <ActivityChart data={series} /> : <EmptyState icon={BarChart3} title="A quiet start is still a start" message="Reader activity will appear here when someone follows a partner link or unlocks a chapter." action={<Button variant="outline" asChild><Link href="/admin/referrals">Open links &amp; partners<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>} />}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Where readers go to buy</CardTitle><CardDescription>Retailer link clicks in the same 30 days.</CardDescription></CardHeader><CardContent>
        {retailerExits.length ? <ul className="space-y-4">{retailerExits.map(row => <li key={row.retailer} className="flex items-center justify-between gap-4 text-sm"><span>{retailerLabel(row.retailer)}</span><strong className="tabular-nums">{Number(row.count).toLocaleString()}</strong></li>)}</ul> : <EmptyState icon={BookOpen} title="No retailer clicks in this period" message="Clicks are recorded when a reader follows a book's retailer link. They do not confirm a purchase." action={<Link href="/admin/books" className="admin-inline-link">Review book links<ArrowRight className="size-4" aria-hidden="true" /></Link>} />}
      </CardContent></Card>
    </div>
    <Card className="mt-6"><CardHeader><CardTitle>Partners bringing readers in</CardTitle><CardDescription>Top five by referral clicks in the same 30 days.</CardDescription></CardHeader><CardContent>
      {activePartners.length ? <Table><TableHeader><TableRow><TableHead>Partner</TableHead><TableHead className="text-right">Link clicks</TableHead><TableHead className="text-right">Chapter unlocks</TableHead></TableRow></TableHeader><TableBody>{activePartners.map(partner => <TableRow key={partner.id}><TableCell><Link href={`/admin/referrals/${partner.id}`} className="font-semibold underline underline-offset-4">{partner.name}</Link></TableCell><TableCell className="text-right tabular-nums">{Number(partner.clicks).toLocaleString()}</TableCell><TableCell className="text-right tabular-nums">{Number(partner.unlocks).toLocaleString()}</TableCell></TableRow>)}</TableBody></Table> : <EmptyState icon={Share2} title="Give your next conversation a link" message="Share a partner's referral link after a podcast or conversation. Clicks and chapter unlocks will show which links readers use." action={<Link href="/admin/referrals" className="admin-inline-link">Open links &amp; partners<ArrowRight className="size-4" aria-hidden="true" /></Link>} />}
    </CardContent></Card>
  </>;
}
