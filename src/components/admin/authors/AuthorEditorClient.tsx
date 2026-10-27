"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ExternalLink } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { authorCreateSchema, imageUrlSchema } from "@/lib/admin/validation";
import { CatalogEditorState } from "../books/CatalogEditorState";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { useDraftRecovery } from "../books/useDraftRecovery";
import { DraftRecoveryNotice } from "../books/DraftRecoveryNotice";
import { draftSignature } from "@/lib/admin/draft-recovery";

const optionalLink = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Enter a full link beginning with https://, or leave this blank.");
const formSchema = authorCreateSchema.omit({ socialLinks: true }).extend({
  title: z.string(),
  avatarUrl: imageUrlSchema.or(z.literal("")),
  website: optionalLink,
  linkedin: optionalLink,
  facebook: optionalLink,
  twitter: optionalLink,
});
const recoverySchema = z.object({
  name: z.string(),
  slug: z.string(),
  title: z.string(),
  bio: z.string(),
  avatarUrl: z.string(),
  website: z.string(),
  linkedin: z.string(),
  facebook: z.string(),
  twitter: z.string(),
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
const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const socialFields = [
  { name: "website", label: "Website", placeholder: "https://" },
  {
    name: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/",
  },
  { name: "facebook", label: "Facebook", placeholder: "https://facebook.com/" },
  { name: "twitter", label: "X / Twitter", placeholder: "https://x.com/" },
] as const;

export function AuthorEditorClient({
  authorId,
  author,
}: {
  authorId: string | null;
  author: AuthorEditorData | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(author));
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
  const [baseline, setBaseline] = useState(() =>
    draftSignature(form.getValues()),
  );
  const currentDraft = useWatch({ control: form.control }) as FormValues;
  const recovery = useDraftRecovery<FormValues>({
    storageKey: `author:${authorId ?? "new"}`,
    baseline,
    current: currentDraft,
    dirty: form.formState.isDirty,
    parse: (value) => {
      const parsed = recoverySchema.safeParse(value);
      return parsed.success ? parsed.data : null;
    },
    onRestore: (value, info) => {
      form.reset(value, { keepDefaultValues: true });
      setSaved(false);
      setError(null);
      toast.info(
        info.baselineChanged
          ? "Local draft restored. Review it against the newer saved version before saving."
          : "Local draft restored. Choose Save author when you’re ready.",
      );
    },
  });
  const slug = useWatch({ control: form.control, name: "slug" });

  async function onSubmit(values: FormValues) {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        title: values.title,
        bio: values.bio,
        avatarUrl: values.avatarUrl,
        socialLinks: {
          ...Object.fromEntries(
            Object.entries(social).filter(
              ([key]) =>
                !["website", "linkedin", "facebook", "x", "twitter"].includes(
                  key,
                ),
            ),
          ),
          website: values.website,
          linkedin: values.linkedin,
          facebook: values.facebook,
          twitter: values.twitter,
        },
      };
      const res = await fetch(
        isEdit ? `/api/admin/authors/${authorId}` : "/api/admin/authors",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        author?: { id: string };
      } | null;
      if (!res.ok) {
        const message =
          res.status === 401
            ? "Your session has expired. Open sign in in another tab, then save again. Your changes are still here."
            : (data?.error ??
              "We could not save this author. Your changes are still here; please try again.");
        setError(message);
        toast.error(message);
        return;
      }
      recovery.clear();
      form.reset(values);
      setBaseline(draftSignature(values));
      setSaved(true);
      toast.success(isEdit ? "Author saved" : "Author created");
      if (!isEdit && data?.author?.id)
        router.replace(`/admin/authors/${data.author.id}`);
      router.refresh();
    } catch {
      setError(
        "We could not reach the server. Check your connection and save again. Your changes are still here.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit, () => {
          setError(
            "A few fields need attention. Check the messages below, then save again.",
          );
          toast.error("Check the highlighted fields before saving.");
        })}
        className="pb-2"
      >
        <DraftRecoveryNotice {...recovery} noun="author" />
        <Link
          href="/admin/authors"
          className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> All authors
        </Link>
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit author" : "Add an author"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {isEdit
                ? "Keep the author’s introduction, photo and links up to date."
                : "Create the profile readers will see alongside this author’s books."}
            </p>
          </div>
          {isEdit && author ? (
            <Button
              variant="outline"
              type="button"
              asChild
              className="min-h-11"
            >
              <a
                href={`/authors/${author.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View profile <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : null}
        </div>
        <fieldset
          disabled={saving}
          className="grid min-w-0 items-start gap-6 disabled:opacity-70 xl:grid-cols-[minmax(0,1fr)_300px]"
        >
          <div className="min-w-0 space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="font-sans text-lg">
                  Author profile
                </CardTitle>
                <CardDescription>
                  Fields marked * are required. Saved changes appear on the
                  public author page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="name"
                          className="min-h-11"
                          onChange={(event) => {
                            field.onChange(event);
                            if (!slugEdited && !isEdit)
                              form.setValue(
                                "slug",
                                slugify(event.target.value),
                                { shouldDirty: true },
                              );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role or short introduction</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="min-h-11"
                          placeholder="For example, Author"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional. Use the author’s approved title.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biography *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={12}
                          {...field}
                          className="min-h-64 leading-relaxed"
                        />
                      </FormControl>
                      <FormDescription>
                        Introduce the author in their approved words. Plain text
                        is welcome.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page address *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly={isEdit}
                          className="min-h-11"
                          onChange={(event) => {
                            setSlugEdited(true);
                            field.onChange(event);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        <span className="break-all">
                          /authors/{slug || "author-name"}
                        </span>
                        {isEdit
                          ? " · Kept fixed so existing links continue to work."
                          : " · Created from the name. You can edit it before saving."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="font-sans text-lg">
                  Website & social links
                </CardTitle>
                <CardDescription>
                  Optional. Add the author’s public profiles using full links
                  beginning with https://.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                {socialFields.map(({ name, label, placeholder }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder={placeholder}
                            className="min-h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
          <Card className="min-w-0 shadow-none">
            <CardHeader>
              <CardTitle className="font-sans text-lg">Author photo</CardTitle>
              <CardDescription>
                Choose a portrait, upload one, or leave this blank.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <MediaPicker
                      value={field.value}
                      onChange={field.onChange}
                      label="Profile photo"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </fieldset>
        <CatalogEditorState
          dirty={form.formState.isDirty}
          saving={saving}
          saved={saved}
          error={error}
          isEdit={isEdit}
          noun="author"
          onDiscard={recovery.clear}
        />
      </form>
    </Form>
  );
}
