/**
 * npm run promote-test -- tests/.temp/test-<ID>-<slug>.spec.ts
 *
 * The ONLY way a generated spec leaves the sandbox. Quality gate:
 *   1. no "NOT AUTOMATED" placeholders, no test.only / waitForTimeout / force:true / page.pause
 *   2. the spec runs GREEN (3 times in a row with --repeat-each to catch flakiness)
 *   3. then it is moved to tests/ui|api/<feature>-<ID>.spec.ts (+ dataset file)
 * "A failing test is never committed; it stays in tests/.temp/" — slide 16.
 */
import { readFileSync, existsSync, renameSync } from 'node:fs';
import { join, basename, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, loadTests } from './lib/tracker-lib';

const input = process.argv[2];
if (!input || !input.includes('tests/.temp/')) {
  console.error('Usage: npm run promote-test -- tests/.temp/test-<ID>-<slug>.spec.ts');
  process.exit(1);
}
const src = join(ROOT, input);
if (!existsSync(src)) {
  console.error(`✖ ${input} not found`);
  process.exit(1);
}

const code = readFileSync(src, 'utf8');
const banned: [RegExp, string][] = [
  [/NOT AUTOMATED/, 'unimplemented step placeholder'],
  [/\btest\.only\b|\bdescribe\.only\b/, 'focused test (.only)'],
  [/waitForTimeout\s*\(/, 'hard wait (waitForTimeout)'],
  [/force:\s*true/, 'force: true click'],
  [/page\.pause\s*\(/, 'page.pause()'],
  [/https?:\/\/(www\.)?(saucedemo|restful-booker)/, 'hardcoded URL (use baseURL / env)'],
];
const problems = banned.filter(([re]) => re.test(code)).map(([, why]) => why);
if (problems.length) {
  console.error(`✖ Quality gate failed for ${input}:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}

const id = basename(src).match(/test-([A-Z]+-T-\d+)-/)?.[1];
const test = loadTests().find((t) => t.id === id);
if (!id || !test) {
  console.error(`✖ Could not map ${input} to a tracker test id`);
  process.exit(1);
}

console.log(`▶ Running ${input} 3× to prove it is green and stable…`);
const run = spawnSync(
  'npx',
  ['playwright', 'test', '--project=temp', '--repeat-each=3', '--reporter=line', input],
  {
    cwd: ROOT,
    stdio: 'inherit',
  },
);
if (run.status !== 0) {
  console.error('✖ Spec is not green. It stays in tests/.temp/. Heal it, then promote again.');
  process.exit(1);
}

const kind = test.labels.includes('api') ? 'api' : 'ui';
const feature =
  test.title
    .match(/^\[[^\]]+\]\[([^\]]+)\]/)?.[1]
    ?.toLowerCase()
    .replace(/\s+/g, '-') ?? 'feature';
const destRel = `tests/${kind}/${feature}-${id}.spec.ts`;
renameSync(src, join(ROOT, destRel));
const dataFile = join(ROOT, 'tests', '.temp', `test-${id}.data.json`);
if (existsSync(dataFile)) renameSync(dataFile, join(ROOT, 'tests', kind, `test-${id}.data.json`));

console.log(`✔ Promoted → ${destRel}`);
console.log(`  Next: Step 6 fidelity check, then Step 7 review/PR. Close-out records the spec with:`);
console.log(`  npm run tracker -- move ${id} Automation --spec ${relative(ROOT, join(ROOT, destRel))}`);
