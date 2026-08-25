import Link from "next/link";
import { Plus, UserPen } from "lucide-react";
import { getDatabase } from "@/lib/db/client";
import { sql } from "drizzle-orm";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuthorRowActions } from "@/components/admin/authors/AuthorRowActions";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const db = await getDatabase();

  const rows = await db.all<{
    id: string;
    name: string;
    slug: string;
    title: string | null;
    avatarUrl: string | null;
    bookCount: number;
  }>(
    sql`SELECT a.id, a.name, a.slug, a.title, a.avatar_url AS avatarUrl,
          (SELECT count(*) FROM books b WHERE b.author_id = a.id) AS bookCount
        FROM authors a
        ORDER BY a.name ASC`
  );

  return (
    <>
      <PageHeader title="Authors" description="Author profiles shown on the site">
        <Button asChild>
          <Link href="/admin/authors/new">
            <Plus className="size-4" />
            New Author
          </Link>
        </Button>
      </PageHeader>

      {rows.length === 0 ? (
        <EmptyState
          icon={UserPen}
          title="No authors yet"
          message="Create an author profile to attach books to."
          action={
            <Button asChild>
              <Link href="/admin/authors/new">
                <Plus className="size-4" />
                New Author
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Books</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {author.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={author.avatarUrl}
                          alt=""
                          className="size-9 rounded-full border object-cover"
                        />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                          {author.name
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                      <Link
                        href={`/admin/authors/${author.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {author.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {author.slug}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {author.title ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(author.bookCount)}
                  </TableCell>
                  <TableCell>
                    <AuthorRowActions author={{ id: author.id, name: author.name }} />
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
