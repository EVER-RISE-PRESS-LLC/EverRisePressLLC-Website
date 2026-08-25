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

  async function toggleActive(active: boolean) {
    try {
      const res = await fetch(`/api/admin/referrals/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: active }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        toast.error(data?.error ?? "Update failed. Try again.");
        return;
      }
      toast.success(active ? "Partner reactivated" : "Partner deactivated");
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
        <Pencil className="size-3.5" />
        Edit
      </Button>
      {partner.isActive ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <PowerOff className="size-3.5" />
              Deactivate
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate {partner.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Their /refer/{partner.slug} link will redirect to the homepage and stop
                recording clicks. You can reactivate anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => toggleActive(false)}>
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button variant="outline" size="sm" onClick={() => toggleActive(true)}>
          <Power className="size-3.5" />
          Reactivate
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
