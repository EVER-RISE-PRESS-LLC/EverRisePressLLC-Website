"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function BookRowActions({
  book,
  canDelete = false,
  hasHistory = false,
}: {
  book: { id: string; title: string; slug: string };
  canDelete?: boolean;
  hasHistory?: boolean;
}) {
  const router = useRouter();
  const confirmationId = useId();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    if (deleting || confirmation !== "DELETE") return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/books/${book.id}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(
          res.status === 401
            ? "Your session expired. Sign in again before deleting this book."
            : (data?.error ??
                "We could not delete this book. Please try again."),
        );
        return;
      }
      setOpen(false);
      toast.success("Book deleted");
      router.refresh();
    } catch {
      setError(
        "We could not reach the server. Check your connection and try again.",
      );
    } finally {
      setDeleting(false);
    }
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            aria-label={`More actions for ${book.title}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-w-72">
          <DropdownMenuItem asChild className="min-h-11">
            <Link href={`/admin/books/${book.id}`}>
              <Pencil className="size-4" /> Edit book
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="min-h-11">
            <a
              href={`/books/${book.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4" /> View book
            </a>
          </DropdownMenuItem>
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={hasHistory}
                className="min-h-11 text-destructive focus:text-destructive"
                onSelect={() => {
                  setConfirmation("");
                  setError(null);
                  setOpen(true);
                }}
              >
                <Trash2 className="size-4" /> Delete book
              </DropdownMenuItem>
              {hasHistory ? (
                <p className="px-2 py-1.5 text-xs leading-relaxed text-muted-foreground">
                  This book has reader or referral history. Keep the book and
                  update its details instead.
                </p>
              ) : null}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!deleting) setOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans">
              Delete “{book.title}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the book, its retailer links and retailer
              click history. Reader and referral history prevent deletion. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor={confirmationId}>Type DELETE to confirm</Label>
            <Input
              id={confirmationId}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              disabled={deleting}
              className="min-h-11"
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="min-h-11">
              Keep book
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting || confirmation !== "DELETE"}
              className="min-h-11 bg-destructive text-background hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {deleting ? "Deleting…" : "Delete book"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
