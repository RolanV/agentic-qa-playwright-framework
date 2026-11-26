#!/usr/bin/env node
/**
 * PostToolUse observability hook: one JSON line per tool call in .claude/audit.log
 * → answer "what did the agent actually do?" after a run (great for debugging and for interviews).
 * Never blocks: logging problems must not break the session.
 */
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';

try {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  const e = JSON.parse(raw);
  const input = e.tool_input ?? {};
  const summary = input.command ?? input.file_path ?? input.url ?? input.pattern ?? input.description ?? '';
  const line = {
    ts: new Date().toISOString(),
    session: e.session_id,
    agent: e.agent_type ?? 'main',
    tool: e.tool_name,
    summary: String(summary).slice(0, 300),
  };
  const dir = process.env.CLAUDE_PROJECT_DIR ?? e.cwd ?? process.cwd();
  appendFileSync(join(dir, '.claude', 'audit.log'), JSON.stringify(line) + '\n');
} catch {
  // ignore
}
process.exit(0);
