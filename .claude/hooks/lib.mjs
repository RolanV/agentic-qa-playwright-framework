// Shared helpers for hooks. Hooks receive the tool call as JSON on stdin and answer with JSON on stdout.
// Docs: https://docs.claude.com/en/docs/claude-code/hooks
export async function readInput() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  const input = JSON.parse(raw); // malformed → throws → caller fails CLOSED
  if (!input || typeof input.tool_name !== 'string') throw new Error('missing tool_name');
  return input;
}

/** PreToolUse decision. "allow" | "ask" (prompt the human) | "deny" (block, reason is shown to Claude). */
export function decide(permissionDecision, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision,
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

/** No opinion: let the normal permission rules in settings.json decide. */
export function pass() {
  process.exit(0);
}

/** Fail-closed wrapper: any bug or bad input in a guard results in DENY, never a silent allow. */
export async function guard(fn) {
  try {
    await fn(await readInput());
    pass();
  } catch (e) {
    decide('deny', `Guard hook error → blocked (fail-closed): ${e instanceof Error ? e.message : String(e)}`);
  }
}
