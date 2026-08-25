"use client";

import { useState } from "react";
import { Plus, Share2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PartnerFormDialog, type PartnerRow } from "./PartnerFormDialog";
import { PartnerRowActions } from "./PartnerRowActions";
import { formatDate } from "@/lib/admin/format";

export interface PartnerListRow extends PartnerRow {
  clicks: number;
  leads: number;
  createdAt: string;
}

export function ReferralsClient({
  partners,
  isAdmin,
}: {
  partners: PartnerListRow[];
  isAdmin: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<PartnerRow | null>(null);

  return (
    <>
      <PageHeader
        title="Referral Partners"
        description="Podcast partners and their attribution links."
      >
        {isAdmin ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New Partner
          </Button>
        ) : null}
      </PageHeader>

      {partners.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="No partners yet"
          message="Create your first podcast partner to start attributing referral clicks."
          action={
            isAdmin ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                New Partner
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Shareable link</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Conversion</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((p) => {
                const clicks = Number(p.clicks);
                const leads = Number(p.leads);
                const conv = clicks > 0 ? ((leads / clicks) * 100).toFixed(1) : "0.0";
                const url =
                  typeof window !== "undefined"
                    ? `${window.location.origin}/refer/${p.slug}`
                    : `/refer/${p.slug}`;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                        /refer/{p.slug}
                        <CopyLinkButton text={url} label={`Copy ${p.name} link`} />
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.contactEmail}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "default" : "secondary"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {clicks.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {leads.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{conv}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(p.createdAt)}
                    </TableCell>
                    <TableCell>
                      <PartnerRowActions
                        partner={p}
                        isAdmin={isAdmin}
                        onEdit={() => setEditPartner(p)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <PartnerFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        partner={null}
        isAdmin={isAdmin}
      />
      <PartnerFormDialog
        open={Boolean(editPartner)}
        onOpenChange={(open) => {
          if (!open) setEditPartner(null);
        }}
        partner={editPartner}
        isAdmin={isAdmin}
      />
    </>
  );
}
