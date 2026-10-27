import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { getImgProps } from "next/dist/shared/lib/get-img-props.js";
import { imageConfigDefault, prepareImageConfig } from "next/dist/shared/lib/image-config.js";

// Bundle the pure SEO builders with a catalog that fails if a synchronous
// renderer accidentally tries to query it. No database or private content loads.
const bundled = await build({
  stdin: {
    contents: 'export { blogPiece, seoRegistry } from "./src/lib/seo/registry"; export { buildMetadata } from "./src/lib/seo/metadata"; export { default as nextConfig } from "./next.config";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  plugins: [{
    name: "catalog-must-be-explicit",
    setup(builder) {
      builder.onResolve({ filter: /^@\/lib\/blog\/catalog$/ }, () => ({ path: "catalog", namespace: "test" }));
      builder.onLoad({ filter: /.*/, namespace: "test" }, () => ({ contents: 'export async function getPublishedArticles() { throw new Error("Unexpected catalog read from pure SEO builder"); }' }));
      builder.onResolve({ filter: /^@opennextjs\/cloudflare$/ }, () => ({ path: "cloudflare", namespace: "next-config-test" }));
      builder.onLoad({ filter: /.*/, namespace: "next-config-test" }, () => ({ contents: 'export function initOpenNextCloudflareForDev() {}' }));
    },
  }],
});
const { blogPiece, seoRegistry, buildMetadata, nextConfig } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);

const article = {
  slug: "local-seo-fixture",
  title: "Local SEO verification fixture",
  description: "A synthetic fixture for the public article metadata and image integration.",
  publishedAt: "2026-10-26T10:00:00Z",
  updatedAt: "2026-10-26T10:00:00Z",
  imageUrl: "/media/00000000-0000-4000-8000-000000000000",
  imageAlt: "Synthetic image fixture",
  imageWidth: 1000,
  imageHeight: 700,
  author: { type: "Organization", name: "EverRise Press", url: "/about" },
};

test("blog schema builders stay pure and use only the passed collection", () => {
  assert.equal(blogPiece().hasPart, undefined);
  const graph = blogPiece([{ slug: "published-one" }, { slug: "published-two" }]);
  assert.equal(graph.hasPart.length, 2);
  assert.ok(graph.hasPart[0]["@id"].endsWith("/blog/published-one#article"));
  assert.ok(!JSON.stringify(graph).includes("local-seo-fixture"));
  assert.doesNotThrow(() => seoRegistry.article.buildPieces(article));
});

test("article schema and metadata preserve actual image dimensions", () => {
  const image = seoRegistry.article.buildPieces(article).find((piece) => piece["@type"] === "ImageObject");
  assert.equal(image.width, 1000);
  assert.equal(image.height, 700);
  const metadata = buildMetadata("article", article);
  assert.equal(metadata.openGraph.images[0].width, 1000);
  assert.equal(metadata.openGraph.images[0].height, 700);
  const unknown = { ...article, imageWidth: undefined, imageHeight: undefined };
  assert.equal(seoRegistry.article.buildPieces(unknown).find((piece) => piece["@type"] === "ImageObject").width, undefined);
  assert.equal(buildMetadata("article", unknown).openGraph.images[0].width, undefined);
});

test("an empty blog remains noindex and emits no collection graph", () => {
  const metadata = buildMetadata("blog", { articles: [] });
  assert.equal(metadata.robots.index, false);
  assert.equal(metadata.alternates.canonical, undefined);
  assert.deepEqual(seoRegistry.blog.buildPieces({ articles: [] }), []);
});

test("all images use a direct source and the Worker has no Images transformation binding", async () => {
  assert.equal(nextConfig.images.unoptimized, true);
  const imgConf = prepareImageConfig(undefined, { ...imageConfigDefault, ...nextConfig.images });
  const defaultLoader = () => { throw new Error("Image optimizer must not run"); };
  defaultLoader.__next_img_default = true;
  for (const src of ["/images/book.jpg", "/media/fixture", "https://everrisepress.com/media/fixture"]) {
    const { props } = getImgProps({ src, alt: "Fixture", width: 500, height: 700 }, { imgConf, defaultLoader });
    assert.equal(props.src, src);
    assert.equal(props.srcSet, undefined);
  }
  const worker = ts.parseConfigFileTextToJson("wrangler.jsonc", await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
  assert.equal(worker.error, undefined);
  assert.equal(worker.config.images, undefined);
});
