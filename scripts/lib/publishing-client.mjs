import { readFile, lstat } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export const defaultConfigPath = () => process.env.EVERRISE_PUBLISH_CONFIG || join(homedir(), ".config", "everrise", "publishing.json");
export function checkedOrigin(value) {
  const url = new URL(value);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("The publishing URL must be an origin without a path or credentials.");
  if (url.origin !== "https://everrisepress.com" && !(url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))) throw new Error("Publishing credentials may only be sent to everrisepress.com or a local test server.");
  return url.origin;
}
export async function loadConfig(path = defaultConfigPath()) {
  const stat = await lstat(path).catch(() => { throw new Error("Publishing is not configured. See docs/agent-publishing.md for credential setup."); });
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0 || (typeof process.getuid === "function" && stat.uid !== process.getuid())) throw new Error("The credential file must be owned by this user and readable only by this user (mode 600).");
  const config = JSON.parse(await readFile(path, "utf8"));
  if (!/^erp_[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/.test(config.token ?? "")) throw new Error("The publishing credential file is invalid.");
  return { ...config, baseUrl: checkedOrigin(config.baseUrl) };
}

export class PublishingApiError extends Error {
  constructor(status, data) { super(data.error || `Publishing request failed (${status}).`); this.status = status; this.code = data.code; this.requestId = data.requestId; this.issues = data.issues; }
}
export function publishingClient(config) {
  const origin = checkedOrigin(config.baseUrl);
  return async function api(path, { method = "GET", json, body, headers = {} } = {}) {
    if (!/^\/[a-zA-Z0-9/?=&%._-]*$/.test(path) || path.startsWith("//") || path.includes("..")) throw new Error("Invalid publishing API path.");
    let response;
    try {
      response = await fetch(`${origin}/api/agent/v1${path}`, {
        method, redirect: "error", signal: AbortSignal.timeout(45_000),
        headers: { ...headers, authorization: `Bearer ${config.token}`, ...(json !== undefined ? { "content-type": "application/json" } : {}) },
        body: json !== undefined ? JSON.stringify(json) : body,
      });
    } catch { throw new Error("The publishing server could not be reached. Read the saved state before retrying a write; requests are never retried automatically."); }
    let result;
    try { result = await response.json(); } catch { throw new Error(`The server returned an unexpected response (${response.status}).`); }
    if (!response.ok) throw new PublishingApiError(response.status, result);
    return result;
  };
}

export function editableArticle(article) {
  const keys = ["slug", "status", "title", "description", "section", "author", "publishedAt", "updatedAt", "review", "imageUrl", "imageAlt", "imageWidth", "imageHeight", "blocks", "sources", "relatedSlugs", "editorialNotes"];
  return Object.fromEntries(keys.filter(key => article[key] !== undefined).map(key => [key, article[key]]));
}
