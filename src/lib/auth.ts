import { getCloudflareContext } from "@/lib/cloudflare-context";
import { sameOrigin } from "@/lib/admin/api";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const PBKDF2_ITERATIONS = 100_000;

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR" | "PARTNER";
};

async function getJwtSecret(): Promise<Uint8Array> {
  const secret = process.env.JWT_SECRET || (await getCloudflareContext({ async: true })).env.JWT_SECRET;
  if (!secret) throw new Error("Admin signing key is not configured");
  return new TextEncoder().encode(secret);
}

export function generateSaltHex(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(
  password: string,
  saltHex: string = generateSaltHex()
): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const saltBytes = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations: PBKDF2_ITERATIONS },
    keyMaterial,
    256
  );
  return `pbkdf2$sha256$${PBKDF2_ITERATIONS}$${saltHex}$${bytesToHex(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2") return false;
  const [, , iterationsStr, saltHex] = parts;
  const iterations = parseInt(iterationsStr, 10);
  if (!Number.isFinite(iterations)) return false;

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const saltBytes = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations },
    keyMaterial,
    256
  );
  const candidate = bytesToHex(bits);
  const expected = parts[4];
  if (candidate.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < candidate.length; i++) {
    mismatch |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(await getJwtSecret());
}

export async function verifySessionToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, await getJwtSecret(), { algorithms: ["HS256"], requiredClaims: ["sub", "exp"] });
    if (!payload.sub) return null;
    return { userId: payload.sub };
  } catch {
    return null;
  }
}

export async function getSessionUser(
  request: NextRequest,
  dbEnv: D1Database
): Promise<AdminUser | null> {
  if (!["GET", "HEAD"].includes(request.method) && !sameOrigin(request)) return null;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const verified = await verifySessionToken(token);
  if (!verified) return null;

  const db = getDb(dbEnv);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, verified.userId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as AdminUser["role"],
  };
}

export async function getCurrentAdminUser(dbEnv: D1Database): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const verified = await verifySessionToken(token);
  if (!verified) return null;

  const db = getDb(dbEnv);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, verified.userId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as AdminUser["role"],
  };
}

export function requireAdmin(user: AdminUser | null): boolean {
  return user?.role === "ADMIN";
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}
