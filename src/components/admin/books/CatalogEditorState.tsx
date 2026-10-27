"use client";

import { AlertCircle, Check, Loader2, Save } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { useUnsavedChanges } from "./useUnsavedChanges";

export function CatalogEditorState({
  dirty,
  saving,
  saved,
  error,
  isEdit,
  noun,
  blocked = false,
  onDiscard,
}: {
  dirty: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
  isEdit: boolean;
  noun: "book" | "author";
  blocked?: boolean;
  onDiscard?: () => void;
}) {
  const navigation = useUnsavedChanges(dirty, onDiscard);
  return (
    <>
      {error ? (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}
      <div className="sticky bottom-3 z-20 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3 shadow-sm sm:p-4">
        <p
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
          ) : saved && !dirty ? (
            <Check className="size-4 text-[var(--admin-positive)]" />
          ) : (
            <span
              className={`size-2 rounded-full ${dirty ? "bg-amber-600" : "bg-muted-foreground/50"}`}
            />
          )}
          {saving
            ? "Saving your changes…"
            : dirty
              ? "You have unsaved changes"
              : saved
                ? "All changes saved"
                : isEdit
                  ? "Up to date"
                  : `Ready for a new ${noun}`}
        </p>
        <Button
          type="submit"
          disabled={saving || blocked || (isEdit && !dirty)}
          className="min-h-11 px-5"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Saving…" : isEdit ? `Save ${noun}` : `Create ${noun}`}
        </Button>
      </div>
      <AlertDialog
        open={Boolean(navigation.pendingHref)}
        onOpenChange={(open) => {
          if (!open) navigation.cancel();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans">
              Leave without saving?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your changes to this {noun} have not been saved. Stay here to save
              them, or discard them and leave.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11"
              onClick={navigation.discard}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
