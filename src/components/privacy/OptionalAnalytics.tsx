"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { env } from "@/lib/env";
import { usePrivacyConsent } from "./PrivacyPreferences";

export default function OptionalAnalytics() {
  const consent = usePrivacyConsent();
  return consent.analytics ? <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} /> : null;
}
