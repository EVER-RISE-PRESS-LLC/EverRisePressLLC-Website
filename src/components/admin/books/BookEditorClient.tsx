"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { retailerLabel } from "@/lib/admin/format";

const formSchema = z.object({
  book: z.object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers, hyphens"),
    title: z.string().trim().min(2, "Title is required"),
    subtitle: z.string(),
    synopsis: z.string().trim().min(10, "Synopsis is required"),
    coverImageUrl: z.string().trim().min(1, "Cover image URL is required"),
    chapterOneTitle: z.string().trim().min(1, "Chapter title is required"),
    chapterOneBody: z.string().min(10, "Chapter content is required"),
    authorId: z.string().min(1, "Author is required"),
    publishedAt: z.string(),
  }),
  formats: z.array(
    z.object({
      id: z.string().optional(),
      formatType: z.enum(["EBOOK", "PAPERBACK", "HARDCOVER", "AUDIOBOOK"]),
      isbn: z.string(),
      retailPrice: z.coerce.number().min(0, "Price must be 0 or more"),
      currency: z.string().min(1).default("USD"),
      distributor: z.enum([
        "AMAZON_KDP",
        "DRAFT2DIGITAL",
        "INGRAMSPARK",
        "APPLE_BOOKS",
        "BARNES_AND_NOBLE",
        "KOBO",
        "BOOKSHOP_ORG",
      ]),
      purchaseUrl: z.string().trim().url("Valid URL required"),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

type FormatRow = FormValues["formats"][number];

const FORMAT_TYPES = ["EBOOK", "PAPERBACK", "HARDCOVER", "AUDIOBOOK"] as const;
const DISTRIBUTORS = [
  "AMAZON_KDP",
  "DRAFT2DIGITAL",
  "INGRAMSPARK",
  "APPLE_BOOKS",
  "BARNES_AND_NOBLE",
  "KOBO",
  "BOOKSHOP_ORG",
] as const;

function emptyFormat(): FormatRow {
  return {
    formatType: "EBOOK",
    distributor: "DRAFT2DIGITAL",
    isbn: "",
    retailPrice: 0,
    currency: "USD",
    purchaseUrl: "",
  };
}

export function BookEditorClient({
  bookId,
  book,
  formats,
  authors,
}: {
  bookId: string | null;
  book: {
    slug: string;
    title: string;
    subtitle: string | null;
    synopsis: string;
    coverImageUrl: string;
    chapterOneTitle: string;
    chapterOneBody: string;
    authorId: string;
    publishedAt: string | null;
  } | null;
  formats: FormatRow[];
  authors: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(bookId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      book: book
        ? {
            slug: book.slug,
            title: book.title,
            subtitle: book.subtitle ?? "",
            synopsis: book.synopsis,
            coverImageUrl: book.coverImageUrl,
            chapterOneTitle: book.chapterOneTitle,
            chapterOneBody: book.chapterOneBody,
            authorId: book.authorId,
            publishedAt: book.publishedAt ?? "",
          }
        : {
            slug: "",
            title: "",
            subtitle: "",
            synopsis: "",
            coverImageUrl: "",
            chapterOneTitle: "Chapter 1",
            chapterOneBody: "",
            authorId: authors[0]?.id ?? "",
            publishedAt: "",
          },
      formats: formats.length > 0 ? formats : [emptyFormat()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "formats",
  });

  const coverImageUrl = useWatch({ control: form.control, name: "book.coverImageUrl" });

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const payload = {
        book: {
          ...values.book,
          subtitle: values.book.subtitle || undefined,
          publishedAt: values.book.publishedAt || undefined,
        },
        formats: values.formats.map((f) => ({
          ...f,
          isbn: f.isbn || undefined,
          currency: f.currency || "USD",
        })),
      };
      const res = await fetch(
        isEdit ? `/api/admin/books/${bookId}` : "/api/admin/books",
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
      toast.success(isEdit ? "Book saved" : "Book created");
      router.push("/admin/books");
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
              href="/admin/books"
              className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              All books
            </Link>
            <h1 className="font-heading text-2xl font-semibold tracking-wide">
              {isEdit ? "Edit book" : "New book"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/books">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book details</CardTitle>
                <CardDescription>
                  Everything readers see on the book landing page and reader.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="book.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="book.subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="book.slug"
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
                  <FormField
                    control={form.control}
                    name="book.authorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select author" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {authors.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="book.coverImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover image URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="/images/books/cover.webp" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="book.publishedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Published date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="book.synopsis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Synopsis</FormLabel>
                      <FormControl>
                        <Textarea rows={7} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chapter 1</CardTitle>
                <CardDescription>
                  Gated reading content. HTML allowed; paragraphs as &lt;p&gt; tags.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="book.chapterOneTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapter title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="book.chapterOneBody"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapter body (HTML)</FormLabel>
                      <FormControl>
                        <Textarea rows={14} className="font-mono text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cover preview</CardTitle>
              </CardHeader>
              <CardContent>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl || undefined}
                  alt="Cover preview"
                  className="mx-auto max-h-72 rounded-md border object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retail formats</CardTitle>
                <CardDescription>
                  Retailer rows shown in the multi-retailer modal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Format {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => remove(index)}
                        aria-label={`Remove format ${index + 1}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`formats.${index}.formatType`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Format</FormLabel>
                            <Select value={f.value} onValueChange={f.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {FORMAT_TYPES.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t.charAt(0) + t.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`formats.${index}.distributor`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Retailer</FormLabel>
                            <Select value={f.value} onValueChange={f.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DISTRIBUTORS.map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {retailerLabel(d)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`formats.${index}.isbn`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>ISBN</FormLabel>
                            <FormControl>
                              <Input {...f} value={f.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`formats.${index}.retailPrice`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Price (USD)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`formats.${index}.purchaseUrl`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Purchase URL</FormLabel>
                          <FormControl>
                            <Input {...f} placeholder="https://books2read.com/…" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => append(emptyFormat())}
                >
                  <Plus className="size-4" />
                  Add format
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-4 mt-6 flex justify-end gap-2 rounded-lg border bg-card/95 p-3 backdrop-blur">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/books">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
