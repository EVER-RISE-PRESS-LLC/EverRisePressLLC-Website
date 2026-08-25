"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, Mail, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/admin/format";

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

export function LeadsClient({
  leads,
  bookOptions,
  partnerOptions,
  filters,
  page,
  totalPages,
  total,
}: {
  leads: LeadRow[];
  bookOptions: { id: string; title: string }[];
  partnerOptions: { id: string; name: string }[];
  filters: { q: string; book: string; partner: string };
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    router.push(`/admin/leads${next.toString() ? `?${next.toString()}` : ""}`);
  }

  const exportUrl = `/api/admin/leads/export?${new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v)
  ).toString()}`;

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${total.toLocaleString()} captured email${total === 1 ? "" : "s"}`}
      >
        <Button asChild variant="outline">
          <a href={exportUrl} download>
            <Download className="size-4" />
            Export CSV
          </a>
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form
          key={`${filters.q}-${filters.book}-${filters.partner}`}
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const query = String(formData.get("q") ?? "").trim();
            updateParams({ q: query || null, page: null });
          }}
        >
          <Input
            name="q"
            placeholder="Search email…"
            defaultValue={filters.q}
            className="w-56"
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
        <Select
          value={filters.book || "all"}
          onValueChange={(v) => updateParams({ book: v === "all" ? null : v, page: null })}
        >
          <SelectTrigger className="w-56" aria-label="Filter by book">
            <SelectValue placeholder="All books" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All books</SelectItem>
            {bookOptions.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.partner || "all"}
          onValueChange={(v) => updateParams({ partner: v === "all" ? null : v, page: null })}
        >
          <SelectTrigger className="w-56" aria-label="Filter by partner">
            <SelectValue placeholder="All partners" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All partners</SelectItem>
            {partnerOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filters.q || filters.book || filters.partner) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateParams({ q: null, book: null, partner: null, page: null })}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        )}
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No leads found"
          message="Leads appear here when readers unlock Chapter 1 with their email."
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Mailchimp</TableHead>
                <TableHead>Unlocked</TableHead>
                <TableHead>Captured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-mono text-xs">{lead.email}</TableCell>
                  <TableCell className="text-sm">{lead.bookTitle}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lead.partnerName ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lead.sourceUtm ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.isSyncedEsp ? "default" : "outline"}>
                      {lead.isSyncedEsp ? "Synced" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(lead.unlockedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
