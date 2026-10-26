import "server-only";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentAdminUser } from "@/lib/auth";

/** Guard each page as well as the shared layout before accessing private briefs. */
export async function requireArticleEditor() {
  const { env } = await getCloudflareContext({ async: true });
  const user = await getCurrentAdminUser(env.DB);
  if (!user) redirect("/admin/login");
  return user;
}
