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

export function AuthorRowActions({
  author,
  canDelete = false,
  bookCount = 0,
  articleCount = 0,
}: {
  author: { id: string; name: string; slug: string };
  canDelete?: boolean;
  bookCount?: number;
  articleCount?: number;
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
      const res = await fetch(`/api/admin/authors/${author.id}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(
          res.status === 401
            ? "Your session expired. Sign in again before deleting this author."
            : (data?.error ??
                "We could not delete this author. Please try again."),
        );
        return;
      }
      setOpen(false);
      toast.success("Author deleted");
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
            aria-label={`More actions for ${author.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-w-72">
          <DropdownMenuItem asChild className="min-h-11">
            <Link href={`/admin/authors/${author.id}`}>
              <Pencil className="size-4" /> Edit author
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="min-h-11">
            <a
              href={`/authors/${author.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4" /> View profile
            </a>
          </DropdownMenuItem>
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={bookCount > 0 || articleCount > 0}
                className="min-h-11 text-destructive focus:text-destructive"
                onSelect={() => {
                  setConfirmation("");
                  setError(null);
                  setOpen(true);
                }}
              >
                <Trash2 className="size-4" /> Delete author
              </DropdownMenuItem>
              {bookCount > 0 || articleCount > 0 ? (
                <p className="px-2 py-1.5 text-xs leading-relaxed text-muted-foreground">
                  Used by {bookCount} {bookCount === 1 ? "book" : "books"} and{" "}
                  {articleCount} {articleCount === 1 ? "article" : "articles"}.
                  Reassign books and article bylines, including archived
                  articles, before deleting the profile.
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
              Delete {author.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the author profile and public author
              page. Authors used by books or article bylines, including archived
              articles, cannot be deleted. This action cannot be undone.
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
              Keep author
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
              {deleting ? "Deleting…" : "Delete author"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
