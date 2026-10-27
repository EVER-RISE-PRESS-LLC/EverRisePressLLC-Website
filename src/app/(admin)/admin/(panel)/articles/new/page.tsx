import { createEmptyArticle } from "@/lib/blog/model";
import { requireArticleEditor } from "@/lib/blog/editor";
import { articleEditorOptions } from "@/lib/blog/admin-options";
import ArticleEditor from "@/components/admin/articles/ArticleEditor";
export const dynamic = "force-dynamic";
export default async function NewArticlePage() {
  const editor = await requireArticleEditor();
  return <ArticleEditor editorId={editor.id} empty={createEmptyArticle()} {...await articleEditorOptions()} />;
}
