"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PartnerFormDialog, type PartnerRow } from "./PartnerFormDialog";
import { toast } from "sonner";

export function PartnerDetailActions({ partner }: { partner: PartnerRow }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleActive(active: boolean) {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/referrals/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: active }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        const message = data?.error ?? "The link status could not be changed. Try again.";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success(active ? "Partner reactivated" : "Partner deactivated");
      setDeactivateOpen(false);
      router.refresh();
    } catch {
      setError("The link status was not changed. Check your connection and try again.");
      toast.error("The link status was not changed. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="outline" className="min-h-11" disabled={saving} onClick={() => setEditOpen(true)}>
        <Pencil className="size-3.5" />
        Edit partner
      </Button>
      {partner.isActive ? (
        <AlertDialog open={deactivateOpen} onOpenChange={(open) => { if (!saving) { setError(null); setDeactivateOpen(open); } }}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={saving} className="min-h-11 text-destructive hover:text-destructive">
              <PowerOff className="size-3.5" />
              Deactivate
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate {partner.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                The /refer/{partner.slug} link will send visitors to the homepage and stop
                recording new visits. Existing reader and visit records stay saved. You can reactivate the link at any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel className="min-h-11" disabled={saving}>Keep active</AlertDialogCancel>
              <AlertDialogAction className="min-h-11" disabled={saving} onClick={(event) => { event.preventDefault(); void toggleActive(false); }}>
                {saving ? "Deactivating…" : "Deactivate link"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button variant="outline" className="min-h-11" disabled={saving} onClick={() => toggleActive(true)}>
          <Power className="size-3.5" />
          {saving ? "Reactivating…" : "Reactivate link"}
        </Button>
      )}
      <PartnerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        partner={partner}
        isAdmin
      />
    </>
  );
}
