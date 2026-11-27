// Unit tests for the guard hooks: `npm run test:unit`
// Guards are code — so they get tests like any other code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const run = (hook, stdin) => {
  const r = spawnSync('node', [join(here, hook)], { input: stdin, encoding: 'utf8' });
  return r.stdout ? JSON.parse(r.stdout).hookSpecificOutput.permissionDecision : 'pass';
};
const bash = (command) => JSON.stringify({ tool_name: 'Bash', tool_input: { command } });

test('tracker writes require human approval', () => {
  assert.equal(run('approval-gate.mjs', bash('npm run tracker -- move AT-301 "IN PROGRESS"')), 'ask');
  assert.equal(run('approval-gate.mjs', bash('npm run tracker -- publish artifacts/test-cases/x.md')), 'ask');
  assert.equal(run('approval-gate.mjs', bash('npm run tracker -- notify "hi"')), 'ask');
  assert.equal(run('approval-gate.mjs', bash('npm run tracker -- update SD-T-403 --file fix.json')), 'ask');
  assert.equal(run('approval-gate.mjs', bash('npm run tracker -- create-task SD-T-404')), 'ask');
});

test('tracker reads pass through', () => {
  assert.equal(run('approval-gate.mjs', bash('npm run tracker -- show SD-T-301')), 'pass');
  assert.equal(run('approval-gate.mjs', bash('npx playwright test --project=temp')), 'pass');
});

test('sign-offs and merges are human-only', () => {
  assert.equal(
    run('approval-gate.mjs', bash('npm run tracker -- signoff SD-T-401 --role Developer')),
    'deny',
  );
  assert.equal(run('approval-gate.mjs', bash('gh pr merge 12 --squash')), 'deny');
  assert.equal(run('approval-gate.mjs', bash('git push --force origin main')), 'deny');
});

test('git writes ask', () => {
  assert.equal(run('approval-gate.mjs', bash('git commit -m "test: add SD-T-301"')), 'ask');
  assert.equal(run('approval-gate.mjs', bash('gh pr create --fill')), 'ask');
});

test('tracker files cannot be edited directly, secrets are protected', () => {
  const edit = JSON.stringify({
    tool_name: 'Edit',
    tool_input: { file_path: '/repo/tracker/tests/SD-T-301.json' },
  });
  assert.equal(run('approval-gate.mjs', edit), 'deny');
  const env = JSON.stringify({ tool_name: 'Read', tool_input: { file_path: '/repo/.env' } });
  assert.equal(run('approval-gate.mjs', env), 'deny');
  const artifact = JSON.stringify({
    tool_name: 'Write',
    tool_input: { file_path: '/repo/artifacts/plans/p.md' },
  });
  assert.equal(run('approval-gate.mjs', artifact), 'pass');
});

test('fail-closed: malformed input is denied', () => {
  assert.equal(run('approval-gate.mjs', 'not json'), 'deny');
  assert.equal(run('no-temp-commit.mjs', '{}'), 'deny');
});

test('sandbox specs cannot be force-added', () => {
  assert.equal(run('no-temp-commit.mjs', bash('git add -f tests/.temp/test-SD-T-301-x.spec.ts')), 'deny');
  assert.equal(run('no-temp-commit.mjs', bash('git add tests/ui/checkout-SD-T-301.spec.ts')), 'pass');
});
