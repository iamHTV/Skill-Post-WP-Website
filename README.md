# Skill-Post-WP-Website

[English](README.md) | [Tiếng Việt](README.vn.md)

Three independent AI-agent skills for posting to multiple WordPress websites, uploading SEO-friendly images, and managing Rank Math metadata.

## Skills

| Skill | What it does |
| --- | --- |
| [wordpress-post-upload](skill-en/wordpress-post-upload/SKILL.md) | Create/update posts, select authors/categories/tags, schedule publication, attach images, and optionally manage JetEngine relations. |
| [wordpress-image-upload](skill-en/wordpress-image-upload/SKILL.md) | Inspect images/read visible text, optimize WebP, write media title/alt/caption/description, upload and attach images. |
| [wordpress-rankmath-seo](skill-en/wordpress-rankmath-seo/SKILL.md) | Set or optimize Rank Math SEO title, description and focus keywords; verify supported metadata. |

Choose `skill-en/` for English instructions or `skill-vn/` for Vietnamese. Both use the same scripts and skill names. **Install only one language version of each skill.** Article language follows your request, not the instruction language.

## Installation

Download/clone this repository. Copy the complete individual skill folders you need into the skills directory supported by your agent application. Keep their scripts, references and assets together. Each skill works independently.

Requirements:

- Node.js 18+ for the REST API helpers.
- Python 3 and Pillow with WebP support for image conversion.
- An HTTPS WordPress website and an Application Password with the permissions needed for your task.

`agents/openai.yaml` contains UI metadata, not a background service. Website examples under each skill's `references/sites/example.md` are fictional, not preset targets.

## Repository and local configuration

```text
README.md                      # English
README.vn.md                   # Vietnamese
credentials/
  website-a.env.example        # blank public template
  website-b.env.example        # blank public template
skill-en/                      # three English skills
skill-vn/                      # three Vietnamese skills
```

Created locally during setup, **never committed**:

```text
credentials/website-a.env
credentials/website-b.env
private-wordpress/references/sites/website-a.json
private-wordpress/references/sites/website-b.json
private-wordpress/receipts/
```

All three skills share these private profiles and credentials. Passwords do not belong inside installed skill folders.

## First website

Tell your agent:

> Set up my WordPress website using credentials/website-a.env and private-wordpress for profiles. Use posts, images and Rank Math; skip JetEngine.

The agent asks for the exact URL and missing scope choices, creates a blank env if necessary, and helps you verify the connection. You can also copy website-a.env.example to website-a.env yourself. Fill the values in a local editor, **not in chat**:

```dotenv
WORDPRESS_URL=
WORDPRESS_USERNAME=
WORDPRESS_APPLICATION_PASSWORD=
```

Use the actual WordPress installation URL (including a subdirectory if needed), login username and an Application Password—not your main account password or an author's display name.

From the repository root, replace the example URL with your own:

```powershell
node ./skill-en/wordpress-post-upload/scripts/wp-setup.mjs init --root ./private-wordpress --key website-a --site https://example.com --env ./credentials/website-a.env
```

If the env already exists, init leaves it unchanged. Fill all three values, then check:

```powershell
node ./skill-en/wordpress-post-upload/scripts/wp-setup.mjs check --profile ./private-wordpress/references/sites/website-a.json
```

Init is local only; check reads the API without creating posts, uploading images or changing plugins/firewalls. Existing profile keys are not overwritten.

## Add another website

Use credentials/website-b.env with a separate profile:

```powershell
node ./skill-en/wordpress-post-upload/scripts/wp-setup.mjs init --root ./private-wordpress --key website-b --site https://example.org --env ./credentials/website-b.env
```

Fill that file locally, then run check against private-wordpress/references/sites/website-b.json. Site A remains unchanged. Additional sites use new keys/files.

You can instead use one shared env with unique groups such as WP_BLOG_A_URL / WP_BLOG_A_USERNAME / WP_BLOG_A_APPLICATION_PASSWORD and WP_BLOG_B_*. Register each profile with the same --env and its own --prefix WP_BLOG_A or WP_BLOG_B. Duplicate variable names and URL mismatches are rejected; no fallback to another site's credentials.

See [full setup](skill-en/wordpress-post-upload/references/site-setup.md), [multi-site template](skill-en/wordpress-post-upload/assets/multi-site.env.example) and [fictional website](skill-en/wordpress-post-upload/references/sites/example.md).

## Paths and workflow

No drive or website is hard-coded. Choose paths with --root, --env and --profile. CLI relative paths use the current working directory; env_file inside a JSON profile is relative to that profile. SKILL_DIR, PRIVATE_ROOT and SITE_KEY in reference documents are placeholders, not automatically expanded variables.

For new posts, the agent asks for missing publication status/date/time/timezone, author, categories, tags and featured-image choices. Existing answers are reused; narrow updates preserve unrelated fields.

Rank Math and JetEngine are optional per website and requested scope. Setup does not install plugins or expose relation endpoints automatically. Route presence does not prove write permission. SEO scores and rankings are not guaranteed.

Image uploads prioritize WebP when supported, compare candidates, preserve originals and require visual review for readability. Uploaded media may be publicly accessible even when its article is a draft.

## Security and sharing

Only blank .env.example templates are tracked. Real .env files, private-wordpress, receipts, local image-check data and legacy site-specific test scripts are excluded. Never force-add them. .gitignore does not remove secrets already committed and does not filter a manually created ZIP. Revoke exposed Application Passwords.

Do not add secrets to public site examples or screenshots. Profiles select a website; they do not authorize publishing or unrelated configuration changes.

## Tests

From the repository root:

```powershell
node --test ./skill-en/wordpress-post-upload/scripts/wp-api.test.mjs ./skill-en/wordpress-post-upload/scripts/wp-setup.test.mjs
python -B -m unittest discover -s ./skill-en/wordpress-image-upload/scripts -p test_optimize_webp.py
```

API/setup tests exist in all three skills and both language versions. They use local fixtures, not live website credentials.
