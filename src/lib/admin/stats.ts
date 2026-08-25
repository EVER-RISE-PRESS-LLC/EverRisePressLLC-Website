import { sql } from "drizzle-orm";
import type { Database } from "@/lib/db";

export type DailyPoint = { day: string; clicks: number; leads: number };

export function lastNDaysUtc(days: number): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function getDailySeries(db: Database, days = 30): Promise<DailyPoint[]> {
  const clicks = await db.all<{ day: string; count: number }>(
    sql`SELECT date(created_at) AS day, count(*) AS count
        FROM referral_clicks
        WHERE created_at >= datetime('now', ${`-${days} days`})
        GROUP BY date(created_at)`
  );
  const leads = await db.all<{ day: string; count: number }>(
    sql`SELECT date(created_at) AS day, count(*) AS count
        FROM leads
        WHERE created_at >= datetime('now', ${`-${days} days`})
        GROUP BY date(created_at)`
  );

  const clickMap = new Map(clicks.map((r) => [r.day, Number(r.count)]));
  const leadMap = new Map(leads.map((r) => [r.day, Number(r.count)]));

  return lastNDaysUtc(days).map((day) => ({
    day,
    clicks: clickMap.get(day) ?? 0,
    leads: leadMap.get(day) ?? 0,
  }));
}

export async function countSince(
  db: Database,
  table: "referral_clicks" | "leads" | "retailer_clicks",
  sinceDays?: number
): Promise<number> {
  const where = sinceDays
    ? sql`WHERE created_at >= datetime('now', ${`-${sinceDays} days`})`
    : sql``;
  const rows = await db.all<{ count: number }>(
    sql`SELECT count(*) AS count FROM ${sql.raw(table)} ${where}`
  );
  return Number(rows[0]?.count ?? 0);
}

export function percentDelta(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}
