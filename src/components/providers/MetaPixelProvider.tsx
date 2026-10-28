"use client";

import { useEffect } from "react";
import { env } from "@/lib/env";
import { usePathname } from "next/navigation";
import { browserConsent, PRIVACY_CHANGE_EVENT } from "@/lib/privacy-consent";
import { canTrackPage, subscribeTrackingPageGuard } from "@/lib/tracking-page";
import { afterPageLoadAndIdle } from "@/lib/after-page-load";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

let initialized = false;
let scheduled = false;
let scriptRequested = false;

function schedulePixelScript() {
  if (scriptRequested || scheduled) return;
  scheduled = true;
  afterPageLoadAndIdle().then(() => {
    scheduled = false;
    if (!browserConsent().advertising) {
      // Drop pending tracking if consent or the public route changed while loading.
      const pixel = window.fbq as (NonNullable<Window["fbq"]> & { queue?: unknown[][] }) | undefined;
      if (pixel?.queue) pixel.queue = pixel.queue.filter(args => !["track", "trackCustom", "trackSingle", "trackSingleCustom"].includes(String(args[0])));
      return;
    }
    scriptRequested = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  });
}

export function trackMetaEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && browserConsent().advertising && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

export default function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => subscribeTrackingPageGuard((page) => {
    if (!canTrackPage(page)) window.fbq?.("consent", "revoke");
  }), []);
  useEffect(() => {
    const syncConsent = () => {
      window.fbq?.("consent", browserConsent().advertising ? "grant" : "revoke");
    };
    window.addEventListener(PRIVACY_CHANGE_EVENT, syncConsent);
    syncConsent();
    const pixelId = env.NEXT_PUBLIC_META_PIXEL_ID;
    if (!pixelId || !browserConsent().advertising) return () => window.removeEventListener(PRIVACY_CHANGE_EVENT, syncConsent);
    if (initialized) {
      trackMetaEvent("PageView");
      schedulePixelScript();
      return () => window.removeEventListener(PRIVACY_CHANGE_EVENT, syncConsent);
    }
    initialized = true;

    type PixelQueue = ((...args: unknown[]) => void) & {
      queue: unknown[][];
      callMethod?: (...args: unknown[]) => void;
      push?: PixelQueue;
      loaded: boolean;
      version: string;
    };
    const fbq: PixelQueue = Object.assign((...args: unknown[]) => {
      if (["track", "trackCustom", "trackSingle", "trackSingleCustom"].includes(String(args[0])) && !browserConsent().advertising) return;
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    }, { queue: [] as unknown[][], loaded: true, version: "2.0" });
    fbq.push = fbq;
    window.fbq = window._fbq = fbq;
    fbq("init", pixelId);
    fbq("track", "PageView");

    schedulePixelScript();
    return () => window.removeEventListener(PRIVACY_CHANGE_EVENT, syncConsent);
  }, [pathname]);

  return children;
}
