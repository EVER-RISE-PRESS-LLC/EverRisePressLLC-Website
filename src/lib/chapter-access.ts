import { SignJWT, jwtVerify } from "jose";

export const CHAPTER_ACCESS_COOKIE = "chapter_access";
export const CHAPTER_ACCESS_MAX_AGE = 60 * 60 * 24 * 7;

export async function createChapterAccessToken(bookSlug: string, secret: string) {
  if (!secret) throw new Error("Chapter access signing key is not configured");
  return new SignJWT({ bookSlug })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(secret));
}

/** Accept existing signed cookies too, but never trust a cookie's presence alone. */
export async function hasChapterAccess(
  token: string | undefined,
  bookSlug: string,
  secret: string | undefined,
) {
  if (!token || !secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
      requiredClaims: ["exp"],
    });
    return payload.bookSlug === bookSlug;
  } catch {
    return false;
  }
}
