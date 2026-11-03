import { timingSafeEqual } from "node:crypto";

export const AGENT_SCOPES = ["articles:read", "articles:write", "articles:publish", "media:read", "media:write", "media:delete"] as const;
export type AgentScope = (typeof AGENT_SCOPES)[number];
export type AgentIdentity = { id: string; name: string; scopes: AgentScope[]; expiresAt: string };
type CredentialRow = { id: string; name: string; token_hash: string; scopes: string; expires_at: string; revoked_at: string | null };

export class AgentError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); this.name = "AgentError"; }
}

export async function authenticateAgent(request: Request, db: D1Database): Promise<AgentIdentity> {
  // This is a machine API: no cookies, browser origins, or cross-site fallback.
  if (request.headers.has("origin") || ["cross-site", "same-site", "same-origin"].includes(request.headers.get("sec-fetch-site") ?? "")) {
    throw new AgentError(403, "BROWSER_REQUEST", "Use the staff workspace in a browser, or the publishing client without browser cookies.");
  }
  const match = /^Bearer (erp_([0-9a-f-]{36})\.[A-Za-z0-9_-]{43})$/.exec(request.headers.get("authorization") ?? "");
  if (!match) throw new AgentError(401, "UNAUTHORIZED", "A valid publishing API credential is required.");
  const row = await db.prepare("SELECT id, name, token_hash, scopes, expires_at, revoked_at FROM agent_credentials WHERE id = ?").bind(match[2]).first<CredentialRow>();
  const actual = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(match[1])));
  const expected = Uint8Array.from((row?.token_hash ?? "0".repeat(64)).match(/.{2}/g) ?? [], hex => parseInt(hex, 16));
  const valid = expected.length === actual.length && timingSafeEqual(actual, expected);
  if (!valid || !row || row.revoked_at || !(Date.parse(row.expires_at) > Date.now())) {
    throw new AgentError(401, "UNAUTHORIZED", "The publishing credential is invalid, expired or revoked.");
  }
  const scopes: unknown = JSON.parse(row.scopes);
  if (!Array.isArray(scopes) || scopes.some(scope => !AGENT_SCOPES.includes(scope))) throw new AgentError(401, "UNAUTHORIZED", "Invalid credential permissions.");
  // Atomically count authenticated requests; invalid guesses cannot lock out a key.
  const window = Math.floor(Date.now() / 60_000);
  const allowed = await db.prepare(`UPDATE agent_credentials SET
    rate_count = CASE WHEN rate_window = ? THEN rate_count + 1 ELSE 1 END,
    rate_window = ?, last_used_at = ?
    WHERE id = ? AND revoked_at IS NULL AND expires_at > ? AND (rate_window != ? OR rate_count < 60) RETURNING id`)
    .bind(window, window, new Date().toISOString(), row.id, new Date().toISOString(), window).first();
  if (!allowed) throw new AgentError(429, "RATE_LIMITED", "Wait one minute before making more publishing requests.");
  return { id: row.id, name: row.name, scopes, expiresAt: row.expires_at };
}

export function requireScope(agent: AgentIdentity, scope: AgentScope) {
  if (!agent.scopes.includes(scope)) throw new AgentError(403, "INSUFFICIENT_SCOPE", `This credential requires ${scope} permission.`);
}
