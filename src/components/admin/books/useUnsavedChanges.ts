"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Keep unsaved catalog edits when a staff member follows an admin navigation link. */
export function useUnsavedChanges(isDirty: boolean, onDiscard?: () => void) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const allowNavigation = useRef(false);
  const pendingHistoryKey = useRef<string | null>(null);

  useEffect(() => {
    if (!isDirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (allowNavigation.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const onClick = (event: MouseEvent) => {
      if (
        allowNavigation.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element).closest?.("a[href]");
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      )
        return;
      const target = new URL(link.href, window.location.href);
      if (
        target.origin !== window.location.origin ||
        (target.pathname === window.location.pathname &&
          target.search === window.location.search)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      pendingHistoryKey.current = null;
      setPendingHref(target.pathname + target.search + target.hash);
    };
    // The Navigation API can cancel same-document browser Back/Forward before Next changes routes.
    const navigation = (window as Window & { navigation?: EventTarget })
      .navigation;
    const onNavigate = (event: Event) => {
      const navigationEvent = event as Event & {
        navigationType?: string;
        destination?: { url: string; key: string; sameDocument: boolean };
      };
      if (
        allowNavigation.current ||
        !event.cancelable ||
        navigationEvent.navigationType !== "traverse" ||
        !navigationEvent.destination?.sameDocument
      )
        return;
      const destination = new URL(navigationEvent.destination.url);
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      )
        return;
      event.preventDefault();
      pendingHistoryKey.current = navigationEvent.destination.key;
      setPendingHref(
        destination.pathname + destination.search + destination.hash,
      );
    };
    navigation?.addEventListener("navigate", onNavigate);
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      navigation?.removeEventListener("navigate", onNavigate);
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [isDirty]);

  function discard() {
    if (!pendingHref) return;
    allowNavigation.current = true;
    onDiscard?.();
    setPendingHref(null);
    const navigation = (
      window as Window & {
        navigation?: { traverseTo: (key: string) => unknown };
      }
    ).navigation;
    if (pendingHistoryKey.current && navigation)
      navigation.traverseTo(pendingHistoryKey.current);
    else router.push(pendingHref);
  }

  return {
    pendingHref,
    discard,
    cancel: () => {
      pendingHistoryKey.current = null;
      setPendingHref(null);
    },
  };
}
