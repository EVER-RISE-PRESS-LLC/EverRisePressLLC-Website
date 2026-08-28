"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import posthog, { type PostHog } from "posthog-js";
import { env } from "@/lib/env";

let phInstance: PostHog | null = null;
let phInitPromise: Promise<PostHog> | null = null;

function initPostHog(): Promise<PostHog> {
  if (phInstance) return Promise.resolve(phInstance);
  if (phInitPromise) return phInitPromise;

  phInitPromise = new Promise((resolve) => {
    const key = env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    posthog.init(key, {
      api_host: host,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true,
      disable_surveys: true,
      capture_dead_clicks: false,
      person_profiles: "always",
    });

    const params = new URLSearchParams(window.location.search);
    const referralId = params.get("_phid");
    if (referralId) {
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
    .then((client) => client.capture(event, properties))
    .catch(() => {});
}

export function identifyUser(
  email: string,
  properties: Record<string, unknown> = {}
) {
  initPostHog()
    .then((client) => client.identify(email, properties))
    .catch(() => {});
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog().catch(() => {});
  }, []);

  return children;
}
