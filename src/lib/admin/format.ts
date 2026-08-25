const LABELS: Record<string, string> = {
  AMAZON_KDP: "Amazon",
  DRAFT2DIGITAL: "Draft2Digital",
  INGRAMSPARK: "IngramSpark",
  APPLE_BOOKS: "Apple Books",
  BARNES_AND_NOBLE: "Barnes & Noble",
  KOBO: "Kobo",
  BOOKSHOP_ORG: "Bookshop.org",
};

export function retailerLabel(retailer: string): string {
  return LABELS[retailer] ?? retailer;
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "—";
  return `$${Number(price).toFixed(2)}`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr.replace(" ", "T")}Z`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
