// Unit tests for the tracker state machine: `npm run test:unit`
// Runs the real CLI against a throwaway copy of tracker/ (TRACKER_DIR), so the repo's tracker is never touched.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
  // Isolate from live practice data: tests below publish into SD-104 and expect ids from SD-T-401,
  // so the throwaway copy starts without any SD-104 tests the real tracker may already hold.
  for (const f of readdirSync(join(dir, 'tests'))) {
    if (/^SD-T-4\d\d\.json$/.test(f)) rmSync(join(dir, 'tests', f));
  }
  for (const f of readdirSync(join(dir, 'tasks'))) {
    if (/^AT-4\d\d\.json$/.test(f)) rmSync(join(dir, 'tasks', f)); // their tests were just removed
  }
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

test('update edits content, rejects protected fields, and resets sign-offs', () => {
  const draft = {
    draftId: 'TC-1',
    story: 'SD-104',
    title: '[UI][Sorting] Update target',
    priority: 'Low',
    labels: ['ui', 'sorting'],
    precondition: 'Logged in',
    steps: [{ action: 'Do the thing', expected: 'Thing is done' }],
  };
  const file = join(dir, 'drafts-update.md');
  writeFileSync(file, `\`\`\`json\n${JSON.stringify(draft)}\n\`\`\`\n`);
  const published = cli('publish', file);
  assert.ok(published.ok, published.out);
  const id = published.out.match(/→ (SD-T-\d+)/)![1]!;
  assert.ok(cli('move', id, 'Review Needed for Manual Test').ok);
  assert.ok(cli('signoff', id, '--role', 'Primary QA').ok);

  // protected fields cannot be patched from a file
  const patchFile = join(dir, 'patch.json');
  writeFileSync(patchFile, JSON.stringify({ status: 'Manual' }));
  const bad = cli('update', id, '--file', patchFile);
  assert.equal(bad.ok, false);
  assert.match(bad.out, /Invalid fields/);

  // a valid edit changes content AND resets the sign-off
  writeFileSync(patchFile, JSON.stringify({ title: '[UI][Sorting] Update target (reworded)' }));
  const ok = cli('update', id, '--file', patchFile, '--note', 'review feedback');
  assert.ok(ok.ok, ok.out);
  assert.match(ok.out, /1 existing sign-off\(s\) were reset/);
  const rec = JSON.parse(readFileSync(join(dir, 'tests', `${id}.json`), 'utf8'));
  assert.equal(rec.title, '[UI][Sorting] Update target (reworded)');
  assert.equal(rec.signoffs.length, 0);
  assert.match(rec.history.at(-1).note, /Edited: title \(1 sign-off\(s\) reset\) - review feedback/);
});

test('update refuses to edit a test once it is signed off (frozen)', () => {
  const patchFile = join(dir, 'patch2.json');
  writeFileSync(patchFile, JSON.stringify({ title: '[UI][Login] Sneaky rewrite after sign-off' }));
  const r = cli('update', 'SD-T-301', '--file', patchFile); // seeded as Manual
  assert.equal(r.ok, false);
  assert.match(r.out, /content is frozen/);
});

test('update with null clears an optional field (dataset)', () => {
  const patchFile = join(dir, 'patch3.json');
  writeFileSync(patchFile, JSON.stringify({ dataset: null }));
  const r = cli('update', 'SD-T-302', '--file', patchFile); // seeded as Manual -> frozen
  assert.equal(r.ok, false); // frozen wins even for harmless edits
  const draft = {
    draftId: 'TC-1',
    story: 'SD-104',
    title: '[UI][Sorting] Has a dataset',
    priority: 'Low',
    labels: ['ui', 'sorting'],
    precondition: 'Logged in',
    steps: [{ action: 'Do {{x}}', expected: 'Done {{x}}' }],
    dataset: [{ x: 'a' }],
  };
  const file = join(dir, 'drafts-null.md');
  writeFileSync(file, `\`\`\`json\n${JSON.stringify(draft)}\n\`\`\`\n`);
  const id = cli('publish', file).out.match(/→ (SD-T-\d+)/)![1]!;
  assert.ok(cli('update', id, '--file', patchFile).ok);
  assert.equal(JSON.parse(readFileSync(join(dir, 'tests', `${id}.json`), 'utf8')).dataset, undefined);
});

test('create-task needs a signed-off test, creates TO DO, and refuses duplicates', () => {
  // SD-T-301 is seeded as Manual but already has AT-301 -> duplicate refused
  const dup = cli('create-task', 'SD-T-301');
  assert.equal(dup.ok, false);
  assert.match(dup.out, /already has task AT-301/);

  // a test still in review cannot get a task
  const draft = {
    draftId: 'TC-1',
    story: 'SD-104',
    title: '[UI][Sorting] Task target',
    priority: 'Low',
    labels: ['ui', 'sorting'],
    precondition: 'Logged in',
    steps: [{ action: 'Do the thing', expected: 'Thing is done' }],
  };
  const file = join(dir, 'drafts-task.md');
  writeFileSync(file, `\`\`\`json\n${JSON.stringify(draft)}\n\`\`\`\n`);
  const id = cli('publish', file).out.match(/→ (SD-T-\d+)/)![1]!;
  const early = cli('create-task', id);
  assert.equal(early.ok, false);
  assert.match(early.out, /Only signed-off tests/);

  // sign off, then it works and the id follows the test number
  assert.ok(cli('move', id, 'Review Needed for Manual Test').ok);
  for (const role of ['Primary QA', 'Developer', 'Second QA'])
    assert.ok(cli('signoff', id, '--role', role).ok);
  assert.ok(cli('move', id, 'Manual').ok);
  const ok = cli('create-task', id, '--summary', 'Automate it');
  assert.ok(ok.ok, ok.out);
  const num = id.split('-').pop();
  const task = JSON.parse(readFileSync(join(dir, 'tasks', `AT-${num}.json`), 'utf8'));
  assert.equal(task.status, 'TO DO');
  assert.equal(task.testId, id);
  assert.equal(task.summary, 'Automate it');
});
