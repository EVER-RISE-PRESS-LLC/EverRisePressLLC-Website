import { z } from "zod";

const webUrl = z
  .string()
  .trim()
  .url("Enter a complete web address")
  .refine((value) => {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Use an http or https web address");
export const imageUrlSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (/^\/(?!\/)[^\\\s]+$/.test(value)) return true;
    try {
      return new URL(value).protocol === "https:" && !/[\\\s]/.test(value);
    } catch {
      return false;
    }
  }, "Choose an image or enter a valid image address");
export const publicationDateSchema = z
  .string()
  .refine(
    (v) =>
      !v ||
      (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
        !Number.isNaN(Date.parse(v)) &&
        new Date(v).toISOString().slice(0, 10) === v),
    "Use a valid publication date",
  );

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens (e.g. growth-mindset-podcast)",
  );

export const partnerCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: slugSchema,
  contactEmail: z.string().trim().toLowerCase().email("Valid email required"),
  customUtm: z.string().trim().optional().or(z.literal("")),
});

export const partnerPatchSchema = z.object({
  name: z.string().trim().min(2).optional(),
  slug: slugSchema.optional(),
  contactEmail: z.string().trim().toLowerCase().email().optional(),
  customUtm: z.string().trim().optional().or(z.literal("").optional()),
  isActive: z.boolean().optional(),
});

export const bookFormatTypeSchema = z.enum([
  "EBOOK",
  "PAPERBACK",
  "HARDCOVER",
  "AUDIOBOOK",
]);
export const distributorSchema = z.enum([
  "AMAZON_KDP",
  "DRAFT2DIGITAL",
  "INGRAMSPARK",
  "APPLE_BOOKS",
  "BARNES_AND_NOBLE",
  "KOBO",
  "BOOKSHOP_ORG",
]);

export const bookFormatSchema = z.object({
  id: z.string().optional(),
  formatType: bookFormatTypeSchema,
  isbn: z.string().trim().optional().or(z.literal("")),
  retailPrice: z
    .union([z.number(), z.string().trim().min(1, "Enter a retail price")])
    .pipe(
      z.coerce
        .number<string | number>()
        .finite("Enter a valid price")
        .min(0, "Price must be 0 or more"),
    ),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Use a three-letter currency code")
    .default("USD"),
  distributor: distributorSchema,
  purchaseUrl: webUrl,
});

export const bookSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(2, "Title is required"),
  subtitle: z.string().trim().optional().or(z.literal("")),
  synopsis: z.string().trim().min(10, "Synopsis is required"),
  coverImageUrl: imageUrlSchema,
  chapterOneTitle: z.string().trim().min(1, "Chapter title is required"),
  chapterOneBody: z
    .string()
    .max(180000, "Chapter content is too long")
    .refine(
      (v) => v.replace(/<[^>]*>/g, "").trim().length >= 10,
      "Add the chapter text",
    ),
  authorId: z.string().min(1, "Author is required"),
  publishedAt: publicationDateSchema.optional().or(z.literal("")),
});

export const bookSaveSchema = z.object({
  book: bookSchema,
  formats: z.array(bookFormatSchema).default([]),
});

export const socialLinksSchema = z
  .object({
    website: webUrl.optional().or(z.literal("")),
    linkedin: webUrl.optional().or(z.literal("")),
    facebook: webUrl.optional().or(z.literal("")),
    twitter: webUrl.optional().or(z.literal("")),
  })
  .catchall(webUrl.optional().or(z.literal("")))
  .transform((links) =>
    Object.fromEntries(
      Object.entries(links)
        .filter(([, value]) => value && value.length > 0)
        .map(([key, value]) => [key === "twitter" ? "x" : key, value]),
    ),
  );

export const authorCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: slugSchema,
  title: z.string().trim().optional().or(z.literal("")),
  bio: z.string().trim().min(10, "Bio is required"),
  avatarUrl: imageUrlSchema.optional().or(z.literal("")),
  socialLinks: socialLinksSchema.optional(),
});

export const authorPatchSchema = authorCreateSchema.partial();
