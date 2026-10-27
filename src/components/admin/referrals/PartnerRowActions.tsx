"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, Pencil, Eye, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function PartnerRowActions({
  partner,
  isAdmin,
  onEdit,
}: {
  partner: { id: string; name: string; slug: string; isActive: boolean };
  isAdmin: boolean;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleActive(active: boolean) {
    if (saving || !isAdmin) return;
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="size-11" disabled={saving} aria-label={`Actions for ${partner.name}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/admin/referrals/${partner.id}`)}>
          <Eye className="size-4" />
          View activity
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
        ) : null}
        {isAdmin ? (
          <>
            <DropdownMenuSeparator />
            {partner.isActive ? (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => { setError(null); setDeactivateOpen(true); }}
                  >
                    <PowerOff className="size-4" />
                    Deactivate
                  </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => toggleActive(true)}>
                <Power className="size-4" />
                Reactivate
              </DropdownMenuItem>
            )}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
    <AlertDialog open={deactivateOpen} onOpenChange={(open) => { if (!saving) setDeactivateOpen(open); }}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Deactivate {partner.name}?</AlertDialogTitle><AlertDialogDescription>The /refer/{partner.slug} link will send visitors to the homepage and stop recording new visits. Existing reader and visit records stay saved. You can reactivate the link at any time.</AlertDialogDescription></AlertDialogHeader>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter><AlertDialogCancel disabled={saving} className="min-h-11">Keep active</AlertDialogCancel><AlertDialogAction disabled={saving} className="min-h-11" onClick={(event) => { event.preventDefault(); void toggleActive(false); }}>{saving ? "Deactivating…" : "Deactivate link"}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
