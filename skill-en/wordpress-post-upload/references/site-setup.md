# Website and credential setup

Use this guide on first use and when adding a website. There is no default website. Select the exact URL or site key supplied by the user before authenticated requests.

## 1. Ask for missing setup choices

Bundle missing items into one question:

- Exact HTTPS WordPress installation URL, including a subdirectory if applicable. Do not use an admin URL, REST URL or article URL; www versus non-www must match the actual configuration.
- A private configuration folder outside installed skill folders and publicly served directories. A local ignored `private-wordpress/` folder is supported; never include it in a public repository or manual ZIP.
- Existing env file path and optional prefix, or permission to create a blank template. Do not ask users to paste passwords into chat.
- Scope: posts, images, Rank Math, JetEngine relations or other integrations. An installed plugin is not automatically in scope.

Reuse current-task answers. If multiple sites fit, wait for the user to select one. Help beginners create blank files using the helper below.

## 2. Paths are placeholders, not hard-coded defaults

`SKILL_DIR`, `PRIVATE_ROOT`, `SITE_KEY` and `ENV_FILE` below must be replaced with the user's actual paths/key. They are not automatically expanded variables. Relative CLI paths are resolved from the current working directory; quote paths containing spaces.

For example, `D:/WordPressPrivate/references/sites/blog-a.json` in earlier instructions was only an illustration. No D: drive or blog-a profile is required. A local repository can keep its existing root `.env` and profiles under `./private-wordpress/references/sites/`. Moving credentials is not required.

All three skills share private profiles rather than duplicate credentials. Recommended structure for additional sites:

```text
PRIVATE_ROOT/
  .gitignore
  credentials/
    blog-a.env
    blog-b.env
  references/sites/
    blog-a.json
    blog-b.json
  receipts/
    blog-a/
    blog-b/
```

## 3. Initialize one website

A single-site env contains:

```dotenv
WORDPRESS_URL=https://example.com
WORDPRESS_USERNAME=
WORDPRESS_APPLICATION_PASSWORD=
```

The filename can be .env, blog-a.env or another explicit path. The helper does not search the working directory for credentials.

Create a blank env and profile (local only, no network):

```powershell
node SKILL_DIR/scripts/wp-setup.mjs init --root PRIVATE_ROOT --key blog-a --site https://example.com
```

Register an existing env without changing or copying it:

```powershell
node SKILL_DIR/scripts/wp-setup.mjs init --root PRIVATE_ROOT --key blog-a --site https://example.com --env ENV_FILE
```

The helper prints file paths and required variable names, not secrets. Existing env files are preserved. Existing site keys are rejected to prevent profile overwrite. New env files have blank username/password fields. If an existing env lives outside PRIVATE_ROOT, protect that file separately; the root's ignore rules do not cover external files.

## 4. Fill an Application Password locally

In WordPress, use Users → Profile → Application Passwords to create a named application credential. Enter the login username and Application Password in the local file. A display name/article author is not the login username. Do not use the main account password. Spaces in the Application Password may remain; quote values containing #.

Do not print the full env merely to inspect configuration. Scripts read it at runtime. Never put credentials in chat, shell history, screenshots, receipts or distributed skills. Env files are plaintext; .gitignore is neither encryption nor access control. If credentials were already committed or exposed, revoke that Application Password; adding ignore rules is not remediation.

Source: [WordPress Application Passwords](https://developer.wordpress.org/advanced-administration/security/application-passwords/).

## 5. Read-only connection check

```powershell
node SKILL_DIR/scripts/wp-setup.mjs check --profile PRIVATE_ROOT/references/sites/blog-a.json
```

This reads the API index and authenticated identity/capabilities. It checks HTTPS, matching profile/env URLs, authentication, post/media permissions and presence of Rank Math/JetEngine routes. It does not create a test post, upload an image, install/enable plugins or alter firewall settings.

Route presence is not proof of write permission. WebP upload/thumbnail support and metadata writes need separate verification during an authorized task. Save only verified observations and their dates in the private profile, not public templates. On 401 check credentials; on 403 inspect permissions/firewall; on 404 inspect installation URL/routes. Do not follow a redirect with credentials to another domain; resolve the correct URL first.

## 6. Add another website

Run init with a new key and URL, fill that site's credentials locally, then check:

```powershell
node SKILL_DIR/scripts/wp-setup.mjs init --root PRIVATE_ROOT --key blog-b --site https://example.org
node SKILL_DIR/scripts/wp-setup.mjs check --profile PRIVATE_ROOT/references/sites/blog-b.json
```

Without --env, a new file is created under credentials/blog-b.env. The existing root .env and other sites are unchanged. Select blog-b.json when the user names blog-b; ask when “the website” is ambiguous. Discover users, taxonomies, CPTs, plugins, relation IDs and timezone per site. Do not inherit another site's IDs or Rank Math/JetEngine scope.

## 7. Multiple websites in one env

Use unique prefixes, never repeated WORDPRESS_* blocks:

```dotenv
WP_BLOG_A_URL=https://example.com
WP_BLOG_A_USERNAME=
WP_BLOG_A_APPLICATION_PASSWORD=

WP_BLOG_B_URL=https://example.org
WP_BLOG_B_USERNAME=
WP_BLOG_B_APPLICATION_PASSWORD=
```

Register each profile against the same ENV_FILE:

```powershell
node SKILL_DIR/scripts/wp-setup.mjs init --root PRIVATE_ROOT --key blog-a --site https://example.com --env ENV_FILE --prefix WP_BLOG_A
node SKILL_DIR/scripts/wp-setup.mjs init --root PRIVATE_ROOT --key blog-b --site https://example.org --env ENV_FILE --prefix WP_BLOG_B
```

If the env file is new, only the first selected group is created. Later calls leave it untouched; the user adds the new group locally using [the template](../assets/multi-site.env.example). Duplicate variable names are rejected. A prefixed env requires explicit prefix selection; missing variables never fall back to another group or WORDPRESS_*.

Profiles remember env_file and env_prefix. When intentionally migrating an existing single-site env to prefixes, update that site's profile env_prefix too; do not migrate silently. Separate files remain the recommended default for new sites.

## 8. Execute using the selected profile

```powershell
node SKILL_DIR/scripts/wp-api.mjs --profile PRIVATE_ROOT/references/sites/blog-a.json --request request.json
```

GET/OPTIONS execute read-only; POST is dry-run until --apply. After the user requests the actual operation, add `--apply --receipt PRIVATE_ROOT/receipts/blog-a/operation-001.json`. Reuse existing authorization rather than asking again. Optional --site cross-checks the intended URL; mismatch fails before credentials are sent. Never combine --profile with --env or --prefix overrides.

Direct mode remains available: `--env ENV_FILE --site URL`, plus --prefix WP_BLOG_A for shared env. Prefixes start with WP_ and contain uppercase letters, digits or underscores. Env parsing does not interpolate shell variables or support multiline values.

## 9. Scope, editorial choices and sharing

For new articles ask missing status/date/time/timezone, author, categories, tags/no tags and featured image/no image choices. Reuse current-task/batch answers; narrow updates preserve unrelated fields. Image-only or SEO-only work asks only relevant questions.

Rank Math and JetEngine are optional per site and task. Setup does not install plugins, create CPTs, expose relations or change firewalls. Check the permissions needed for the task rather than assuming every user must be an Administrator.

Public folders contain only instructions, code and fictional templates. Keep real profiles, env files, receipts, backups and local image-check assets private. Ignore rules do not filter a manually created ZIP. Use the repository README for sharing instructions.

References: [single-site env](../assets/single-site.env.example), [multi-site env](../assets/multi-site.env.example), [profile schema](sites/template.md), [fictional website](sites/example.md).
