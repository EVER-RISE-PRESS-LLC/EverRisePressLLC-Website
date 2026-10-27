import test from "node:test";
import assert from "node:assert/strict";
import {
  attachDraftLifecycle,
  draftFingerprint,
  draftSignature,
  draftStorageKey,
  readDraftSnapshot,
  removeDraftSnapshot,
  writeDraftSnapshot,
} from "../src/lib/admin/draft-recovery.ts";

class TabStorage {
  values = new Map();
  getItem(key) {
    return this.values.get(key) ?? null;
  }
  setItem(key, value) {
    this.values.set(key, value);
  }
  removeItem(key) {
    this.values.delete(key);
  }
}

class BrowserWithoutNavigation extends EventTarget {
  navigation = undefined;
  location = { pathname: "/admin/books/book-one" };
  history = {
    length: 3,
    state: { __NA: true, tree: ["existing-next-state"] },
    pushState() {
      throw new Error("Recovery must not add history entries");
    },
    replaceState() {
      throw new Error("Recovery must not modify Next's state");
    },
    go() {
      throw new Error("Recovery must not guess history distances");
    },
  };
}

test("a browser without Navigation API retains the latest draft before a same-document Back move", () => {
  const tab = new BrowserWithoutNavigation();
  const storage = new TabStorage();
  const baseline = draftSignature({
    title: "Saved title",
    chapter: "Saved chapter",
  });
  let current = { title: "Unsaved title", chapter: "Latest unsaved paragraph" };
  let dirty = true;
  const order = [];
  const cleanup = attachDraftLifecycle(tab, () => {
    order.push("snapshot");
    if (dirty) writeDraftSnapshot(storage, "book:book-one", baseline, current);
    else removeDraftSnapshot(storage, "book:book-one");
  });
  tab.addEventListener("popstate", () => {
    order.push("next-router");
    assert.deepEqual(
      readDraftSnapshot(storage, "book:book-one")?.value,
      current,
    );
  });
  const priorNextState = structuredClone(tab.history.state);
  tab.location.pathname = "/admin/books"; // Popstate is dispatched after the URL already changes.
  tab.dispatchEvent(new Event("popstate"));
  assert.deepEqual(order, ["snapshot", "next-router"]);
  assert.deepEqual(readDraftSnapshot(storage, "book:book-one")?.value, current);
  assert.equal(
    readDraftSnapshot(storage, "book:book-one")?.baseline,
    draftFingerprint(baseline),
  );
  assert.equal(tab.history.length, 3);
  assert.deepEqual(tab.history.state, priorNextState);
  // Forward and subsequent edits do not introduce synthetic entries or lose newer content.
  tab.location.pathname = "/admin/books/book-one";
  current = { ...current, chapter: "An even newer paragraph" };
  tab.dispatchEvent(new Event("popstate"));
  assert.deepEqual(readDraftSnapshot(storage, "book:book-one")?.value, current);
  assert.equal(tab.history.length, 3);
  dirty = false;
  cleanup();
  assert.equal(readDraftSnapshot(storage, "book:book-one"), null);
});

test("unmount, pagehide and beforeunload flush the current value instead of a delayed snapshot", () => {
  const tab = new BrowserWithoutNavigation();
  const storage = new TabStorage();
  let current = { bio: "First edit" };
  const cleanup = attachDraftLifecycle(tab, () =>
    writeDraftSnapshot(storage, "author:one", "saved-baseline", current),
  );
  current = { bio: "Edit immediately before leaving" };
  tab.dispatchEvent(new Event("pagehide"));
  assert.deepEqual(readDraftSnapshot(storage, "author:one")?.value, current);
  current = { bio: "A final paragraph" };
  tab.dispatchEvent(new Event("beforeunload"));
  assert.deepEqual(readDraftSnapshot(storage, "author:one")?.value, current);
  current = { bio: "Latest committed input before component unmount" };
  cleanup();
  assert.deepEqual(readDraftSnapshot(storage, "author:one")?.value, current);
});

test("recovery is explicit, records the older baseline, and never replaces a newer saved value", () => {
  const storage = new TabStorage();
  const oldBaseline = draftSignature({ title: "Original", blocks: [] });
  const local = { title: "Local draft", blocks: [{ text: "Unsent writing" }] };
  const newerServer = { title: "Another editor's newer version", blocks: [] };
  writeDraftSnapshot(
    storage,
    "article:one",
    oldBaseline,
    local,
    "2026-10-27T12:00:00.000Z",
  );
  const recovered = readDraftSnapshot(storage, "article:one");
  assert.deepEqual(recovered?.value, local);
  assert.notEqual(
    recovered?.baseline,
    draftFingerprint(draftSignature(newerServer)),
  );
  assert.equal(recovered?.savedAt, "2026-10-27T12:00:00.000Z");
  assert.deepEqual(newerServer, {
    title: "Another editor's newer version",
    blocks: [],
  });
  assert.ok(storage.getItem(draftStorageKey("article:one"))); // Reading alone neither applies nor discards it.
  removeDraftSnapshot(storage, "article:one");
  assert.equal(readDraftSnapshot(storage, "article:one"), null);
});

test("recovery keys and browser tab stores keep different records separate", () => {
  const firstTab = new TabStorage();
  const secondTab = new TabStorage();
  writeDraftSnapshot(firstTab, "book:one", "one", { title: "One" });
  writeDraftSnapshot(firstTab, "author:one", "two", { name: "Author" });
  assert.equal(readDraftSnapshot(firstTab, "book:two"), null);
  assert.equal(readDraftSnapshot(secondTab, "book:one"), null);
  removeDraftSnapshot(firstTab, "book:one");
  assert.deepEqual(readDraftSnapshot(firstTab, "author:one")?.value, {
    name: "Author",
  });
});

test("malformed and unsupported copies are ignored; blocked storage and large drafts report failures", () => {
  const storage = new TabStorage();
  storage.setItem(draftStorageKey("broken"), "not json");
  assert.equal(readDraftSnapshot(storage, "broken"), null);
  storage.setItem(
    draftStorageKey("future"),
    JSON.stringify({ version: 2, value: {} }),
  );
  assert.equal(readDraftSnapshot(storage, "future"), null);
  assert.throws(
    () =>
      writeDraftSnapshot(
        {
          ...storage,
          setItem() {
            throw new Error("QuotaExceededError");
          },
        },
        "blocked",
        "base",
        { title: "Unsent" },
      ),
    /QuotaExceededError/,
  );
  assert.throws(
    () =>
      writeDraftSnapshot(storage, "large", "base", {
        body: "x".repeat(1_000_001),
      }),
    /DRAFT_TOO_LARGE/,
  );
});
