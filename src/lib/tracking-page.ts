export interface TrackingPage {
  hostname: string;
  pathname: string;
}

/** Staff pages and local development never send optional tracking. */
export function canTrackPage({ hostname, pathname }: TrackingPage): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host === "::1" || host === "0.0.0.0" || /^127\./.test(host)) return false;
  let path = pathname;
  try { path = decodeURIComponent(path); } catch { /* Use the literal path. */ }
  return path !== "/admin" && !path.startsWith("/admin/");
}

type PageListener = (page: TrackingPage) => void;
const listeners = new Set<PageListener>();
let removeGuard: (() => void) | null = null;

/** Stop loaded SDKs before their own history listeners can see a staff URL. */
export function subscribeTrackingPageGuard(listener: PageListener): () => void {
  listeners.add(listener);
  if (!removeGuard) {
    const history = window.history;
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;
    const notify = (page: TrackingPage) => { for (const callback of listeners) callback(page); };
    const current = () => notify(window.location);
    const beforeNavigation = (url?: string | URL | null) => {
      try { notify(new URL(url == null ? window.location.href : String(url), window.location.href)); } catch { /* The browser validates invalid URLs. */ }
    };
    history.pushState = function (data, unused, url) {
      beforeNavigation(url);
      return originalPush.call(this, data, unused, url);
    };
    history.replaceState = function (data, unused, url) {
      beforeNavigation(url);
      return originalReplace.call(this, data, unused, url);
    };
    window.addEventListener("popstate", current);
    window.addEventListener("hashchange", current);
    removeGuard = () => {
      history.pushState = originalPush;
      history.replaceState = originalReplace;
      window.removeEventListener("popstate", current);
      window.removeEventListener("hashchange", current);
      removeGuard = null;
    };
  }
  listener(window.location);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) removeGuard?.();
  };
}
