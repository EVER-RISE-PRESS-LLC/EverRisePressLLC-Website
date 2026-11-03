---
name: everrise-publishing
description: Use when an AI agent is asked to upload website images, edit or publish EverRise Press articles, run an EverRise editorial release, or verify its live publishing and discovery. Uses the site's scoped API and repository client.
---

# EverRise Press publishing

Work from the EverRisePressLLC-Website repository. Read the repository's [agent publishing guide](../../../docs/agent-publishing.md) for commands and credential setup, and [PRODUCT.md](../../../PRODUCT.md) for editorial authority. The live article store is the publishing API. Repository seed articles and previous exports are reference material.

## Choose the right access

- Run `node scripts/everrise.mjs status` to confirm access. The client loads the configured credential privately. Keep credentials, private drafts and manuscript extracts out of GitHub. If credentials fail, distinguish an expired or revoked key from a missing permission before following the guide.
- Use the client for image and article operations. Treat public image URLs as immediate publication of the uploaded bytes, even when the article is private. Use the Ever rise Chrome profile associated with the owner's EverRise account for visual or print review and other necessary browser work. Use the connected Search Console tool for discovery checks when requested.
- Follow the user's publication scope. Reading, draft preparation and publication are separate actions. Use archive, restore, unpublish and deletion only when the task authorizes that visibility or removal change.

## Prepare and publish

1. Read the current article with `articles get SLUG --out FILE`, or use `articles new --slug SLUG --out FILE` for a local template. Preserve the existing byline, slug and revision when editing. Use approved source material, distinguish manuscript recollections from general claims, and mark fictional examples. Establish byline authority before confirming it.
2. Use `media upload FILE` for approved still JPEG, PNG or WebP. Prepare artwork within 500 KiB and 1600 pixels per side. Use `--optimize` only when needed and inspect the resulting copy. Keep asset provenance in the working records. Verify the returned public URL and byte digest. Use the returned `image.url`, dimensions and meaningful alternative text in the article.
3. Use `articles create FILE` or `articles save FILE`, saving the response to a new file when useful. Check the saved version with `articles check ARTICLE_ID`. Review actual copy, source claims, links and rendering. The API check covers publishability fields. A live article continues showing its approved version while a newer draft is saved.
4. When publication is authorized and review is complete, use `articles publish ARTICLE_ID --revision REV --reviewed` with the exact checked revision. Publish a destination before activating new links to it. On a revision conflict, read the newest version, merge and review again. After a timeout, read the saved state and audit trail before attempting another mutation.
5. Read the article back and verify the public URL, metadata, images and linked destinations. Check sitemap and discovery feeds for new URLs. Record the live result and any failed checks. Search Console inspection reports Google's known state. Treat an indexing request and confirmed indexing as separate outcomes.

Use `node scripts/everrise.mjs --help` for command options. Use [the maintainer guide](../../../docs/agent-publishing.md#credential-administration) for credential administration.
