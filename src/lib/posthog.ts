import { env } from "@/lib/env";

const POSTHOG_KEY =
  process.env.POSTHOG_API_KEY ||
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || env.NEXT_PUBLIC_POSTHOG_HOST;

export interface ServerEventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

function getPostHogDistinctIdFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const raw of cookieHeader.split(";")) {
    const cookie = raw.trim();
    const eqIndex = cookie.indexOf("=");
    if (eqIndex === -1) continue;
    const name = cookie.slice(0, eqIndex).trim();
    if (!name.startsWith("ph_") || !name.endsWith("_posthog")) continue;
    const value = cookie.slice(eqIndex + 1);
    try {
      const parsed = JSON.parse(decodeURIComponent(value));
      return typeof parsed.distinct_id === "string" ? parsed.distinct_id : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function getAnonymousId(
  cookieHeader: string | null
): { distinctId: string; isNew: boolean } {
  const existing = getPostHogDistinctIdFromCookies(cookieHeader);
  if (existing) return { distinctId: existing, isNew: false };
  return { distinctId: crypto.randomUUID(), isNew: true };
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties: ServerEventProperties = {}
): Promise<void> {
  try {
    const body = JSON.stringify({
      api_key: POSTHOG_KEY,
      batch: [
        {
          event,
          distinct_id: distinctId,
          properties: {
            ...properties,
            $lib: "everrise-server",
          },
        },
      ],
    });

    await fetch(`${POSTHOG_HOST}/batch/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (error) {
    console.error("PostHog server capture failed:", error);
  }
}
