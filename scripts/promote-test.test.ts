// Unit test for the promotion gate: `npm run test:unit`
// A generated spec that passes the banned-pattern scan but breaks an ESLint rule must NOT leave the sandbox.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/tracker-lib';

test('promote-test refuses a spec that fails ESLint and leaves it in tests/.temp', () => {
  const rel = 'tests/.temp/test-SD-T-999-lint-probe.spec.ts';
  const abs = join(ROOT, rel);
  // No banned patterns here, but `expect(await …isVisible()).toBe(true)` is a non-retrying assertion:
  // playwright/prefer-web-first-assertions must reject it.
  writeFileSync(
    abs,
    `import { test, expect } from '@fixtures';

test('SD-T-999 lint probe', async ({ page }) => {
  expect(await page.getByTestId('title').isVisible()).toBe(true);
});
`,
  );
  try {
    const r = spawnSync('npx', ['tsx', join(ROOT, 'scripts/promote-test.ts'), rel], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    assert.notEqual(r.status, 0, 'promotion must fail');
    assert.match(r.stdout + r.stderr, /ESLint failed/);
    assert.ok(existsSync(abs), 'the spec must stay in the sandbox');
  } finally {
    rmSync(abs, { force: true });
  }
});
