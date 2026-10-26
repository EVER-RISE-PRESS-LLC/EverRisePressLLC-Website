import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ArticleContent from "@/components/blog/ArticleContent";
import SeoJsonLd from "@/components/seo/SeoJsonLd";
import { getPublishedArticle, getPublishedArticles } from "@/lib/blog/catalog";
import { articleToSeo } from "@/lib/blog/seo";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getPublishedArticle(slug);
  if (!article) notFound();
  return buildMetadata("article", articleToSeo(article));
}
export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getPublishedArticle(slug);
  if (!article) notFound();
  const related = getPublishedArticles().filter(item => article.relatedSlugs.includes(item.slug));
  return <main id="page-content" tabIndex={-1} className="bg-cream pt-20 text-charcoal"><Navbar /><SeoJsonLd type="article" data={articleToSeo(article)} /><ArticleContent article={article} related={related} /><SiteFooter /></main>;
}
