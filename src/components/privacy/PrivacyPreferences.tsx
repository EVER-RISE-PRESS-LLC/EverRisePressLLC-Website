"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import ReactiveButton from "@/components/ui/ReactiveButton";
import { env } from "@/lib/env";
import { canTrackPage } from "@/lib/tracking-page";
import { browserConsent, consentCookieValue, PRIVACY_CHANGE_EVENT, PRIVACY_OPEN_EVENT, savePrivacyConsent, type PrivacyConsent } from "@/lib/privacy-consent";

function subscribe(callback: () => void) {
  window.addEventListener(PRIVACY_CHANGE_EVENT, callback);
  return () => window.removeEventListener(PRIVACY_CHANGE_EVENT, callback);
}

export function usePrivacyConsent() {
  const pathname = usePathname();
  const eligible = canTrackPage({ pathname, hostname: typeof window === "undefined" ? "" : window.location.hostname });
  const value = useSyncExternalStore(subscribe, () => consentCookieValue(document.cookie) || "default", () => "");
  return { chosen: !eligible || (Boolean(value) && value !== "default"), analytics: eligible && (value === "default" || value[3] === "1"), advertising: eligible && (value === "default" || value[5] === "1") };
}

export function PrivacySettingsButton() {
  return <button type="button" className="inline-flex min-h-11 items-center text-sm text-cream/75 underline underline-offset-4 transition-colors hover:text-gold" onClick={() => window.dispatchEvent(new Event(PRIVACY_OPEN_EVENT))}>Privacy choices</button>;
}

function removeOptionalStorage(consent: PrivacyConsent) {
  const optional = (name: string) => (!consent.analytics && (/^_ga(?:_|$)/.test(name) || name.startsWith("ph_"))) || (!consent.advertising && ["_fbp", "_fbc"].includes(name));
  for (const entry of document.cookie.split(";")) {
    const name = entry.trim().split("=")[0];
    if (!optional(name)) continue;
    for (const domain of ["", location.hostname, `.${location.hostname}`]) {
      document.cookie = `${name}=; Path=/; Max-Age=0${domain ? `; Domain=${domain}` : ""}`;
    }
  }
  try {
    for (const key of Object.keys(localStorage)) if (optional(key)) localStorage.removeItem(key);
  } catch { /* The browser may block storage. */ }
}

export default function PrivacyPreferences() {
  const consent = usePrivacyConsent();
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const [saving, setSaving] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function show() {
      returnFocus.current = document.activeElement as HTMLElement | null;
      const current = browserConsent();
      setAnalytics(current.analytics);
      setAdvertising(current.advertising);
      setOpen(true);
    }
    window.addEventListener(PRIVACY_OPEN_EVENT, show);
    return () => window.removeEventListener(PRIVACY_OPEN_EVENT, show);
  }, []);

  function save(next: PrivacyConsent) {
    setSaving(true);
    // Discard identifiers from the older email-linked analytics setup on first choice.
    if (!consent.chosen) removeOptionalStorage({ analytics: false, advertising: false });
    // Stop already-loaded vendors before reloading with the new choice.
    if (!next.analytics) {
      (window as unknown as Record<string, unknown>)[`ga-disable-${env.NEXT_PUBLIC_GA_ID}`] = true;
    }
    if (!next.advertising) window.fbq?.("consent", "revoke");
    savePrivacyConsent(next);
    removeOptionalStorage(next);
    window.location.reload();
  }

  return <>
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="press-dialog-overlay" />
        <Dialog.Content className="press-retailer-dialog p-6 md:p-8" onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); }}>
          <div className="flex items-start justify-between gap-4"><Dialog.Title className="font-heading text-2xl font-semibold">Privacy choices</Dialog.Title><Dialog.Close asChild><button type="button" aria-label="Close privacy choices" className="flex size-11 items-center justify-center rounded-md hover:bg-charcoal/10"><X size={20}/></button></Dialog.Close></div>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-text-body">Analytics and advertising tools run by default. Turn either category off here. Essential features provide chapter access and protect forms regardless of these settings.</Dialog.Description>
          <div className="my-6 space-y-5">
            <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1 size-5 shrink-0 accent-charcoal" checked={analytics} onChange={event => setAnalytics(event.target.checked)}/><span><strong className="block">Analytics</strong><span className="mt-1 block text-sm leading-relaxed text-text-body">Google Analytics and PostHog measure visits, chapter unlocks, and retailer clicks. This includes partner referral measurement.</span></span></label>
            <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1 size-5 shrink-0 accent-charcoal" checked={advertising} onChange={event => setAdvertising(event.target.checked)}/><span><strong className="block">Advertising</strong><span className="mt-1 block text-sm leading-relaxed text-text-body">Meta measures ad visits and chapter signups. After signup, this can include a hashed email address and device information.</span></span></label>
          </div>
          <div className="flex flex-wrap gap-3"><ReactiveButton disabled={saving} onClick={() => save({ analytics, advertising })}>{saving ? "Saving…" : "Save choices"}</ReactiveButton><ReactiveButton variant="outline" surface="light" disabled={saving} onClick={() => save({ analytics: false, advertising: false })}>Essential only</ReactiveButton></div>
          <p className="mt-5 text-sm text-text-body">Your choice lasts up to six months on this browser. <Link href="/privacy" className="underline underline-offset-4">Privacy policy</Link>.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
