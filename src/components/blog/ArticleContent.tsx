import Link from "next/link";
import type { ArticleBlock, BlogArticle } from "@/lib/blog/model";
import { articleWordCount } from "@/lib/blog/model";
import { BOOK_PATH } from "@/lib/publisher";
import ReactiveButton from "@/components/ui/ReactiveButton";
import { formatArticleDate } from "./ArticleList";
import { cleanContentHtml } from "@/lib/content-html";

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "richtext": return <div className={`press-article-rich ${block.html.includes("<table") ? "press-article-table" : ""}`} {...(block.html.includes("<table") ? { role: "region", "aria-label": "Article table", tabIndex: 0 } : {})} dangerouslySetInnerHTML={{ __html: cleanContentHtml(block.html) }} />;
    case "image": return <figure>
      {/* Direct image delivery avoids image transformations. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={block.src} alt={block.alt} width={block.width} height={block.height} loading="lazy" decoding="async" className="h-auto max-w-full" />
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>;
    case "heading": return <h2 id={block.id}>{block.text}</h2>;
    case "paragraph": return <p>{block.text}</p>;
    case "list": return block.ordered ? <ol>{block.items.map((item, i) => <li key={i}>{item}</li>)}</ol> : <ul>{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
    case "quote": return <figure><blockquote><p>{block.text}</p></blockquote><figcaption>{block.attribution} · <a href={`#source-${block.sourceId}`}>Source</a></figcaption></figure>;
    case "table": return <div>{block.columns.length > 2 && <p className="mb-3 text-sm leading-relaxed text-text-muted md:hidden">Scroll the table sideways to see every column.</p>}<div className="press-article-table" tabIndex={0} role="region" aria-label={block.caption}><table><caption>{block.caption}</caption><thead><tr>{block.columns.map((column, i) => <th key={i} scope="col">{column}</th>)}</tr></thead><tbody>{block.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div></div>;
  }
}

export default function ArticleContent({ article, related = [], preview = false }: { article: BlogArticle; related?: BlogArticle[]; preview?: boolean }) {
  const headings = article.blocks.filter(block => block.type === "heading");
  const minutes = Math.max(1, Math.ceil(articleWordCount(article) / 200));
  return <article className="press-article bg-cream text-charcoal">
    <header className="mx-auto max-w-6xl px-6 pb-12 pt-12 md:pb-16">
      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-x-3 text-sm text-text-muted"><Link href="/" className="inline-flex min-h-11 items-center underline">Home</Link><span aria-hidden>/</span><Link href="/blog" className="inline-flex min-h-11 items-center underline">Blog</Link><span aria-hidden>/</span><span aria-current="page">{article.section}</span></nav>
      <h1 id="article-title" className="max-w-4xl font-heading text-4xl font-semibold leading-[1.12] text-balance md:text-5xl lg:text-6xl">{article.title}</h1>
      <p className="mt-7 max-w-3xl text-xl leading-relaxed text-text-body">{article.description}</p>
      <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm leading-relaxed text-text-muted"><p>By <Link href={article.author.url} className="underline hover:text-gold-deep">{article.author.name}</Link></p>{article.publishedAt ? <p>Published <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time></p> : <p>Draft · publication date not set</p>}{article.updatedAt && article.updatedAt !== article.publishedAt && <p>Updated <time dateTime={article.updatedAt}>{formatArticleDate(article.updatedAt)}</time></p>}{article.blocks.length > 0 && <p>{minutes} min read</p>}</div>
      {article.review && <p className="mt-3 text-sm text-text-muted">Reviewed by {article.review.by} on <time dateTime={article.review.at}>{formatArticleDate(article.review.at)}</time>.</p>}
      {article.imageUrl && <figure className="mt-9 overflow-hidden rounded-xl bg-charcoal">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.imageUrl} alt={article.imageAlt || article.title} width={article.imageWidth || 1200} height={article.imageHeight || 630} loading="eager" fetchPriority="high" decoding="async" className="h-auto w-full" />
      </figure>}
    </header>
    <div className="press-article-grid mx-auto max-w-6xl gap-12 px-6 pb-16 md:pb-24">
      <aside className="min-w-0" aria-label="In this article">{headings.length > 0 && <nav className="lg:sticky lg:top-28"><p className="font-semibold">In this article</p><ul className="mt-3 space-y-1 text-sm">{headings.map(heading => <li key={heading.id}><Link href={`#${heading.id}`} className="inline-flex min-h-11 items-center underline hover:text-gold-deep">{heading.text}</Link></li>)}{article.sources.length > 0 && <li><Link href="#sources" className="inline-flex min-h-11 items-center underline hover:text-gold-deep">Sources</Link></li>}</ul></nav>}</aside>
      <div className="min-w-0">
        {preview && <div role="note" className="mb-8 border-y border-charcoal/20 py-5 text-base leading-relaxed"><strong>Private preview of the saved draft.</strong>{article.editorialNotes && <p className="mt-2">{article.editorialNotes}</p>}</div>}
        <div className="press-article-body">{article.blocks.map((block, i) => <Block key={i} block={block} />)}</div>
        {article.sources.length > 0 && <section id="sources" className="mt-12 border-t border-charcoal/20 pt-8" aria-labelledby="sources-title"><h2 id="sources-title" className="font-heading text-2xl font-semibold">Sources and further reading</h2><ul className="mt-5 space-y-4 text-base leading-relaxed">{article.sources.map(source => <li id={`source-${source.id}`} key={source.id}><a href={source.url} className="break-words underline hover:text-gold-deep">{source.title}</a></li>)}</ul></section>}
        {related.length > 0 && <section id="related-reading" className="mt-12 border-t border-charcoal/20 pt-8" aria-labelledby="related-reading-title"><h2 id="related-reading-title" className="font-heading text-2xl font-semibold">Keep exploring</h2><ul className="mt-5 space-y-3">{related.map(item => <li key={item.slug}><Link href={`/blog/${item.slug}`} className="inline-flex min-h-11 items-center text-lg underline hover:text-gold-deep">{item.title}</Link></li>)}</ul></section>}
        <section className="mt-12 border-t border-charcoal/20 pt-8" aria-labelledby="book-reading-title"><h2 id="book-reading-title" className="font-heading text-2xl font-semibold">Read the story behind the book.</h2><p className="mt-4 text-base leading-relaxed text-text-body">Explore <Link href={BOOK_PATH} className="underline hover:text-gold-deep">How To Have a Financial Heart Attack</Link> by Lamont D. McLeod, or start with the first chapter.</p><div className="mt-6"><ReactiveButton href={`${BOOK_PATH}/preview`} surface="light">Read Chapter 1 Free</ReactiveButton><p className="mt-3 text-sm text-text-muted">Free with email signup. The chapter opens on this site.</p></div></section>
      </div>
    </div>
  </article>;
}
