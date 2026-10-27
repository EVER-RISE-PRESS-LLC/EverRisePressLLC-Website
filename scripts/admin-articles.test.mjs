import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { createEmptyArticle, articleSchema, articleWordCount } from "../src/lib/blog/model.ts";
import { ArticleStoreError, createStoredArticle, listStoredArticles, mutateStoredArticle, readPublishedArticles, readStoredArticle } from "../src/lib/blog/store.ts";
import { cleanContentHtml, contentPlainText } from "../src/lib/content-html.ts";

function fixtureDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../migrations/0003_admin_publishing.sql", import.meta.url), "utf8"));
  sqlite.exec(readFileSync(new URL("../migrations/0004_article_publication_history.sql", import.meta.url), "utf8"));
  return {
    sqlite,
    prepare(query) {
      const statement = sqlite.prepare(query); let bindings = [];
      return {
        bind(...values) { bindings = values; return this; },
        async first() { return statement.get(...bindings) ?? null; },
        async all() { return { results: statement.all(...bindings), success: true }; },
        async run() { return { success: true, meta: statement.run(...bindings) }; },
      };
    },
    close() { sqlite.close(); },
  };
}
const reviewer = { name: "Signed-in test reviewer" };
const timelineBase = Date.now() - 60_000;
const timeline = index => new Date(timelineBase + index * 1000).toISOString();
function completeDocument() {
  return {
    ...createEmptyArticle(), slug: "local-article-fixture", title: "A disposable local article fixture",
    description: "This local fixture checks draft saving, reviewed publication, safe content, image descriptions, and preserved public article snapshots.",
    section: "Local verification", author: { type: "Organization", name: "EverRise Press", url: "/about", confirmed: true },
    imageUrl: "/images/og/everrise-default.png", imageAlt: "EverRise Press", imageWidth: 1200, imageHeight: 630,
    blocks: [{ type: "richtext", html: "<p>This is a disposable local article fixture. It checks that writing stays private until a person explicitly reviews and publishes the finished article.</p><p>The second paragraph adds useful reading text for the publication validation.</p>" }],
    sources: [{ id: "source-one", title: "Primary source fixture", url: "https://developers.cloudflare.com/d1/" }],
  };
}
const expectStoreError = (status) => error => error instanceof ArticleStoreError && error.status === status;

test("blank and incomplete drafts save without accepting spoofed publication or review dates", async () => {
  const db = fixtureDatabase();
  try {
    const draft = await createStoredArticle(db, { ...createEmptyArticle(), status: "published", publishedAt: timeline(0), updatedAt: timeline(0), review: { by: "Spoofed reviewer", at: timeline(0) } }, timeline(1));
    assert.match(draft.slug, /^untitled-[a-f0-9]{8}$/);
    assert.equal(draft.title, ""); assert.equal(draft.status, "draft"); assert.equal(draft.publishedAt, null); assert.equal(draft.review, null);
    assert.equal(draft.isLive, false); assert.equal(draft.hasUnpublishedChanges, true); assert.equal(draft.revision, 1);
    await assert.rejects(mutateStoredArticle(db, draft.id, { action: "publish", revision: 1, reviewConfirmed: true }, reviewer), expectStoreError(422));
    assert.equal((await readPublishedArticles(db)).length, 0);
  } finally { db.close(); }
});

test("publishing uses a signed-in reviewer and real server dates; saved edits preserve the public snapshot", async () => {
  const db = fixtureDatabase();
  try {
    const original = await createStoredArticle(db, completeDocument(), timeline(0));
    await assert.rejects(mutateStoredArticle(db, original.id, { action: "publish", revision: 1 }, reviewer, timeline(1)), expectStoreError(422));
    const published = await mutateStoredArticle(db, original.id, { action: "publish", revision: 1, reviewConfirmed: true }, reviewer, timeline(2));
    assert.equal(published.review.by, reviewer.name); assert.equal(published.review.at, published.updatedAt); assert.equal(published.publishedAt, published.everPublishedAt);
    assert.equal(published.isLive, true); assert.equal(published.hasUnpublishedChanges, false);
    const { id, revision, isLive, hasUnpublishedChanges, everPublishedAt, createdAt, savedAt, archivedAt, ...document } = published;
    assert.ok(id && isLive && !hasUnpublishedChanges && everPublishedAt && createdAt && savedAt && archivedAt === null);
    const edited = await mutateStoredArticle(db, id, { action: "save", revision, document: { ...document, title: "A private revised article title" } }, reviewer, timeline(3));
    assert.equal(edited.isLive, true); assert.equal(edited.hasUnpublishedChanges, true); assert.equal(edited.review, null);
    assert.equal((await readPublishedArticles(db))[0].title, original.title);
    await assert.rejects(mutateStoredArticle(db, id, { action: "save", revision, document }, reviewer), expectStoreError(409));
    const republished = await mutateStoredArticle(db, id, { action: "publish", revision: edited.revision, reviewConfirmed: true }, reviewer, timeline(4));
    assert.equal(republished.publishedAt, published.publishedAt); assert.equal(republished.updatedAt, timeline(4));
    assert.equal((await readPublishedArticles(db))[0].title, edited.title);
  } finally { db.close(); }
});

test("the first published address remains locked after unpublishing and the initial date survives republication", async () => {
  const db = fixtureDatabase();
  try {
    let article = await createStoredArticle(db, completeDocument(), timeline(0));
    article = await mutateStoredArticle(db, article.id, { action: "publish", revision: article.revision, reviewConfirmed: true }, reviewer, timeline(1));
    const originalDate = article.publishedAt;
    article = await mutateStoredArticle(db, article.id, { action: "unpublish", revision: article.revision }, reviewer, timeline(2));
    assert.equal(article.isLive, false); assert.equal((await readPublishedArticles(db)).length, 0);
    await assert.rejects(mutateStoredArticle(db, article.id, { action: "save", revision: article.revision, document: { ...completeDocument(), slug: "new-address" } }, reviewer), expectStoreError(409));
    article = await mutateStoredArticle(db, article.id, { action: "publish", revision: article.revision, reviewConfirmed: true }, reviewer, timeline(3));
    assert.equal(article.publishedAt, originalDate); assert.equal(article.slug, "local-article-fixture");
  } finally { db.close(); }
});

test("archive and restore retain both snapshots and restore the previous visibility", async () => {
  const db = fixtureDatabase();
  try {
    let article = await createStoredArticle(db, completeDocument(), timeline(0));
    article = await mutateStoredArticle(db, article.id, { action: "publish", revision: article.revision, reviewConfirmed: true }, reviewer, timeline(1));
    article = await mutateStoredArticle(db, article.id, { action: "save", revision: article.revision, document: { ...completeDocument(), title: "Private pending revision" } }, reviewer, timeline(2));
    article = await mutateStoredArticle(db, article.id, { action: "archive", revision: article.revision }, reviewer, timeline(3));
    assert.ok(article.archivedAt); assert.equal(article.isLive, false); assert.equal((await listStoredArticles(db)).length, 0);
    assert.equal((await listStoredArticles(db, true)).length, 1); assert.equal((await readPublishedArticles(db)).length, 0);
    assert.equal(await readStoredArticle(db, article.slug), undefined);
    article = await mutateStoredArticle(db, article.id, { action: "restore", revision: article.revision }, reviewer, timeline(4));
    assert.equal(article.archivedAt, null); assert.equal(article.isLive, true); assert.equal(article.hasUnpublishedChanges, true);
    assert.equal((await readPublishedArticles(db))[0].title, completeDocument().title); assert.equal(article.title, "Private pending revision");
  } finally { db.close(); }
});

test("optimistic revision prevents concurrent lost updates and addresses remain unique", async () => {
  const db = fixtureDatabase();
  try {
    const original = await createStoredArticle(db, completeDocument(), timeline(0));
    await assert.rejects(createStoredArticle(db, completeDocument()), expectStoreError(409));
    const results = await Promise.allSettled(["First revised title", "Second revised title"].map(title => mutateStoredArticle(db, original.id, { action: "save", revision: original.revision, document: { ...completeDocument(), title } }, reviewer, timeline(1))));
    assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
    assert.equal(results.filter(result => result.status === "rejected" && result.reason.status === 409).length, 1);
    assert.equal((await readStoredArticle(db, original.slug)).revision, 2);
  } finally { db.close(); }
});

test("rich text sanitizes executable content and publication requires image descriptions and HTTPS sources", () => {
  const cleaned = cleanContentHtml('<p onclick="evil()">Safe words</p><script>evil()</script><img src="javascript:evil()" onerror="evil()"><a href="javascript:evil()">Unsafe link</a>');
  assert.doesNotMatch(cleaned, /onclick|onerror|<script|javascript:/i);
  assert.equal(contentPlainText("<p>First paragraph</p><p>Second paragraph</p>"), "First paragraph Second paragraph");
  const base = { ...completeDocument(), status: "published", publishedAt: timeline(0), updatedAt: timeline(0), review: { by: reviewer.name, at: timeline(0) } };
  assert.equal(articleSchema.safeParse(base).success, true); assert.ok(articleWordCount(base) > 20);
  assert.equal(articleSchema.safeParse({ ...base, blocks: [...base.blocks, { type: "image", src: "/media/example-id", alt: "" }] }).success, false);
  assert.equal(articleSchema.safeParse({ ...base, sources: [{ id: "source-one", title: "Unsafe", url: "javascript:alert(1)" }] }).success, false);
  assert.equal(articleSchema.safeParse({ ...base, author: { ...base.author, confirmed: false } }).success, false);
});

test("editorial brief import is idempotent and cannot overwrite later staff work", () => {
  const db = fixtureDatabase();
  try {
    const seed = readFileSync(new URL("../src/lib/db/seed-article-briefs.sql", import.meta.url), "utf8");
    db.sqlite.exec(seed); db.sqlite.exec(seed);
    assert.equal(db.sqlite.prepare("SELECT count(*) AS count FROM articles").get().count, 2);
    db.sqlite.prepare("UPDATE articles SET document = ? WHERE slug = ?").run(JSON.stringify({ ...createEmptyArticle(), title: "Staff draft changed after import" }), "payday-spending-patterns");
    db.sqlite.exec(seed);
    assert.equal(JSON.parse(db.sqlite.prepare("SELECT document FROM articles WHERE slug = ?").get("payday-spending-patterns").document).title, "Staff draft changed after import");
    assert.equal(db.sqlite.prepare("SELECT count(*) AS count FROM articles WHERE published_document IS NOT NULL").get().count, 0);
  } finally { db.close(); }
});


test("visibility actions preserve supplied unsaved work and private notes stay outside public snapshots", async () => {
  const db = fixtureDatabase();
  try {
    let article = await createStoredArticle(db, { ...completeDocument(), editorialNotes: "Confidential internal editorial reminder" }, timeline(0));
    article = await mutateStoredArticle(db, article.id, { action: "publish", revision: article.revision, reviewConfirmed: true }, reviewer, timeline(1));
    assert.equal(article.editorialNotes, "Confidential internal editorial reminder");
    assert.equal((await readPublishedArticles(db))[0].editorialNotes, "");
    article = await mutateStoredArticle(db, article.id, { action: "save", revision: article.revision, document: { ...completeDocument(), editorialNotes: "A revised staff-only note" } }, reviewer, timeline(2));
    assert.equal(article.hasUnpublishedChanges, false);
    article = await mutateStoredArticle(db, article.id, { action: "archive", revision: article.revision, document: { ...completeDocument(), title: "Unsaved words before archive" } }, reviewer, timeline(3));
    assert.equal(article.title, "Unsaved words before archive"); assert.ok(article.archivedAt);
    article = await mutateStoredArticle(db, article.id, { action: "restore", revision: article.revision }, reviewer, timeline(4));
    assert.equal(article.title, "Unsaved words before archive"); assert.equal((await readPublishedArticles(db))[0].title, completeDocument().title);
    article = await mutateStoredArticle(db, article.id, { action: "unpublish", revision: article.revision, document: { ...completeDocument(), title: "Unsaved words before unpublish" } }, reviewer, timeline(5));
    assert.equal(article.title, "Unsaved words before unpublish"); assert.equal(article.isLive, false);
  } finally { db.close(); }
});


test("unchanged and private-note publication preserve public modification and review dates", async () => {
  const db = fixtureDatabase();
  try {
    let article = await createStoredArticle(db, completeDocument(), timeline(0));
    article = await mutateStoredArticle(db, article.id, { action: "publish", revision: article.revision, reviewConfirmed: true }, reviewer, timeline(1));
    const originalPublishedAt = article.publishedAt;
    const originalUpdatedAt = article.updatedAt;
    const originalReview = { ...article.review };
    const nextReviewer = { name: "Another signed-in reviewer" };
    await assert.rejects(mutateStoredArticle(db, article.id, { action: "publish", revision: article.revision }, nextReviewer, timeline(2)), expectStoreError(422));
    article = await mutateStoredArticle(db, article.id, { action: "publish", revision: article.revision, reviewConfirmed: true }, nextReviewer, timeline(2));
    assert.equal(article.publishedAt, originalPublishedAt); assert.equal(article.updatedAt, originalUpdatedAt);
    assert.deepEqual(article.review, originalReview); assert.equal(article.savedAt, timeline(2));
    article = await mutateStoredArticle(db, article.id, { action: "publish", revision: article.revision, document: { ...completeDocument(), editorialNotes: "Only a private editorial reminder changed" }, reviewConfirmed: true }, nextReviewer, timeline(3));
    assert.equal(article.editorialNotes, "Only a private editorial reminder changed");
    assert.equal(article.publishedAt, originalPublishedAt); assert.equal(article.updatedAt, originalUpdatedAt); assert.deepEqual(article.review, originalReview);
    const publicArticle = (await readPublishedArticles(db))[0];
    assert.equal(publicArticle.editorialNotes, ""); assert.equal(publicArticle.updatedAt, originalUpdatedAt); assert.deepEqual(publicArticle.review, originalReview);
    article = await mutateStoredArticle(db, article.id, { action: "publish", revision: article.revision, document: { ...completeDocument(), title: "An actual changed public title" }, reviewConfirmed: true }, nextReviewer, timeline(4));
    assert.equal(article.publishedAt, originalPublishedAt); assert.equal(article.updatedAt, timeline(4));
    assert.equal(article.review.by, nextReviewer.name); assert.equal(article.review.at, timeline(4));
  } finally { db.close(); }
});
