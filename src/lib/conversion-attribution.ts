import { browserConsent } from "./privacy-consent";

const STORAGE_KEY = "everrise_landing_v1";
const PUBLIC_PATH = /^\/(?:about|press|privacy|blog(?:\/[a-z0-9-]+)?|authors\/[a-z0-9-]+|books\/[a-z0-9-]+(?:\/preview)?)?$/;

/** Only public route shapes are recorded; queries and fragments are discarded. */
export function publicTrackingPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const path = new URL(value, "https://everrisepress.com").pathname;
    return PUBLIC_PATH.test(path) ? path : null;
  } catch { return null; }
}

export function rememberLandingPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    if (!browserConsent().analytics) { window.sessionStorage.removeItem(STORAGE_KEY); return null; }
    const previous = publicTrackingPath(window.sessionStorage.getItem(STORAGE_KEY));
    const path = previous ?? publicTrackingPath(window.location.pathname);
    if (path) window.sessionStorage.setItem(STORAGE_KEY, path);
    return path;
  } catch { return null; }
}

export function browserConversionAttribution() {
  if (typeof window === "undefined" || !browserConsent().analytics) return {};
  return { landing_path: rememberLandingPath(), conversion_path: publicTrackingPath(window.location.pathname) };
}

/** Descriptive client input, never an authorization signal. */
export function conversionAttribution(value: unknown, referer: string | null, origin: string) {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  let fallback: string | null = null;
  try { if (referer && new URL(referer).origin === origin) fallback = publicTrackingPath(referer); } catch { /* No same-site source. */ }
  return { landing_path: publicTrackingPath(input.landing_path), conversion_path: publicTrackingPath(input.conversion_path) ?? fallback };
}
