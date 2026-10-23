"use client";

import { useEffect } from "react";
import { env } from "@/lib/env";
import { browserConsent } from "@/lib/privacy-consent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

let loaded = false;

export function trackMetaEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && browserConsent().advertising && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

export default function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const pixelId = env.NEXT_PUBLIC_META_PIXEL_ID;
    if (!pixelId || loaded || !browserConsent().advertising) return;
    loaded = true;

    type PixelQueue = ((...args: unknown[]) => void) & {
      queue: unknown[][];
      callMethod?: (...args: unknown[]) => void;
      push?: PixelQueue;
      loaded: boolean;
      version: string;
    };
    const fbq: PixelQueue = Object.assign((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    }, { queue: [] as unknown[][], loaded: true, version: "2.0" });
    fbq.push = fbq;
    window.fbq = window._fbq = fbq;
    fbq("init", pixelId);
    fbq("track", "PageView");

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }, []);

  return children;
}
