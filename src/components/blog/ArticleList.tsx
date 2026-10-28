import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogArticle } from "@/lib/blog/model";

export function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export default function ArticleList({ articles, priorityFirst = false }: { articles: BlogArticle[]; priorityFirst?: boolean }) {
  return <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{articles.map((article, index) => <article key={article.slug} className="flex min-w-0 flex-col border-b border-charcoal/20 pb-7">
    <Link href={`/blog/${article.slug}`} aria-labelledby={`card-${article.slug}`} className="group flex flex-1 flex-col rounded-md outline-offset-8 focus-visible:outline-2 focus-visible:outline-gold-deep">
      <div className="mb-6 aspect-[1200/630] overflow-hidden rounded-xl bg-charcoal">
        {/* Prepared images are served directly, without a paid transformation service. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.imageUrl || "/images/og/everrise-default.png"} alt={article.imageAlt || article.title} width={article.imageWidth || 1200} height={article.imageHeight || 630} loading={priorityFirst && index === 0 ? "eager" : "lazy"} fetchPriority={priorityFirst && index === 0 ? "high" : "auto"} decoding="async" className="h-full w-full object-cover" />
      </div>
      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-sm leading-relaxed text-text-muted"><span>{article.section}</span>{article.publishedAt && <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>}</div>
      <h2 id={`card-${article.slug}`} className="font-heading text-2xl font-semibold leading-snug text-balance group-hover:text-gold-deep">{article.title}</h2>
      <p className="mt-4 text-base leading-relaxed text-text-body">{article.description}</p>
      <span className="press-text-link mb-4 mt-5 font-semibold">Read the article<ArrowRight className="size-4" aria-hidden /></span>
    </Link>
    <p className="mt-auto text-sm text-text-muted">By <Link href={article.author.url} className="inline-flex min-h-11 items-center underline hover:text-gold-deep">{article.author.name}</Link></p>
  </article>)}</div>;
}
