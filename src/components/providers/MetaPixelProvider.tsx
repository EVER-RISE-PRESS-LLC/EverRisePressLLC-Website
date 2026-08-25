"use client";

import { useEffect } from "react";
import { env } from "@/lib/env";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

let loaded = false;

export function trackMetaEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

export default function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const pixelId = env.NEXT_PUBLIC_META_PIXEL_ID;
    if (!pixelId || loaded) return;
    loaded = true;

    const queue: unknown[][] = [];
    const fbq = (...args: unknown[]) => {
      if (window.fbq) {
        window.fbq(...args);
      } else {
        queue.push(args);
      }
    };
    fbq("init", pixelId);
    fbq("track", "PageView");

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.onload = () => {
      for (const args of queue) {
        window.fbq?.(...args);
      }
    };
    document.head.appendChild(script);
  }, []);

  return children;
}
