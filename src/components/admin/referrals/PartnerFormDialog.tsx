"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers, hyphens"),
  contactEmail: z.string().trim().toLowerCase().email("Valid email required"),
  customUtm: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
  const isEdit = Boolean(partner);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
  const slugTouched = form.formState.touchedFields.slug;

  useEffect(() => {
    if (!isEdit && !slugTouched) {
      form.setValue("slug", slugify(name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, slugTouched, isEdit]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/referrals/${partner!.id}` : "/api/admin/referrals",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        toast.error(data?.error ?? "Save failed. Try again.");
        return;
      }
      toast.success(isEdit ? "Partner updated" : "Partner created");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit partner" : "New referral partner"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this podcast partner's details."
              : "Create a podcast partner. Their shareable link will be /refer/<slug>."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="The Growth Mindset Podcast" {...field} />
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
                  <FormLabel>Vanity slug</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="mr-1 text-sm text-muted-foreground">/refer/</span>
                      <Input placeholder="growth-mindset-podcast" {...field} />
                    </div>
                  </FormControl>
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
                    <Input type="email" placeholder="host@podcast.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customUtm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom UTM (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="podcast-launch-2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : isEdit ? "Save changes" : "Create partner"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
