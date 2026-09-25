import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

export function readEnv(filename, prefix) {
  const env = Object.create(null);
  for (const line of fs.readFileSync(filename, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    let value = match[2];
    if (/^['"]/.test(value)) {
      const quote = value[0];
      const end = value.lastIndexOf(quote);
      if (end === 0 || !/^\s*(?:#.*)?$/.test(value.slice(end + 1))) throw Error('Invalid quoted env value');
      value = value.slice(1, end);
    } else value = value.replace(/\s+#.*$/, '').trim();
    if (Object.hasOwn(env, match[1])) throw Error('Invalid env: duplicate variable name');
    env[match[1]] = value;
  }
  if (prefix && !/^WP_[A-Z0-9_]+$/.test(prefix)) throw Error('Invalid prefix; use WP_BLOG_A without trailing field name');
  const groups = Object.keys(env).filter(k => /^WP_[A-Z0-9_]+_URL$/.test(k));
  if (!prefix && groups.length) throw Error('Select --prefix explicitly for a shared multi-site env');
  const selected = {};
  for (const field of ['URL', 'USERNAME', 'APPLICATION_PASSWORD']) {
    const key = (prefix || 'WORDPRESS') + '_' + field;
    if (!env[key]) throw Error('Missing selected-site variable: ' + key);
    selected['WORDPRESS_' + field] = env[key];
  }
  return selected;
}

export async function run(args, transport = fetch) {
  if (args.profile) {
    if (args.env || args.prefix) throw Error('Invalid options: profile cannot be combined with env/prefix overrides');
    const profilePath = path.resolve(args.profile);
    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    if (profile.schema_version !== 1 || typeof profile.env_file !== 'string' || typeof profile.url !== 'string') throw Error('Invalid site profile');
    const normalizeSite = value => new URL(value).href.replace(/\/$/, '');
    if (args.site && normalizeSite(args.site) !== normalizeSite(profile.url)) throw Error('Selected website does not match profile');
    args = { ...args, site: profile.url, env: path.resolve(path.dirname(profilePath), profile.env_file), prefix: profile.env_prefix || undefined };
  }
  const env = readEnv(args.env, args.prefix);
  const base = new URL(env.WORDPRESS_URL);
  const expected = new URL(args.site);
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw Error('Invalid HTTPS site URL');
  const normalize = url => url.href.replace(/\/$/, '');
  if (normalize(base) !== normalize(expected)) throw Error('Selected website does not match credential file');
  const request = typeof args.request === 'object' ? args.request : JSON.parse(fs.readFileSync(args.request, 'utf8'));
  const method = request.method || 'GET';
  if (!['GET', 'OPTIONS', 'POST'].includes(method)) throw Error('Supported methods: GET, OPTIONS, POST');
  if (typeof request.path !== 'string' || !/^\/(?:wp\/v2(?:\/|$)|rankmath\/v1(?:\/|$)|jet-rel(?:\/|$)|jet-engine\/v2(?:\/|$))/.test(request.path)) {
    if (request.path !== '/') throw Error('Use a supported path relative to wp-json');
  }
  if (/[\\#]/.test(request.path) || /(?:^|\/)\.{1,2}(?:\/|\?|$)/.test(request.path) || /%2e|%2f|%5c/i.test(request.path)) throw Error('Invalid REST path');
  const url = new URL(`${normalize(base)}/wp-json${request.path}`);
  if (url.origin !== base.origin) throw Error('Cross-origin request refused');
  if (method !== 'POST' && (request.body !== undefined || request.upload_file)) throw Error('Body requires POST');
  if (request.upload_file && request.body !== undefined) throw Error('Separate upload and metadata requests');
  if (method === 'POST' && request.path === '/') throw Error('Cannot POST API root');
  const headers = { Authorization: `Basic ${Buffer.from(`${env.WORDPRESS_USERNAME}:${env.WORDPRESS_APPLICATION_PASSWORD}`).toString('base64')}` };
  let body;
  if (request.upload_file) {
    if (request.path !== '/wp/v2/media') throw Error('Binary upload requires media route');
    const name = request.upload_name;
    const extensions = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
    const ext = path.extname(name || '').slice(1).toLowerCase();
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name || '') || !extensions[ext]) throw Error('Use an ASCII raster upload filename');
    const sourceExt = path.extname(request.upload_file).slice(1).toLowerCase();
    if (extensions[sourceExt] !== extensions[ext]) throw Error('Upload extension must match source format');
    body = fs.readFileSync(request.upload_file);
    headers['Content-Type'] = extensions[ext];
    headers['Content-Disposition'] = `attachment; filename="${name}"`;
  } else if (request.body !== undefined) {
    body = JSON.stringify(request.body);
    headers['Content-Type'] = 'application/json';
  }
  if (method === 'POST' && !args.apply) return { dry_run: true, site: normalize(base), method, path: request.path, body: request.body, upload_name: request.upload_name, bytes: request.upload_file ? body.length : undefined };
  let receipt;
  if (method === 'POST') {
    if (!args.receipt) throw Error('Writes require a unique --receipt path');
    // Exclusive creation prevents accidental replay, even after an ambiguous timeout.
    receipt = { state: 'pending', site: normalize(base), method, path: request.path, started: new Date().toISOString(), request_sha256: crypto.createHash('sha256').update(request.path).update(body || '').digest('hex') };
    fs.writeFileSync(args.receipt, JSON.stringify(receipt, null, 2), { flag: 'wx', mode: 0o600 });
  }
  const save = changes => {
    if (receipt) fs.writeFileSync(args.receipt, JSON.stringify({ ...receipt, ...changes }, null, 2), { mode: 0o600 });
  };
  let response, data;
  try {
    response = await transport(url, { method, headers, body, redirect: 'error', signal: AbortSignal.timeout(60000) });
    const raw = await response.text();
    try { data = JSON.parse(raw); } catch {
      save({ state: 'unknown', http_status: response.status, error: 'non_json_response', wordfence: /wordfence/i.test(raw) });
      throw Error(`HTTP ${response.status}: non-JSON response${/wordfence/i.test(raw) ? ' (Wordfence)' : ''}`);
    }
  } catch (error) {
    if (/^HTTP /.test(error.message)) throw error;
    save({ state: 'unknown', error: 'transport_or_response_failure' });
    throw Error('Request outcome unknown; inspect receipt and server before retrying');
  }
  save({ state: response.ok ? 'accepted' : 'failed', http_status: response.status, response: data });
  if (!response.ok) throw Error(`HTTP ${response.status}: request rejected; inspect receipt`);
  return { http_status: response.status, data };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = {};
    for (let i = 2; i < process.argv.length; i++) {
      const key = process.argv[i];
      if (key === '--apply') args.apply = true;
      else if (['--env', '--site', '--prefix', '--profile', '--request', '--receipt'].includes(key)) args[key.slice(2)] = process.argv[++i];
      else throw Error('Unknown option');
    }
    if ((!args.profile && (!args.env || !args.site)) || !args.request) throw Error('Usage: node wp-api.mjs (--profile FILE | --env FILE --site HTTPS_URL [--prefix WP_KEY]) --request JSON [--apply --receipt FILE]');
    console.log(JSON.stringify(await run(args), null, 2));
  } catch (error) {
    // No raw network errors, request headers or env values in console output.
    const safe = /^(Missing |Select --prefix|Invalid |Selected website|Supported methods|Use a |Body requires|Separate upload|Cannot POST|Cross-origin|Binary upload|Upload extension|Writes require|HTTP |Request outcome|Unknown option|Usage:)/.test(error.message);
    console.error(safe ? error.message : 'Local input or receipt error; no request replayed. Inspect file paths and existing receipts.');
    process.exitCode = 1;
  }
}
