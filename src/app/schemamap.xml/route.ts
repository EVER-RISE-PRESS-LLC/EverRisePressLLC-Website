import { SCHEMA_ENDPOINTS } from "@/lib/seo/endpoints";
import { SITE_URL } from "@/lib/seo/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Schemamap — sitemap-style discovery document for schema.org endpoints.
 * Listed from robots.txt via `Schemamap:`. Content updates live (D1);
 * this list only changes when a new endpoint type is registered in
 * SCHEMA_ENDPOINTS (src/lib/seo/endpoints.ts).
 */
export async function GET() {
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = SCHEMA_ENDPOINTS.map(
    (endpoint) =>
      `  <url><loc>${SITE_URL}${endpoint.path}</loc><lastmod>${lastmod}</lastmod></url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
