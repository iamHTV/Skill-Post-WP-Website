---
name: wordpress-image-upload
description: Inspect images and read their visible text, optimize WebP size while preserving readability, write WordPress media title, alt text, caption and description, then upload or update media and optionally attach it as featured or inline. Use for WordPress image upload and image SEO requests, not image generation or redesign. Also use for first-time website setup, adding a website, or selecting per-site/shared env credentials for this workflow.
---

# WordPress image upload

Read [site setup](references/site-setup.md) and the private profile selected using [site index](references/sites/index.md). All required resources are inside this skill folder; no sibling folder is required.

## Establish scope

Resolve source file(s), website, whether to create media or update an existing attachment, and whether to set a featured image, insert inline, or only upload. Resolve the exact target post when needed. Reuse choices already established. Do not attach to an arbitrary recent post or reuse an ID from another website.

## Read the image and optimize the four fields

Open each source with the image-viewing tool before writing metadata. Read visible text directly (visual OCR). For tiny text, inspect at original resolution or use an available OCR tool; do not invent unclear numbers. Separate visible evidence from user-supplied context. Record consequential uncertainty, especially project names, unit codes, area, price and dates.

- **Title:** concise human-readable image subject; add a confirmed unit code or project only when useful. Avoid generic filenames and keyword lists.
- **Alt text:** describe the meaningful visual content in its article context. Include important visible text when it contributes meaning; do not transcribe every advertisement, slogan or phone number. Avoid “image of” filler and keyword stuffing. A purely decorative inline image can have empty alt; an informative floor plan cannot.
- **Caption:** a short useful reader-facing explanation. Distinguish an illustration/rendering from a real photograph. Include a relevant caveat when needed.
- **Description:** fuller factual account of the image, significant legible text and useful context or attribution. Do not imply OCR established facts absent from the image. Media description is not the post's SEO meta description.

Use the requested language and any site editorial preferences. There are no fixed SEO character quotas for these fields; prioritize accurate meaning and readability. Never assign a project name solely because the target post happens to have a relation to that project.

## Upload and attach

1. Prioritize WebP before new uploads, following [WebP optimization](references/webp-optimization.md). Preserve the source, test multiple encodes, and visually inspect the smallest acceptable candidate for legibility. Use the selected site's media constraints; do not blindly shrink text-heavy floor plans to a fixed width or file-size cap. If WebP is unsupported, larger than a suitable original, or harms readability, retain a suitable original and report why. Existing optimized WebP normally needs no re-encoding. Use a descriptive ASCII filename with the actual selected file format.
2. Use [API helper](references/api-helper.md) to POST binary media to `/wp/v2/media`. Save the returned attachment ID and source URL immediately. Do not blindly upload again if a later step fails or the upload response is lost; inspect receipts and recent media first.
3. POST `/wp/v2/media/{id}` with `title`, `alt_text`, `caption`, `description`; add `post` only for the intended target. Read back with `context=edit` and compare all four fields (`title.raw`, `caption.raw`, `description.raw`, `alt_text`).
4. If requested, POST the target post with `featured_media: attachment_id`. Setting `post` on the attachment alone does not make it featured.
5. For inline insertion, read the latest `content.raw`; prepend or place a valid Gutenberg image block near the relevant content or at the requested location. Use `wp:image` with `id`, `sizeSlug`, `linkDestination`, and a figure containing the image's source URL and escaped alt. Include correct intrinsic width/height to reserve space. Caption markup should use `figcaption.wp-element-caption`. Avoid duplicate insertion and preserve all other content. For broader article edits, optionally use `wordpress-post-upload` if installed; this skill already supports featured/inline attachment without it.
6. Read back the attachment and post. Verify the featured ID and/or inline occurrence, existing publication status, and preservation of prior content. If image placement depends on the theme, report that distinction.

Use the [SEO image checklist](references/seo-checklist.md) at handoff. For a public page, inspect image delivery and mobile layout when tools allow; distinguish untested/theme-dependent items from passed items. Do not change global theme/cache/lazy-load configuration just to finish an upload.

Return the attachment/edit link, four saved fields, attachment status, format, dimensions and before/after bytes. Report any unverified checklist item. Uploading to Media Library creates a publicly accessible file even when its related article remains a draft; do not describe media uploads as private. No need to change Rank Math metadata unless separately requested.
