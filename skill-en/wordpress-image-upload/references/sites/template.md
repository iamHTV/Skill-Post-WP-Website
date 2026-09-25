# Private site profile schema

Create actual profiles outside the distributable skill, using scripts/wp-setup.mjs init. Example content (not runnable credentials):

```json
{
  "schema_version": 1,
  "key": "blog-a",
  "url": "https://example.com",
  "env_file": "../../credentials/blog-a.env",
  "env_prefix": null,
  "capabilities": {
    "checked_at": null,
    "rankmath": "unknown",
    "jetengine": "unknown",
    "webp": "unknown"
  },
  "task_defaults": null
}
```

The env_file is resolved relative to this JSON file, not the shell working directory. Absolute env paths also work. A shared env profile uses env_prefix such as WP_BLOG_A. Never store passwords or copied env contents in this JSON.

Store verified post type routes, user/category lookup notes, timezone, WebP upload/thumbnail support, dimensions and optional relation IDs in the private profile when useful. Keep stale observations separate from current verified capabilities. Do not turn historical test IDs into defaults. Credentials define the API account, not the chosen article author.
