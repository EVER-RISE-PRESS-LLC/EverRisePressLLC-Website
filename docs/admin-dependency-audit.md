# Admin update: dependency audit and bounded repairs

27 October 2026. The initial `npm audit --omit=dev --json` reported **18 affected package entries: 3 critical, 11 high, and 4 moderate**. This counts packages affected by one or more advisories, not exploitable paths proven in the deployed Worker. The owner-authorized repairs below use official registry releases and published advisories, without `npm audit fix --force` or a major framework migration.

## Versions repaired

| Package/path | Before → after | Evidence and scope |
| --- | --- | --- |
| `next` | 16.3.1 → **16.4.1** | The latest reported Next.js advisory ranges include 16.4.0; the maintainer identifies 16.4.1 as patched. This is the minimum patched Next 16 release for those advisories. [Next cache advisory](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr), [Next image advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw) |
| `@next/third-parties`, `eslint-config-next` | 16.3.3 / 16.3.1 → **16.4.1** | Align the Next-maintained companion packages with the framework; official npm registry versions and peer ranges were checked before installation. |
| `@opennextjs/cloudflare`, Wrangler | 1.20.2 / 4.124.0 → **1.20.12 / 4.148.0** | The old adapter built successfully but failed every dynamic preview request after the Next update because it did not inline `preview-props.json`. The official 1.20.12 release contains that exact fix and adds Next 16.4 support through AWS adapter 4.1.11; its minimum Wrangler peer is 4.148.0. [Adapter release](https://github.com/opennextjs/opennextjs-cloudflare/releases/tag/%40opennextjs%2Fcloudflare%401.20.12) |
| App `zod` | 4.4.3 → **4.6.6** | 4.6.6 is the patched release for oversized constrained-collection validation. The application and Zod resolver resolve to the repaired version. An older Zod 3 dependency remains inside the shadcn CLI tree. [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) |
| `posthog-js → dompurify` | 3.4.14 → **3.4.17** | A scoped override under `posthog-js` selects the patched DOMPurify release within PostHog’s existing `^3.4.13` range. The analytics package version and public analytics behavior remain unchanged. [DOMPurify maintainer advisory](https://github.com/cure53/DOMPurify/security/advisories/GHSA-mrv2-3pqr-j5jr) |
| `@opennextjs/cloudflare → @opennextjs/aws → express → proxy-addr` | 2.0.7 → **2.0.8** | A scoped override under the existing Cloudflare adapter selects the patched same-major version, within Express’s `^2.0.7` range. No adapter or service migration. [proxy-addr maintainer advisory](https://github.com/jshttp/proxy-addr/security/advisories/GHSA-jqcg-44mw-7w3h) |

The installed `@opennextjs/cloudflare` is **1.20.12**, with `@opennextjs/aws` **4.1.11** and Wrangler **4.148.0**. Its official registry peer range permits `next >=15.5.28 <16 || >=16.4.1`; Next 16.4.1 satisfies that range. The current Node 24 runtime satisfies both Next’s `>=20.9.0` and Wrangler’s `>=22.0.0` requirement. Official registry checks used `npm view` for each selected release; `npm ls` confirmed installed versions and peers. No generated bundle was hand-patched. The first failed preview demonstrated why a permissive peer range and a successful build alone are insufficient runtime verification.

## Final audit and remaining paths

After the security patches and required adapter compatibility update, `npm audit --omit=dev --json` reports **19 affected package entries: 0 critical, 14 high, and 5 moderate**. The intermediate security-only audit had 15 entries; the adapter’s newer minification/glob toolchain adds vulnerable-package and ancestor entries. `next`, `dompurify`, and `proxy-addr` no longer appear in the audit. The app’s direct Zod dependency is repaired; the remaining Zod entry is specifically `node_modules/shadcn/node_modules/zod`.

`--omit=dev` still includes development/deployment tools because some are production dependencies of the adapter or were already listed in the application dependencies. The following are dependency-tree paths, not a claim that every advisory is reachable in a deployed request:

| Remaining package group | Observed path |
| --- | --- |
| MCP SDK, Hono, `ip-address` | `shadcn@4.19.0 → @modelcontextprotocol/sdk@1.30.0` and its Hono/Express rate-limit dependencies; `ip-address` also appears via shadcn’s SOCKS dependency. |
| Zod 3 | `shadcn@4.19.0 → zod@3.25.76`. App, resolver, and several other consumers resolve to fixed Zod 4.6.6. |
| `js-yaml`, `postcss-selector-parser`, some `brace-expansion` | shadcn’s cosmiconfig, selector parser, and ts-morph dependencies. |
| `body-parser`, `qs` | The Cloudflare adapter’s AWS adapter / Express dependency tree. The patched proxy-addr override remains scoped to this adapter tree. |
| `glob`, `@node-minify/core`, adapter ancestor entries | `@opennextjs/cloudflare@1.20.12 → @opennextjs/aws@4.1.11 → @node-minify/core` and its glob dependency. The audit also marks those ancestor packages affected. |
| Wrangler / Miniflare / `sharp` / `undici` | The updated Cloudflare adapter / Wrangler 4.148.0 local-runtime tree. The audit’s vulnerable Sharp node is specifically `node_modules/miniflare/node_modules/sharp`; Next resolves to Sharp 0.35.5. Undici also appears in shadcn tooling. |
| `fast-uri` | `@hookform/resolvers@5.9.1 → ajv@8.20.0 → fast-uri@3.1.6`. The application uses the Zod resolver subpath; bundle-level reachability was not established by this audit. |

Further toolchain/transitive upgrades were intentionally left for a separate compatibility pass, as requested. No blanket overrides, forced updates, changes to billing, or new hosted services were introduced.

## Verification

- `npm ls @opennextjs/cloudflare next @next/third-parties eslint-config-next zod --depth=0`: expected installed versions, no peer failure.
- `npx tsc --noEmit`: passed after the article integration landed.
- Targeted ESLint over the modified public content, SEO, tracking guard, reader/referral code, tests, and Next config: passed.
- 23 focused tests across blog publication rules, reader/date/CSV behavior, chapter/privacy rules, public SEO/image handling, and staff/local tracking eligibility: passed.
- The parent integration pass owns the final OpenNext production build and deployment verification. This report does not substitute an audit result for a successful production build or claim a clean dependency audit.
