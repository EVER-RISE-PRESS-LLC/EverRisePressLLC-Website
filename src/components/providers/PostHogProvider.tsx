"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import posthog, { type PostHog } from "posthog-js";
import { env } from "@/lib/env";
import { browserConsent, PRIVACY_CHANGE_EVENT } from "@/lib/privacy-consent";

let phInstance: PostHog | null = null;
let phInitPromise: Promise<PostHog> | null = null;

function initPostHog(): Promise<PostHog | null> {
  if (!browserConsent().analytics) return Promise.resolve(null);
  if (phInstance) return Promise.resolve(phInstance);
  if (phInitPromise) return phInitPromise;

  phInitPromise = new Promise((resolve) => {
    const key = env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    posthog.init(key, {
      api_host: host,
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true,
      person_profiles: "never",
    });
    // A prior withdrawal may be persisted by the SDK. The site choice is authoritative.
    if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing({ captureEventName: false });

    const params = new URLSearchParams(window.location.search);
    const referralId = params.get("_phid");
    if (referralId && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(referralId)) {
      posthog.identify(referralId);
      params.delete("_phid");
      const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", nextUrl);
    }

    phInstance = posthog;
    resolve(posthog);
  });

  return phInitPromise;
}

export function usePostHog(): PostHog | null {
  const [client, setClient] = useState<PostHog | null>(phInstance);

  useEffect(() => {
    let mounted = true;
    initPostHog().then((instance) => {
      if (mounted) setClient(instance);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return client;
}

export function usePostHogFlag(name: string): boolean | undefined {
  const client = usePostHog();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!client) return () => {};
      return client.onFeatureFlags(onStoreChange);
    },
    [client]
  );

  const getSnapshot = useCallback(() => {
    return client ? client.isFeatureEnabled(name) : undefined;
  }, [client, name]);

  const getServerSnapshot = useCallback(() => undefined, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function trackEvent(event: string, properties: Record<string, unknown> = {}) {
  initPostHog()
    .then((client) => { if (browserConsent().analytics) client?.capture(event, properties); })
    .catch(() => {});
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog().catch(() => {});
    const stopIfDeclined = () => { if (!browserConsent().analytics) phInstance?.opt_out_capturing(); };
    window.addEventListener(PRIVACY_CHANGE_EVENT, stopIfDeclined);
    return () => window.removeEventListener(PRIVACY_CHANGE_EVENT, stopIfDeclined);
  }, []);

  return children;
}
