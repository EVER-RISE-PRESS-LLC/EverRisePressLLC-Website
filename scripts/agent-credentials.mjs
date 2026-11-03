#!/usr/bin/env node
// Administration only. Routine publishing uses the scoped API, never Wrangler.
import { execFileSync } from "node:child_process";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile, rename, rm, lstat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { checkedOrigin, defaultConfigPath, loadConfig } from "./lib/publishing-client.mjs";

const project = fileURLToPath(new URL("..", import.meta.url));
const allScopes = ["articles:read", "articles:write", "articles:publish", "media:read", "media:write", "media:delete"];
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    remote: { type: "boolean" }, local: { type: "boolean" }, "persist-to": { type: "string" },
    config: { type: "string" }, name: { type: "string" }, scopes: { type: "string" }, days: { type: "string" },
    "base-url": { type: "string" }, help: { type: "boolean" },
  } });
  const [command, id] = positionals;
  if (values.help || !command) {
    console.log("npm run agent:credentials -- create|rotate|list|revoke [ID] --remote|--local [--name NAME] [--days 180] [--scopes comma,separated] [--config PRIVATE_FILE] [--base-url http://127.0.0.1:8789] [--persist-to LOCAL_DIRECTORY]\nRemote administration uses the everrise Wrangler profile and the configured EverRise D1 database. Raw tokens are written only to a mode-600 file outside the repository."); return;
  }
  if (Boolean(values.remote) === Boolean(values.local)) throw new Error("Choose exactly one of --remote or --local.");
  if (!["create", "rotate", "list", "revoke"].includes(command)) throw new Error("Unknown credential command.");
  const wrangler = join(project, "node_modules", "wrangler", "bin", "wrangler.js");
  const baseArgs = [wrangler, "d1", "execute", "everrisepress-db", values.remote ? "--remote" : "--local", "--json", ...(values.remote ? ["--profile", "everrise"] : []), ...(values["persist-to"] ? ["--persist-to", resolve(values["persist-to"])] : [])];
  const run = async (sql, returnRows = false) => {
    const folder = await mkdtemp(join(tmpdir(), "everrise-agent-admin-"));
    try {
      const file = join(folder, "operation.sql"); await writeFile(file, sql, { mode: 0o600 });
      let stdout;
      // SQL-file imports return aggregate stats remotely. Metadata reads and
      // revocation use --command to receive real rows; these contain no secrets.
      try { stdout = execFileSync(process.execPath, [...baseArgs, ...(returnRows ? ["--command", sql] : ["--file", file])], { cwd: project, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 2 * 1024 * 1024 }); }
      catch { throw new Error("The credential database operation did not complete. Check the everrise Cloudflare login and migration 0005; any pending credential file is retained for recovery."); }
      // Remote SQL-file imports may prefix --json output with progress lines.
      // Find a complete result array, without printing SQL or credential data.
      let result;
      for (const match of stdout.matchAll(/^\s*\[(?:\s*\{|\s*\])/gm)) {
        try { result = JSON.parse(stdout.slice(match.index)); break; } catch { /* Try the next array. */ }
      }
      if (!Array.isArray(result) || result.some(item => !item.success)) throw new Error("The credential database operation returned no successful result. Verify the database before retrying.");
      return result.flatMap(item => item.results ?? []);
    } finally { await rm(folder, { recursive: true, force: true }); }
  };
  if (command === "list") {
    console.log(JSON.stringify(await run("SELECT id, name, scopes, created_at, expires_at, revoked_at, last_used_at FROM agent_credentials ORDER BY created_at DESC", true), null, 2)); return;
  }
  if (command === "revoke") {
    if (!/^[0-9a-f-]{36}$/.test(id ?? "")) throw new Error("Supply a credential ID from list.");
    const result = await run(`UPDATE agent_credentials SET revoked_at = ${quote(new Date().toISOString())} WHERE id = ${quote(id)} RETURNING id, name, revoked_at`, true);
    if (!result.length) throw new Error("Credential not found.");
    console.log(JSON.stringify(result, null, 2)); return;
  }
  const path = resolve(values.config ?? defaultConfigPath());
  if (path === project || path.startsWith(project + "/")) throw new Error("Keep credential files outside the public repository.");
  if (command === "create" && await lstat(path).catch(() => null)) throw new Error("A credential file already exists. Use rotate to replace and revoke it.");
  const old = command === "rotate" ? await loadConfig(path) : null;
  const baseUrl = checkedOrigin(values["base-url"] ?? old?.baseUrl ?? (values.remote ? "https://everrisepress.com" : "http://127.0.0.1:8789"));
  if (Boolean(values.remote) !== (baseUrl === "https://everrisepress.com")) throw new Error("The configured URL must match the local or remote database target.");
  const scopes = values.scopes ? values.scopes.split(",") : old?.scopes ?? allScopes;
  if (!scopes.length || scopes.some(scope => !allScopes.includes(scope)) || new Set(scopes).size !== scopes.length) throw new Error("Choose distinct supported publishing scopes.");
  const name = values.name ?? old?.name ?? "Codex publishing agent";
  if (!name.trim() || name.length > 120 || /[\u0000-\u001f\u007f]/.test(name)) throw new Error("Use a plain credential label of 1–120 characters.");
  const days = Number(values.days ?? "180");
  if (!Number.isInteger(days) || days < 1 || days > 365) throw new Error("Credential lifetime must be 1–365 days.");
  const createdAt = new Date().toISOString(), expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();
  const credentialId = randomUUID(), token = `erp_${credentialId}.${randomBytes(32).toString("base64url")}`;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const folder = dirname(path); await mkdir(folder, { recursive: true, mode: 0o700 });
  const folderStat = await lstat(folder);
  if (!folderStat.isDirectory() || folderStat.isSymbolicLink() || (folderStat.mode & 0o077) !== 0) throw new Error("Use a private credential directory (mode 700).");
  const pending = `${path}.pending-${credentialId}`;
  await writeFile(pending, JSON.stringify({ baseUrl, token, id: credentialId, name, scopes, createdAt, expiresAt }, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  try {
    await run(`INSERT INTO agent_credentials (id, name, token_hash, scopes, created_at, expires_at) VALUES (${[credentialId, name, tokenHash, JSON.stringify(scopes), createdAt, expiresAt].map(quote).join(", ")});`);
    await rename(pending, path);
    // Activate the replacement locally before revoking the old key. A failure
    // leaves the new file usable; list/revoke can finish revocation explicitly.
    if (old) await run(`UPDATE agent_credentials SET revoked_at = ${quote(createdAt)} WHERE id = ${quote(old.id)};`);
  } catch (error) { throw new Error(`${error.message} Credential recovery location: ${await lstat(pending).catch(() => null) ? pending : path}`); }
  console.log(JSON.stringify({ configured: true, credentialId, name, scopes, expiresAt, configFile: path, previousCredentialRevoked: Boolean(old) }, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
