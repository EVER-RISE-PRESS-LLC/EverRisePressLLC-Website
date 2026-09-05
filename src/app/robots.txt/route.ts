import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_SITE_URL;

  const robots = `# EverRise Press LLC — crawler policy
# AI indexing and training permitted (GEO-first publishing strategy).

User-agent: *
Content-Signal: search=yes,ai-train=yes,use=full
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /books/*/preview

# AI crawlers explicitly welcome
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: Amazonbot
Allow: /s

User-agent: PetalBot
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
# Schemamap: ${baseUrl}/schemamap.xml
# Agentmap: ${baseUrl}/.well-known/api-catalog
`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
