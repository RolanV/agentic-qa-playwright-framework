#!/usr/bin/env node
/**
 * PreToolUse guard — slide 16: "A failing test is never committed; it stays in tests/.temp/."
 * Blocks `git add -f tests/.temp…` and any `git commit` while files from tests/.temp/ are staged.
 * The only way out of the sandbox is `npm run promote-test`, which proves the spec is green.
 */
import { execFileSync } from 'node:child_process';
import { guard, decide } from './lib.mjs';

await guard(async ({ tool_name, tool_input = {}, cwd }) => {
  if (tool_name !== 'Bash') return;
  const cmd = String(tool_input.command ?? '');

  if (/\bgit\s+add\b.*(-f|--force)\b.*tests\/\.temp|\bgit\s+add\b.*tests\/\.temp.*(-f|--force)\b/.test(cmd))
    decide(
      'deny',
      'tests/.temp/ is a sandbox. Promote green specs with `npm run promote-test -- <path>` instead.',
    );

  if (/\bgit\s+commit\b/.test(cmd)) {
    let staged;
    try {
      staged = execFileSync('git', ['diff', '--cached', '--name-only'], {
        cwd: cwd || process.cwd(),
        encoding: 'utf8',
      });
    } catch {
      return; // not a git repo yet → nothing staged → nothing to protect
    }
    const temp = staged.split('\n').filter((f) => f.startsWith('tests/.temp/') && !f.endsWith('.gitkeep'));
    if (temp.length) decide('deny', `Staged sandbox files must not be committed: ${temp.join(', ')}`);
  }
});
