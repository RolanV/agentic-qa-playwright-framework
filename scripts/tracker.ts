/**
 * npm run tracker -- <command>
 *
 * READ (never needs approval):
 *   list [tests|tasks|stories|epics]      overview table
 *   show <ID>                             full record (epic, story, test or task)
 *
 * WRITE (gated: .claude/settings.json "ask" + approval-gate hook):
 *   move <ID> "<STATUS>" [--note "..."] [--spec path]   transition a test or task
 *   signoff <TEST-ID> --role "Primary QA" [--by name]   record one of the 3 sign-offs
 *   update <TEST-ID> --file fields.json [--note "..."]   edit content; null clears gherkin/dataset; resets sign-offs
 *   create-task <TEST-ID> [--summary "..."]             add an automation task (TO DO) for a signed-off test
 *   comment <ID> "<text>"                              add a comment to a task
 *   publish <artifact.md> [--select TC-1,TC-3]          create tests from draft cases (Step 3)
 *   notify "<message>" [--channel qa-automation]        mock Slack post (Step 8)
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { userInfo } from 'node:os';
import {
  ROOT,
  TRACKER,
  TEST_STATUSES,
  TASK_STATUSES,
  TEST_TRANSITIONS,
  TASK_TRANSITIONS,
  SIGNOFF_ROLES,
  DraftTestCaseSchema,
  TestCaseSchema,
  TestCaseEditSchema,
  TaskSchema,
  EDITABLE_STATUSES,
  loadDocs,
  loadTests,
  loadTasks,
  testPath,
  taskPath,
  saveJson,
  now,
  matchStatus,
  type TestCase,
  type Task,
} from './lib/tracker-lib';

const [, , cmd, ...rest] = process.argv;

function flag(name: string): string | undefined {
  const i = rest.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const value = rest[i + 1];
  rest.splice(i, 2);
  return value;
}

const actor = () => flag('by') ?? process.env.TRACKER_USER ?? userInfo().username;

function fail(msg: string): never {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function table(rows: Record<string, string>[]): void {
  if (rows.length === 0) return console.log('(none)');
  const cols = Object.keys(rows[0]!);
  const width = cols.map((c) => Math.max(c.length, ...rows.map((r) => (r[c] ?? '').length)));
  const line = (r: Record<string, string>) => cols.map((c, i) => (r[c] ?? '').padEnd(width[i]!)).join('  ');
  console.log(line(Object.fromEntries(cols.map((c) => [c, c.toUpperCase()]))));
  rows.forEach((r) => console.log(line(r)));
}

function findTest(id: string): TestCase | undefined {
  return loadTests().find((t) => t.id === id);
}
function findTask(id: string): Task | undefined {
  return loadTasks().find((t) => t.id === id);
}

const commands: Record<string, () => void> = {
  list() {
    const what = rest[0] ?? 'tests';
    if (what === 'tests') {
      table(
        loadTests().map((t) => ({
          id: t.id,
          story: t.story,
          status: t.status,
          spec: t.automation?.spec ?? '-',
          title: t.title,
        })),
      );
    } else if (what === 'tasks') {
      table(loadTasks().map((t) => ({ id: t.id, test: t.testId, status: t.status, summary: t.summary })));
    } else if (what === 'stories' || what === 'epics') {
      table(
        loadDocs(what).map((d) => ({
          id: d.id,
          status: d.meta.status ?? '',
          epic: d.meta.epic ?? '',
          title: d.meta.title ?? '',
        })),
      );
    } else fail(`Unknown list target "${what}"`);
  },

  show() {
    const id = rest[0] ?? fail('Usage: show <ID>');
    const doc = [...loadDocs('epics'), ...loadDocs('stories')].find((d) => d.id === id);
    if (doc) return console.log(readFileSync(doc.file, 'utf8'));
    const record = findTest(id) ?? findTask(id);
    if (!record) fail(`No record with id ${id}`);
    console.log(JSON.stringify(record, null, 2));
  },

  move() {
    const [id, statusInput] = [rest[0], rest[1]];
    if (!id || !statusInput) fail('Usage: move <ID> "<STATUS>" [--note ...] [--spec path]');
    const note = flag('note');
    const spec = flag('spec');
    const by = actor();

    const test = findTest(id);
    if (test) {
      const to =
        matchStatus(statusInput, TEST_STATUSES) ??
        fail(`Unknown test status "${statusInput}". Valid: ${TEST_STATUSES.join(' | ')}`);
      if (!TEST_TRANSITIONS[test.status].includes(to)) {
        fail(
          `Transition not allowed: "${test.status}" → "${to}". Allowed: ${TEST_TRANSITIONS[test.status].join(', ') || 'none'}`,
        );
      }
      if (to === 'Manual') {
        const missing = SIGNOFF_ROLES.filter((r) => !test.signoffs.some((s) => s.role === r));
        if (missing.length) fail(`Cannot move to Manual: missing sign-off(s) from ${missing.join(', ')}`);
      }
      if (to === 'Automation') {
        const path =
          spec ?? test.automation?.spec ?? fail('Moving to Automation requires --spec <committed spec path>');
        if (path.includes('.temp'))
          fail('Spec is still in tests/.temp — promote it first (npm run promote-test)');
        if (!existsSync(join(ROOT, path))) fail(`Spec not found: ${path}`);
        if (!readFileSync(join(ROOT, path), 'utf8').includes(test.id))
          fail(`Spec ${path} does not reference ${test.id}`);
        test.automation = { spec: path };
      }
      test.history.push({ at: now(), by, from: test.status, to, note });
      console.log(`✔ ${id}: ${test.status} → ${to}`);
      test.status = to;
      return saveJson(testPath(id), TestCaseSchema.parse(test));
    }

    const task = findTask(id);
    if (task) {
      const to =
        matchStatus(statusInput, TASK_STATUSES) ??
        fail(`Unknown task status "${statusInput}". Valid: ${TASK_STATUSES.join(' | ')}`);
      if (!TASK_TRANSITIONS[task.status].includes(to))
        fail(`Transition not allowed: "${task.status}" → "${to}"`);
      task.history.push({ at: now(), by, from: task.status, to, note });
      console.log(`✔ ${id}: ${task.status} → ${to}`);
      task.status = to;
      return saveJson(taskPath(id), task);
    }
    fail(`No test or task with id ${id}`);
  },

  signoff() {
    const id = rest[0] ?? fail('Usage: signoff <TEST-ID> --role "Primary QA" [--by name]');
    const role =
      matchStatus(flag('role') ?? '', SIGNOFF_ROLES) ??
      fail(`--role must be one of: ${SIGNOFF_ROLES.join(', ')}`);
    const by = actor();
    const test = findTest(id) ?? fail(`No test ${id}`);
    if (test.status !== 'Review Needed for Manual Test')
      fail(`Sign-off only allowed in "Review Needed for Manual Test" (is "${test.status}")`);
    if (test.signoffs.some((s) => s.role === role)) fail(`${role} already signed off ${id}`);
    test.signoffs.push({ role, by, at: now() });
    saveJson(testPath(id), test);
    console.log(`✔ ${id}: signed off by ${by} as ${role} (${test.signoffs.length}/3)`);
  },

  comment() {
    const [id, text] = [rest[0], rest[1]];
    if (!id || !text) fail('Usage: comment <TASK-ID> "<text>"');
    const task = findTask(id) ?? fail(`No task ${id}`);
    task.comments.push({ at: now(), by: actor(), text });
    saveJson(taskPath(id), task);
    console.log(`✔ Comment added to ${id}`);
  },

  publish() {
    const file = rest[0] ?? fail('Usage: publish <artifacts/test-cases/file.md> [--select TC-1,TC-2]');
    const select = flag('select')
      ?.split(',')
      .map((s) => s.trim());
    const by = actor();
    const md = readFileSync(resolve(ROOT, file), 'utf8');
    const blocks = [...md.matchAll(/```json\n([\s\S]*?)\n```/g)].map((m) => m[1]!);
    if (blocks.length === 0) fail(`No \`\`\`json draft blocks found in ${file}`);
    const drafts = blocks.map((b, i) => {
      const r = DraftTestCaseSchema.safeParse(JSON.parse(b));
      if (!r.success) fail(`Draft #${i + 1} in ${file} is invalid:\n${r.error.message}`);
      return r.data;
    });
    const chosen = select ? drafts.filter((d) => select.includes(d.draftId)) : drafts;
    if (chosen.length === 0) fail('Nothing selected to publish');

    // IDs follow the story: SD-104 → SD-T-401, SD-T-402 … (next free number)
    const taken = new Set(loadTests().map((t) => t.id));
    const nextId = (story: string): string => {
      const [prefix, num] = story.split('-');
      const base = Number(num) % 100;
      for (let n = 1; ; n++) {
        const id = `${prefix}-T-${base}${String(n).padStart(2, '0')}`;
        if (!taken.has(id)) return (taken.add(id), id);
      }
    };
    const created: string[] = [];
    for (const d of chosen) {
      const next = nextId(d.story);
      const { draftId, ...fields } = d;
      const test: TestCase = TestCaseSchema.parse({
        id: next,
        ...fields,
        status: 'Test Writing In Progress',
        automation: null,
        signoffs: [],
        history: [
          { at: now(), by, to: 'Test Writing In Progress', note: `Published from ${file} (${draftId})` },
        ],
      });
      saveJson(testPath(next), test);
      created.push(next);
      console.log(`✔ ${draftId} → ${next}  ${test.title}`);
    }
    console.log(`\nPublished ${created.length} test(s) in status "Test Writing In Progress".`);
  },

  update() {
    const id = rest[0] ?? fail('Usage: update <TEST-ID> --file <fields.json> [--note "..."]');
    const file = flag('file') ?? fail('--file <fields.json> is required');
    const note = flag('note');
    const by = actor();
    const test = findTest(id) ?? fail(`No test ${id}`);
    if (!(EDITABLE_STATUSES as readonly string[]).includes(test.status)) {
      fail(
        `${id} is "${test.status}" and its content is frozen. Only ${EDITABLE_STATUSES.join(' / ')} can be edited. ` +
          'Sign-off froze it; reopening a signed-off test is a deliberate human decision.',
      );
    }
    if (!existsSync(resolve(ROOT, file))) fail(`File not found: ${file}`);
    const parsed = TestCaseEditSchema.safeParse(JSON.parse(readFileSync(resolve(ROOT, file), 'utf8')));
    if (!parsed.success) fail(`Invalid fields in ${file}:\n${parsed.error.message}`);
    const fields = Object.keys(parsed.data);
    if (fields.length === 0) fail('Nothing to update: the file has no editable fields');

    const hadSignoffs = test.signoffs.length;
    const merged: Record<string, unknown> = { ...test, ...parsed.data };
    for (const key of ['gherkin', 'dataset'] as const) if (merged[key] === null) delete merged[key]; // null clears
    const updated: TestCase = TestCaseSchema.parse({
      ...merged,
      signoffs: [], // an edit invalidates earlier approvals: they approved different content
      history: [
        ...test.history,
        {
          at: now(),
          by,
          note: `Edited: ${fields.join(', ')}${hadSignoffs ? ` (${hadSignoffs} sign-off(s) reset)` : ''}${note ? ` - ${note}` : ''}`,
        },
      ],
    });
    saveJson(testPath(id), updated);
    console.log(`✔ ${id} updated: ${fields.join(', ')}`);
    if (hadSignoffs)
      console.log(`  ⚠ ${hadSignoffs} existing sign-off(s) were reset. Reviewers must sign off again.`);
  },

  'create-task'() {
    const testId = rest[0] ?? fail('Usage: create-task <TEST-ID> [--summary "..."]');
    const summary = flag('summary');
    const by = actor();
    const test = findTest(testId) ?? fail(`No test ${testId}`);
    if (!['Manual', 'Automation In Progress', 'Automation'].includes(test.status)) {
      fail(`${testId} is "${test.status}". Only signed-off tests (Manual or later) get an automation task.`);
    }
    const existing = loadTasks();
    const dup = existing.find((t) => t.testId === testId);
    if (dup) fail(`${testId} already has task ${dup.id} (${dup.status})`);

    // Prefer the test's own number (SD-T-404 -> AT-404); fall back to the next free number if taken (BK-T-101 vs SD-T-101).
    const taken = new Set(existing.map((t) => t.id));
    let n = Number(testId.split('-').pop());
    if (taken.has(`AT-${n}`)) n = Math.max(1000, ...existing.map((t) => Number(t.id.slice(3)))) + 1;
    const id = `AT-${n}`;

    const task: Task = TaskSchema.parse({
      id,
      testId,
      summary: summary ?? `Automate ${testId}`,
      status: 'TO DO',
      comments: [],
      history: [{ at: now(), by, to: 'TO DO', note: `Created for ${testId}` }],
    });
    saveJson(taskPath(id), task);
    console.log(`✔ ${id} created (TO DO): ${task.summary}`);
  },

  notify() {
    const message = rest[0] ?? fail('Usage: notify "<message>" [--channel name]');
    const channel = flag('channel') ?? 'qa-automation';
    const dir = join(TRACKER, 'notifications');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${now().replace(/[:.]/g, '-')}-${channel}.md`);
    writeFileSync(file, `# #${channel}\n\n_posted by ${actor()} at ${now()}_\n\n${message}\n`);
    console.log(`✔ Posted to #${channel} → ${relative(ROOT, file)}`);
  },
};

const run = commands[cmd ?? ''];
if (!run) {
  console.log(
    readFileSync(new URL(import.meta.url), 'utf8')
      .split('*/')[0]!
      .replace('/**', '')
      .replace(/^ \* ?/gm, ''),
  );
  process.exit(cmd ? 1 : 0);
}
run();
