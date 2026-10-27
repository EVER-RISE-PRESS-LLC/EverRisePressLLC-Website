import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getDb } from "./index";

export async function getDatabase() {
  const { env } = await getCloudflareContext({ async: true });
  return getDb(env.DB);
}
