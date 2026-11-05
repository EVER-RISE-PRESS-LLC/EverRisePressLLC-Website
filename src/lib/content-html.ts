import sanitizeHtml from "sanitize-html";

// Memoize only pure string transformations, not access or publication decisions.
// Each cache is bounded to about 1 MiB of UTF-16 string storage per isolate.
function memoizeHtml(transform: (html: string) => string) {
  const values = new Map<string, string>();
  let bytes = 0;
  const limit = 1_048_576;
  return (html: string): string => {
    const hit = values.get(html);
    if (hit !== undefined) return hit;
    const result = transform(html);
    const size = (html.length + result.length) * 2;
    if (size <= limit) {
      while (values.size && (bytes + size > limit || values.size >= 128)) {
        const oldest = values.entries().next().value!;
        bytes -= (oldest[0].length + oldest[1].length) * 2;
        values.delete(oldest[0]);
      }
      values.set(html, result);
      bytes += size;
    }
    return result;
  };
}

/** Server-side allowlist for staff-authored book and article content. */
export const cleanContentHtml = memoizeHtml((html: string) => {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "a", "code", "pre", "hr", "img", "table", "thead", "tbody", "tr", "th", "td", "caption"],
    allowedAttributes: { a: ["href", "title", "rel"], img: ["src", "alt", "width", "height"], th: ["scope", "colspan", "rowspan"], td: ["colspan", "rowspan"] },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
    exclusiveFilter: frame => frame.tag === "img" && !(/^(?:\/media\/[a-zA-Z0-9-]+|\/images\/[^\s]+|https:\/\/[^\s]+)$/.test(frame.attribs.src ?? "")),
  });
});
export const contentPlainText = memoizeHtml((html: string) => {
  const separated = html.replace(/<(?:br\s*\/?|\/(?:p|h[1-6]|li|blockquote|tr|td|th|pre))>/gi, " ");
  return sanitizeHtml(separated, { allowedTags: [], allowedAttributes: {} }).replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
});
