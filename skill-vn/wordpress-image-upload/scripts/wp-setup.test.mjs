import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { run, readEnv } from './wp-api.mjs';
import { initSite, checkSite } from './wp-setup.mjs';

function workspace(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wp-onboarding-'));
  t.after(() => fs.rmSync(root, { recursive: true }));
  return root;
}
test('new site creates blank local env and private reusable profile', t => {
  const root = workspace(t);
  const result = initSite({ root, key: 'blog-a', site: 'https://example.com/' });
  assert.equal(result.site, 'https://example.com');
  assert.equal(result.env_created, true);
  const content = fs.readFileSync(result.env_file, 'utf8');
  assert.match(content, /WORDPRESS_USERNAME=\nWORDPRESS_APPLICATION_PASSWORD=\n/);
  const profile = JSON.parse(fs.readFileSync(result.profile));
  assert.equal(path.resolve(path.dirname(result.profile), profile.env_file), result.env_file);
  assert.equal(profile.env_prefix, null);
  assert.throws(() => initSite({ root, key: 'blog-a', site: 'https://other.example' }), /already exists/);
});
test('existing env is never overwritten and separate site can be added', t => {
  const root = workspace(t);
  const env = path.join(root, 'existing.env');
  fs.writeFileSync(env, 'WORDPRESS_URL=https://example.com\nWORDPRESS_USERNAME=local-user\nWORDPRESS_APPLICATION_PASSWORD=not-a-real-secret\n');
  const before = fs.readFileSync(env, 'utf8');
  initSite({ root, key: 'a', site: 'https://example.com', env });
  initSite({ root, key: 'b', site: 'https://example.org' });
  assert.equal(fs.readFileSync(env, 'utf8'), before);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'references/sites/a.json'))).url, 'https://example.com');
});
test('shared env requires selection and reads only selected credentials', async t => {
  const root = workspace(t);
  const env = path.join(root, 'shared.env');
  fs.writeFileSync(env, 'WP_A_URL=https://example.com\nWP_A_USERNAME=user-a\nWP_A_APPLICATION_PASSWORD=fake-a\nWP_B_URL=https://example.org\nWP_B_USERNAME=user-b\nWP_B_APPLICATION_PASSWORD=fake-b\n');
  assert.throws(() => readEnv(env), /Select --prefix/);
  assert.throws(() => readEnv(env, 'WP_C'), /Missing selected-site/);
  const result = initSite({ root, key: 'b', site: 'https://example.org', env, prefix: 'WP_B' });
  let calls = 0;
  await run({ profile: result.profile, site: 'https://example.org/', request: { path: '/wp/v2/posts' } }, async (url, options) => {
    calls++;
    assert.equal(url.origin, 'https://example.org');
    assert.equal(options.headers.Authorization, 'Basic ' + Buffer.from('user-b:fake-b').toString('base64'));
    return new Response('[]');
  });
  assert.equal(calls, 1);
  await assert.rejects(run({ profile: result.profile, site: 'https://example.com', request: { path: '/' } }, () => assert.fail('Must not send credentials')), /does not match profile/);
  await assert.rejects(run({ env, prefix: 'WP_A', site: 'https://example.org', request: { path: '/' } }, () => assert.fail('Must not send credentials')), /does not match credential/);
});
test('duplicate variables rejected rather than last-wins behavior', t => {
  const root = workspace(t);
  const env = path.join(root, 'duplicate.env');
  fs.writeFileSync(env, 'WORDPRESS_URL=https://example.com\nWORDPRESS_URL=https://other.example\n');
  assert.throws(() => readEnv(env), /duplicate/);
});
test('setup check reads only and returns no password', async t => {
  const root = workspace(t);
  const result = initSite({ root, key: 'a', site: 'https://example.com/blog' });
  fs.writeFileSync(result.env_file, 'WORDPRESS_URL=https://example.com/blog\nWORDPRESS_USERNAME=user\nWORDPRESS_APPLICATION_PASSWORD=fake-pass\n');
  let calls = 0;
  const report = await checkSite(result.profile, async (url, options) => {
    calls++;
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'error');
    assert.ok(url.pathname.startsWith('/blog/wp-json/'));
    return new Response(JSON.stringify(calls === 1 ? { routes: { '/wp/v2/posts': {}, '/rankmath/v1/updateMeta': {} } } : { id: 5, capabilities: { edit_posts: true, upload_files: true } }));
  });
  assert.equal(calls, 2);
  assert.equal(report.writes_performed, false);
  assert.equal(report.can_edit_posts, true);
  assert.equal(report.can_publish_posts, false);
  assert.equal(report.rankmath_update_route_present, true);
  assert.equal(JSON.stringify(report).includes('fake-pass'), false);
});
