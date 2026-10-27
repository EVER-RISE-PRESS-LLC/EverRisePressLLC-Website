"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  attachDraftLifecycle,
  draftFingerprint,
  draftSignature,
  readDraftSnapshot,
  removeDraftSnapshot,
  writeDraftSnapshot,
  type DraftSnapshot,
} from "@/lib/admin/draft-recovery";

export type DraftRecoveryInfo = { baselineChanged: boolean; savedAt: string };
export function useDraftRecovery<T>({
  storageKey,
  baseline,
  current,
  dirty,
  parse,
  onRestore,
}: {
  storageKey: string;
  baseline: string;
  current: T;
  dirty: boolean;
  parse: (value: unknown) => T | null;
  onRestore: (value: T, info: DraftRecoveryInfo) => void;
}) {
  const latest = useRef({
    storageKey,
    baseline,
    current,
    dirty,
    parse,
    onRestore,
  });
  const initializedKey = useRef<string | null>(null);
  const pending = useRef<DraftSnapshot | null>(null);
  const suppressed = useRef(false);
  const [recovery, setRecovery] = useState<DraftRecoveryInfo | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  const flush = useCallback(() => {
    const state = latest.current;
    if (
      initializedKey.current !== state.storageKey ||
      pending.current ||
      suppressed.current
    )
      return;
    try {
      if (state.dirty)
        writeDraftSnapshot(
          window.sessionStorage,
          state.storageKey,
          state.baseline,
          state.current,
        );
      else removeDraftSnapshot(window.sessionStorage, state.storageKey);
    } catch {
      setStorageError(
        "This browser could not keep a recovery copy. Keep this editor open and save before leaving.",
      );
    }
  }, []);

  useLayoutEffect(() => {
    latest.current = { storageKey, baseline, current, dirty, parse, onRestore };
    if (!dirty) suppressed.current = false;
    // Persist after each committed change, with no debounce that could miss a quick Back action.
    // This setter only reports an external browser-storage failure.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    flush();
  });

  useEffect(() => {
    initializedKey.current = null;
    pending.current = null;
    let cancelled = false;
    // Read browser-only storage after hydration; never auto-apply it to a fresh server version.
    queueMicrotask(() => {
      if (cancelled) return;
      const state = latest.current;
      try {
        const saved = readDraftSnapshot(window.sessionStorage, storageKey);
        if (
          saved &&
          draftSignature(saved.value) !== draftSignature(state.current)
        ) {
          pending.current = saved;
          setRecovery({
            baselineChanged:
              saved.baseline !== draftFingerprint(state.baseline),
            savedAt: saved.savedAt,
          });
        } else {
          if (saved) removeDraftSnapshot(window.sessionStorage, storageKey);
          setRecovery(null);
        }
      } catch {
        setStorageError(
          "This browser could not open draft recovery. Keep this editor open and save before leaving.",
        );
      }
      initializedKey.current = storageKey;
      flush();
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey, flush]);

  useEffect(() => attachDraftLifecycle(window, flush), [flush]);

  function clear() {
    suppressed.current = true;
    pending.current = null;
    setRecovery(null);
    try {
      removeDraftSnapshot(window.sessionStorage, latest.current.storageKey);
    } catch {
      /* The editor still guards ordinary exits. */
    }
  }
  function discard() {
    clear();
    suppressed.current = false;
    flush();
  }
  function restore() {
    const saved = pending.current;
    if (!saved || !recovery) return;
    const value = latest.current.parse(saved.value);
    if (!value) {
      setStorageError(
        "This local draft cannot be opened safely. Keep the saved version, or copy any writing from the original tab.",
      );
      return;
    }
    // Retain the local copy until the restored content is saved successfully.
    pending.current = null;
    setRecovery(null);
    latest.current.onRestore(value, recovery);
  }
  return { recovery, restore, discard, clear, storageError };
}
