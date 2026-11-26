// Unit tests for the tracker state machine: `npm run test:unit`
// Runs the real CLI against a throwaway copy of tracker/ (TRACKER_DIR), so the repo's tracker is never touched.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT } from './lib/tracker-lib';

let dir: string;
const cli = (...args: string[]) => {
  const r = spawnSync('npx', ['tsx', join(ROOT, 'scripts/tracker.ts'), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, TRACKER_DIR: dir, TRACKER_USER: 'unit-test' },
  });
  return { ok: r.status === 0, out: r.stdout + r.stderr };
};
const status = (id: string) => JSON.parse(readFileSync(join(dir, 'tests', `${id}.json`), 'utf8')).status;

before(() => {
  dir = mkdtempSync(join(tmpdir(), 'tracker-'));
  cpSync(join(ROOT, 'tracker'), dir, { recursive: true });
});
after(() => rmSync(dir, { recursive: true, force: true }));

test('publish creates tests from draft JSON blocks with story-based ids', () => {
  const draft = {
    draftId: 'TC-1',
    story: 'SD-104',
    title: '[UI][Sorting] Price low to high sorts numerically',
    priority: 'High',
    labels: ['ui', 'sorting', 'regression'],
    precondition: 'Logged in on Products',
    steps: [{ action: 'Choose Price (low to high)', expected: 'Prices are ascending' }],
  };
  const file = join(dir, 'drafts.md');
  writeFileSync(file, `# drafts\n\n\`\`\`json\n${JSON.stringify(draft)}\n\`\`\`\n`);
  const r = cli('publish', file);
  assert.ok(r.ok, r.out);
  assert.match(r.out, /TC-1 → SD-T-401/);
  assert.equal(status('SD-T-401'), 'Test Writing In Progress');
});

test('illegal transitions are refused', () => {
  const r = cli('move', 'SD-T-401', 'Automation');
  assert.equal(r.ok, false);
  assert.match(r.out, /Transition not allowed/);
});

test('Manual requires all three sign-offs', () => {
  assert.ok(cli('move', 'SD-T-401', 'Review Needed for Manual Test').ok);
  assert.ok(cli('signoff', 'SD-T-401', '--role', 'Primary QA').ok);
  assert.ok(cli('signoff', 'SD-T-401', '--role', 'Developer').ok);
  const early = cli('move', 'SD-T-401', 'Manual');
  assert.equal(early.ok, false);
  assert.match(early.out, /missing sign-off\(s\) from Second QA/);
  assert.ok(cli('signoff', 'SD-T-401', '--role', 'Second QA').ok);
  assert.ok(cli('move', 'SD-T-401', 'manual').ok); // status names are case-insensitive
  assert.equal(status('SD-T-401'), 'Manual');
});

test('Automation refuses specs that are still in the .temp sandbox', () => {
  assert.ok(cli('move', 'SD-T-401', 'Automation In Progress').ok);
  const r = cli('move', 'SD-T-401', 'Automation', '--spec', 'tests/.temp/test-SD-T-401-x.spec.ts');
  assert.equal(r.ok, false);
  assert.match(r.out, /still in tests\/\.temp/);
});

test('task board moves in order and records comments', () => {
  assert.equal(cli('move', 'AT-301', 'DONE').ok, false);
  assert.ok(cli('move', 'AT-301', 'in_progress').ok);
  assert.ok(cli('comment', 'AT-301', 'started').ok);
  const task = JSON.parse(readFileSync(join(dir, 'tasks', 'AT-301.json'), 'utf8'));
  assert.equal(task.status, 'IN PROGRESS');
  assert.equal(task.comments[0].text, 'started');
});
