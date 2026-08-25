import { getDatabase } from "@/lib/db/client";
import { authors } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { BookEditorClient } from "@/components/admin/books/BookEditorClient";

export const dynamic = "force-dynamic";

export default async function AdminBookNewPage() {
  const db = await getDatabase();
  const authorOptions = await db
    .select({ id: authors.id, name: authors.name })
    .from(authors)
    .orderBy(asc(authors.name));

  return <BookEditorClient bookId={null} book={null} formats={[]} authors={authorOptions} />;
}
