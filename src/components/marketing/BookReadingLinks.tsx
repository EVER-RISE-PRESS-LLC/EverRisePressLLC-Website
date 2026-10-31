import Link from "next/link";
import type { BlogArticle } from "@/lib/blog/model";

const READING_TASKS: Record<string, string> = {
  "payday-spending-patterns": "Reflect on the allowance and first-paycheck scenes, then try a private seven-day spending check.",
  "weekly-cash-flow-calendar": "Work through a fictional budget and use the free printable calendar or manual CSV without signup.",
  "financial-heart-attack-book-club-guide": "Discuss the book with ten chapter-based questions and a free printable guide. Contains spoilers.",
};

/** Callers pass only the published catalog; draft titles and links stay private. */
export default function BookReadingLinks({ articles }: { articles: BlogArticle[] }) {
  return <ul className="mt-6 space-y-6">{articles.map(article => <li key={article.slug}>
    <Link href={`/blog/${article.slug}`} className="inline-flex min-h-11 items-center text-lg font-semibold underline underline-offset-4 hover:text-gold-deep">{article.title}</Link>
    <p className="mt-1 max-w-prose text-base leading-relaxed text-text-body">{READING_TASKS[article.slug] ?? article.description}</p>
  </li>)}</ul>;
}
