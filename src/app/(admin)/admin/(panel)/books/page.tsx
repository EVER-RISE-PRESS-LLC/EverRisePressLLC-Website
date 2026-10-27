import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getDb } from "@/lib/db";
import { getCurrentAdminUser } from "@/lib/auth";
import { sql } from "drizzle-orm";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import {
  BooksCatalogClient,
  type CatalogBook,
} from "@/components/admin/books/BooksCatalogClient";

export const dynamic = "force-dynamic";
export default async function AdminBooksPage() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const [rows, user] = await Promise.all([
    db.all<CatalogBook>(sql`SELECT b.id, b.title, b.subtitle, b.slug, b.cover_image_url AS coverImageUrl,
      a.name AS authorName, b.published_at AS publishedAt, b.updated_at AS updatedAt,
      (SELECT count(*) FROM book_formats f WHERE f.book_id = b.id) AS formatCount,
      (EXISTS(SELECT 1 FROM leads l WHERE l.book_id = b.id) OR EXISTS(SELECT 1 FROM referral_clicks r WHERE r.book_id = b.id)) AS hasHistory
      FROM books b JOIN authors a ON a.id = b.author_id ORDER BY b.updated_at DESC`),
    getCurrentAdminUser(env.DB),
  ]);
  return (
    <>
      <PageHeader
        title="Books"
        description="Manage book pages, sample chapters and retailer links."
      >
        <Button asChild className="min-h-11">
          <Link href="/admin/books/new">
            <Plus className="size-4" /> Add book
          </Link>
        </Button>
      </PageHeader>
      {rows.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Your catalog starts here"
          message="Add a book with its description and sample chapter. Retailer links can come later."
          action={
            <Button asChild className="min-h-11">
              <Link href="/admin/books/new">
                <Plus className="size-4" /> Add your first book
              </Link>
            </Button>
          }
        />
      ) : (
        <BooksCatalogClient
          books={rows.map((book) => ({
            ...book,
            formatCount: Number(book.formatCount),
            hasHistory: Number(book.hasHistory),
          }))}
          canDelete={user?.role === "ADMIN"}
        />
      )}
    </>
  );
}
