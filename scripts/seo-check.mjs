import assert from "node:assert/strict";

const base = (process.argv[2] ?? "https://everrisepress.com").replace(/\/$/, "");
const canonicalOrigin = "https://everrisepress.com";
const headers = { "user-agent": "EverRisePress-SEO-Audit/1.0" };
const paths = ["/", "/books/how-to-have-a-financial-heart-attack", "/authors/lamont-mcleod", "/privacy", "/about"];
const results = [];
async function get(path) {
  const r = await fetch(new URL(path, base), { headers });
  return { status: r.status, body: await r.text() };
}
function attr(tag, name) {
  return tag.match(new RegExp(name + '="([^"]*)"'))?.[1];
}
for (const path of paths) {
  const { status, body } = await get(path);
  assert.equal(status, 200, path + " status");
  assert.equal((body.match(/<h1[\s>]/g) ?? []).length, 1, path + " H1");
  const canonical = (body.match(/<link\b[^>]*>/g) ?? []).find(t => attr(t, "rel") === "canonical");
  assert.equal(new URL(attr(canonical ?? "", "href")).href, canonicalOrigin + path, path + " canonical");
  const meta = body.match(/<meta\b[^>]*>/g) ?? [];
  const description = meta.find(t => attr(t, "name") === "description");
  assert.ok(attr(description ?? "", "content")?.length > 30, path + " description");
  assert.ok(meta.some(t => attr(t, "property") === "og:image"), path + " social image");
  assert.ok(!meta.some(t => attr(t, "name") === "robots" && /noindex/.test(attr(t, "content") ?? "")), path + " indexable");
  // These marketing pages must be visible in their initial HTML.
  assert.ok(!/style="[^"]*opacity:0(?:;|")/.test(body), path + " initially hidden text");
  const graphs = [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  assert.ok(graphs.length, path + " structured data");
  const nodes = graphs.flatMap(g => g["@graph"] ?? [g]);
  if (path === "/about") {
    assert.ok(nodes.some(n => n["@type"] === "AboutPage"), "AboutPage schema");
    assert.match(body, /monitored inbox/, "confirmed contact inbox");
    assert.match(body, /mailto:privacy@everrisepress\.com/, "privacy contact");
  }
  assert.match(body, /Google Analytics, PostHog, and Meta load by default/, path + " footer tracking disclosure");
  assert.ok(!body.includes('class="press-privacy-banner"'), path + " no automatic consent banner");
  for (const crumb of nodes.filter(n => n["@type"] === "BreadcrumbList")) {
    assert.ok(crumb.itemListElement.length >= 2, path + " breadcrumb length");
    crumb.itemListElement.forEach((c, i) => {
      assert.equal(c.position, i + 1);
      assert.ok(c.name);
      const url = typeof c.item === "string" ? c.item : c.item?.["@id"];
      assert.ok(url?.startsWith(canonicalOrigin + "/"), path + " breadcrumb URL");
    });
  }
  results.push({ path, status, title: body.match(/<title>(.*?)<\/title>/s)?.[1], descriptionLength: attr(description, "content").length, graphs: graphs.length });
}
const preview = await get(paths[1] + "/preview");
assert.equal(preview.status, 200);
assert.match(preview.body, /name="robots" content="noindex, follow"/);
const robots = await get("/robots.txt");
assert.equal(robots.status, 200);
assert.match(robots.body, /Sitemap: https:\/\/everrisepress.com\/sitemap.xml/);
assert.ok(!robots.body.includes("Content-Signal:"));
assert.ok(!robots.body.includes("Disallow: /books/"));
for (const path of ["/seo-check-missing-page", "/books/seo-check-missing-book"]) {
  assert.equal((await get(path)).status, 404, path);
}
const sitemap = await get("/sitemap.xml");
const sitemapAgain = await get("/sitemap.xml");
assert.equal(sitemap.status, 200);
assert.equal(sitemap.body, sitemapAgain.body, "unchanged sitemap must have stable dates");
for (const path of paths) assert.ok(sitemap.body.includes("<loc>" + canonicalOrigin + path + "</loc>"));
assert.ok(!sitemap.body.includes("/preview"));
const manifest = JSON.parse((await get("/manifest.json")).body);
for (const icon of manifest.icons) {
  const r = await fetch(new URL(icon.src, base), { headers });
  assert.equal(r.status, 200, icon.src);
  assert.match(r.headers.get("content-type"), /image\/png/);
}
const schema = JSON.parse((await get("/schema/site.json")).body);
assert.ok(!(schema["@graph"] ?? []).some(n => n["@type"] === "Blog"), "no unpublished blog collection");
if (base === canonicalOrigin) {
  for (const host of ["everrisepress.com", "www.everrisepress.com"]) {
    for (const path of ["/", "/robots.txt"]) {
      const url = "http://" + host + path;
      const r = await fetch(url, { headers, redirect: "manual" });
      assert.ok([301, 308].includes(r.status), url + " permanent HTTPS redirect");
      assert.ok(r.headers.get("location")?.startsWith("https://"));
      const final = await fetch(url, { headers });
      assert.equal(final.url, canonicalOrigin + path);
      assert.equal(final.status, 200);
    }
  }
}
console.log(JSON.stringify({ base, checkedAt: new Date().toISOString(), passed: true, results }, null, 2));
