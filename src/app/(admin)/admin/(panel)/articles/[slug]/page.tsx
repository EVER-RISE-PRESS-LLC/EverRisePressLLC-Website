import { notFound } from "next/navigation";
import Link from "next/link";
import ArticleContent from "@/components/blog/ArticleContent";
import { getAllArticles } from "@/lib/blog/catalog";
import { requireArticleEditor } from "@/lib/blog/editor";

export const dynamic = "force-dynamic";
export default async function EditorialPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireArticleEditor();
  const { slug } = await params;
  const article = getAllArticles().find(item => item.slug === slug);
  if (!article) notFound();
  return <div><div className="border-b border-border px-6 py-4"><Link href="/admin/articles" className="inline-flex min-h-11 items-center text-sm underline">Back to article review</Link><p className="mt-1 text-sm text-muted-foreground">Private preview · excluded from indexing · publishing is managed through Git</p></div><ArticleContent article={article} preview /></div>;
}
