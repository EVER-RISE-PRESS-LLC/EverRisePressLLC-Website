// Run with `node scripts/admin-catalog-media.test.mjs`. Uses only an ephemeral local D1 database.
// Existing esbuild/Miniflare development tooling bundles actual route handlers; no remote binding is read.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { build } = require("esbuild");
const { Miniflare, convertV4MiniflareOptions } = require("miniflare");
const { NextRequest } = require("next/server");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const project = fileURLToPath(new URL("..", import.meta.url));
let assertions = 0;
const check = Object.fromEntries(
  ["equal", "deepEqual", "match", "ok"].map((method) => [
    method,
    (...args) => {
      assert[method](...args);
      assertions++;
    },
  ]),
);
(async () => {
  const folder = fs.mkdtempSync(project + "/.media-check-");
  let mf;
  try {
    for (const [name, path] of Object.entries({
      media: "src/app/api/admin/media/route.ts",
      deletion: "src/app/api/admin/media/[id]/route.ts",
      public: "src/app/media/[id]/route.ts",
      books: "src/app/api/admin/books/route.ts",
      book: "src/app/api/admin/books/[id]/route.ts",
      author: "src/app/api/admin/authors/[id]/route.ts",
      site: "src/lib/seo/ids.ts",
      inspect: "src/lib/admin/media.ts",
      validation: "src/lib/admin/validation.ts",
      auth: "src/lib/auth.ts",
    })) {
      await build({
        absWorkingDir: project,
        entryPoints: [path],
        outfile: folder + "/" + name + ".cjs",
        bundle: true,
        platform: "node",
        format: "cjs",
        packages: "external",
        alias: {
          "@jdevalk/seo-graph-core": fileURLToPath(
            import.meta.resolve("@jdevalk/seo-graph-core"),
          ),
        },
        logLevel: "silent",
      });
    }
    mf = new Miniflare(
      convertV4MiniflareOptions({
        name: "fixture",
        modules: true,
        script: 'export default {fetch(){return new Response("fixture")}}',
        d1Databases: ["DB"],
      }),
    );
    const DB = await mf.getD1Database("DB");
    for (const file of fs
      .readdirSync(project + "/migrations")
      .filter((x) => x.endsWith(".sql"))
      .sort()) {
      const sql = fs.readFileSync(project + "/migrations/" + file, "utf8");
      await DB.exec(sql.replace(/--[^\n]*/g, "").replace(/\n/g, " "));
    }
    process.env.JWT_SECRET = "isolated-test-secret-only-not-production";
    global[Symbol.for("__cloudflare-context__")] = { env: { DB } };
    const auth = require(folder + "/auth.cjs");
    const token = await auth.createSessionToken("fixture-admin");
    await DB.prepare(
      "INSERT INTO users (id,email,password_hash,name,role) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(
        "fixture-admin",
        "fixture@example.invalid",
        "unused",
        "Fixture",
        "ADMIN",
      )
      .run();
    await DB.prepare(
      "INSERT INTO authors (id,slug,name,bio) VALUES (?, ?, ?, ?)",
    )
      .bind(
        "fixture-author",
        "fixture-author",
        "Fixture Author",
        "Biography for isolated local checks.",
      )
      .run();
    const api = require(folder + "/media.cjs");
    const del = require(folder + "/deletion.cjs");
    const pub = require(folder + "/public.cjs");
    const bookApi = require(folder + "/books.cjs");
    const editBook = require(folder + "/book.cjs");
    const authorApi = require(folder + "/author.cjs");
    const { SITE_URL } = require(folder + "/site.cjs");
    const req = (url, method = "GET", body, type, extra = {}) =>
      new NextRequest("http://localhost" + url, {
        method,
        headers: {
          cookie: "admin_session=" + token,
          ...(type ? { "Content-Type": type } : {}),
          ...extra,
        },
        ...(body ? { body } : {}),
        ...(body && typeof body !== "string" ? { duplex: "half" } : {}),
      });
    const validation = require(folder + "/validation.cjs");
    const validFormat = {
      formatType: "EBOOK",
      distributor: "DRAFT2DIGITAL",
      isbn: "",
      retailPrice: 1,
      currency: "USD",
      purchaseUrl: "https://example.invalid/book",
    };
    check.equal(
      validation.bookFormatSchema.safeParse({
        ...validFormat,
        purchaseUrl: "not a url",
      }).success,
      false,
    );
    check.equal(
      validation.bookFormatSchema.safeParse({
        ...validFormat,
        purchaseUrl: "javascript:alert(1)",
      }).success,
      false,
    );
    check.equal(
      validation.bookFormatSchema.safeParse({ ...validFormat, retailPrice: "" })
        .success,
      false,
    );
    check.equal(
      validation.bookFormatSchema.safeParse({
        ...validFormat,
        retailPrice: null,
      }).success,
      false,
    );
    check.equal(
      validation.bookFormatSchema.safeParse({
        ...validFormat,
        retailPrice: false,
      }).success,
      false,
    );
    check.equal(
      validation.bookFormatSchema.parse({ ...validFormat, retailPrice: "0" })
        .retailPrice,
      0,
    );
    check.equal(
      validation.publicationDateSchema.safeParse("2026-02-30").success,
      false,
    );
    check.equal(
      validation.imageUrlSchema.safeParse("https://?").success,
      false,
    );
    check.deepEqual(
      validation.socialLinksSchema.parse({
        instagram: "https://example.invalid/profile",
        twitter: "https://x.com/fixture",
      }),
      {
        instagram: "https://example.invalid/profile",
        x: "https://x.com/fixture",
      },
    );
    const inspector = require(folder + "/inspect.cjs").inspectRaster;
    check.deepEqual(
      inspector(
        fs.readFileSync(project + "/public/images/authors/lamont-mcleod.jpg"),
      ),
      { contentType: "image/jpeg", width: 753, height: 960 },
    );
    check.deepEqual(
      inspector(
        fs.readFileSync(
          project + "/public/images/books/financial-heart-attack-cover.webp",
        ),
      ),
      { contentType: "image/webp", width: 801, height: 1200 },
    );
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aYoQAAAAASUVORK5CYII=",
      "base64",
    );
    check.equal(
      inspector(
        Buffer.concat([png.subarray(0, 33), png.subarray(png.length - 12)]),
      ),
      null,
    );
    const oversizedDimensions = Buffer.from(png);
    oversizedDimensions.writeUInt32BE(1601, 16);
    check.equal(inspector(oversizedDimensions), null);
    check.equal(
      (await api.GET(new NextRequest("http://localhost/api/admin/media")))
        .status,
      401,
    );
    check.equal(
      (
        await api.POST(
          req("/api/admin/media", "POST", Buffer.from("<svg/>"), "image/png"),
        )
      ).status,
      400,
    );
    check.equal(
      (await api.POST(req("/api/admin/media", "POST", png, "image/jpeg")))
        .status,
      400,
    );
    check.equal(
      (
        await api.POST(
          req("/api/admin/media", "POST", Buffer.alloc(512001), "image/png"),
        )
      ).status,
      413,
    );
    check.equal(
      (
        await api.POST(
          req("/api/admin/media", "POST", png, "image/png", {
            origin: "https://attacker.invalid",
          }),
        )
      ).status,
      403,
    );
    const uploaded = await api.POST(
      req("/api/admin/media", "POST", png, "image/png", {
        "x-file-name": "one-pixel.png",
      }),
    );
    check.equal(uploaded.status, 201);
    const image = (await uploaded.json()).image;
    check.equal(image.width, 1);
    check.equal(image.height, 1);
    const listed = await (await api.GET(req("/api/admin/media"))).json();
    check.equal(listed.images.length, 1);
    check.equal(listed.images[0].data, undefined);
    check.equal(listed.usage.bytes, png.length);
    const publicImage = await pub.GET(req(image.url), {
      params: Promise.resolve({ id: image.id }),
    });
    check.equal(publicImage.status, 200);
    check.equal(publicImage.headers.get("content-type"), "image/png");
    check.equal(publicImage.headers.get("x-content-type-options"), "nosniff");
    check.match(publicImage.headers.get("cache-control"), /immutable/);
    check.deepEqual(Buffer.from(await publicImage.arrayBuffer()), png);
    const book = {
      slug: "fixture-book",
      title: "Fixture Book",
      subtitle: "",
      synopsis: "Fixture description for local validation.",
      coverImageUrl: image.url,
      chapterOneTitle: "Chapter 1",
      chapterOneBody:
        "<p>Fixture chapter content.</p><script>alert(1)</script>",
      authorId: "fixture-author",
      publishedAt: "",
    };
    const format = {
      formatType: "EBOOK",
      distributor: "DRAFT2DIGITAL",
      isbn: "",
      retailPrice: 2.99,
      currency: "USD",
      purchaseUrl: "https://example.invalid/buy",
    };
    const saved = await bookApi.POST(
      req(
        "/api/admin/books",
        "POST",
        JSON.stringify({ book, formats: [format] }),
        "application/json",
      ),
    );
    check.equal(saved.status, 201);
    const savedBody = await saved.json();
    const bookId = savedBody.book.id;
    const formatId = savedBody.formats[0].id;
    check.equal(savedBody.book.chapterOneBody.includes("<script>"), false);
    check.equal(
      (
        await del.DELETE(req("/api/admin/media/" + image.id, "DELETE"), {
          params: Promise.resolve({ id: image.id }),
        })
      ).status,
      409,
    );
    const patched = await editBook.PATCH(
      req(
        "/api/admin/books/" + bookId,
        "PATCH",
        JSON.stringify({
          book: { ...book, title: "Updated Fixture" },
          formats: [{ ...format, id: formatId, retailPrice: 3.99 }],
        }),
        "application/json",
      ),
      { params: Promise.resolve({ id: bookId }) },
    );
    check.equal(patched.status, 200);
    const patchedBody = await patched.json();
    check.equal(patchedBody.formats[0].id, formatId);
    // Force the final insert to fail and prove the book update and retailer deletion roll back together.
    await DB.exec(
      "CREATE TRIGGER block_fixture_format BEFORE INSERT ON book_formats WHEN NEW.retail_price = 9.99 BEGIN SELECT RAISE(ABORT, 'fixture failure'); END;",
    );
    const failed = await editBook.PATCH(
      req(
        "/api/admin/books/" + bookId,
        "PATCH",
        JSON.stringify({
          book: { ...book, title: "Must Roll Back" },
          formats: [{ ...format, id: formatId, retailPrice: 9.99 }],
        }),
        "application/json",
      ),
      { params: Promise.resolve({ id: bookId }) },
    );
    check.equal(failed.status, 500);
    const persisted = await DB.prepare("SELECT title FROM books WHERE id=?")
      .bind(bookId)
      .first();
    check.equal(persisted.title, "Updated Fixture");
    const persistedFormat = await DB.prepare(
      "SELECT id, retail_price FROM book_formats WHERE book_id=?",
    )
      .bind(bookId)
      .first();
    check.equal(persistedFormat.id, formatId);
    check.equal(persistedFormat.retail_price, 3.99);
    const failedCreation = await bookApi.POST(
      req(
        "/api/admin/books",
        "POST",
        JSON.stringify({
          book: { ...book, slug: "failed-creation" },
          formats: [{ ...format, retailPrice: 9.99 }],
        }),
        "application/json",
      ),
    );
    check.equal(failedCreation.status, 500);
    check.equal(
      (
        await DB.prepare(
          "SELECT count(*) AS n FROM books WHERE slug='failed-creation'",
        ).first()
      ).n,
      0,
    );
    await DB.exec("DROP TRIGGER block_fixture_format");
    await DB.prepare("INSERT INTO leads (id,email,book_id) VALUES (?, ?, ?)")
      .bind("fixture-lead", "reader@example.invalid", bookId)
      .run();
    check.equal(
      (
        await editBook.DELETE(req("/api/admin/books/" + bookId, "DELETE"), {
          params: Promise.resolve({ id: bookId }),
        })
      ).status,
      409,
    );
    // Protect images referenced by saved article drafts and public article snapshots.
    const img2 = (
      await (
        await api.POST(req("/api/admin/media", "POST", png, "image/png"))
      ).json()
    ).image;
    await DB.prepare(
      "INSERT INTO articles (id,slug,document,published_document,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(
        "fixture-article",
        "fixture-article",
        "{}",
        JSON.stringify({ image: img2.url }),
        "2026-10-27",
        "2026-10-27",
      )
      .run();
    check.equal(
      (
        await del.DELETE(req("/api/admin/media/" + img2.id, "DELETE"), {
          params: Promise.resolve({ id: img2.id }),
        })
      ).status,
      409,
    );
    await DB.prepare("DELETE FROM articles WHERE id=?")
      .bind("fixture-article")
      .run();
    check.equal(
      (
        await del.DELETE(req("/api/admin/media/" + img2.id, "DELETE"), {
          params: Promise.resolve({ id: img2.id }),
        })
      ).status,
      200,
    );
    const chapterImage = (
      await (
        await api.POST(req("/api/admin/media", "POST", png, "image/png"))
      ).json()
    ).image;
    await DB.prepare("UPDATE books SET chapter_one_body = ? WHERE id = ?")
      .bind(
        `<p>Chapter image</p><img src="${chapterImage.url}" alt="Fixture">`,
        bookId,
      )
      .run();
    check.equal(
      (
        await del.DELETE(req(`/api/admin/media/${chapterImage.id}`, "DELETE"), {
          params: Promise.resolve({ id: chapterImage.id }),
        })
      ).status,
      409,
    );
    await DB.prepare("UPDATE books SET chapter_one_body = ? WHERE id = ?")
      .bind("<p>Fixture text.</p>", bookId)
      .run();
    check.equal(
      (
        await del.DELETE(req(`/api/admin/media/${chapterImage.id}`, "DELETE"), {
          params: Promise.resolve({ id: chapterImage.id }),
        })
      ).status,
      200,
    );
    // An author profile must survive any saved or published byline, including archived restore targets.
    check.equal(
      (
        await authorApi.DELETE(
          req("/api/admin/authors/fixture-author", "DELETE"),
          { params: Promise.resolve({ id: "fixture-author" }) },
        )
      ).status,
      409,
    );
    const bylineCases = [
      { draft: "relative", published: null, archived: false },
      { draft: "absolute", published: null, archived: false },
      { draft: null, published: "relative", archived: false },
      { draft: null, published: "absolute", archived: true },
      { draft: "relative", published: "absolute", archived: true },
    ];
    for (const [index, scenario] of bylineCases.entries()) {
      const id = `fixture-byline-author-${index}`;
      const slug = `byline-author-${index}`;
      const relative = `/authors/${slug}`;
      const link = (kind) =>
        kind === "relative"
          ? relative
          : kind === "absolute"
            ? SITE_URL + relative
            : "/about";
      await DB.prepare(
        "INSERT INTO authors (id,slug,name,bio) VALUES (?, ?, ?, ?)",
      )
        .bind(id, slug, "Byline fixture", "Local byline deletion fixture.")
        .run();
      await DB.prepare(
        "INSERT INTO articles (id,slug,document,published_document,archived_at,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
        .bind(
          `fixture-byline-${index}`,
          `fixture-byline-${index}`,
          JSON.stringify({ author: { url: link(scenario.draft) } }),
          scenario.published
            ? JSON.stringify({ author: { url: link(scenario.published) } })
            : null,
          scenario.archived ? "2026-10-27" : null,
          "2026-10-27",
          "2026-10-27",
        )
        .run();
      check.equal(
        (
          await authorApi.DELETE(req(`/api/admin/authors/${id}`, "DELETE"), {
            params: Promise.resolve({ id }),
          })
        ).status,
        409,
      );
      check.equal(
        (
          await DB.prepare("SELECT COUNT(*) AS count FROM authors WHERE id = ?")
            .bind(id)
            .first()
        ).count,
        1,
      );
      await DB.prepare("DELETE FROM articles WHERE id = ?")
        .bind(`fixture-byline-${index}`)
        .run();
      check.equal(
        (
          await authorApi.DELETE(req(`/api/admin/authors/${id}`, "DELETE"), {
            params: Promise.resolve({ id }),
          })
        ).status,
        200,
      );
      check.equal(
        (
          await DB.prepare("SELECT COUNT(*) AS count FROM authors WHERE id = ?")
            .bind(id)
            .first()
        ).count,
        0,
      );
    }
    await DB.prepare(
      "INSERT INTO authors (id,slug,name,bio) VALUES (?, ?, ?, ?)",
    )
      .bind(
        "fixture-unused-author",
        "unused-author",
        "Unused fixture",
        "Local unused author fixture.",
      )
      .run();
    await DB.prepare(
      "INSERT INTO articles (id,slug,document,published_document,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(
        "fixture-other-byline",
        "fixture-other-byline",
        JSON.stringify({ author: { url: "/authors/unused-author-other" } }),
        JSON.stringify({
          author: { url: "https://outside.invalid/authors/unused-author" },
        }),
        "2026-10-27",
        "2026-10-27",
      )
      .run();
    check.equal(
      (
        await authorApi.DELETE(
          req("/api/admin/authors/fixture-unused-author", "DELETE"),
          { params: Promise.resolve({ id: "fixture-unused-author" }) },
        )
      ).status,
      200,
    );
    check.equal(
      (
        await authorApi.DELETE(
          req("/api/admin/authors/fixture-unused-author", "DELETE"),
          { params: Promise.resolve({ id: "fixture-unused-author" }) },
        )
      ).status,
      404,
    );
    check.equal(
      (
        await authorApi.DELETE(
          new NextRequest("http://localhost/api/admin/authors/fixture-author", {
            method: "DELETE",
          }),
          { params: Promise.resolve({ id: "fixture-author" }) },
        )
      ).status,
      401,
    );
    await DB.prepare(
      "INSERT INTO users (id,email,password_hash,name,role) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(
        "fixture-editor",
        "editor@example.invalid",
        "unused",
        "Editor",
        "EDITOR",
      )
      .run();
    const editorToken = await auth.createSessionToken("fixture-editor");
    check.equal(
      (
        await authorApi.DELETE(
          req(
            "/api/admin/authors/fixture-author",
            "DELETE",
            undefined,
            undefined,
            { cookie: `admin_session=${editorToken}` },
          ),
          { params: Promise.resolve({ id: "fixture-author" }) },
        )
      ).status,
      403,
    );
    // Atomic quota check under two competing uploads at the 100-image boundary.
    const insert = DB.prepare(
      "INSERT INTO media (id,name,content_type,byte_size,width,height,data,created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    for (let index = 0; index < 98; index++)
      await insert
        .bind(
          crypto.randomUUID(),
          "fixture",
          "image/png",
          png.length,
          1,
          1,
          png,
          "2026-10-27",
        )
        .run();
    const statuses = await Promise.all([
      api.POST(req("/api/admin/media", "POST", png, "image/png")),
      api.POST(req("/api/admin/media", "POST", png, "image/png")),
    ]).then((rs) => rs.map((r) => r.status).sort());
    check.deepEqual(statuses, [201, 409]);
    check.equal(
      (await DB.prepare("SELECT count(*) AS n FROM media").first()).n,
      100,
    );
    // The byte quota is enforced by the same atomic statement, independently of image count.
    await DB.prepare("DELETE FROM media WHERE id <> ?").bind(image.id).run();
    await DB.prepare("UPDATE media SET byte_size = ? WHERE id = ?")
      .bind(20 * 1024 * 1024 - png.length + 1, image.id)
      .run();
    check.equal(
      (await api.POST(req("/api/admin/media", "POST", png, "image/png")))
        .status,
      409,
    );
    check.equal(
      (await DB.prepare("SELECT count(*) AS n FROM media").first()).n,
      1,
    );
    console.log(
      `PASS: ${assertions} isolated D1 assertions for media authentication, validation, serving, reference protection, atomic count/byte quotas, and catalog ID preservation, sanitization, atomic rollback and history guards.`,
    );
  } finally {
    if (mf) await mf.dispose();
    fs.rmSync(folder, { recursive: true, force: true });
    delete global[Symbol.for("__cloudflare-context__")];
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
