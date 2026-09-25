---
name: wordpress-post-upload
description: Create or update WordPress posts from supplied content, including authors, categories, inline images, featured images and optional site-specific relations. Use for requests to upload or edit articles on WordPress; coordinate image and Rank Math skills only when requested. Also use for first-time website setup, adding a website, or selecting per-site/shared env credentials for this workflow.
---

# WordPress post upload

## Select website and scope

Read [site setup](references/site-setup.md) and the private profile selected using [site index](references/sites/index.md). All required resources are inside this skill folder. Optional sibling skills can assist when installed; they are not required.

Resolve website, source content, create versus update, target post, draft/publish/schedule, and requested extras before writes. Infer choices already given in the session; ask only for material missing choices. A known website does not imply that every installed integration is in scope. A project mention in the article alone does not authorize linking a relation.

Before creating a post, ask the user to choose the following unless already explicitly specified for the current task or batch:

- Publication status and date/time: draft, publish now, or schedule at a specified date/time and timezone.
- Author.
- Categories.
- Tags, including the explicit choice of no tags.
- Featured image, including the explicit choice of no featured image. If an image is selected, ask whether it should also appear inline when that placement has not been specified.

Bundle missing choices into one concise question. Use live lookup results to offer actual author/category options where helpful. A past test, historical site profile, current API account or inferred article subject is not a substitute for the user's choices. Do not silently use the authenticated user as author, Uncategorized, inferred tags or a previous image. Explicit current-task or batch instructions such as “no tags”, “no image” or “use the defaults listed here” count as answers; do not ask again.

While awaiting required choices, read the article, inspect site capabilities and prepare a local payload. Do not create, publish, schedule or associate media until the required answers arrive. If the user explicitly delegates the choices, choose within that delegation and state the selections. For a narrow update, ask only about ambiguous requested changes; preserve unrelated existing fields instead of reopening every choice.

Offer draft as the default suggestion when publication intent is unspecified, but obtain the user's choice before creating the post. Explicit permission to publish or schedule is sufficient: do not ask again. For updates, preserve the current status and fields outside the requested changes. Existing examples in a site profile are not universal defaults.

## Prepare and execute

1. Read the supplied article completely. Preserve approved wording; uploading does not imply a full rewrite. Convert Markdown to suitable HTML/Gutenberg blocks if needed; do not submit literal Markdown as HTML. Keep the post title separate from body headings; avoid a duplicate H1.
2. Discover the correct post type and REST base. Resolve author, category and tag names against that site's actual IDs. If a search yields multiple plausible matches, resolve before attaching. Do not create users/categories merely because a name was not found.
3. For updates, GET the exact post with `context=edit`; use `content.raw` and preserve existing block attributes. Never identify an existing post solely by an old slug after a user has renamed it. For creates, keep the returned post ID in the working record immediately; resume later steps by that ID.
4. Send the smallest WordPress payload. Use `POST /wp/v2/posts` for new standard posts and `POST /wp/v2/posts/{id}` for updates. Discover equivalent CPT routes. Category assignment replaces the category list: merge or replace according to the request. Scheduling needs an unambiguous date and timezone.
5. If image work is requested, use the optional `wordpress-image-upload` skill if installed, or follow [image operations](references/image-operations.md). A WordPress featured image is an attachment ID, not a URL. For “under the title”, insert an image block at the beginning of `content.raw`; do not alter the theme. Use the attachment's URL, alt and optional caption. Check for an existing matching image before insertion. Mention any unverified theme-dependent placement rather than claiming a front-end check.
6. If SEO work is requested, use the optional `wordpress-rankmath-seo` skill if installed, or follow [Rank Math operations](references/rankmath-operations.md). If optional relations are requested, read [JetEngine](references/jetengine.md). Skip integrations outside scope.
7. GET the post again. Verify title, slug, status, selected date/time, requested author/categories/tags, body and featured_media. Read back relations separately. For published posts, check rendered output when relevant. Do not publish a draft merely to inspect it.

Use the [API helper](references/api-helper.md) for repeatable requests. Each write is a separate operation with a receipt; no automatic create retry after a timeout. Metadata or relation failure does not undo a successful draft automatically. Report the completed steps and the remaining blocker.

## Handoff

Return the edit URL, final publication status and requested fields changed. Distinguish verified data from successful write responses that could not be independently read. Do not claim a SEO score or live layout was checked unless it was.
