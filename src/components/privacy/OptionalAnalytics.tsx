"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { env } from "@/lib/env";
import { canTrackPage, subscribeTrackingPageGuard } from "@/lib/tracking-page";
import { usePrivacyConsent } from "./PrivacyPreferences";

export default function OptionalAnalytics() {
  const consent = usePrivacyConsent();
  const pathname = usePathname();
  useEffect(() => subscribeTrackingPageGuard((page) => {
    if (!canTrackPage(page)) (window as unknown as Record<string, unknown>)[`ga-disable-${env.NEXT_PUBLIC_GA_ID}`] = true;
  }), []);
  useEffect(() => {
    const disabledKey = `ga-disable-${env.NEXT_PUBLIC_GA_ID}`;
    const state = window as unknown as Record<string, unknown>;
    const wasDisabled = state[disabledKey] === true;
    state[disabledKey] = !consent.analytics;
    if (consent.analytics && wasDisabled && window.gtag) {
      // A staff URL must never become the referrer of the resumed public view.
      window.gtag("set", { page_referrer: window.location.origin });
      window.gtag("event", "page_view", { page_location: window.location.href, page_referrer: window.location.origin, page_title: document.title });
    }
  }, [pathname, consent.analytics]);
  return consent.analytics ? <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} /> : null;
}
