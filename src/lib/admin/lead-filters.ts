import { sql } from "drizzle-orm";

export interface LeadFilters {
  q: string;
  book: string;
  partner: string;
  from: string;
  to: string;
}

type FilterInput = Partial<Record<keyof LeadFilters, string | string[] | undefined>>;

function single(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseLeadFilters(input: FilterInput): { filters: LeadFilters; notice: string | null } {
  const filters: LeadFilters = {
    q: single(input.q).slice(0, 254),
    book: single(input.book),
    partner: single(input.partner),
    from: single(input.from),
    to: single(input.to),
  };
  let notice: string | null = null;
  for (const key of ["from", "to"] as const) {
    if (filters[key] && !validDate(filters[key])) {
      filters[key] = "";
      notice = "An invalid date was ignored. Choose a date from the calendar and apply the filters again.";
    }
  }
  if (filters.from && filters.to && filters.from > filters.to) {
    filters.from = "";
    filters.to = "";
    notice = "The start date must be on or before the end date. The date filter was cleared.";
  }
  return { filters, notice };
}

export function buildLeadWhere(filters: LeadFilters) {
  const conditions = [];
  if (filters.q) {
    // D1 limits LIKE/GLOB patterns to 50 bytes; literal substring search also
    // keeps valid email characters such as percent and underscore literal.
    conditions.push(sql`instr(lower(l.email), lower(${filters.q})) > 0`);
  }
  if (filters.book) conditions.push(sql`l.book_id = ${filters.book}`);
  if (filters.partner) conditions.push(sql`l.partner_id = ${filters.partner}`);
  if (filters.from) conditions.push(sql`date(l.created_at) >= ${filters.from}`);
  if (filters.to) conditions.push(sql`date(l.created_at) <= ${filters.to}`);
  return conditions.length ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;
}

export function csvCell(value: string | null | undefined): string {
  let text = value ?? "";
  // Keep spreadsheet applications from treating reader-supplied text as a formula.
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
