import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { getDatabase } from "@/lib/db/client";
import { sql } from "drizzle-orm";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookRowActions } from "@/components/admin/books/BookRowActions";
import { formatDate } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const db = await getDatabase();

  const rows = await db.all<{
    id: string;
    title: string;
    subtitle: string | null;
    slug: string;
    coverImageUrl: string;
    publishedAt: string | null;
    updatedAt: string;
    formatCount: number;
  }>(
    sql`SELECT b.id, b.title, b.subtitle, b.slug, b.cover_image_url AS coverImageUrl,
          b.published_at AS publishedAt, b.updated_at AS updatedAt,
          (SELECT count(*) FROM book_formats f WHERE f.book_id = b.id) AS formatCount
        FROM books b
        ORDER BY b.updated_at DESC`
  );

  return (
    <>
      <PageHeader
        title="Books"
        description={`${rows.length} title${rows.length === 1 ? "" : "s"} in the catalog`}
      >
        <Button asChild>
          <Link href="/admin/books/new">
            <Plus className="size-4" />
            New Book
          </Link>
        </Button>
      </PageHeader>

      {rows.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No books yet"
          message="Create your first book to start capturing Chapter 1 readers."
          action={
            <Button asChild>
              <Link href="/admin/books/new">
                <Plus className="size-4" />
                New Book
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Formats</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.coverImageUrl}
                      alt=""
                      className="h-14 w-10 rounded-sm border object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/books/${book.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {book.title}
                    </Link>
                    {book.subtitle ? (
                      <p className="text-xs text-muted-foreground">{book.subtitle}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {book.slug}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(book.publishedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{Number(book.formatCount)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(book.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <BookRowActions
                      book={{ id: book.id, title: book.title, slug: book.slug }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
