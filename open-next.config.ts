// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// NOTE: R2 incremental cache is disabled (R2 is not enabled on this account).
// With no incrementalCache override, the adapter uses a no-op cache which is
// fine for this site — all DB-backed pages are force-dynamic.
// To re-enable, see https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({});
