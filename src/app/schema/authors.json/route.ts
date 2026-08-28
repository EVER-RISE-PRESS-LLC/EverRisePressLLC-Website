import { assembleGraph } from "@jdevalk/seo-graph-core";
import { getPersonPieces, schemaJsonResponse } from "@/lib/seo/endpoints";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return schemaJsonResponse(assembleGraph(await getPersonPieces()));
}
