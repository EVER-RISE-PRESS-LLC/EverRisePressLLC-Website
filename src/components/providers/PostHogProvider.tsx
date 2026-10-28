"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { PostHog } from "posthog-js/dist/module.no-external";
import { env } from "@/lib/env";
import { usePathname } from "next/navigation";
import { browserConsent, PRIVACY_CHANGE_EVENT } from "@/lib/privacy-consent";
import { canTrackPage, subscribeTrackingPageGuard } from "@/lib/tracking-page";
import { afterPageLoadAndIdle } from "@/lib/after-page-load";

let phInstance: PostHog | null = null;
let phInitPromise: Promise<PostHog | null> | null = null;

function initPostHog(): Promise<PostHog | null> {
  if (!browserConsent().analytics) {
    phInstance?.opt_out_capturing();
    return Promise.resolve(null);
  }
  if (phInstance) {
    if (phInstance.has_opted_out_capturing()) phInstance.opt_in_capturing({ captureEventName: false });
    return Promise.resolve(phInstance);
  }
  if (phInitPromise) return phInitPromise;

  phInitPromise = afterPageLoadAndIdle().then(() => {
    if (!browserConsent().analytics) return null;
    return import("posthog-js/dist/module.no-external");
  }).then((sdk) => {
    if (!sdk) return null;
    const posthog = sdk.default;
    // Consent or route may change while the SDK chunk is loading.
    if (!browserConsent().analytics) return null;
    const key = env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    posthog.init(key, {
      api_host: host,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: true,
      disable_session_recording: true,
      disable_surveys: true,
      disable_external_dependency_loading: true,
      person_profiles: "never",
      before_send: (event) => browserConsent().analytics ? event : null,
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
    return posthog;
  }).finally(() => { phInitPromise = null; });

  return phInitPromise;
}

export function usePostHog(): PostHog | null {
  const [client, setClient] = useState<PostHog | null>(phInstance);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    initPostHog().then((instance) => {
      if (mounted) setClient(instance);
    });
    return () => {
      mounted = false;
    };
  }, [pathname]);

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
  if (!browserConsent().analytics) return;
  initPostHog()
    .then((client) => { if (browserConsent().analytics) client?.capture(event, properties); })
    .catch(() => {});
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => subscribeTrackingPageGuard((page) => {
    if (!canTrackPage(page)) phInstance?.opt_out_capturing();
  }), []);
  useEffect(() => {
    const sync = () => {
      if (!browserConsent().analytics) { phInstance?.opt_out_capturing(); return; }
      const pageUrl = new URL(window.location.href);
      pageUrl.searchParams.delete("_phid");
      initPostHog().then((client) => {
        if (browserConsent().analytics) client?.capture("$pageview", { $current_url: pageUrl.href });
      }).catch(() => {});
    };
    sync();
    window.addEventListener(PRIVACY_CHANGE_EVENT, sync);
    return () => window.removeEventListener(PRIVACY_CHANGE_EVENT, sync);
  }, [pathname]);

  return children;
}
