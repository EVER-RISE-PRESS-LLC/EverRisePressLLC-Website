"use client";

import { AlertCircle } from "lucide-react";
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
import type { DraftRecoveryInfo } from "./useDraftRecovery";

export function DraftRecoveryNotice({
  recovery,
  restore,
  discard,
  storageError,
  noun = "draft",
}: {
  recovery: DraftRecoveryInfo | null;
  restore: () => void;
  discard: () => void;
  storageError: string | null;
  noun?: string;
}) {
  return (
    <>
      {storageError ? (
        <p
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {storageError}
        </p>
      ) : null}
      <AlertDialog open={Boolean(recovery)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans">
              Recover your unsaved {noun}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              A local copy from{" "}
              {recovery
                ? new Date(recovery.savedAt).toLocaleString()
                : "this tab"}{" "}
              is available. Restoring it brings the writing back into the
              editor. Keeping the saved version discards this local copy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {recovery?.baselineChanged ? (
            <p className="rounded-lg border bg-muted p-3 text-sm leading-relaxed">
              The saved version has changed since this copy was made. Review the
              recovered changes before saving so you do not replace newer work.
            </p>
          ) : null}
          {storageError ? (
            <p role="alert" className="text-sm text-destructive">
              {storageError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11" onClick={discard}>
              Keep saved version
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11"
              onClick={(event) => {
                event.preventDefault();
                restore();
              }}
            >
              Restore local draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
