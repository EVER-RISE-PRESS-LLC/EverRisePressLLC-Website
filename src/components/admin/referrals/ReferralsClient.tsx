"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, Share2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PartnerFormDialog, type PartnerRow } from "./PartnerFormDialog";
import { PartnerRowActions } from "./PartnerRowActions";

export interface PartnerListRow extends PartnerRow {
  clicks: number;
  leads: number;
  createdAt: string;
}

const PAGE_SIZE = 15;

export function ReferralsClient({ partners, isAdmin, siteUrl }: {
  partners: PartnerListRow[];
  isAdmin: boolean;
  siteUrl: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<PartnerRow | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return partners.filter((partner) =>
      (status === "all" || partner.isActive === (status === "active")) &&
      (!search || [partner.name, partner.slug, partner.contactEmail].some((value) => value.toLowerCase().includes(search)))
    );
  }, [partners, query, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasFilters = Boolean(query || status !== "all");

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setPage(1);
  }

  function partnerLink(partner: PartnerListRow) {
    return <span className="inline-flex max-w-full items-center gap-2 text-sm text-muted-foreground [&_button]:size-11"><span className="break-all">/refer/{partner.slug}</span><CopyLinkButton text={`${siteUrl}/refer/${partner.slug}`} label={`Copy referral link for ${partner.name}`} /></span>;
  }

  return (
    <>
      <PageHeader title="Links & partners" description="Give each podcast partner a referral link and see the readers it brings in.">
        {isAdmin && <Button className="min-h-11" onClick={() => setCreateOpen(true)}><Plus className="size-4" />Add partner</Button>}
      </PageHeader>

      <p className="mb-6 max-w-3xl text-sm leading-6 text-muted-foreground">Copy a partner’s link and share it with them. Recorded visits and saved reader emails appear here when analytics is enabled for the visitor. Counts are all time and may include repeat visits.</p>

      {partners.length > 0 && <div className="mb-5 flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1 space-y-2 sm:max-w-md"><Label htmlFor="partner-search">Find a partner</Label><div className="relative"><Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" aria-hidden="true" /><Input id="partner-search" type="search" placeholder="Name, email, or referral link" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="min-h-11 pl-9" /></div></div>
        <div className="w-full space-y-2 sm:w-44"><Label htmlFor="partner-status">Link status</Label><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}><SelectTrigger id="partner-status" className="min-h-11 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All partners</SelectItem><SelectItem value="active">Active links</SelectItem><SelectItem value="inactive">Inactive links</SelectItem></SelectContent></Select></div>
        {hasFilters && <Button variant="ghost" className="min-h-11" onClick={clearFilters}>Clear filters</Button>}
      </div>}

      <p role="status" className="mb-3 text-sm text-muted-foreground">{filtered.length.toLocaleString()} partner{filtered.length === 1 ? "" : "s"}{hasFilters ? " match your filters" : ""}{totalPages > 1 ? ` · Page ${safePage} of ${totalPages}` : ""}</p>

      {visible.length === 0 ? <EmptyState icon={Share2} title={partners.length ? "No partners match these filters" : "Every partner gets their own link"} message={partners.length ? "Try a different name or show all link statuses." : isAdmin ? "Add a podcast partner, then copy their link. Creating a partner sends no email." : "An administrator can add podcast partners. Their referral activity will appear here."} action={partners.length ? <Button variant="outline" className="min-h-11" onClick={clearFilters}>Clear filters</Button> : isAdmin ? <Button className="min-h-11" onClick={() => setCreateOpen(true)}><Plus className="size-4" />Add partner</Button> : undefined} /> : <>
        <div className="hidden rounded-xl border bg-card md:block"><Table>
          <TableHeader><TableRow><TableHead>Partner</TableHead><TableHead>Referral link</TableHead><TableHead className="text-right">Visits</TableHead><TableHead className="text-right">Readers</TableHead><TableHead>Link status</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
          <TableBody>{visible.map((partner) => <TableRow key={partner.id}>
            <TableCell className="max-w-64 whitespace-normal"><Link href={`/admin/referrals/${partner.id}`} className="inline-flex min-h-11 items-center font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{partner.name}</Link><p className="break-all text-sm text-muted-foreground">{partner.contactEmail}</p></TableCell>
            <TableCell className="max-w-72 whitespace-normal">{partnerLink(partner)}</TableCell>
            <TableCell className="text-right tabular-nums">{Number(partner.clicks).toLocaleString()}</TableCell>
            <TableCell className="text-right tabular-nums">{Number(partner.leads).toLocaleString()}</TableCell>
            <TableCell><Badge variant={partner.isActive ? "default" : "secondary"}>{partner.isActive ? "Active" : "Inactive"}</Badge></TableCell>
            <TableCell><PartnerRowActions partner={partner} isAdmin={isAdmin} onEdit={() => setEditPartner(partner)} /></TableCell>
          </TableRow>)}</TableBody>
        </Table></div>
        <ul className="divide-y rounded-xl border bg-card md:hidden">{visible.map((partner) => <li key={partner.id} className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`/admin/referrals/${partner.id}`} className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">{partner.name}</Link><p className="break-all text-sm text-muted-foreground">{partner.contactEmail}</p></div><PartnerRowActions partner={partner} isAdmin={isAdmin} onEdit={() => setEditPartner(partner)} /></div>
          {partnerLink(partner)}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"><Badge variant={partner.isActive ? "default" : "secondary"}>{partner.isActive ? "Active" : "Inactive"}</Badge><span className="tabular-nums">{Number(partner.clicks).toLocaleString()} visits</span><span className="tabular-nums">{Number(partner.leads).toLocaleString()} readers</span></div>
        </li>)}</ul>
      </>}

      {totalPages > 1 && <nav aria-label="Partner pages" className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} partners</p><div className="flex gap-2"><Button variant="outline" className="min-h-11" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}><ChevronLeft className="size-4" />Previous</Button><Button variant="outline" className="min-h-11" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>Next<ChevronRight className="size-4" /></Button></div></nav>}

      <PartnerFormDialog open={createOpen} onOpenChange={setCreateOpen} partner={null} isAdmin={isAdmin} />
      <PartnerFormDialog open={Boolean(editPartner)} onOpenChange={(open) => { if (!open) setEditPartner(null); }} partner={editPartner} isAdmin={isAdmin} />
    </>
  );
}
