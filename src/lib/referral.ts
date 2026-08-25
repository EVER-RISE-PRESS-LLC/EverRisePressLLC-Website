export const REFERRAL_COOKIE_NAME = "everise_ref";
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function normalizePartnerSlug(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function hashIp(ip: string | null | undefined): Promise<string | null> {
  if (!ip) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
