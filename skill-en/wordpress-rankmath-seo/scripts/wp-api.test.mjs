import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from './wp-api.mjs';

function fixture(t, request) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wp-skill-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true }));
  fs.writeFileSync(path.join(dir, '.env'), 'WORDPRESS_URL=https://example.com\nWORDPRESS_USERNAME=test-user\nWORDPRESS_APPLICATION_PASSWORD="test-only-password"\n');
  fs.writeFileSync(path.join(dir, 'request.json'), JSON.stringify(request));
  return { env: path.join(dir, '.env'), site: 'https://example.com', request: path.join(dir, 'request.json'), receipt: path.join(dir, 'receipt.json') };
}
test('POST dry-run never calls transport or reserves a receipt', async t => {
  const args = fixture(t, { method: 'POST', path: '/wp/v2/posts', body: { title: 'Tiếng Việt', status: 'draft' } });
  const result = await run(args, () => assert.fail('Unexpected network'));
  assert.equal(result.dry_run, true);
  assert.equal(result.body.title, 'Tiếng Việt');
  assert.equal(fs.existsSync(args.receipt), false);
});
test('website mismatch rejects before sending credentials', async t => {
  const args = fixture(t, { path: '/wp/v2/posts' });
  args.site = 'https://other.example';
  await assert.rejects(run(args, () => assert.fail('Unexpected network')), /does not match/);
});
test('accepted create records ID and refuses replay', async t => {
  const args = { ...fixture(t, { method: 'POST', path: '/wp/v2/posts', body: { status: 'draft' } }), apply: true };
  let calls = 0;
  const mock = async (url, options) => {
    calls++;
    assert.equal(url.href, 'https://example.com/wp-json/wp/v2/posts');
    assert.equal(options.redirect, 'error');
    return new Response(JSON.stringify({ id: 321, status: 'draft' }), { status: 201 });
  };
  await run(args, mock);
  const receipt = JSON.parse(fs.readFileSync(args.receipt));
  assert.equal(receipt.response.id, 321);
  assert.equal(receipt.state, 'accepted');
  assert.equal(JSON.stringify(receipt).includes('test-only-password'), false);
  await assert.rejects(run(args, mock));
  assert.equal(calls, 1);
});
test('timeout keeps uncertain operation reserved', async t => {
  const args = { ...fixture(t, { method: 'POST', path: '/wp/v2/media', body: { title: 'x' } }), apply: true };
  await assert.rejects(run(args, async () => { throw Error('timeout'); }), /outcome unknown/);
  assert.equal(JSON.parse(fs.readFileSync(args.receipt)).state, 'unknown');
  await assert.rejects(run(args, () => assert.fail('Must not replay')));
});
test('firewall response identified without dumping HTML', async t => {
  const args = { ...fixture(t, { method: 'POST', path: '/rankmath/v1/updateMeta', body: { objectID: 321 } }), apply: true };
  await assert.rejects(run(args, async () => new Response('<html>Wordfence blocked</html>', { status: 403 })), /403.*Wordfence/);
  const receipt = JSON.parse(fs.readFileSync(args.receipt));
  assert.equal(receipt.wordfence, true);
  assert.equal(receipt.response, undefined);
});
