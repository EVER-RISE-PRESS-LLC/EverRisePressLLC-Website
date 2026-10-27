import { notFound } from "next/navigation";
import { getArticle } from "@/lib/blog/catalog";
import { createEmptyArticle } from "@/lib/blog/model";
import { requireArticleEditor } from "@/lib/blog/editor";
import { articleEditorOptions } from "@/lib/blog/admin-options";
import ArticleEditor from "@/components/admin/articles/ArticleEditor";
export const dynamic = "force-dynamic";
export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const editor = await requireArticleEditor();
  const { slug } = await params;
  const article = await getArticle(slug, true);
  if (!article) notFound();
  return <ArticleEditor editorId={editor.id} key={article.id} initial={article} empty={createEmptyArticle()} {...await articleEditorOptions(slug)} />;
}
