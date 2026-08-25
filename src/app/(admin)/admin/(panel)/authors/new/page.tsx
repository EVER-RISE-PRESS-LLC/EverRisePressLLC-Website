import { AuthorEditorClient } from "@/components/admin/authors/AuthorEditorClient";

export const dynamic = "force-dynamic";

export default function AdminAuthorNewPage() {
  return <AuthorEditorClient authorId={null} author={null} />;
}
