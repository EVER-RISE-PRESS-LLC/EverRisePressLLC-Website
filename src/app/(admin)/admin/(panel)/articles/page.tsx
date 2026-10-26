import Link from "next/link";
import { getAllArticles, getPublishedArticles } from "@/lib/blog/catalog";
import { requireArticleEditor } from "@/lib/blog/editor";

export const dynamic = "force-dynamic";
export default async function ArticleReviewPage() {
  await requireArticleEditor();
  const published = new Set(getPublishedArticles().map(article => article.slug));
  return <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-10"><div><h1 className="font-heading text-3xl font-semibold">Article review</h1><p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">Review the article layout and editorial brief here. Content is maintained in the website repository; publishing requires reviewed copy, sources, a confirmed byline, and real dates.</p></div><div className="divide-y divide-border border-y border-border">{getAllArticles().map(article => <article key={article.slug} className="py-6"><p className="text-sm text-muted-foreground">{published.has(article.slug) ? "Published" : "Unpublished"} · {article.section}</p><h2 className="mt-2 font-heading text-2xl"><Link href={`/admin/articles/${article.slug}`} className="underline underline-offset-4">{article.title}</Link></h2><p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{article.editorialNotes}</p><Link href={`/admin/articles/${article.slug}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold underline">Open editorial preview</Link></article>)}</div></div>;
}
