import Link from "next/link";
import { Plus, UserPen } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getCurrentAdminUser } from "@/lib/auth";
import { sql } from "drizzle-orm";
import { SITE_URL } from "@/lib/seo/ids";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import {
  AuthorsCatalogClient,
  type CatalogAuthor,
} from "@/components/admin/authors/AuthorsCatalogClient";

export const dynamic = "force-dynamic";
export default async function AdminAuthorsPage() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const [rows, user] = await Promise.all([
    db.all<CatalogAuthor>(sql`SELECT a.id, a.name, a.slug, a.title, a.avatar_url AS avatarUrl,
      (SELECT count(*) FROM books b WHERE b.author_id = a.id) AS bookCount,
      (SELECT count(*) FROM articles ar
        WHERE json_extract(ar.document, '$.author.url') IN ('/authors/' || a.slug, ${SITE_URL} || '/authors/' || a.slug)
        OR json_extract(ar.published_document, '$.author.url') IN ('/authors/' || a.slug, ${SITE_URL} || '/authors/' || a.slug)) AS articleCount
      FROM authors a ORDER BY a.name ASC`),
    getCurrentAdminUser(env.DB),
  ]);
  return (
    <>
      <PageHeader
        title="Authors"
        description="Give readers a familiar face and an approved introduction."
      >
        <Button asChild className="min-h-11">
          <Link href="/admin/authors/new">
            <Plus className="size-4" /> Add author
          </Link>
        </Button>
      </PageHeader>
      {rows.length === 0 ? (
        <EmptyState
          icon={UserPen}
          title="Introduce your first author"
          message="Create an author profile with a biography and optional photo, then attach their books."
          action={
            <Button asChild className="min-h-11">
              <Link href="/admin/authors/new">
                <Plus className="size-4" /> Add your first author
              </Link>
            </Button>
          }
        />
      ) : (
        <AuthorsCatalogClient
          authors={rows.map((author) => ({
            ...author,
            bookCount: Number(author.bookCount),
            articleCount: Number(author.articleCount),
          }))}
          canDelete={user?.role === "ADMIN"}
        />
      )}
    </>
  );
}
