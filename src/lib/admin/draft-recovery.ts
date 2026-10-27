/** Per-tab recovery only. Callers pass editor content, never credentials. */
export interface DraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export interface DraftSnapshot {
  version: 1;
  baseline: string;
  savedAt: string;
  value: unknown;
}
export const draftStorageKey = (key: string) =>
  `everrise:admin-draft:v1:${key}`;

export function draftFingerprint(value: string) {
  let first = 2166136261;
  let second = 5381;
  for (let index = 0; index < value.length; index++) {
    first = Math.imul(first ^ value.charCodeAt(index), 16777619);
    second = Math.imul(second, 33) ^ value.charCodeAt(index);
  }
  return `${value.length}:${(first >>> 0).toString(16)}:${(second >>> 0).toString(16)}`;
}
export const draftSignature = (value: unknown) =>
  JSON.stringify(value) ?? "null";
export function writeDraftSnapshot(
  storage: DraftStorage,
  key: string,
  baseline: string,
  value: unknown,
  now = new Date().toISOString(),
) {
  const serialized = JSON.stringify({
    version: 1,
    baseline: draftFingerprint(baseline),
    savedAt: now,
    value,
  } satisfies DraftSnapshot);
  if (serialized.length > 1_000_000) throw new Error("DRAFT_TOO_LARGE");
  storage.setItem(draftStorageKey(key), serialized);
}
export function readDraftSnapshot(
  storage: DraftStorage,
  key: string,
): DraftSnapshot | null {
  const stored = storage.getItem(draftStorageKey(key));
  if (!stored) return null;
  try {
    const value = JSON.parse(stored) as Partial<DraftSnapshot>;
    if (
      value.version !== 1 ||
      typeof value.baseline !== "string" ||
      typeof value.savedAt !== "string" ||
      !Number.isFinite(Date.parse(value.savedAt)) ||
      !("value" in value)
    )
      return null;
    return value as DraftSnapshot;
  } catch {
    return null;
  }
}
export function removeDraftSnapshot(storage: DraftStorage, key: string) {
  storage.removeItem(draftStorageKey(key));
}

/** Flush before the SPA handles a history move; do not change Next's history entries. */
export function attachDraftLifecycle(
  target: Pick<Window, "addEventListener" | "removeEventListener">,
  flush: () => void,
) {
  const handler = () => flush();
  target.addEventListener("popstate", handler, true);
  target.addEventListener("pagehide", handler, true);
  target.addEventListener("beforeunload", handler, true);
  return () => {
    target.removeEventListener("popstate", handler, true);
    target.removeEventListener("pagehide", handler, true);
    target.removeEventListener("beforeunload", handler, true);
    flush();
  };
}
