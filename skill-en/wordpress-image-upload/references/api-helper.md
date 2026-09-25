# API helper

Requires Node.js 18+; no packages. Run `../scripts/wp-api.mjs` relative to this references folder. This helper is bundled locally with this skill. The helper issues one request; the agent follows the relevant skill to prepare metadata, resolve IDs and verify results.

Create UTF-8 request JSON with `apply_patch`. `path` is relative to `/wp-json`; no secrets in JSON. Prefer `--profile PRIVATE_ROOT/references/sites/SITE_KEY.json`. Direct mode also accepts `--env FILE --site URL`, with explicit `--prefix WP_BLOG_A` for a shared env. The selected profile URL, explicit --site when supplied, and selected env URL must match. Never combine --profile with --env/--prefix overrides. Domain and subdirectory must match exactly (trailing slash ignored).

```powershell
node PATH/wordpress-image-upload/scripts/wp-api.mjs --env PATH/website.env --site https://example.com --request PATH/request.json
```

Use `scripts/wp-setup.mjs init` and `check` as explained in [site setup](site-setup.md) for first use or a new website. Private profiles and receipts stay outside the public skill.

GET/OPTIONS execute read-only. POST is dry-run until `--apply` is provided. Once the user has authorized the operation and the request is ready, execute with `--apply --receipt PATH/unique-operation.receipt.json`. This is an execution flag, not a requirement to ask again. Receipt parent directory must exist. Use a separate request and unique receipt for each write step, scoped by site and task; keep these outside this skill source folder.

Receipts reserve the operation before sending. Existing receipt paths cannot be reused. On success the receipt contains returned IDs and response. On timeout/non-JSON response its outcome is unknown: inspect the target or recent posts/media, reconcile IDs and only then decide whether a new request is necessary. Never simply generate a new receipt to blindly retry a create/upload. A plugin's accepted response still needs independent readback where possible. Receipts can contain article text and should remain local.

## Request shapes

Read: `{ "method": "GET", "path": "/wp/v2/posts/123?context=edit" }`.

Discover: `{ "method": "GET", "path": "/" }` or OPTIONS `/wp/v2/posts`. After a configuration change, a fresh GET query can bypass a stale cache, not an authorization check.

Draft payload shape only; collect the post skill's required editorial choices before execution:

```json
{"method":"POST","path":"/wp/v2/posts","body":{"title":"Article title","content":"<p>Article content</p>","status":"draft"}}
```

Update uses `/wp/v2/posts/123` and only requested fields. New-post status must follow the user's current draft/publish/schedule choice. Do not put an ID from an example into a real request.

Upload:

```json
{"method":"POST","path":"/wp/v2/media","upload_file":"C:/path/photo.png","upload_name":"descriptive-image-name.png"}
```

The helper accepts PNG/JPEG/WebP/GIF filenames; inspect actual file content before upload. For other allowed formats use an appropriately validated client extension, not a fake extension. Update all four fields in a separate request:

```json
{"method":"POST","path":"/wp/v2/media/456","body":{"title":"...","alt_text":"...","caption":"...","description":"..."}}
```

Rank Math: POST `/rankmath/v1/updateMeta` with `{ "objectID":123, "objectType":"post", "meta":{ "rank_math_title":"...", "rank_math_description":"...", "rank_math_focus_keyword":"..." } }` as body.

Other integrations are outside this skill's scope unless explicitly requested and documented in the selected site profile.

The helper does not authorize actions, validate SEO quality, automatically retry, publish, calculate scores, transform images or reconcile duplicates on its own. These decisions belong to the active task and selected skill.
