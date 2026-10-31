import { gtagEvent } from "./gtag";
import { browserConsent } from "./privacy-consent";
import { browserConversionAttribution } from "./conversion-attribution";

interface RetailerClick {
  bookSlug?: string;
  distributor: string;
  formatType: string;
}

/** Shared by the retailer chooser and the purchase link after the sample. */
export function trackRetailerClick({ bookSlug, distributor, formatType }: RetailerClick): void {
  if (!browserConsent().analytics) return;
  const attribution = browserConversionAttribution();
  // Optional measurement must never prevent the browser following the link.
  try {
    gtagEvent("retailer_redirect_click", {
      book_slug: bookSlug,
      retailer: distributor,
      format_type: formatType,
      ...attribution,
    });
  } catch { /* Continue to the retailer if the analytics client fails. */ }
  if (!bookSlug) return;
  try {
    fetch("/api/retailer-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookSlug, retailer: distributor, formatType, attribution }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* Navigation still works when measurement is unavailable. */ }
}
