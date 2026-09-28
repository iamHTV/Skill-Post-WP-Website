# Schema writes and security blocks

Read for schema tasks or when Rank Math requests fail. Discover routes and permissions on the selected website; no example ID, slug or schema key is a default.

## Add or update a schema

1. GET the exact post with context=edit. Record its status, slug and unrelated fields. Inspect existing saved schemas through an available authorized editor/API before adding; distinguish a generated default schema from a saved schema record.
2. Discover POST /rankmath/v1/updateSchemas. Schema fields follow the plugin's current internal format, not arbitrary JSON-LD pasted into content. If the route is absent, report the missing capability; do not install a bridge or change plugin settings automatically.
3. New schemas use a fresh key beginning with new-. Updates use the existing schema-<meta_id> key belonging to this post. Never use new- to edit an existing record: that adds another schema. Preserve unrelated schemas; do not delete or replace them unless requested.
4. Send objectID, objectType "post" and schemas. Use the local [API helper](api-helper.md), one unique receipt per write. An uncertain response requires checking saved state before retrying; a new receipt alone is not permission to add a duplicate.
5. Save the returned mapping from new key to database meta ID. Read back independently and compare schema type and fields. A successful response or returned ID alone does not verify rendered JSON-LD. Keep drafts unpublished; on public posts inspect output for duplicate/incorrect entities when possible.

### Article example

Replace 123 with the confirmed post ID and new-article-example with a fresh local operation key. Use this shape only after confirming the selected plugin version supports it:

```json
{
  "method": "POST",
  "path": "/rankmath/v1/updateSchemas",
  "body": {
    "objectID": 123,
    "objectType": "post",
    "schemas": {
      "new-article-example": {
        "@type": "Article",
        "metadata": {
          "title": "Article",
          "type": "template",
          "isPrimary": true,
          "name": "%seo_title%",
          "description": "%seo_description%"
        },
        "headline": "%seo_title%",
        "description": "%seo_description%",
        "keywords": "%keywords%",
        "author": { "@type": "Person", "name": "%name%" }
      }
    }
  }
}
```

The variables are Rank Math placeholders resolved from the post. Retain supplied literal values when requested. Do not invent authors, dates, publisher logos, ratings or other facts. isPrimary=true is suitable for an intended primary Article, not an instruction to override an existing primary schema. If adding beside another schema, resolve the primary choice and preserve the rest. Only add a shortcode when needed, using a unique value.

A create response can look like {"new-article-example":456}; subsequent updates target "schema-456", not "new-article-example".

### Readback limitations

Prefer registered schema metadata or an authorized editor. updateSchemas returns IDs, not the full stored schema. updateMeta can return a schemas collection read from the database, but **it is a POST write route, not a read-only endpoint**. Empty meta may be rejected with HTTP 400.

For an already authorized schema mutation only, a version-verified fallback is updateMeta with meta.permalink equal to the post's freshly fetched current, nonempty slug. In the verified implementation this keeps an unchanged slug and returns stored schemas; it still runs plugin hooks and must use a receipt. Recheck the slug immediately before this call, never supply an old/example slug, and confirm post fields afterward. Do not use this fallback for a read-only audit or when concurrent editing/implementation behavior is uncertain. If no safe readback is available, report that limitation rather than changing an unrelated SEO field just to get a response.

## When requests are blocked

Warn users when relevant: security plugins, host WAFs or CDN rules can block legitimate Rank Math REST requests. A failed request does not automatically mean Rank Math lacks API support.

- 401: inspect authentication/Application Password handling.
- JSON 403: inspect the error code/message and user capabilities; it may be a permission issue, not a firewall.
- HTML/non-JSON 403 or an identifiable challenge/block page: inspect the security plugin, hosting/CDN firewall and matching logs. Do not claim Wordfence unless evidence identifies it.
- 400: inspect parameters/schema. 404: inspect site URL, REST routes and module availability. Do not recommend security exceptions for every error.

Stop repeated writes after a confirmed security block. Report site, exact route, time, HTTP status and a short sanitized diagnostic; never share Authorization headers, passwords or full sensitive logs. Explain whether any earlier steps succeeded and whether the latest outcome is unknown.

For Wordfence: Tools → Live Traffic → Blocked by Firewall; find the matching legitimate request and use "Add param to firewall allowlist". Review the exact URL/parameter under Firewall → All Firewall Options → Allowlisted URLs. Common routes for this workflow are:

- /wp-json/rankmath/v1/updateMeta
- /wp-json/rankmath/v1/updateSchemas

Allowlisting one route/parameter does not guarantee all future payloads are allowed, and does not replace WordPress authentication/capability checks. For other WAFs, ask the site administrator/host to examine the matching rule and make a narrow exception. Do not disable the whole firewall, allow all /wp-json/, bypass an access restriction, or change global settings without authorization.

Learning Mode is an optional user-approved, temporary diagnostic—not a default fix or a Rank Math-only switch. It reduces some protection across the site. If chosen, perform only legitimate required tasks, review learned exceptions and return to Enabled and Protecting promptly; avoid it on a site under attack.

After the user confirms the block was resolved, inspect current schemas again, then retry only the missing operation with a fresh receipt. Verify saved data and unchanged post status; do not blindly repeat new- creates.

Sources: [Rank Math shared REST implementation](https://github.com/rankmath/seo-by-rank-math/blob/master/includes/rest/class-shared.php), [schema defaults](https://github.com/rankmath/seo-by-rank-math/blob/master/includes/modules/schema/class-admin.php), [Wordfence allowlisting](https://rankmath.com/kb/whitelist-rank-math-in-wordfence/), [Learning Mode risks](https://www.wordfence.com/help/firewall/learning-mode/).
