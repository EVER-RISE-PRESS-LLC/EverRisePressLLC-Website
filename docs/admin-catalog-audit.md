# Catalog and image library audit — 27 October 2026

Scope: staff books, authors, their editors and save/delete routes, and the new shared image library. The workspace uses Operate mode: Karla typography, existing light-first admin tokens, restrained gold, clear task language, familiar controls and 44 px targets. Public facts and production data were not changed during the work.

## Findings resolved

| Severity | Finding and user impact | Resolution |
| --- | --- | --- |
| P1 | Saving a book updated the book, deleted all retailer rows, then inserted replacements in separate operations. An insert failure could leave the book without purchase links. New books could also be half-created. | Both routes now write the book and formats in one D1 batch. An injected database failure confirms rollback of the full create/update. Existing retailer IDs and creation dates are retained; returned IDs reset the editor accurately. |
| P1 | Existing books with no retailer rows opened with a new, incomplete ebook row, so an unrelated book edit could fail purchase-link validation. | Zero rows stay zero. The empty state explains that retailer links can be added later. |
| P1 | Editors offered no unsaved state, navigated away immediately after saving, and silently discarded edits on workspace navigation. | Persistent save bar, dirty/saving/saved states, stays-in-editor save feedback, retained edits on error, same-origin navigation confirmation, native unload protection, Back/Forward interception in browsers with the Navigation API, and explicit per-tab draft recovery after history moves in other browsers. |
| P1 | Save failures appeared only in short-lived toasts. Session expiry and network failures gave little recovery guidance. | Persistent inline alerts explain recovery, preserve edits, distinguish expired sessions and connection errors, and retain field validation messages. |
| P1 | Chapter 1 editing required staff to write HTML. | Shared visual RichTextEditor now provides familiar formatting, links, images, lists, tables and undo while keeping HTML as the stored format. The API sanitizes content before saving, independently of client validation. |
| P1 | Image fields required a path or URL, and image errors permanently hid the preview. | Shared MediaPicker supports the actual image library/upload flow and existing local or web image links. Missing or failed previews show a recoverable explanation, and changing the image restores the preview. |
| P1 | The delete dialog was nested inside the dropdown and closed as soon as deletion started. Users could not see persistent errors or pending state. | Controlled dialogs live outside the menu, require typing DELETE for books/authors, disable repeat submission and cancellation while pending, and stay open when deletion fails. |
| P1 | Book deletion promised to remove reader history although foreign keys prevented deletion. A generic server failure hid the actual reason. | Reader and referral history explicitly prevent deletion in the API and are explained in the menu. Author deletion also protects saved and published article bylines, including archived articles; the catalog shows article usage counts. Editor accounts do not receive administrator-only delete controls. |
| P1 | Purchase/social links allowed arbitrary URL protocols; currency and dates had weak validation. | Shared client/server schemas enforce http(s) purchase/social links, local or web image addresses, real publication dates, finite non-negative prices and three-letter currency codes. Book save bodies are bounded. |
| P2 | New records required manually constructing a slug; forms exposed technical labels such as “slug,” “schema.org sameAs” and “multi-retailer modal.” | Page addresses are generated from a new title/name and can be edited before creation. Existing addresses remain read-only to protect links. Labels explain the public outcome in publishing language. |
| P2 | Retailer editing was squeezed into a sidebar and silently assumed USD. | Full-width, responsive retailer sections group edition, retailer, price, editable currency, purchase link and optional ISBN. Removing a link requires an explicit confirmation and is applied only on save. |
| P2 | Tables forced horizontal scanning on mobile and did not support finding a particular record. | Searchable catalogs use task-focused tables on larger screens and cover/profile rows on mobile, with clear no-match and first-use states. |
| P2 | Display headings, tiny action targets, inconsistent image fallbacks and weak dark-theme destructive contrast made operation harder. | Catalog headings use Karla, controls meet 44 px targets, thumbnails have deterministic image-error fallbacks, and semantic admin tokens carry success/destructive contrast in both themes. |
| P2 | Editing known social fields could erase additional existing profile links. | Additional valid web-link keys are preserved, while the legacy Twitter/X key is normalized without preventing a link from being cleared. |

## Image library implementation

- Existing D1 binding only. No R2 bucket, paid image transformation, external media service or billing configuration was added.
- Each stored image is capped at 500 KiB; the library is capped at 100 images and 20 MiB. The quota check and insertion form one SQL statement, so concurrent uploads cannot both claim the last available slot.
- Uploads are authenticated and same-origin, streamed through a byte limit, and verified against JPEG/PNG/WebP signatures and dimensions. SVG, HTML, animated raster structures, unsupported formats, mismatched MIME declarations, oversized dimensions and malformed raster chunks are rejected.
- The client resizes to a maximum 1600 px side, re-encodes the raster and recompresses before upload. It shows preparation, upload percentage, completion and recoverable failures. Cancellation does not replace the current image.
- Library listing never selects the image BLOB. Metadata includes dimensions, size and whether the image is in use.
- Deletion is conditional in SQL and protects book covers, inline Chapter 1 images, author portraits, and article draft and published documents. The confirmation explains that unsaved selections and externally shared URLs are not tracked.
- Public image URLs serve verified image content types with `nosniff`, immutable browser caching and the existing Worker Cache API when available. Public components should render these already-sized images without an Images transformation.

## Verification evidence

`node scripts/admin-catalog-media.test.mjs` executes actual route handlers against a new, ephemeral Miniflare D1 database, never the configured production binding. All 74 assertions pass. The suite checks authentication and origin rejection, invalid raster and MIME rejection, size/dimension bounds, actual JPEG/WebP fixtures, upload/list/serving behavior, inline/book/article reference protection, concurrent count limits and byte limits, retailer ID preservation, sanitization, history-aware deletion, and injected create/update failures that must roll back atomically. Fixture bundles and the database are disposed after the run.

`node --test --experimental-strip-types scripts/admin-draft-recovery.test.mjs` passes five browser-shim tests. They cover a browser without the Navigation API, snapshot flushes before simulated Next handling of Back/Forward, pagehide/beforeunload/unmount, stable history state and length, explicit stale-baseline recovery, per-tab record separation, and malformed or unavailable storage. These are deterministic shims; they do not claim physical Safari/Firefox device coverage.

The recovery fallback leaves Next’s history state and existing entries untouched. [MDN documents that popstate follows a history-entry change](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event), so guessing a reversal distance would be unsafe for entries created before the form mounted. [sessionStorage is scoped to a browser tab and survives reloads](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage); it provides the recoverable copy without changing navigation.

Targeted ESLint, full-project TypeScript (`npx tsc --noEmit`) and `git diff --check` pass. The Impeccable detector returns no findings for the changed catalog/media UI. Final project-wide build and browser evidence are recorded with the main admin release audit.

## Known limits and release checks

- Browsers without the Navigation API keep their normal Back/Forward behavior. A versioned, per-tab sessionStorage copy preserves committed editor input and is offered for explicit recovery when the record is reopened. A changed server baseline receives a warning; recovery never automatically replaces server data. Successful saves and explicit discard remove the local copy. Storage failures show a persistent message asking staff to keep the editor open and save. Closing the tab ends this recovery session.
- Existing URLs and approved book/author copy are retained; creating a new book makes its public page available immediately, as before. Publication date is metadata, not a draft/publish switch, and the form explains this.
- No production signup, content write, deletion, remote migration, deployment or billing change was used as a test.
- Browser layout, keyboard and end-to-end upload verification awaits the shared local test server. Do not infer physical-device or live-production verification from the local API checks.


Final browser check found a false unsaved state when the visual chapter editor mounted. Tiptap emits an update from setEditable by default. The editor now passes emitUpdate=false for enable/disable changes, so opening or locking a form does not create a content edit. Actual writing still emits updates.
