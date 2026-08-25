import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens (e.g. growth-mindset-podcast)");

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

export const bookFormatTypeSchema = z.enum(["EBOOK", "PAPERBACK", "HARDCOVER", "AUDIOBOOK"]);
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
  retailPrice: z.coerce.number().min(0, "Price must be 0 or more"),
  currency: z.string().trim().toUpperCase().default("USD"),
  distributor: distributorSchema,
  purchaseUrl: z.string().trim().url("Valid URL required"),
});

export const bookSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(2, "Title is required"),
  subtitle: z.string().trim().optional().or(z.literal("")),
  synopsis: z.string().trim().min(10, "Synopsis is required"),
  coverImageUrl: z.string().trim().min(1, "Cover image URL is required"),
  chapterOneTitle: z.string().trim().min(1, "Chapter title is required"),
  chapterOneBody: z.string().min(10, "Chapter content is required"),
  authorId: z.string().min(1, "Author is required"),
  publishedAt: z.string().trim().optional().or(z.literal("")),
});

export const bookSaveSchema = z.object({
  book: bookSchema,
  formats: z.array(bookFormatSchema).default([]),
});

export const socialLinksSchema = z
  .object({
    website: z.string().trim().optional().or(z.literal("")),
    linkedin: z.string().trim().optional().or(z.literal("")),
    facebook: z.string().trim().optional().or(z.literal("")),
    twitter: z.string().trim().optional().or(z.literal("")),
  })
  .transform((links) =>
    Object.fromEntries(
      Object.entries(links)
        .filter(([, value]) => value && value.length > 0)
        .map(([key, value]) => [key === "twitter" ? "x" : key, value])
    )
  );

export const authorCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: slugSchema,
  title: z.string().trim().optional().or(z.literal("")),
  bio: z.string().trim().min(10, "Bio is required"),
  avatarUrl: z.string().trim().optional().or(z.literal("")),
  socialLinks: socialLinksSchema.optional(),
});

export const authorPatchSchema = authorCreateSchema.partial();
