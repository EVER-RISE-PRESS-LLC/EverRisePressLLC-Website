import { env } from "@/lib/env";

const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || env.NEXT_PUBLIC_META_PIXEL_ID;

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface MetaLeadEventParams {
  email: string;
  ip: string | null;
  userAgent: string | null;
  eventSourceUrl: string;
  fbc: string | null;
  fbp: string | null;
}

export async function sendMetaLeadEvent({
  email,
  ip,
  userAgent,
  eventSourceUrl,
  fbc,
  fbp,
}: MetaLeadEventParams): Promise<void> {
  const accessToken = process.env.META_CAPI_TOKEN;
  if (!accessToken || !META_PIXEL_ID) {
    console.warn("Meta CAPI not configured — skipping server event");
    return;
  }

  const userData: Record<string, string> = {
    em: await sha256Hex(email.trim().toLowerCase()),
  };
  if (ip) userData.client_ip_address = ip;
  if (userAgent) userData.client_user_agent = userAgent;
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              event_source_url: eventSourceUrl,
              user_data: userData,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`Meta CAPI error ${response.status}: ${text.slice(0, 300)}`);
    }
  } catch (error) {
    console.error("Meta CAPI send failed:", error);
  }
}
