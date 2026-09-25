import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { run } from './wp-api.mjs';

export function initSite(args) {
  if (!args.root || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.key || '')) throw Error('Provide --root PRIVATE_FOLDER and --key lowercase-site-key');
  const site = new URL(args.site);
  if (site.protocol !== 'https:' || site.username || site.password || site.search || site.hash || /\/(wp-admin|wp-json)(\/|$)/.test(site.pathname)) throw Error('Use the HTTPS WordPress installation URL, not wp-admin or wp-json');
  const url = site.href.replace(/\/$/, '');
  if (args.prefix && !/^WP_[A-Z0-9_]+$/.test(args.prefix)) throw Error('Use a prefix such as WP_BLOG_A');
  const root = path.resolve(args.root);
  const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  if (root === skillRoot || root.startsWith(skillRoot + path.sep)) throw Error('Private configuration must be outside the installed skill folder');
  const profiles = path.join(root, 'references', 'sites');
  const profilePath = path.join(profiles, args.key + '.json');
  if (fs.existsSync(profilePath)) throw Error('Site key already exists; select that profile or use a new key');
  const envFile = args.env ? path.resolve(args.env) : path.join(root, 'credentials', args.key + '.env');
  fs.mkdirSync(profiles, { recursive: true });
  fs.mkdirSync(path.join(root, 'receipts', args.key), { recursive: true });
  const ignore = path.join(root, '.gitignore');
  if (!fs.existsSync(ignore)) fs.writeFileSync(ignore, '*\n!.gitignore\n', { flag: 'wx' });
  const prefix = args.prefix || 'WORDPRESS';
  const variableNames = ['URL', 'USERNAME', 'APPLICATION_PASSWORD'].map(f => prefix + '_' + f);
  let envCreated = false;
  if (!fs.existsSync(envFile)) {
    fs.mkdirSync(path.dirname(envFile), { recursive: true });
    fs.writeFileSync(envFile, `# Fill values locally; do not share this file.\n${variableNames[0]}=${url}\n${variableNames[1]}=\n${variableNames[2]}=\n`, { flag: 'wx', mode: 0o600 });
    envCreated = true;
  }
  const profile = {
    schema_version: 1, key: args.key, url,
    env_file: path.relative(profiles, envFile).split(path.sep).join('/'),
    env_prefix: args.prefix || null,
    capabilities: { checked_at: null, rankmath: 'unknown', jetengine: 'unknown', webp: 'unknown' },
    task_defaults: null,
  };
  fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), { flag: 'wx', mode: 0o600 });
  return { profile: profilePath, site: url, env_file: envFile, env_created: envCreated, required_variables: variableNames, next: envCreated ? 'Fill username and Application Password locally, then run check.' : 'Existing env left unchanged. Ensure the selected variables exist, then run check.' };
}

export async function checkSite(profilePath, transport = fetch) {
  const options = { profile: profilePath };
  const index = await run({ ...options, request: { path: '/' } }, transport);
  const identity = await run({ ...options, request: { path: '/wp/v2/users/me?context=edit&_fields=id,name,capabilities' } }, transport);
  const routes = index.data.routes || {};
  const caps = identity.data.capabilities || {};
  const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
  return {
    site: profile.url, key: profile.key, authenticated_user_id: identity.data.id,
    can_edit_posts: !!caps.edit_posts, can_publish_posts: !!caps.publish_posts, can_upload_files: !!caps.upload_files,
    post_route_present: !!routes['/wp/v2/posts'], rankmath_update_route_present: !!routes['/rankmath/v1/updateMeta'],
    relation_routes: Object.keys(routes).filter(k => k.startsWith('/jet-rel/')),
    webp: 'not verified by read-only setup',
    checked_at: new Date().toISOString(), writes_performed: false,
    note: 'Route presence is not proof of plugin write permission. Discover permissions and schemas for the requested task.',
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const command = process.argv[2];
    const args = {};
    for (let i = 3; i < process.argv.length; i += 2) {
      const option = process.argv[i];
      if (!['--root', '--key', '--site', '--env', '--prefix', '--profile'].includes(option) || !process.argv[i + 1]) throw Error('Invalid arguments');
      args[option.slice(2)] = process.argv[i + 1];
    }
    if (command === 'init') console.log(JSON.stringify(initSite(args), null, 2));
    else if (command === 'check' && args.profile) console.log(JSON.stringify(await checkSite(args.profile), null, 2));
    else throw Error('Usage: wp-setup.mjs init --root PRIVATE_FOLDER --key SITE_KEY --site HTTPS_URL [--env FILE --prefix WP_KEY] | check --profile FILE');
  } catch (error) {
    const safe = /^(Provide |Use |Private configuration|Site key|Invalid arguments|Usage:|Missing |Select --prefix|Selected website|Invalid HTTPS|Invalid site profile|Invalid env|HTTP |Request outcome)/.test(error.message);
    console.error(safe ? error.message : 'Setup failed; inspect configuration paths and URL. No secret values printed.');
    process.exitCode = 1;
  }
}
