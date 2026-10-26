import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogArticle } from "@/lib/blog/model";

export function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export default function ArticleList({ articles }: { articles: BlogArticle[] }) {
  return <div className="divide-y divide-charcoal/20 border-y border-charcoal/20">{articles.map(article => <article key={article.slug} className="grid gap-4 py-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10">
    <div className="text-sm leading-relaxed text-text-muted"><p>{article.section}</p><p className="mt-2">{article.publishedAt && <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>}</p></div>
    <div className="min-w-0"><h2 className="max-w-3xl font-heading text-2xl font-semibold leading-snug text-balance md:text-3xl"><Link href={`/blog/${article.slug}`} className="hover:text-gold-deep">{article.title}</Link></h2><p className="mt-4 max-w-prose text-base leading-relaxed text-text-body">{article.description}</p><p className="mt-4 text-sm text-text-muted">By <Link href={article.author.url} className="underline hover:text-gold-deep">{article.author.name}</Link></p><Link href={`/blog/${article.slug}`} className="press-text-link mt-4 font-semibold">Read the article<span className="sr-only">: {article.title}</span><ArrowRight className="size-4" aria-hidden /></Link></div>
  </article>)}</div>;
}
