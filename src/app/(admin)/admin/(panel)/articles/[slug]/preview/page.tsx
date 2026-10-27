import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ArticleContent from "@/components/blog/ArticleContent";
import { getArticle } from "@/lib/blog/catalog";
import { requireArticleEditor } from "@/lib/blog/editor";
export const dynamic = "force-dynamic";
export default async function ArticlePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireArticleEditor();
  const { slug } = await params;
  const article = await getArticle(slug, true);
  if (!article) notFound();
  return <><div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4"><Link href={`/admin/articles/${article.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline"><ArrowLeft className="size-4" />Back to editor</Link><p className="text-sm text-muted-foreground">Private preview of the last saved draft · excluded from search</p></div><div className="overflow-hidden rounded-xl border"><ArticleContent article={article} preview /></div></>;
}
