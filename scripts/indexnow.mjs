#!/usr/bin/env node
/**
 * IndexNow submission script.
 *
 * Usage:
 *   node scripts/indexnow.mjs [--dry-run] [url...]
 *
 * With explicit URLs, submits those. With no URLs, fetches the production
 * sitemap and submits up to 100 of its URLs. IndexNow only supports
 * Bing, Yandex, Seznam, and Naver — Google does not support it.
 *
 * The verification key lives in public/<32-char-hex>.txt (served at the
 * site root). See docs/seo-system.md for rotation instructions.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { submitToIndexNow } from "@jdevalk/seo-graph-core";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://everrisepress.com").replace(/\/+$/, "");
const HOST = new URL(SITE_URL).host;

function findKey() {
  const publicDir = join(process.cwd(), "public");
  const file = readdirSync(publicDir).find((name) => /^[0-9a-f]{32}\.txt$/.test(name));
  if (!file) {
    console.error(
      "IndexNow key file not found. Expected public/<32-char-hex>.txt (see docs/seo-system.md)."
    );
    process.exit(1);
  }
  const key = file.replace(/\.txt$/, "");
  const content = readFileSync(join(publicDir, file), "utf8").trim();
  if (content !== key) {
    console.error(`IndexNow key file "${file}" content does not match its filename.`);
    process.exit(1);
  }
  return { key, file };
}

async function urlsFromSitemap() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml fetch failed: HTTP ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return urls.slice(0, 100);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const urlArgs = args.filter((arg) => arg !== "--dry-run");

  const urls = urlArgs.length > 0 ? urlArgs : await urlsFromSitemap();

  if (urls.length === 0) {
    console.log("No URLs to submit.");
    return;
  }

  const { key, file } = findKey();
  console.log(`Host: ${HOST}`);
  console.log(`Key file: ${file}`);
  console.log(`Key location: ${SITE_URL}/${file}`);
  console.log(`URLs: ${urls.length}`);

  if (dryRun) {
    console.log("[dry-run] Would submit the following URLs to IndexNow:");
    for (const url of urls) console.log(`  ${url}`);
    return;
  }

  const results = await submitToIndexNow({ host: HOST, key, urls });
  for (const result of results) {
    console.log(
      `${result.ok ? "OK" : "FAILED"} (HTTP ${result.status}): ${result.message}`
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
