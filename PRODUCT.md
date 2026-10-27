# EverRise Press

EverRise Press LLC presents How To Have a Financial Heart Attack by Lamont D. McLeod. Readers can learn what the book covers, check the author and edition details, read Chapter 1 with email signup, and choose an external retailer. The site also supports podcast referrals and an existing staff admin area.

## Readers and outcomes

The working audience is English-speaking adults researching the book or reflecting on spending habits. US readers are a working assumption based on USD retail links, not measured audience research. Success means readers understand what is offered, can check the supporting facts, and can read or buy without confusing controls or exaggerated promises. Blog pages use Read mode: explain the subject, identify the responsible author, provide sources and useful navigation, and offer relevant further reading.

## Truth and editorial decisions

The manuscript and existing Chapter 1 sample are source material. The owner approved Lamont's biography, the monitored contact privacy@everrisepress.com, and the publishing/distribution service relationship through HMD Publishing. Do not invent personal testimony, qualifications, reviews, universal financial outcomes, or an HMD founder role. New articles need reviewed copy, sources, a confirmed byline, and real publication/update dates before public release.

The current signup opens the chapter on the website. It does not send an email series or start a newsletter. Analytics and advertising run by default at the owner's request, with an accurate footer disclosure and saved opt-outs. Keep this behavior unless the owner changes it.

## Design authority

Follow docs/DESIGN.md, especially its 22 October public-interface update, and the incumbent shared components. Preserve charcoal, cream and gold; Spectral/Karla; real cover and author assets; stable navigation; accessible controls and dialogs; visible reading text; and reduced-motion behavior. Extend this established world without a new visual identity exercise.

## Publishing and operation

The Next.js API application runs through vinext and the Cloudflare Vite plugin on the existing Cloudflare Worker and D1 database. The owner wants changes tested, pushed to GitHub main, and deployed; Cloudflare Workers Builds also deploys main automatically. The staff workspace now provides visual article and Chapter 1 editing, image upload, searchable book/author catalogs, reader export and referral management. Use the existing Cloudflare free plan; do not add a paid CMS, storage account, image transformation service or billing change.

D1 is the live source for articles and uploaded images. Staff write in the visual editor, save private drafts, preview them, and explicitly review and publish. Saving changes to a published article keeps the approved version public until those changes are published. Publication records the actual reviewer and dates, retains the first publication date, and fixes the public article address. Archive keeps the content and hides the article; restoration restores its earlier visibility. Public navigation, homepage reading, sitemap and schema use published versions only.

Repository article JSON is seed input for the original briefs, not the live editing source. Deploys must preserve saved D1 content. The image library uses the existing D1 binding with an application limit of 100 images, 20 MiB total and 500 KiB per image; no R2 or paid image transformations are required. Preserve existing book, author, chapter, referral and privacy behavior.
The two planned article briefs are unpublished. Building the blog foundation does not authorize fabricated author statements or treat draft content as reviewed. Keep the detailed sources, work plan, review inputs and release evidence in seo-dev-doc.

The GitHub repository is public. Staff preview authentication does not make repository files confidential. The committed article briefs contain non-sensitive planning information; keep sensitive material outside source control. New editorial notes belong in the authenticated staff workspace. Uploaded images have public URLs, so use artwork intended for the website even when attaching it to a private draft.
