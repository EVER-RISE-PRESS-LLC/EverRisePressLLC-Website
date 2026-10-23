export const PRIVACY_COOKIE = "everrise_privacy";
export const PRIVACY_MAX_AGE = 60 * 60 * 24 * 180;
export const PRIVACY_CHANGE_EVENT = "everrise:privacy-change";
export const PRIVACY_OPEN_EVENT = "everrise:privacy-open";

export interface PrivacyConsent {
  analytics: boolean;
  advertising: boolean;
}

export function consentCookieValue(cookieHeader: string | null | undefined): string {
  const value = cookieHeader?.split(";").map(part => part.trim())
    .find(part => part.startsWith(`${PRIVACY_COOKIE}=`))?.slice(PRIVACY_COOKIE.length + 1);
  return value && /^v1\.[01]\.[01]$/.test(value) ? value : "";
}

export function readPrivacyConsent(cookieHeader: string | null | undefined): PrivacyConsent {
  const value = consentCookieValue(cookieHeader);
  return { analytics: value[3] === "1", advertising: value[5] === "1" };
}

export function browserConsent(): PrivacyConsent {
  if (typeof location !== "undefined" && location.pathname.startsWith("/admin")) return { analytics: false, advertising: false };
  return readPrivacyConsent(typeof document === "undefined" ? "" : document.cookie);
}

export function savePrivacyConsent(consent: PrivacyConsent) {
  document.cookie = `${PRIVACY_COOKIE}=v1.${Number(consent.analytics)}.${Number(consent.advertising)}; Path=/; Max-Age=${PRIVACY_MAX_AGE}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  window.dispatchEvent(new Event(PRIVACY_CHANGE_EVENT));
}
