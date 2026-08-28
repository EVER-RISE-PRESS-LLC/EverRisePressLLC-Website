import { SCHEMA_ENDPOINTS } from "@/lib/seo/endpoints";
import { SITE_URL } from "@/lib/seo/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * API catalog (RFC 9727) at the /.well-known/api-catalog well-known URI,
 * served as a linkset (RFC 9264). Listed from robots.txt via `Agentmap:`.
 * Schema endpoints are typed by their schema.org type so agent crawlers
 * know what they will find at each URL. Derived from SCHEMA_ENDPOINTS —
 * new endpoint types appear here automatically.
 */
export async function GET() {
  const schemaEndpoints = SCHEMA_ENDPOINTS.filter(
    (endpoint) => endpoint.schemaType
  ).map((endpoint) => ({
    anchor: `${SITE_URL}${endpoint.path}`,
    type: `https://schema.org/${endpoint.schemaType}`,
  }));

  const catalog = {
    linkset: [
      {
        anchor: SITE_URL,
        item: [
          ...schemaEndpoints,
          { anchor: `${SITE_URL}/schema.json` },
          { anchor: `${SITE_URL}/schemamap.xml` },
          { anchor: `${SITE_URL}/sitemap.xml` },
          { anchor: `${SITE_URL}/llms.txt` },
        ],
      },
    ],
  };

  return new Response(JSON.stringify(catalog, null, 2), {
    headers: {
      "Content-Type": "application/linkset+json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
