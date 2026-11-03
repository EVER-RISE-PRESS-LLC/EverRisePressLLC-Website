# Direct publishing for agents

Use the publishing client for routine image uploads and article work. It talks to the existing app at `https://everrisepress.com/api/agent/v1`. Chrome is needed for visual/print review or browser-only external services, not for uploading, saving or publishing. When the owner requests publication, finish the editorial checks and use the API; no new browser login or confirmation is required.

The API has its own identity and permissions and uses the same article store, HTML sanitizer, publication gates and image library as the staff workspace. It uses the existing Worker and D1 database, with no additional CMS or paid storage service.

## Commands

Run from the repository root. The client automatically loads `~/.config/everrise/publishing.json`; override with `EVERRISE_PUBLISH_CONFIG` or `--config`. Never print or copy that credential file into chat, evidence, source control or command arguments.

```sh
npm run publish:agent -- status
npm run publish:agent -- media list
npm run publish:agent -- media upload /absolute/path/cover.webp
npm run publish:agent -- articles list
npm run publish:agent -- articles get roommates-or-living-alone --out /absolute/path/current-draft.json
npm run publish:agent -- audit
```

`status` shows identity, permissions, expiry and limits without the secret. JSON responses include a request ID. Use `node scripts/everrise.mjs …` to consume JSON without npm's banner. Output files use exclusive creation and private permissions; pick a new filename instead of overwriting a review copy. Run `--help` for all commands.

## Images

Upload a prepared still JPEG, PNG or WebP. The response includes `image.url`, the full `publicUrl`, actual dimensions and a SHA-256 digest. Use `image.url` in a cover's `imageUrl` or an image block's `src`, with useful alternative text. The server checks raster bytes and dimensions. Existing limits remain 500 KiB per image, 1600 pixels per side, 100 images and 20 MiB total.

`media upload FILE --optimize` optionally uses Sharp to rotate, fit inside 1600 pixels and encode WebP. It preserves embedded XMP and writes a separate content-named `.web-HASH.webp` beside the source. Inspect that output before publication and keep any separate provenance record with the source artwork. The original is unchanged. Without this flag the exact supplied bytes are uploaded.

Identical agent uploads reuse one library entry, including simultaneous retries; staff uploads retain their existing behavior. Images have public URLs even when their referencing draft is private. `media delete IMAGE_ID` refuses to delete any image referenced by a saved book, author, draft or published article, including archived restore targets.

## Draft, review, publish

1. For an update, use `articles get SLUG_OR_ID --out FILE`. Keep its `id`, `revision` and editable `document`. Older imported IDs are supported.
2. For new work, use `articles new --slug article-slug --out FILE`, then fill in the document. This only creates a local template. Byline confirmation starts false.
3. Edit the document. Use `articles create FILE` for new work or `articles save FILE` for an existing article. Capture the returned revision or use `--out NEXT_FILE`. A new draft requires a stable slug; a repeated create returns a conflict instead of an unnamed duplicate.
4. Run `articles check ARTICLE_ID`. It checks the saved draft and returns its revision, issues and staff preview URL. Exit code 2 means fields are incomplete. Also review the actual claims, sources, arithmetic, byline authorization, image rights, links, layout and print proofs as appropriate. Use the required Ever rise Chrome profile when visual review is needed.
5. Publish the exact reviewed version:

```sh
npm run publish:agent -- articles publish ARTICLE_ID --revision 3 --reviewed
```

Publication requires its own permission and the explicit review flag. Changed publications record the agent label as reviewer, with real server dates. The store preserves the byline and first publication time, locks the address after publication, and strips private notes from the public snapshot. Publishing unchanged content preserves its real modification and review dates. Saving changes keeps the approved version live until publication.

`REVISION_CONFLICT` means another edit was saved. Read the current version, merge and review; never fetch a newer revision just to bypass the check. The client never automatically retries a mutation or follows a redirect. After interruption, inspect the saved state and audit record before retrying. Recover creates by slug and reuse identical image bytes for upload retries.

`articles archive`, `restore` and `unpublish` also require publication permission and `--revision`. Restore can return a previously public article to visibility. Archive retains both snapshots. There is no destructive article-delete endpoint.

## API contract

Use `Authorization: Bearer <credential>` over HTTPS. Credentials never go in URLs. The API rejects browser origins and does not authenticate staff cookies. Browser editing continues through `/api/admin/*`. Agent keys cannot access staff accounts, leads, exports, referrals or catalog edits.

| Method/path below `/api/agent/v1` | Permission | Request/result |
| --- | --- | --- |
| `GET /me` | Valid key | Identity, expiry, permissions and limits |
| `GET /schema` | `articles:read` | JSON Schema for create/mutation bodies |
| `GET /articles` | `articles:read` | Saved versions; optional `?includeArchived=true` and `?slug=SLUG_OR_ID` |
| `GET /articles/:id` | `articles:read` | Saved article, revision and visibility |
| `POST /articles` | `articles:write` | `{ "document": … }`, always a private draft |
| `PATCH /articles/:id` | Per action | Action, exact revision and optional document |
| `POST /articles/:id/validate` | `articles:read` | Checks saved draft without publishing |
| `GET /media` | `media:read` | Metadata, references and remaining capacity |
| `POST /media` | `media:write` | Raw image bytes, matching Content-Type, URL-encoded X-File-Name |
| `DELETE /media/:id` | `media:delete` | Deletes an unused image |
| `GET /audit` | Valid key | Current credential's last 100 requests |

Save uses `{ "action": "save", "revision": 1, "document": … }` and needs `articles:write`. Publish uses `{ "action": "publish", "revision": 3, "reviewConfirmed": true }`. Publish/unpublish/archive/restore need `articles:publish`; a supplied document additionally needs `articles:write`.

Success returns 200 or 201. Errors include 401 invalid/expired/revoked key, 403 permission/browser rejection, 404 missing item/route, 409 conflicting revision/slug/in-use image/full library, 413 oversized body, 415 unsupported type, 422 validation, 429 rate limit and 503 temporary failure. JSON includes `error`, `code` where applicable, `requestId` and optional `issues`. Responses are private/no-store and noindex. Each key allows 60 authenticated requests per minute; 429 includes Retry-After. Invalid secret guesses do not consume a legitimate key's allowance.

## Credential administration

Apply migration `0005_agent_publishing.sql` before deploying. It adds credentials, audit records and an optional upload hash without rewriting existing content. Administration uses the existing `everrise` Wrangler profile for `everrisepressdev@gmail.com` and the configured EverRise D1 database. Routine publishing uses only the scoped API.

```sh
npm run agent:credentials -- create --remote --name "Codex publishing agent"
npm run agent:credentials -- list --remote
npm run agent:credentials -- rotate --remote
npm run agent:credentials -- revoke CREDENTIAL_ID --remote
```

Creation generates 256 random secret bits, writes the token to a user-owned mode-600 file in a mode-700 directory outside the repository, and stores only its SHA-256 hash on the server. Default lifetime: 180 days; `--days` accepts 1–365. `--scopes` accepts a comma-separated subset. Keys are checked per request and revoked independently of staff accounts. Rotation activates the replacement file before revoking the old key. If interrupted, the command reports a private recovery location; verify status and list/revoke obsolete keys before discarding recovery files.

The client pins destinations to production or an explicitly configured loopback test server, refuses redirects, and rejects credential files readable by other users. Credentials are not accepted as command-line arguments or printed by normal commands. Do not copy Chrome session cookies or staff passwords for automation.

The API reserves an audit entry before dispatch, then records the result and affected ID. Records contain no credentials, image bytes, private notes or article text. A pending record means completion was not recorded; inspect the resource before retrying. The latest 5,000 records are retained across credentials. `/audit` shows only the current credential's latest 100. Published articles retain their reviewer/date records independently.

## Verification

Run `npm run test:agent`, `npm run test:admin`, `npm run test:public`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Agent tests run real handlers and SQL against disposable Miniflare D1. Release checks also exercise the actual client against the built Worker and compare served media bytes.

For local HTTP testing, pass the same isolated `--persist-to` path to migrations, credential setup (`--local`) and `npm run start`. Use a separate credential `--config` and loopback `--base-url`; never copy the production credential into a test server. Full publication fixtures belong only in isolated local D1. Live checks use approved artwork and preserve public article content and dates.

Implementation references: [D1 binding/batches](https://developers.cloudflare.com/d1/worker-api/d1-database/), [migrations](https://developers.cloudflare.com/d1/reference/migrations/), [Workers cryptography](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/), and [Sharp output/metadata](https://sharp.pixelplumbing.com/api-output/). The project's installed versions and compatibility date remain the baseline.
