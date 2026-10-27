import { env, waitUntil } from "cloudflare:workers";

/** Native Workers bindings shared by server pages and route handlers. */
export async function getCloudflareContext(options?: { async?: boolean }) {
  void options;
  return { env: env as CloudflareEnv, ctx: { waitUntil: (task: Promise<unknown>) => waitUntil(task) } };
}
