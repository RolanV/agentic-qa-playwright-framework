#!/usr/bin/env node
/**
 * PreToolUse "publish gate" — slide 22: "Humans approve every write. Fail-closed by design."
 *
 *  Tracker writes (move/comment/publish/update/create-task/notify) ... ASK   (human approves each one)
 *  Sign-offs .................................... DENY  (human-only: run it yourself with `!`)
 *  Direct edits of tracker/*.json|md ............ DENY  (must go through the validated CLI)
 *  git commit / git push / gh pr create ......... ASK
 *  gh pr merge, git push --force, reset --hard .. DENY  (no agent merges or rewrites history)
 *  Reading/writing .env ......................... DENY
 *  Everything else .............................. no opinion → settings.json rules apply
 */
import { guard, decide } from './lib.mjs';

const TRACKER_WRITE =
  /(npm run (-s )?tracker --|tsx scripts\/tracker\.ts)\s+(move|comment|publish|notify|update|create-task)\b/;
const TRACKER_SIGNOFF = /(npm run (-s )?tracker --|tsx scripts\/tracker\.ts)\s+signoff\b/;

await guard(async ({ tool_name, tool_input = {} }) => {
  if (tool_name === 'Bash') {
    const cmd = String(tool_input.command ?? '');
    if (TRACKER_SIGNOFF.test(cmd))
      decide(
        'deny',
        'HUMAN GATE: sign-offs are human-only. Ask the user to run it: `! npm run tracker -- signoff <ID> --role "..."`',
      );
    if (/\bgh\s+pr\s+merge\b/.test(cmd))
      decide('deny', 'HUMAN GATE: no agent merges a PR. Humans review and merge.');
    if (/\bgit\s+push\b.*(--force|-f\b)/.test(cmd)) decide('deny', 'Force-push is never allowed.');
    if (/\bgit\s+reset\s+--hard\b|\bgit\s+clean\s+-[a-z]*f/.test(cmd))
      decide('deny', 'Destructive git command blocked.');
    if (/(^|[\s'"/])\.env\b(?!\.example)/.test(cmd))
      decide('deny', 'Secrets: .env must not be read or written by agents.');
    if (TRACKER_WRITE.test(cmd)) decide('ask', `HUMAN GATE (tracker write): ${cmd}`);
    if (/\bgit\s+(commit|push)\b/.test(cmd)) decide('ask', `HUMAN GATE (git write): ${cmd}`);
    if (/\bgh\s+pr\s+create\b/.test(cmd)) decide('ask', 'HUMAN GATE: opening a pull request');
    return;
  }

  if (['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(tool_name)) {
    const path = String(tool_input.file_path ?? tool_input.notebook_path ?? '');
    if (/(^|\/)tracker\/(tests|tasks|epics|stories)\//.test(path))
      decide(
        'deny',
        'Tracker records change only through `npm run tracker -- …` (it validates transitions and sign-offs).',
      );
    if (/(^|\/)\.env$/.test(path)) decide('deny', 'Secrets: .env must not be written by agents.');
  }

  if (tool_name === 'Read' && /(^|\/)\.env$/.test(String(tool_input.file_path ?? '')))
    decide('deny', 'Secrets: .env must not be read by agents. Use .env.example for variable names.');
});
