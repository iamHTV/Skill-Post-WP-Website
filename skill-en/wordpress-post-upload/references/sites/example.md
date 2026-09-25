# Fictional website: Garden Notes

This is an illustration, not a configured/live website or an executable profile. example.com, garden-demo and all paths below must be replaced. Never authenticate to the example domain with real credentials.

## Requested scope

Suppose a user wants to post gardening articles and images, use Rank Math if available, and skip JetEngine. These are illustrative choices, not defaults. No author, category, tag, featured image or publication time has been chosen yet; ask before creating an article.

## Private file layout

```text
PRIVATE_ROOT/
  credentials/garden-demo.env
  references/sites/garden-demo.json
```

garden-demo.env (fill actual values locally):

```dotenv
WORDPRESS_URL=https://example.com
WORDPRESS_USERNAME=
WORDPRESS_APPLICATION_PASSWORD=
```

garden-demo.json:

```json
{
  "schema_version": 1,
  "key": "garden-demo",
  "url": "https://example.com",
  "env_file": "../../credentials/garden-demo.env",
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

The env_file path is relative to the JSON. If the profile instead lives in REPO/private-wordpress/references/sites/ and credentials remain at REPO/.env, set env_file to "../../../.env". That is a layout example, not a fixed repository location.

For a shared env at REPO/.env, the same profile uses env_prefix "WP_GARDEN_DEMO" and the keys WP_GARDEN_DEMO_URL, WP_GARDEN_DEMO_USERNAME and WP_GARDEN_DEMO_APPLICATION_PASSWORD. Set the actual URL consistently in both places.

## Verification

Run the setup helper's check against the real private JSON after initialization. All capabilities above are unknown until verified. Record actual plugin support and selected scope in the private profile/companion notes, not this example. Discover IDs on the real website; do not invent them.

See [setup](../site-setup.md) for init/check commands and [schema](template.md) for field meanings.
