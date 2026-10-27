# Cloudflare deployment

The project uses vinext 1.3.1 with Next.js 16 APIs, React 19.3.1 and Cloudflare's Vite plugin. This follows the [current Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/). The migration used the official initializer's existing-Wrangler option, preserving the existing Worker/account/D1 configuration. It replaces OpenNext's build output; it does not create another hosting service.

## Workers Builds settings

- Build command: `npm run build`
- Deploy command: `npm run deploy`
- Root directory: `/`
- Build token: keep the existing `everrisepressllc-website build token`
- Build variables: no additional variables required for this release

The owner confirmed the two commands were saved. The local API session cannot edit Workers CI configuration, so that dashboard change was required. Runtime secrets stay on the existing Worker; do not put them into source control or public build variables.

`.node-version` pins Node 24.22.0. `packageManager` pins npm 11.16.0 so clean installs use the same lockfile behavior. [Workers Builds supports these version files](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/).

## Local checks and deployment

```sh
npm ci
npm run test:admin
npm run test:public
npm run lint
npm run build
npm run start -- --port 8789
node scripts/seo-check.mjs http://localhost:8789
```

The source entry is `vinext/server/app-router-entry`; Vite writes the deployable Worker configuration to `dist/server/wrangler.json` and assets to `dist/client`. `npm run deploy` deploys that generated configuration. Do not point deployment at `.open-next/worker.js` or run the previous OpenNext commands.

For a staged release, upload with `wrangler versions upload --config dist/server/wrangler.json`, test its returned version URL, then promote with `wrangler versions deploy <verified-version>@100 --yes`. Do not copy version identifiers from examples. Keep the last working deployment available for rollback.

## Bindings and cost controls

Server code imports native `env` and `waitUntil` from `cloudflare:workers` through `src/lib/cloudflare-context.ts`. No OpenNext platform proxy is used. The existing D1 database remains `everrisepress-db`; its migrations and content are preserved.

The configuration has no R2, KV, paid Images, Durable Object or external cache-service binding. Raster media stays in bounded D1 storage; static and uploaded images are delivered directly. The visual editor loads only in the browser. Drafts and published versions remain separate, and publication does not require another deployment.

A free plan is still subject to Worker/D1 request, CPU, query and storage limits. The current session cannot inspect billing subscriptions. See [the verification record](admin-free-plan-verification.md).

## Verified migration result

The compatibility check reported zero blocking issues. All 43 tests and 74 isolated D1/API assertions passed after migration. Type checking and builds passed; lint retained one existing public ScrollStack warning. Native-Workers local checks covered authentication, all admin pages, autosave, private preview and public-snapshot isolation.

Version `ff18926c-10d9-436f-b2f9-b4319455a4ea` passed public SEO/blog/access checks on its version URL before promotion. Live checks then passed on everrisepress.com. Compressed Worker output was 1,091.54 KiB. No production reader record, synthetic article or uploaded fixture was created.
