#!/usr/bin/env node
import { readFile, writeFile, stat } from "node:fs/promises";
import { basename, extname } from "node:path";
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import { defaultConfigPath, editableArticle, loadConfig, publishingClient } from "./lib/publishing-client.mjs";

const help = `EverRise publishing — direct API access, no browser session required.

npm run publish:agent -- status
npm run publish:agent -- media list
npm run publish:agent -- media upload /absolute/path/image.webp [--optimize]
npm run publish:agent -- media delete IMAGE_ID
npm run publish:agent -- articles list [--archived]
npm run publish:agent -- articles get SLUG_OR_ID [--out /absolute/path/draft.json]
npm run publish:agent -- articles new --slug article-slug --out /absolute/path/draft.json
npm run publish:agent -- articles create /absolute/path/draft.json
npm run publish:agent -- articles save /absolute/path/draft.json
npm run publish:agent -- articles check ARTICLE_ID
npm run publish:agent -- articles publish ARTICLE_ID --revision NUMBER --reviewed
npm run publish:agent -- articles archive|restore|unpublish ARTICLE_ID --revision NUMBER
npm run publish:agent -- audit
npm run publish:agent -- schema [--out /absolute/path/schema.json]

Global: --config /absolute/path/private-config.json
Existing drafts must retain their id and revision. Re-read and merge after a conflict.
--optimize writes a separate WebP beside the original, preserving XMP provenance.
Publish requires a specific reviewed revision; it never fetches and publishes a newer one.
Credentials are never printed. Staff pages remain available for visual/print review.`;

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    config: { type: "string" }, out: { type: "string" }, slug: { type: "string" }, revision: { type: "string" },
    reviewed: { type: "boolean" }, archived: { type: "boolean" }, optimize: { type: "boolean" }, help: { type: "boolean" },
  } });
  if (values.help || !positionals.length) { console.log(help); return; }
  const [group, command, target] = positionals;
  const output = async value => {
    const text = JSON.stringify(value, null, 2) + "\n";
    if (values.out) { await writeFile(values.out, text, { flag: "wx", mode: 0o600 }); console.log(JSON.stringify({ saved: values.out })); }
    else console.log(text.trimEnd());
  };
  if (group === "articles" && command === "new") {
    if (!values.out || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug ?? "")) throw new Error("Supply --slug and --out for the new draft.");
    await output({ document: {
      slug: values.slug, title: "", description: "", section: "Reading guides",
      author: { type: "Organization", name: "EverRise Press", url: "/about", confirmed: false },
      imageUrl: "", imageAlt: "", blocks: [], sources: [], relatedSlugs: [], editorialNotes: "",
    } }); return;
  }
  const config = await loadConfig(values.config ?? defaultConfigPath());
  const api = publishingClient(config);
  if (group === "status") { await output(await api("/me")); return; }
  if (group === "audit" || group === "schema") { await output(await api(`/${group}`)); return; }
  if (group === "media" && command === "list") { await output(await api("/media")); return; }
  if (group === "media" && command === "upload") {
    if (!target) throw new Error("Supply an image file path.");
    if ((await stat(target)).size > 30 * 1024 * 1024) throw new Error("Choose an image under 30 MB before optimization.");
    let bytes = await readFile(target), name = basename(target), optimizedFile;
    const sharp = (await import("sharp")).default;
    let metadata = await sharp(bytes, { limitInputPixels: 50_000_000 }).metadata();
    if ((metadata.pages ?? 1) > 1 || !["jpeg", "png", "webp"].includes(metadata.format)) throw new Error("Choose a still JPEG, PNG or WebP image.");
    if (values.optimize) {
      const source = bytes;
      for (const quality of [86, 78, 68, 55]) {
        bytes = await sharp(source, { limitInputPixels: 50_000_000 }).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).keepXmp().webp({ quality, effort: 5 }).toBuffer();
        if (bytes.length <= 512_000) break;
      }
      const digest = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
      optimizedFile = target.slice(0, target.length - extname(target).length) + `.web-${digest}.webp`;
      await writeFile(optimizedFile, bytes, { flag: "wx" }).catch(async error => {
        if (error.code !== "EEXIST" || !(await readFile(optimizedFile)).equals(bytes)) throw error;
      });
      name = basename(optimizedFile); metadata = await sharp(bytes).metadata();
    }
    if (bytes.length > 512_000 || metadata.width > 1600 || metadata.height > 1600) throw new Error("The library accepts 500 KiB and 1600 pixels per side. Use --optimize or prepare a smaller image.");
    const result = await api("/media", { method: "POST", body: bytes, headers: { "content-type": `image/${metadata.format}`, "x-file-name": encodeURIComponent(name) } });
    await output({ ...result, publicUrl: config.baseUrl + result.image.url, sha256: createHash("sha256").update(bytes).digest("hex"), ...(optimizedFile ? { optimizedFile } : {}) }); return;
  }
  if (group === "media" && command === "delete") {
    if (!target) throw new Error("Supply an image ID.");
    await output(await api(`/media/${encodeURIComponent(target)}`, { method: "DELETE" })); return;
  }
  if (group === "articles" && command === "list") {
    const result = await api(`/articles${values.archived ? "?includeArchived=true" : ""}`);
    await output({ ...result, articles: result.articles.map(({ id, slug, title, revision, isLive, hasUnpublishedChanges, archivedAt }) => ({ id, slug, title, revision, isLive, hasUnpublishedChanges, archivedAt })) }); return;
  }
  if (group === "articles" && command === "get") {
    if (!target) throw new Error("Supply an article slug or ID.");
    const result = /^[0-9a-f-]{36}$/i.test(target) ? await api(`/articles/${target}`) : await api(`/articles?includeArchived=true&slug=${encodeURIComponent(target)}`);
    const article = result.article ?? result.articles[0];
    if (!article) throw new Error("Article not found.");
    await output({ id: article.id, revision: article.revision, document: editableArticle(article), isLive: article.isLive, hasUnpublishedChanges: article.hasUnpublishedChanges, archivedAt: article.archivedAt }); return;
  }
  if (group === "articles" && ["create", "save"].includes(command)) {
    if (!target) throw new Error("Supply a draft JSON file.");
    if ((await stat(target)).size > 250_000) throw new Error("Keep the article file below 250 KB.");
    const draft = JSON.parse(await readFile(target, "utf8"));
    if (!draft.document) throw new Error("The file must contain a document object; use articles new/get.");
    let result;
    if (command === "create") {
      if (draft.id) throw new Error("This file already identifies a saved article; use articles save.");
      result = await api("/articles", { method: "POST", json: { document: draft.document } });
    } else {
      if (!draft.id || !Number.isSafeInteger(draft.revision)) throw new Error("Use the id and revision returned by articles get.");
      result = await api(`/articles/${draft.id}`, { method: "PATCH", json: { action: "save", revision: draft.revision, document: draft.document } });
    }
    // Caller chooses where to keep each returned version; never overwrite edits.
    await output({ id: result.article.id, revision: result.article.revision, document: editableArticle(result.article), isLive: result.article.isLive, requestId: result.requestId }); return;
  }
  if (group === "articles" && command === "check") {
    if (!target) throw new Error("Supply an article ID.");
    const result = await api(`/articles/${target}/validate`, { method: "POST" });
    await output(result); if (!result.valid) process.exitCode = 2; return;
  }
  if (group === "articles" && ["publish", "archive", "restore", "unpublish"].includes(command)) {
    const revision = Number(values.revision);
    if (!target || !Number.isSafeInteger(revision) || revision < 1) throw new Error("Supply an article ID and the exact --revision you reviewed.");
    if (command === "publish" && !values.reviewed) throw new Error("Review the saved text, sources, byline and layout, then publish with --reviewed.");
    await output(await api(`/articles/${target}`, { method: "PATCH", json: { action: command, revision, ...(command === "publish" ? { reviewConfirmed: true } : {}) } })); return;
  }
  throw new Error("Unknown command. Run npm run publish:agent -- --help.");
}
main().catch(error => {
  console.error(JSON.stringify({ error: error.message, code: error.code, status: error.status, requestId: error.requestId, issues: error.issues }));
  process.exitCode = 1;
});
