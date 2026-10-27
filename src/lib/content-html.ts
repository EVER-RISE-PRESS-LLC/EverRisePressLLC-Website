import sanitizeHtml from "sanitize-html";

/** Server-side allowlist for staff-authored book and article content. */
export function cleanContentHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "a", "code", "pre", "hr", "img", "table", "thead", "tbody", "tr", "th", "td", "caption"],
    allowedAttributes: { a: ["href", "title", "rel"], img: ["src", "alt", "width", "height"], th: ["scope", "colspan", "rowspan"], td: ["colspan", "rowspan"] },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
    exclusiveFilter: frame => frame.tag === "img" && !(/^(?:\/media\/[a-zA-Z0-9-]+|\/images\/[^\s]+|https:\/\/[^\s]+)$/.test(frame.attribs.src ?? "")),
  });
}
export function contentPlainText(html: string) {
  const separated = html.replace(/<(?:br\s*\/?|\/(?:p|h[1-6]|li|blockquote|tr|td|th|pre))>/gi, " ");
  return sanitizeHtml(separated, { allowedTags: [], allowedAttributes: {} }).replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
