# Publish an article

Write and publish articles from the EverRise Press staff workspace at `/admin/articles`. You can format text, upload images, save private drafts and preview the page before it goes live. You can publish from this page without editing code or rebuilding the site.

## Start a draft

1. Sign in with an existing ADMIN or EDITOR account.
2. Open **Articles**, then choose **Write article**.
3. Add an **Article title** and a **Short introduction**. Keep the title to 90 characters or fewer. The short introduction also appears in search results. Aim for 70–200 characters.
4. Choose a **Category** that tells readers what the piece is about.
5. Write or paste the article in the editor. The toolbar adds headings, bold and italic text, lists, quotes, links, images and tables. Undo and redo are available.

Drafts save automatically after you pause for about 1.5 seconds. Autosave starts once you add a title or content. You can also choose **Save draft**. Wait for **All changes saved** before closing the page.

A saved draft stays private. When you edit a live article, readers keep seeing the approved version until you choose **Publish changes**.

## Add author and sharing details

Open **Details & sharing** to add the details readers will see.

- **Byline:** Choose EverRise Press, an existing author, or another contributor. Check the name and profile link. Check the approval box once the named author has agreed to the byline.
- **Article URL:** Use a short address with lowercase words and hyphens. The address stays fixed once you first publish, so shared links keep working.
- **Sources & further reading:** Add a clear title and an HTTPS link for each source. Add at least one full source before you publish. Use first-hand sources for factual claims where you can.
- **Related reading:** Select useful follow-up articles. The public page only shows links that are live.
- **Sharing image:** Choose an image and describe what it shows. A wide image around 1200 × 630 pixels works well when readers share a link.
- **Private editorial notes:** Keep a brief, reminders or review notes here. Staff can see these notes. Readers cannot see them in the live article.

Changing the author name or profile link clears the byline approval checkbox. Confirm it again after checking the change.

## Use images

Choose **Choose or upload** in an image field to open the library. Select a thumbnail, then choose **Use image**. You can also paste an existing `/images/…` path or HTTPS image link.

To upload, choose **Upload image** and select a JPEG, PNG or WebP file. The site makes a web-sized copy and shows upload progress. If an upload fails, your current image stays in place. Add a useful image description when inserting an image into an article.

The library holds up to 100 images and 20 MB in total. Each copy can use up to 500 KB. Its longest side can be up to 1600 pixels. When the library is full, reuse an existing image or remove an unused one. Images used in saved books, author profiles or articles cannot be deleted. Unsaved selections and links shared outside the website are not tracked.

Uploaded images have public URLs, including images selected for a private draft. Use artwork intended for the website.

## Preview and publish

1. Choose **Preview**. The editor saves your latest changes, then opens the staff preview.
2. Read the whole page. Check the opening, headings, links, images, tables, byline and source list.
3. Return to the editor and choose **Review & publish**, or **Publish changes** for a live article.
4. Complete the checklist. It checks the title, category, introduction, article text, byline approval, image descriptions and supporting sources.
5. Select the review checkbox after checking the content and facts. Choose **Publish article** or **Publish changes** to make that version public immediately.

The site records when you publish and who reviewed the work. If you publish again, it keeps the first publish date and adds a new update and review time. You do not need to type dates or choose a technical status.

Check the facts as well as the form fields. Confirm claims and sums, label made-up examples, and get the author’s approval for personal statements. The planned payday-spending and cash-flow pieces stay as briefs until the text, sources and bylines pass review.

## Understand article status

| Status | What readers can see |
| --- | --- |
| Draft | Nothing public. Staff can keep writing and preview the saved draft. |
| Published | The approved version appears on the public blog. |
| Unpublished changes | Readers still see the approved version. Your newer saved changes remain private. |
| Archived | The article is hidden from the public blog and the active article list. The text is kept. |

The **Articles** list has All articles, Drafts, Published, Changes and Archived filters, plus a search field. Use **Changes** to find public articles with saved work awaiting publication.

## Hide or restore an article

Open **Details & sharing**, then find **Visibility**.

Choose **Unpublish** to remove the public article and keep a private draft. Choose **Archive** to hide the article from both the public blog and the active staff list. Each action asks you to confirm.

To restore, open the **Archived** filter, select the article and choose **Restore article**. Restore also brings back its earlier public status. If it was live when you archived it, the approved version becomes public again.

## Recover from a save problem

If a save fails, keep the editor open. Your text stays in the page. Read the error, then choose **Retry save**. If your session has ended, open sign-in in another tab. Sign in, then retry in the first editor tab.

If another tab saved the same article, the workspace stops to keep that version safe. Choose **Copy draft text** to keep your writing, then **Reload saved version**. Reloading drops unsaved changes from the page. Copy what you need first.

If you follow a workspace link while changes remain unsaved, the editor offers **Keep editing** or **Discard changes**. Use Keep editing while you fix a save error.

The editor also keeps a local recovery copy in the current browser tab. If Back or Forward takes you away before a save completes, return to the same article. Choose **Restore local draft** to recover the writing, or **Keep saved version** to discard that copy. If the saved version changed, review the recovered text before saving. No server content changes just because a recovery copy exists.

A successful save or an explicit discard clears the local copy. Keep the same browser tab open until you finish saving; closing it ends this recovery session. If draft recovery cannot use the browser’s storage, the editor shows a message asking you to keep the page open and save first.

## How public discovery works

Only approved, live versions appear on the blog and in related reading. The site also adds them to the homepage, menus, sitemap and search data. Drafts and archived work stay out of these lists. Staff previews require sign-in and tell search engines not to index them.

When no articles are published, `/blog` shows a coming-soon page and stays out of the main navigation and sitemap. The first live article adds these blog links on its own.

## Notes for site maintainers

D1 is the live article and image store. The editor saves drafts separately from published versions and checks a revision number before changing an article. Deploying code does not replace saved D1 content.

The older `src/content/blog/articles.json` file holds the two original editorial briefs. It is seed input, not the live editing source. The repository is public; files committed there can be read on GitHub. Keep staff-only notes in the workspace.

New environments need the committed D1 migrations, including the article/media tables and publication-history migration. The release record documents the explicit import of existing briefs and deployment checks. Developers should run the article tests, catalog/media tests, reader/referral tests, lint, TypeScript and the existing OpenNext build before a release.

The first file-based blog foundation and its earlier checks are recorded in README and the dated SEO work log. They describe the earlier implementation; this guide describes the visual D1 publishing workflow that replaces it.
