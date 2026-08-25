"use client";

import { useRouter } from "next/navigation";
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
  AlertDialogTrigger,
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${partner.name}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/admin/referrals/${partner.id}`)}>
          <Eye className="size-4" />
          View detail
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <PowerOff className="size-4" />
                    Deactivate
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate {partner.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Their /refer/{partner.slug} link will redirect to the homepage and
                      stop recording clicks. You can reactivate anytime.
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
              <DropdownMenuItem onClick={() => toggleActive(true)}>
                <Power className="size-4" />
                Reactivate
              </DropdownMenuItem>
            )}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
