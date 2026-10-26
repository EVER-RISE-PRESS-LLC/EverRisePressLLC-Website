import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ReactiveButton from "@/components/ui/ReactiveButton";
import ArticleList from "@/components/blog/ArticleList";
import SeoJsonLd from "@/components/seo/SeoJsonLd";
import { getPublishedArticles } from "@/lib/blog/catalog";
import { buildMetadata } from "@/lib/seo/metadata";
import { BOOK_PATH } from "@/lib/publisher";

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata { return buildMetadata("blog", { articles: getPublishedArticles() }); }

export default function BlogPage() {
  const articles = getPublishedArticles();
  return <main id="page-content" tabIndex={-1} className="bg-cream text-charcoal">
    <Navbar />
    {articles.length > 0 && <SeoJsonLd type="blog" data={{ articles }} />}
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-32 md:pb-24 md:pt-40">
      <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight text-balance md:text-6xl">{articles.length ? "Stories about money and the habits behind it." : "More to read, soon."}</h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-text-body">{articles.length ? "Articles from EverRise Press, with sources, reading ideas, and room to reflect on your own experience." : "We’re preparing our first articles. In the meantime, explore Lamont D. McLeod’s book and try the opening chapter."}</p>
      {articles.length > 0 ? <div className="mt-12"><ArticleList articles={articles} /></div> : <div className="mt-9 flex flex-wrap items-center gap-4"><ReactiveButton href={`${BOOK_PATH}/preview`} surface="light">Read Chapter 1 Free</ReactiveButton><Link href={BOOK_PATH} className="press-text-link">Explore the book</Link><p className="basis-full text-sm text-text-muted">Free chapter with email signup.</p></div>}
    </section>
    <SiteFooter />
  </main>;
}
