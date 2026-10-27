# Cloudflare free-plan verification for the admin update

Checked 27 October 2026 using the project’s existing Wrangler OAuth session and read-only Cloudflare REST requests. Credentials were read in process memory and sent only in authorization headers; no token, secret value, or payment detail was printed, logged, saved in this document, or committed. No billing setting, subscription, resource binding, or database record was changed during this verification.

The implementation continues to use the existing Worker and D1 database. It does not require enabling a new paid service. **The account’s current paid/free subscription could not be verified with the available API permission.** An absence of a newly introduced paid service is not evidence that the account has a zero-dollar invoice.

## Remote facts verified

| Check | Result | What this proves |
| --- | --- | --- |
| Project-local Wrangler `whoami --json --account` | Authenticated with an existing OAuth session; exact account `4bb86ba631de88ebffab0709d3e09c19` is accessible. | The following checks target the configured account rather than an inferred account. |
| `GET /accounts/{id}/subscriptions` | HTTP **403**, Cloudflare error code **10000**. | The current session cannot read billing subscriptions. Its recorded OAuth scopes do not include Billing Read/Write. The endpoint explicitly requires one of those permissions. [Subscriptions API](https://developers.cloudflare.com/api/resources/accounts/subresources/subscriptions/methods/get/) |
| `GET /accounts/{id}/workers/account-settings` | HTTP 200; `default_usage_model: standard`. | Confirms the usage-model setting. This field is not a subscription receipt and does not establish Free versus Paid. [Workers account settings API](https://developers.cloudflare.com/api/resources/workers/subresources/account_settings/methods/get/) |
| `GET /accounts/{id}/workers/scripts/everrisepressllc-website/settings` | HTTP 200; `usage_model: standard`. Pre-change deployed binding types: assets, D1, Images, service, plain text, and secrets. Secret values were not printed. | Confirms the named Worker and its binding types before this update is deployed. No R2 binding was present. The new source config removes the Images binding; this check does not claim that source config was already deployed. [Worker settings API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/settings/methods/get/) |
| `GET /accounts/{id}/d1/database/a2082483-d085-44a8-b90c-48d5c9cd5c17` | HTTP 200; name `everrisepress-db`; version `production`; reported file size **122,880 bytes** at this check. | Confirms the existing database identity and reported storage size. This metadata response does not prove the billing plan or remaining daily query quota. [D1 metadata API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/get/) |
| `GET /accounts/{id}/entitlements` | HTTP 200; no Workers, D1, Images, or R2 allocation was exposed by the matching feature keys/names. | Does not resolve the missing subscription information. No entitlement or subscription was changed. [Entitlements API](https://developers.cloudflare.com/api/resources/accounts/subresources/entitlements/methods/list/) |

## Published free limits checked

These are current product documentation limits, **conditional on the relevant Free plan being active**. They are not measurements of remaining account usage.

| Product | Published free allocation and relevant behavior | Official source |
| --- | --- | --- |
| Workers | 100,000 dynamic requests/day; 10 ms CPU per invocation. Static asset requests have separate free treatment. An admin page, API request, or database-backed media response executes Worker code and must fit the applicable runtime limits. | [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) |
| Workers runtime | 128 MB memory; 1 second startup; 64 MiB uncompressed bundle limit. The current documentation no longer imposes a compressed bundle-size limit. The Free daily request allowance resets at midnight UTC; exceeding it can return error 1027. CPU exhaustion can terminate a request. | [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) |
| D1 usage | 5 million rows read/day, 100,000 rows written/day, 5 GB total account storage. Scanned rows count, so returning a small result is not evidence that a query read few rows. Exhausting a Free daily allowance causes query errors; additional storage cannot be written after the storage limit is reached. | [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) |
| D1 technical limits | 500 MB per Free database, 10 databases per Free account, 50 queries per Worker invocation, and a 2,000,000-byte maximum string/BLOB/row. LIKE/GLOB patterns are limited to 50 bytes; the reader search now uses parameterized literal substring matching instead. | [D1 limits](https://developers.cloudflare.com/d1/platform/limits/) |
| Images | Images Free permits 5,000 unique transformations/month. Once exhausted, new transformations fail; the Free plan does not charge for going over its limit. Hosted image storage is a Paid feature. The deployed Worker already has an Images binding; its subscription status was not verified. | [Images pricing](https://developers.cloudflare.com/images/pricing/) |
| Workers Builds | 3,000 build minutes/month, one concurrent build, and a 20-minute build timeout on Free. These limits apply to the existing Git-connected build workflow; local builds do not consume Workers Builds minutes. | [Builds limits and pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/) |

Source precedence: the current Cloudflare platform limits page is authoritative for platform limits. The OpenNext overview still describes older compressed Worker-size caps; it is useful for adapter compatibility but is stale on this particular limit.

## Implementation evidence and its limits

The new library uses the existing D1 `DB` binding. Source constants in `src/lib/admin/media.ts` cap each upload at **500 KiB**, the library at **20 MiB of stored image bytes**, the library at **100 images**, and dimensions at **1600 pixels**. The API checks the raw upload stream size and combines its total/count quota check with the insert in one statement. Each image is comfortably below D1’s row limit. The 20 MiB image allowance excludes other table rows, indexes, SQLite overhead, and the rest of the database; it is not a database-wide storage quota or a traffic guarantee.

The new source config has no Images transformation binding, R2 bucket, KV cache, or additional paid storage binding. Its OpenNext incremental-cache override remains disabled. `next.config.ts` sets `images.unoptimized: true` globally, so existing Next.js Image components keep their dimensions/layout while serving the prepared assets and bounded D1 uploads directly. The image library and article content also use direct image URLs. Cloudflare binding types were regenerated after removing `IMAGES`. No existing Cloudflare subscription or resource was deleted or modified during this source-only change.

`scripts/public-content.test.mjs` verifies that the actual Next image attribute builder produces original URLs without an optimizer URL or responsive optimizer `srcset` for static and D1 media sources using the configured global option. It also checks that the Wrangler configuration has no Images binding.

Reader lists remain paginated, partner-detail activity uses grouped date-limited queries, and no polling or scheduled job was introduced. The all-matching-reader CSV is intentionally not silently truncated; very large exports can still encounter Worker memory/CPU or D1 query limits. Local input limits and pagination do not guarantee unlimited requests, writes, storage, or traffic.

## Not verified

The session cannot confirm the exact Workers/D1/Images subscription, invoice amount, enabled metered add-ons, total account-wide daily query usage, remaining Workers/Builds allowances, or the site’s production CPU distribution. A successful deployment or an existing `standard` usage-model response does not answer these billing questions. Viewing the account’s subscriptions in Cloudflare’s dashboard, or repeating the read with an explicitly scoped Billing Read session, would close the subscription gap; no new credential or permission was requested or created here.

The accurate release statement is: **this update reuses the existing Worker/D1 resources and adds bounded image storage without requiring a new paid service; current billing status remains unverified because the existing session cannot read subscriptions.** It must not be described as an unconditional promise of zero cost at any traffic level.
