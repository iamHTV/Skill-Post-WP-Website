---
name: wordpress-rankmath-seo
description: Optimize and update Rank Math SEO metadata on selected WordPress posts, including SEO title, description and focus keywords, with optional canonical, robots, social metadata or schema when supported and requested. Use for Rank Math work, not merely uploading an article unchanged. Also use for first-time website setup, adding a website, or selecting per-site/shared env credentials for this workflow.
---

# WordPress Rank Math SEO

Read [site setup](references/site-setup.md) and the private profile selected using [site index](references/sites/index.md). All required resources are inside this skill folder; no sibling folder is required.

## Establish scope and capability

Resolve website, exact post(s), optimize versus set literal values, and requested fields. Read the actual article and existing SEO data where available. Respect literal test values. SEO title and WordPress post title are different: do not change the latter unless requested or already agreed. Resolve ambiguous “title” from context or ask if consequential.

Check the site's routes and active plugin, not just historical profile notes. If Rank Math is absent, report the missing capability; ordinary SEO work does not authorize installing/activating a plugin, migrating another SEO plugin or changing site-wide settings.

## Optimize content-facing fields

Write a distinct SEO title and accurate description aligned with the article's subject and search intent. Use focus keywords naturally; do not promise rankings or fabricate facts to satisfy plugin checks. Character counts are guidance, not pass/fail requirements. Suggest substantive article edits when useful, but apply only within the user's editing scope.

Normally set `rank_math_title`, `rank_math_description`, `rank_math_focus_keyword`. For optional canonical, robots, social fields or schema, inspect current types and site configuration first. Avoid overriding automatic canonical/robots behavior without a concrete reason. Rank Math schema storage is structured plugin data; do not place arbitrary JSON-LD into a guessed meta key or create duplicate schemas.

## Write through the supported route

Use [API helper](references/api-helper.md).

- If `/rankmath/v1/updateMeta` exists and permissions allow it, POST `{ "objectID": POST_ID, "objectType": "post", "meta": { "rank_math_title": "...", "rank_math_description": "...", "rank_math_focus_keyword": "..." } }`. This plugin route was tested on one profile; discover it on each new site and treat compatibility as version-specific.
- Alternatively use the normal WordPress post `meta` payload only if the fields are registered in its REST schema with appropriate write access. Do not assume an HTTP success on the post proves unknown metadata was saved.
- If neither works, explain the required narrowly scoped metadata registration/bridge. Do not install snippets, expose every meta field, or edit theme code merely to avoid reporting the dependency.

Send only requested keys. Empty values may delete Rank Math metadata; omit unmodified keys. Never set `rank_math_seo_score` to an invented number. A saved keyword does not automatically recalculate the analysis score.

## Verify and report precisely

Prefer independent metadata readback using registered REST fields or an authorized editor view. If only the plugin's successful write response is available, state “API accepted the update; independent readback unavailable”. Do not turn this into a mandatory user approval step.

For public posts, inspect rendered title, description, canonical, robots and applicable schema. The optional `/rankmath/v1/getHead?url=...` reads generated head tags when Headless CMS Support is enabled; it does not enable metadata writes. Do not enable headless support or publish a draft just for verification.

Rank Math's score may require opening the editor or running its Recalculate Scores tool. Site-wide recalculation is outside a single-post task unless authorized. Score is a plugin analysis signal, not a Google ranking guarantee.

For a 403 or non-JSON firewall page, stop repeated writes and report the route and blocker. On Wordfence, use the blocked request in Live Traffic to identify the precise allowlist entry; do not disable protection globally. Retry when the user has resolved the block. A fresh query parameter can distinguish a cached GET result after settings change, but is not a means to evade an access restriction.

Sources to consult for version-dependent details: [Rank Math metadata route source](https://github.com/rankmath/seo-by-rank-math/blob/master/includes/rest/class-shared.php), [metadata registration](https://developer.wordpress.org/rest-api/extending-the-rest-api/modifying-responses/), [SEO scores](https://rankmath.com/kb/seo-score-not-available/), [Wordfence allowlist](https://rankmath.com/kb/whitelist-rank-math-in-wordfence/).
