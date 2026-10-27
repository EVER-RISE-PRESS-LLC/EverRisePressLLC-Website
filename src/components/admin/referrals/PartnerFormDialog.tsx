"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { referralPartnerSchema } from "@/lib/admin/referral-validation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type FormValues = z.infer<typeof referralPartnerSchema>;

export interface PartnerRow {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  customUtm: string | null;
  isActive: boolean;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PartnerFormDialog({
  open,
  onOpenChange,
  partner,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: PartnerRow | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [confirmLinkChange, setConfirmLinkChange] = useState(false);
  const isEdit = Boolean(partner);

  const form = useForm<FormValues>({
    resolver: zodResolver(referralPartnerSchema),
    defaultValues: {
      name: partner?.name ?? "",
      slug: partner?.slug ?? "",
      contactEmail: partner?.contactEmail ?? "",
      customUtm: partner?.customUtm ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: partner?.name ?? "",
        slug: partner?.slug ?? "",
        contactEmail: partner?.contactEmail ?? "",
        customUtm: partner?.customUtm ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, partner]);

  const name = useWatch({ control: form.control, name: "name" });
  const slug = useWatch({ control: form.control, name: "slug" });
  const linkChanged = Boolean(partner && slug.trim().toLowerCase() !== partner.slug);
  const slugTouched = form.formState.touchedFields.slug;

  useEffect(() => {
    if (!isEdit && !slugTouched) {
      form.setValue("slug", slugify(name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, slugTouched, isEdit]);

  async function onSubmit(values: FormValues) {
    if (!isAdmin || saving || (linkChanged && !confirmLinkChange)) return;
    setSaving(true);
    form.clearErrors("root");
    try {
      const res = await fetch(
        isEdit ? `/api/admin/referrals/${partner!.id}` : "/api/admin/referrals",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const data = (await res.json().catch(() => null)) as { error?: string; field?: string } | null;
      if (!res.ok) {
        const message = res.status === 401 ? "Your session ended. Sign in again, then save your changes." : data?.error ?? "Your changes could not be saved. Try again.";
        form.setError(data?.field === "slug" ? "slug" : "root", { message }, { shouldFocus: true });
        return;
      }
      toast.success(isEdit ? "Partner updated" : "Partner created");
      form.reset(values);
      setConfirmLinkChange(false);
      onOpenChange(false);
      router.refresh();
    } catch {
      form.setError("root", { message: "Your changes were not saved. Check your connection and try again." });
    } finally {
      setSaving(false);
    }
  }

  function requestClose(nextOpen: boolean) {
    if (saving) return;
    if (!nextOpen && form.formState.isDirty) setDiscardOpen(true);
    else { setConfirmLinkChange(false); onOpenChange(nextOpen); }
  }

  if (!isAdmin) return null;

  return (
    <>
    <Dialog open={open} onOpenChange={requestClose}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg" onEscapeKeyDown={(event) => { if (saving) event.preventDefault(); }} onInteractOutside={(event) => { if (saving) event.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit partner" : "New referral partner"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this podcast partner's details."
              : "Add a partner, then copy their referral link to share with them."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" aria-busy={saving}>
            <fieldset disabled={saving} className="space-y-5 disabled:opacity-70">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="The Growth Mindset Podcast" maxLength={150} autoComplete="organization" className="min-h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral link name</FormLabel>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-sm text-muted-foreground" aria-hidden="true">/refer/</span>
                    <FormControl><Input placeholder="growth-mindset-podcast" maxLength={100} autoCapitalize="none" spellCheck={false} className="min-h-11" {...field} /></FormControl>
                  </div>
                  <FormDescription>Use a short name that is easy to read aloud. Letters, numbers, and hyphens work here.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="host@podcast.com" maxLength={254} autoComplete="email" className="min-h-11" {...field} />
                  </FormControl>
                  <FormDescription>Saved for your records. Creating a partner sends no email.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <details className="rounded-lg border p-3">
              <summary className="min-h-8 cursor-pointer text-sm font-medium">Optional internal label</summary>
              <div className="pt-3"><FormField
              control={form.control}
              name="customUtm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal label</FormLabel>
                  <FormControl>
                    <Input placeholder="Spring podcast launch" maxLength={200} className="min-h-11" {...field} />
                  </FormControl>
                  <FormDescription>For your records only. This label does not change the referral link or its tracking.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /></div></details>
            {linkChanged && <div className="space-y-3 rounded-lg border border-destructive/30 p-3 text-sm"><p>Changing this link name stops the old /refer/{partner?.slug} link from recording visits. Share the new link with your partner after saving.</p><label className="flex min-h-11 items-start gap-2"><input type="checkbox" checked={confirmLinkChange} onChange={(event) => setConfirmLinkChange(event.target.checked)} className="mt-1 size-4 accent-primary" /><span>I understand that the old link will stop working.</span></label></div>}
            </fieldset>
            {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={saving} className="min-h-11" onClick={() => requestClose(false)}>
                Cancel
              </Button>
              <Button type="submit" className="min-h-11" disabled={saving || (linkChanged && !confirmLinkChange)}>
                {saving ? "Saving…" : isEdit ? "Save changes" : "Create partner"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle><AlertDialogDescription>Your partner details have not been saved. Keep editing to finish them, or discard this draft.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="min-h-11">Keep editing</AlertDialogCancel><AlertDialogAction className="min-h-11" onClick={() => { setConfirmLinkChange(false); onOpenChange(false); }}>Discard changes</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
    </>
  );
}
