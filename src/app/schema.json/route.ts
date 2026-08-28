import { assembleGraph } from "@jdevalk/seo-graph-core";
import { getCorpusPieces, schemaJsonResponse } from "@/lib/seo/endpoints";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Corpus-wide knowledge graph for AI crawlers and agents.
 * One fetch returns Organization, WebSite, the Blog collection, every
 * Person, and every Book, fully cross-referenced by @id.
 */
export async function GET() {
  return schemaJsonResponse(
    assembleGraph(await getCorpusPieces()),
    "no-store"
  );
}
