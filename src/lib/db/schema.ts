import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["ADMIN", "EDITOR", "PARTNER"] }).notNull().default("PARTNER"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const authors = sqliteTable("authors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  title: text("title"),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url"),
  socialLinks: text("social_links", { mode: "json" }),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const books = sqliteTable("books", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  synopsis: text("synopsis").notNull(),
  coverImageUrl: text("cover_image_url").notNull(),
  chapterOneTitle: text("chapter_one_title").notNull().default("Chapter 1"),
  chapterOneBody: text("chapter_one_body").notNull(),
  authorId: text("author_id").notNull().references(() => authors.id, { onDelete: "cascade" }),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const bookFormats = sqliteTable("book_formats", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookId: text("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  formatType: text("format_type", { enum: ["EBOOK", "PAPERBACK", "HARDCOVER", "AUDIOBOOK"] }).notNull(),
  isbn: text("isbn"),
  retailPrice: real("retail_price").notNull(),
  currency: text("currency").notNull().default("USD"),
  distributor: text("distributor", {
    enum: ["AMAZON_KDP", "DRAFT2DIGITAL", "INGRAMSPARK", "APPLE_BOOKS", "BARNES_AND_NOBLE", "KOBO", "BOOKSHOP_ORG"],
  }).notNull(),
  purchaseUrl: text("purchase_url").notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const referralPartners = sqliteTable("referral_partners", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").unique().references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  contactEmail: text("contact_email").notNull(),
  customUtm: text("custom_utm"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const referralClicks = sqliteTable("referral_clicks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  partnerId: text("partner_id").notNull().references(() => referralPartners.id, { onDelete: "cascade" }),
  bookId: text("book_id").references(() => books.id),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  country: text("country"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  bookId: text("book_id").notNull().references(() => books.id),
  partnerId: text("partner_id").references(() => referralPartners.id),
  sourceUtm: text("source_utm"),
  isSyncedEsp: integer("is_synced_esp", { mode: "boolean" }).notNull().default(false),
  unlockedAt: text("unlocked_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});
