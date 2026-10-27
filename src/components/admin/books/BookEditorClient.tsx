"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ExternalLink, Plus, Store, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { retailerLabel } from "@/lib/admin/format";
import {
  bookSchema,
  bookFormatSchema,
  publicationDateSchema,
} from "@/lib/admin/validation";
import { CatalogEditorState } from "./CatalogEditorState";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { useDraftRecovery } from "./useDraftRecovery";
import { DraftRecoveryNotice } from "./DraftRecoveryNotice";
import { draftSignature } from "@/lib/admin/draft-recovery";

const formSchema = z.object({
  book: bookSchema.extend({
    subtitle: z.string(),
    publishedAt: publicationDateSchema,
  }),
  formats: z.array(
    bookFormatSchema.extend({
      isbn: z.string(),
      currency: z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z]{3}$/, "Use a three-letter currency code, such as USD."),
    }),
  ),
});
type FormValues = z.infer<typeof formSchema>;
type FormatRow = FormValues["formats"][number];
const FORMAT_TYPES = ["EBOOK", "PAPERBACK", "HARDCOVER", "AUDIOBOOK"] as const;
const FORMAT_LABELS = {
  EBOOK: "Ebook",
  PAPERBACK: "Paperback",
  HARDCOVER: "Hardcover",
  AUDIOBOOK: "Audiobook",
};
const DISTRIBUTORS = [
  "AMAZON_KDP",
  "DRAFT2DIGITAL",
  "INGRAMSPARK",
  "APPLE_BOOKS",
  "BARNES_AND_NOBLE",
  "KOBO",
  "BOOKSHOP_ORG",
] as const;
const emptyFormat = (): FormatRow => ({
  formatType: "EBOOK",
  distributor: "DRAFT2DIGITAL",
  isbn: "",
  retailPrice: 0,
  currency: "USD",
  purchaseUrl: "",
});
const recoverySchema = z.object({
  book: z.object({
    slug: z.string(),
    title: z.string(),
    subtitle: z.string(),
    synopsis: z.string(),
    coverImageUrl: z.string(),
    chapterOneTitle: z.string(),
    chapterOneBody: z.string(),
    authorId: z.string(),
    publishedAt: z.string(),
  }),
  formats: z.array(
    z.object({
      id: z.string().optional(),
      formatType: z.enum(FORMAT_TYPES),
      distributor: z.enum(DISTRIBUTORS),
      isbn: z.string(),
      retailPrice: z.union([z.number(), z.string()]),
      currency: z.string(),
      purchaseUrl: z.string(),
    }),
  ),
});
const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

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
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(book));
  const isEdit = Boolean(bookId);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      book: {
        slug: book?.slug ?? "",
        title: book?.title ?? "",
        subtitle: book?.subtitle ?? "",
        synopsis: book?.synopsis ?? "",
        coverImageUrl: book?.coverImageUrl ?? "",
        chapterOneTitle: book?.chapterOneTitle ?? "Chapter 1",
        chapterOneBody: book?.chapterOneBody ?? "",
        authorId: book?.authorId ?? (authors.length === 1 ? authors[0].id : ""),
        publishedAt: book?.publishedAt?.slice(0, 10) ?? "",
      },
      formats,
    },
  });
  const [baseline, setBaseline] = useState(() =>
    draftSignature(form.getValues()),
  );
  const currentDraft = useWatch({ control: form.control }) as FormValues;
  const recovery = useDraftRecovery<FormValues>({
    storageKey: `book:${bookId ?? "new"}`,
    baseline,
    current: currentDraft,
    dirty: form.formState.isDirty,
    parse: (value) => {
      const parsed = recoverySchema.safeParse(value);
      return parsed.success ? (parsed.data as unknown as FormValues) : null;
    },
    onRestore: (value, info) => {
      form.reset(value, { keepDefaultValues: true });
      setSaved(false);
      setError(null);
      toast.info(
        info.baselineChanged
          ? "Local draft restored. Review it against the newer saved version before saving."
          : "Local draft restored. Choose Save book when you’re ready.",
      );
    },
  });
  // Keep the database id separate from React Hook Form's internal row key.
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "formats",
    keyName: "rowKey",
  });
  const slug = useWatch({ control: form.control, name: "book.slug" });
  const formatValues = useWatch({ control: form.control, name: "formats" });

  async function onSubmit(values: FormValues) {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/books/${bookId}` : "/api/admin/books",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        book?: { id: string; chapterOneBody?: string };
        formats?: (Omit<FormatRow, "isbn"> & { isbn: string | null })[];
      } | null;
      if (!res.ok) {
        const message =
          res.status === 401
            ? "Your session has expired. Open sign in in another tab, then save again. Your changes are still here."
            : (data?.error ??
              "We could not save this book. Your changes are still here; please try again.");
        setError(message);
        toast.error(message);
        return;
      }
      const savedValues: FormValues = {
        ...values,
        book: {
          ...values.book,
          chapterOneBody:
            data?.book?.chapterOneBody ?? values.book.chapterOneBody,
        },
        formats:
          data?.formats?.map((format) => ({
            id: format.id,
            formatType: format.formatType,
            distributor: format.distributor,
            isbn: format.isbn ?? "",
            retailPrice: format.retailPrice,
            currency: format.currency,
            purchaseUrl: format.purchaseUrl,
          })) ?? values.formats,
      };
      recovery.clear();
      form.reset(savedValues);
      setBaseline(draftSignature(savedValues));
      setSaved(true);
      toast.success(isEdit ? "Book saved" : "Book created");
      if (!isEdit && data?.book?.id)
        router.replace(`/admin/books/${data.book.id}`);
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
        <DraftRecoveryNotice {...recovery} noun="book" />
        <Link
          href="/admin/books"
          className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> All books
        </Link>
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit book" : "Add a book"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {isEdit
                ? "Keep your book details, sample chapter and retailer links ready for readers."
                : "Start with the book details, add the sample chapter, then choose where readers can buy it."}
            </p>
          </div>
          {isEdit && book ? (
            <Button
              type="button"
              variant="outline"
              asChild
              className="min-h-11"
            >
              <a
                href={`/books/${book.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View book <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : null}
        </div>
        {authors.length === 0 ? (
          <div role="alert" className="mb-5 rounded-xl border bg-muted/40 p-4">
            <p className="font-medium">Add an author first</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every book needs an author. Create the author profile, then return
              here to add their book.
            </p>
            <Button asChild variant="outline" className="mt-3 min-h-11">
              <Link href="/admin/authors/new">Add an author</Link>
            </Button>
          </div>
        ) : null}
        <fieldset
          disabled={saving}
          className="min-w-0 space-y-6 disabled:opacity-70"
        >
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <Card className="min-w-0 shadow-none">
              <CardHeader>
                <CardTitle className="font-sans text-lg">
                  Book details
                </CardTitle>
                <CardDescription>
                  Fields marked * are required. Saved changes appear on the
                  public book page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="book.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="min-h-11"
                          onChange={(event) => {
                            field.onChange(event);
                            if (!slugEdited && !isEdit)
                              form.setValue(
                                "book.slug",
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
                  name="book.subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input {...field} className="min-h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="book.authorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={saving || authors.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="min-h-11 w-full">
                              <SelectValue placeholder="Choose an author" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {authors.map((author) => (
                              <SelectItem key={author.id} value={author.id}>
                                {author.name}
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
                    name="book.publishedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publication date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="min-h-11" />
                        </FormControl>
                        <FormDescription>
                          Optional. This date does not hide or schedule the
                          book.
                        </FormDescription>
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
                      <FormLabel>Book description *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={7}
                          {...field}
                          className="min-h-44 leading-relaxed"
                        />
                      </FormControl>
                      <FormDescription>
                        Tell readers what the book covers. Use the approved
                        description.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="book.slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page address *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="min-h-11"
                          readOnly={isEdit}
                          onChange={(event) => {
                            setSlugEdited(true);
                            field.onChange(event);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        <span className="break-all">
                          /books/{slug || "your-book-title"}
                        </span>
                        {isEdit
                          ? " · Kept fixed so existing reader links continue to work."
                          : " · Created from the title. You can edit it before saving."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card className="min-w-0 shadow-none">
              <CardHeader>
                <CardTitle className="font-sans text-lg">Book cover</CardTitle>
                <CardDescription>
                  Choose the published cover, or upload an image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="book.coverImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <MediaPicker
                        value={field.value}
                        onChange={field.onChange}
                        label="Cover image *"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="font-sans text-lg">
                Chapter 1 sample
              </CardTitle>
              <CardDescription>
                Readers open this chapter after entering their email. Changes
                replace the sample immediately when you save.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField
                control={form.control}
                name="book.chapterOneTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter title *</FormLabel>
                    <FormControl>
                      <Input {...field} className="min-h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="book.chapterOneBody"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      label="Chapter content *"
                      placeholder="Paste or write the approved chapter here…"
                      disabled={saving}
                      errorId={
                        fieldState.error ? "chapter-content-error" : undefined
                      }
                    />
                    <FormMessage id="chapter-content-error" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="font-sans text-lg">
                  Where to buy
                </CardTitle>
                <CardDescription className="mt-1">
                  Add one link for each retailer and edition. You can save a
                  book without retailer links.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() =>
                  append(emptyFormat(), {
                    shouldFocus: true,
                    focusName: `formats.${fields.length}.purchaseUrl`,
                  })
                }
              >
                <Plus className="size-4" /> Add retailer link
              </Button>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-5">
                  <Store className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">No retailer links yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      When a retailer listing is ready, add its purchase link
                      here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y">
                  {fields.map((row, index) => (
                    <div
                      key={row.rowKey}
                      className="space-y-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="min-w-0 font-semibold">
                          {
                            FORMAT_LABELS[
                              formatValues?.[index]?.formatType ??
                                row.formatType
                            ]
                          }{" "}
                          ·{" "}
                          {retailerLabel(
                            formatValues?.[index]?.distributor ??
                              row.distributor,
                          )}
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          className="min-h-11 text-destructive hover:text-destructive"
                          onClick={() => setRemoveIndex(index)}
                          aria-label={`Remove retailer link ${index + 1}`}
                        >
                          <Trash2 className="size-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <FormField
                          control={form.control}
                          name={`formats.${index}.formatType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Edition *</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger className="min-h-11 w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {FORMAT_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {FORMAT_LABELS[type]}
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
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Retailer *</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger className="min-h-11 w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {DISTRIBUTORS.map((distributor) => (
                                    <SelectItem
                                      key={distributor}
                                      value={distributor}
                                    >
                                      {retailerLabel(distributor)}
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
                          name={`formats.${index}.retailPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Retail price *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  inputMode="decimal"
                                  className="min-h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`formats.${index}.currency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="min-h-11 uppercase"
                                  maxLength={3}
                                  placeholder="USD"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(150px,0.4fr)]">
                        <FormField
                          control={form.control}
                          name={`formats.${index}.purchaseUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purchase link *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="url"
                                  className="min-h-11"
                                  placeholder="https://"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`formats.${index}.isbn`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ISBN</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="min-h-11"
                                  placeholder="Optional"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </fieldset>
        <CatalogEditorState
          dirty={form.formState.isDirty}
          saving={saving}
          saved={saved}
          error={error}
          isEdit={isEdit}
          noun="book"
          onDiscard={recovery.clear}
          blocked={authors.length === 0}
        />
        <AlertDialog
          open={removeIndex !== null}
          onOpenChange={(open) => {
            if (!open) setRemoveIndex(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-sans">
                Remove this retailer link?
              </AlertDialogTitle>
              <AlertDialogDescription>
                The link will be removed from this book when you save. The
                retailer listing itself is unaffected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="min-h-11">
                Keep link
              </AlertDialogCancel>
              <AlertDialogAction
                className="min-h-11"
                onClick={() => {
                  if (removeIndex !== null) remove(removeIndex);
                  setRemoveIndex(null);
                }}
              >
                Remove link
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  );
}
