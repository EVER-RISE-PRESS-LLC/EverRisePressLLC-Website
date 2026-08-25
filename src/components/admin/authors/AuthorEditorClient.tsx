"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers, hyphens"),
  title: z.string().trim().optional(),
  bio: z.string().trim().min(10, "Bio is required"),
  avatarUrl: z.string().trim().optional(),
  website: z.string().trim().optional(),
  linkedin: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
  twitter: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface AuthorEditorData {
  name: string;
  slug: string;
  title: string | null;
  bio: string;
  avatarUrl: string | null;
  socialLinks: Record<string, string> | null;
}

export function AuthorEditorClient({
  authorId,
  author,
}: {
  authorId: string | null;
  author: AuthorEditorData | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(authorId);

  const social = author?.socialLinks ?? {};

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: author?.name ?? "",
      slug: author?.slug ?? "",
      title: author?.title ?? "",
      bio: author?.bio ?? "",
      avatarUrl: author?.avatarUrl ?? "",
      website: social.website ?? "",
      linkedin: social.linkedin ?? "",
      facebook: social.facebook ?? "",
      twitter: social.x ?? social.twitter ?? "",
    },
  });

  const avatarUrl = useWatch({ control: form.control, name: "avatarUrl" });

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        title: values.title || "",
        bio: values.bio,
        avatarUrl: values.avatarUrl || "",
        socialLinks: {
          website: values.website ?? "",
          linkedin: values.linkedin ?? "",
          facebook: values.facebook ?? "",
          twitter: values.twitter ?? "",
        },
      };
      const res = await fetch(
        isEdit ? `/api/admin/authors/${authorId}` : "/api/admin/authors",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        toast.error(data?.error ?? "Save failed. Try again.");
        return;
      }
      toast.success(isEdit ? "Author saved" : "Author created");
      router.push("/admin/authors");
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/authors"
              className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              All authors
            </Link>
            <h1 className="font-heading text-2xl font-semibold tracking-wide">
              {isEdit ? "Edit author" : "New author"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/authors">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Shown on the author page and book metadata.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Founder & Publisher" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea rows={12} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Photo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="/images/authors/photo.jpg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl || undefined}
                  alt="Avatar preview"
                  className="mx-auto size-28 rounded-full border object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social links</CardTitle>
                <CardDescription>Optional. Used for schema.org sameAs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://linkedin.com/in/…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://facebook.com/…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>X / Twitter</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://x.com/…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
