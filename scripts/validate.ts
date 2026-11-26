/**
 * npm run validate — integrity checks for the mock tracker + traceability. Runs in CI.
 *  1. Every tracker file matches its schema (zod)
 *  2. References resolve (test → story → epic, task → test)
 *  3. Status rules hold (Manual+ needs 3 sign-offs, task IN PROGRESS ⇒ test Automation In Progress,
 *     Automation ⇒ spec exists and contains the test ID)
 *  4. Traceability: every @<TEST-ID> tag in committed specs exists in the tracker
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT,
  TRACKER,
  SIGNOFF_ROLES,
  TestCaseSchema,
  TaskSchema,
  loadDocs,
  parseFrontMatter,
} from './lib/tracker-lib';

const errors: string[] = [];
const err = (m: string) => errors.push(m);

const epics = loadDocs('epics');
const stories = loadDocs('stories');
const storyIds = new Set(stories.map((s) => s.id));
for (const s of stories) {
  if (!s.meta.epic || !epics.some((e) => e.id === s.meta.epic)) err(`${s.id}: unknown epic "${s.meta.epic}"`);
}
for (const d of [...epics, ...stories]) {
  if (!d.id) err(`${d.file}: missing "id" in front matter`);
  if (!parseFrontMatter(readFileSync(d.file, 'utf8')).body.includes('AC'))
    err(`${d.id}: no acceptance criteria found`);
}

const read = (sub: string) =>
  readdirSync(join(TRACKER, sub))
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ f, data: JSON.parse(readFileSync(join(TRACKER, sub, f), 'utf8')) }));

const tests = read('tests').flatMap(({ f, data }) => {
  const r = TestCaseSchema.safeParse(data);
  if (!r.success)
    return (
      err(`tracker/tests/${f}: ${r.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`),
      []
    );
  if (f !== `${r.data.id}.json`) err(`tracker/tests/${f}: file name must equal id ${r.data.id}`);
  return [r.data];
});
const tasks = read('tasks').flatMap(({ f, data }) => {
  const r = TaskSchema.safeParse(data);
  if (!r.success)
    return (
      err(`tracker/tasks/${f}: ${r.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`),
      []
    );
  return [r.data];
});
const testById = new Map(tests.map((t) => [t.id, t]));

for (const t of tests) {
  if (!storyIds.has(t.story)) err(`${t.id}: unknown story ${t.story}`);
  const signedOff = ['Manual', 'Automation In Progress', 'Automation'].includes(t.status);
  if (signedOff) {
    const missing = SIGNOFF_ROLES.filter((r) => !t.signoffs.some((s) => s.role === r));
    if (missing.length) err(`${t.id}: status "${t.status}" but missing sign-off from ${missing.join(', ')}`);
  }
  if (t.status === 'Automation') {
    const spec = t.automation?.spec;
    if (!spec) err(`${t.id}: status Automation but no automation.spec`);
    else if (!existsSync(join(ROOT, spec))) err(`${t.id}: spec ${spec} does not exist`);
    else if (!readFileSync(join(ROOT, spec), 'utf8').includes(t.id))
      err(`${t.id}: spec ${spec} does not reference the test id`);
  }
}
for (const k of tasks) {
  const t = testById.get(k.testId);
  if (!t) err(`${k.id}: unknown test ${k.testId}`);
  else if (k.status === 'IN PROGRESS' && t.status !== 'Automation In Progress')
    err(`${k.id}: task IN PROGRESS but ${t.id} is "${t.status}" (expected "Automation In Progress")`);
}

// Traceability: spec tags → tracker
const specFiles = ['ui', 'api'].flatMap((d) =>
  existsSync(join(ROOT, 'tests', d))
    ? readdirSync(join(ROOT, 'tests', d))
        .filter((f) => f.endsWith('.spec.ts'))
        .map((f) => `tests/${d}/${f}`)
    : [],
);
let tagged = 0;
for (const spec of specFiles) {
  for (const [, id] of readFileSync(join(ROOT, spec), 'utf8').matchAll(/'@([A-Z]+-T-\d+)'/g)) {
    tagged++;
    if (!testById.has(id!)) err(`${spec}: tag @${id} has no tracker test`);
  }
}

if (errors.length) {
  console.error(`✖ ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log(
  `✔ tracker valid: ${epics.length} epics, ${stories.length} stories, ${tests.length} tests, ${tasks.length} tasks`,
);
console.log(
  `✔ traceability: ${tagged} test tags across ${specFiles.length} specs all resolve to tracker tests`,
);
