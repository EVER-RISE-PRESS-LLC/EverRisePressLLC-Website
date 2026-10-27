"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, Mail, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/admin/format";
import type { LeadFilters } from "@/lib/admin/lead-filters";

export interface LeadRow {
  id: string;
  email: string;
  bookTitle: string;
  partnerName: string | null;
  sourceUtm: string | null;
  isSyncedEsp: boolean;
  unlockedAt: string;
  createdAt: string;
}

export function LeadsClient({ leads, bookOptions, partnerOptions, filters, notice, page, totalPages, total }: {
  leads: LeadRow[];
  bookOptions: { id: string; title: string }[];
  partnerOptions: { id: string; name: string }[];
  filters: LeadFilters;
  notice?: string | null;
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [exporting, setExporting] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const hasFilters = Object.values(filters).some(Boolean);

  function navigate(params: URLSearchParams) {
    startTransition(() => router.push(`/admin/leads${params.size ? `?${params}` : ""}`, { scroll: false }));
  }

  async function exportReaders() {
    setExporting(true);
    try {
      const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
      const response = await fetch(`/api/admin/leads/export?${params}`);
      if (!response.ok || !response.headers.get("content-type")?.includes("text/csv")) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(response.status === 401 ? "Your session ended. Sign in again, then export the readers." : data?.error ?? "The export could not be prepared. Try again.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `everrise-readers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(`CSV prepared with ${total.toLocaleString()} reader${total === 1 ? "" : "s"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The export could not be prepared. Check your connection and try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHeader title="Readers" description="People who saved their email to open Chapter 1 on the website.">
        <Button variant="outline" className="min-h-11" disabled={exporting || pending || total === 0} onClick={exportReaders}>
          <Download className="size-4" />
          {exporting ? "Preparing CSV…" : hasFilters ? "Export filtered readers" : "Export readers"}
        </Button>
      </PageHeader>

      <p className="mb-6 max-w-3xl text-sm leading-6 text-muted-foreground">Chapter signup does not send an automated email or subscribe readers to a newsletter. Export includes all readers matching the applied filters.</p>

      <form
        key={JSON.stringify(filters)}
        className="mb-6 space-y-4 rounded-xl border bg-card p-4 sm:p-5"
        aria-label="Filter readers"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const from = String(data.get("from") ?? "");
          const to = String(data.get("to") ?? "");
          if (from && to && from > to) {
            setFilterError("Choose an end date on or after the start date.");
            return;
          }
          setFilterError(null);
          const params = new URLSearchParams();
          for (const key of ["q", "book", "partner", "from", "to"]) {
            const value = String(data.get(key) ?? "").trim();
            if (value && value !== "all") params.set(key, value);
          }
          navigate(params);
        }}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="reader-search">Email address</Label>
            <Input id="reader-search" name="q" type="search" placeholder="Search all or part of an email" defaultValue={filters.q} maxLength={254} className="min-h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reader-book">Book</Label>
            <Select name="book" defaultValue={filters.book || "all"}>
              <SelectTrigger id="reader-book" className="min-h-11 w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All books</SelectItem>{bookOptions.map((book) => <SelectItem key={book.id} value={book.id}>{book.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reader-partner">Referral partner</Label>
            <Select name="partner" defaultValue={filters.partner || "all"}>
              <SelectTrigger id="reader-partner" className="min-h-11 w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All partners</SelectItem>{partnerOptions.map((partner) => <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reader-from">Saved from</Label>
            <Input id="reader-from" name="from" type="date" defaultValue={filters.from} className="min-h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reader-to">Saved through</Label>
            <Input id="reader-to" name="to" type="date" defaultValue={filters.to} className="min-h-11" />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Button type="submit" disabled={pending} className="min-h-11"><Search className="size-4" />{pending ? "Applying…" : "Apply filters"}</Button>
            {hasFilters && <Button type="button" variant="ghost" disabled={pending} className="min-h-11" onClick={() => { setFilterError(null); navigate(new URLSearchParams()); }}><RotateCcw className="size-4" />Clear filters</Button>}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Date filters include both selected days and use UTC.</p>
        {(filterError || notice) && <p role="alert" className="text-sm text-destructive">{filterError || notice}</p>}
      </form>

      <div aria-busy={pending}>
        <p role="status" className="mb-3 text-sm text-muted-foreground">
          {pending ? "Updating reader results…" : total ? `Showing ${((page - 1) * 20 + 1).toLocaleString()}–${Math.min(page * 20, total).toLocaleString()} of ${total.toLocaleString()} reader${total === 1 ? "" : "s"}${hasFilters ? " matching your filters" : ""}` : "0 readers"}
        </p>
        {leads.length === 0 ? (
          <EmptyState icon={Mail} title={hasFilters ? "No readers match these filters" : "Your reader list starts here"} message={hasFilters ? "Try a different email, book, partner, or date range." : "Readers appear here after saving their email to open Chapter 1. Share the chapter page or a partner referral link to get started."} action={hasFilters ? <Button variant="outline" className="min-h-11" onClick={() => navigate(new URLSearchParams())}>Clear filters</Button> : undefined} />
        ) : (
          <>
            <div className="hidden rounded-xl border bg-card md:block">
              <Table>
                <TableHeader><TableRow><TableHead>Email address</TableHead><TableHead>Book</TableHead><TableHead>Referral</TableHead><TableHead>Chapter opened</TableHead><TableHead>Email saved</TableHead></TableRow></TableHeader>
                <TableBody>{leads.map((lead) => <TableRow key={lead.id}>
                  <TableCell className="max-w-72 break-all whitespace-normal font-medium">{lead.email}</TableCell>
                  <TableCell className="max-w-64 whitespace-normal text-sm">{lead.bookTitle}</TableCell>
                  <TableCell className="max-w-56 whitespace-normal text-sm text-muted-foreground">{lead.partnerName ?? lead.sourceUtm ?? "No partner recorded"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(lead.unlockedAt)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(lead.createdAt)}</TableCell>
                </TableRow>)}</TableBody>
              </Table>
            </div>
            <ul className="divide-y rounded-xl border bg-card md:hidden">{leads.map((lead) => <li key={lead.id} className="space-y-3 p-4">
              <p className="break-all font-semibold">{lead.email}</p><p className="text-sm">{lead.bookTitle}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm"><dt className="text-muted-foreground">Referral</dt><dd className="break-words">{lead.partnerName ?? lead.sourceUtm ?? "No partner recorded"}</dd><dt className="text-muted-foreground">Chapter opened</dt><dd>{formatDate(lead.unlockedAt)}</dd><dt className="text-muted-foreground">Email saved</dt><dd>{formatDate(lead.createdAt)}</dd></dl>
            </li>)}</ul>
          </>
        )}
      </div>

      {totalPages > 1 && <nav aria-label="Reader pages" className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-2"><Button variant="outline" className="min-h-11" disabled={pending || page <= 1} onClick={() => { const next = new URLSearchParams(searchParams); next.set("page", String(page - 1)); navigate(next); }}><ChevronLeft className="size-4" />Previous</Button><Button variant="outline" className="min-h-11" disabled={pending || page >= totalPages} onClick={() => { const next = new URLSearchParams(searchParams); next.set("page", String(page + 1)); navigate(next); }}>Next<ChevronRight className="size-4" /></Button></div>
      </nav>}
    </>
  );
}
