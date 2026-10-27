import { getAllArticles } from "@/lib/blog/catalog";
import { requireArticleEditor } from "@/lib/blog/editor";
import ArticlesClient from "@/components/admin/articles/ArticlesClient";
export const dynamic = "force-dynamic";
export default async function ArticlesPage() {
  await requireArticleEditor();
  return <ArticlesClient articles={await getAllArticles(true)} />;
}
