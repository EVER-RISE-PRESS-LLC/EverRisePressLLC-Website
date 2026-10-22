import { SITE_URL } from "@/lib/seo/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // One group keeps exclusions consistent for search and AI crawlers.
  // The preview is crawlable so Google can read its noindex meta tag.
  const robots = `# EverRise Press LLC crawler policy
# AI indexing and training remain permitted for public content.
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
