import type { ArticleBlock } from "@/lib/blog/model";

const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
export function blocksToHtml(blocks: ArticleBlock[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case "heading": return `<h2>${escape(block.text)}</h2>`;
      case "paragraph": return `<p>${escape(block.text)}</p>`;
      case "richtext": return block.html;
      case "image": return `<img src="${escape(block.src)}" alt="${escape(block.alt)}"${block.width ? ` width="${block.width}"` : ""}${block.height ? ` height="${block.height}"` : ""}${block.caption ? ` data-caption="${escape(block.caption)}"` : ""}>`;
      case "list": return `<${block.ordered ? "ol" : "ul"}>${block.items.map(item => `<li><p>${escape(item)}</p></li>`).join("")}</${block.ordered ? "ol" : "ul"}>`;
      case "quote": return `<blockquote><p>${escape(block.text)}</p><p>${escape(block.attribution)} · <a href="#source-${escape(block.sourceId)}">Source</a></p></blockquote>`;
      case "table": return `<p><strong>${escape(block.caption)}</strong></p><table><thead><tr>${block.columns.map(column => `<th><p>${escape(column)}</p></th>`).join("")}</tr></thead><tbody>${block.rows.map(row => `<tr>${row.map(cell => `<td><p>${escape(cell)}</p></td>`).join("")}</tr>`).join("")}</tbody></table>`;
    }
  }).join("") || "<p></p>";
}

/** Convert the visual editor's HTML into the public article's structured blocks. */
export function htmlToBlocks(html: string): ArticleBlock[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  const used = new Set(["sources", "related-reading", "article-title", "page-content"]);
  return [...document.body.children].flatMap((element): ArticleBlock[] => {
    const text = element.textContent?.trim() || "";
    if (element.tagName === "H2") {
      if (!text) return [];
      let base = text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "section";
      if (base.startsWith("source-")) base = `section-${base}`;
      let id = base;
      for (let suffix = 2; used.has(id); suffix++) id = `${base}-${suffix}`;
      used.add(id);
      return [{ type: "heading", id, text }];
    }
    if (element.tagName === "IMG") {
      const image = element as HTMLImageElement;
      return [{ type: "image", src: image.getAttribute("src") || "", alt: image.getAttribute("alt") || "", ...(image.getAttribute("data-caption") ? { caption: image.getAttribute("data-caption")! } : {}), ...(image.width ? { width: image.width } : {}), ...(image.height ? { height: image.height } : {}) }];
    }
    if (element.tagName === "P" && !element.childElementCount) return text ? [{ type: "paragraph", text }] : [];
    if (!text && !element.querySelector("img,hr")) return [];
    return [{ type: "richtext", html: element.outerHTML }];
  });
}

export function plainWordCount(html: string): number {
  return html.replace(/<[^>]*>/g, " ").replace(/&[a-z0-9#]+;/gi, " ").trim().split(/\s+/).filter(Boolean).length;
}
