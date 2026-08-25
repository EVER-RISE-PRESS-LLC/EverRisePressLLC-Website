// Creates or updates an admin user in D1.
// Usage:
//   node scripts/create-admin.mjs <email> <name> [--role ADMIN|EDITOR] [--remote] [--password <pw>]
//
// If --password is omitted, a random one is generated and printed once.
import { execFileSync } from "node:child_process";
import { randomBytes, pbkdf2Sync, randomUUID } from "node:crypto";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const email = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--role" && args[i - 1] !== "--password");
const name = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--role" && args[i - 1] !== "--password").filter((a) => a !== email)[0];
const remote = args.includes("--remote");
const roleIdx = args.indexOf("--role");
const role = roleIdx !== -1 ? args[roleIdx + 1] : "ADMIN";
const pwIdx = args.indexOf("--password");
const password = pwIdx !== -1 ? args[pwIdx + 1] : randomBytes(9).toString("base64url");

if (!email || !name) {
  console.error("Usage: node scripts/create-admin.mjs <email> <name> [--role ADMIN|EDITOR] [--remote] [--password <pw>]");
  process.exit(1);
}
if (!["ADMIN", "EDITOR", "PARTNER"].includes(role)) {
  console.error("--role must be ADMIN, EDITOR, or PARTNER");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = pbkdf2Sync(password, Buffer.from(salt, "hex"), 100_000, 32, "sha256").toString("hex");
const stored = `pbkdf2$sha256$100000$${salt}$${hash}`;
const id = randomUUID();

const sql = `
INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
VALUES ('${id}', '${email.toLowerCase().replace(/'/g, "''")}', '${stored}', '${name.replace(/'/g, "''")}', '${role}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT(email) DO UPDATE SET
  password_hash = excluded.password_hash,
  name = excluded.name,
  role = excluded.role,
  updated_at = CURRENT_TIMESTAMP;
`;

const dir = mkdtempSync(join(tmpdir(), "everise-admin-"));
const file = join(dir, "create-admin.sql");
writeFileSync(file, sql);

const flag = remote ? "--remote" : "--local";
try {
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "everrisepress-db", flag, "--file", file],
    { stdio: "inherit" }
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log("\n✅ Admin user ready.");
console.log(`   Email:    ${email.toLowerCase()}`);
console.log(`   Role:     ${role}`);
if (pwIdx === -1) {
  console.log(`   Password: ${password}  (shown once — save it now)`);
}
