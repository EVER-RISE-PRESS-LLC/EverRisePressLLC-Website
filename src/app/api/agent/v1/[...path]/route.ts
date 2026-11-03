import { NextRequest } from "next/server";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { handleAgentRequest } from "@/lib/agent/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { env } = await getCloudflareContext({ async: true });
  return handleAgentRequest(request, env.DB, (await context.params).path);
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
