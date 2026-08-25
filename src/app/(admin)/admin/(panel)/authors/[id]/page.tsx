import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/db/client";
import { authors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AuthorEditorClient } from "@/components/admin/authors/AuthorEditorClient";

export const dynamic = "force-dynamic";

export default async function AdminAuthorEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDatabase();

  const author = await db
    .select()
    .from(authors)
    .where(eq(authors.id, id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!author) notFound();

  return (
    <AuthorEditorClient
      authorId={author.id}
      author={{
        name: author.name,
        slug: author.slug,
        title: author.title,
        bio: author.bio,
        avatarUrl: author.avatarUrl,
        socialLinks: (author.socialLinks ?? {}) as Record<string, string>,
      }}
    />
  );
}
