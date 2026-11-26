/**
 * Mock Jira + Xray, stored as plain files under tracker/.
 * Why files? The workflow (statuses, transitions, sign-offs, approvals) is the lesson —
 * not the vendor API. Swapping this module for a real Jira/Xray client (or an MCP server)
 * would leave agents, skills and gates unchanged.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// TRACKER_DIR lets unit tests run the CLI against a throwaway copy of the tracker.
export const TRACKER = process.env.TRACKER_DIR ?? join(ROOT, 'tracker');

// ── Statuses (mirror slide 3 of the course deck) ──────────────────────────────
export const TEST_STATUSES = [
  'Test Writing In Progress',
  'Review Needed for Manual Test',
  'Manual',
  'Automation In Progress',
  'Automation',
] as const;
export const TASK_STATUSES = ['TO DO', 'IN PROGRESS', 'DONE'] as const;
export const SIGNOFF_ROLES = ['Primary QA', 'Developer', 'Second QA'] as const;

/** Allowed transitions. Anything else is rejected — the workflow is enforced by code, not by trust. */
export const TEST_TRANSITIONS: Record<TestStatus, TestStatus[]> = {
  'Test Writing In Progress': ['Review Needed for Manual Test'],
  'Review Needed for Manual Test': ['Manual', 'Test Writing In Progress'],
  Manual: ['Automation In Progress'],
  'Automation In Progress': ['Automation', 'Manual'],
  Automation: ['Automation In Progress'],
};
export const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  'TO DO': ['IN PROGRESS'],
  'IN PROGRESS': ['DONE', 'TO DO'],
  DONE: ['IN PROGRESS'],
};

export type TestStatus = (typeof TEST_STATUSES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

// ── Schemas ───────────────────────────────────────────────────────────────────
const HistoryEntry = z.object({
  at: z.string(),
  by: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  note: z.string().optional(),
});

export const StepSchema = z.object({
  action: z.string().min(3),
  data: z.string().optional(),
  expected: z.string().min(3),
});

export const TestCaseSchema = z.object({
  id: z.string().regex(/^[A-Z]+-T-\d+$/),
  story: z.string().regex(/^[A-Z]+-\d+$/),
  title: z.string().regex(/^\[(UI|API)\]\[[^\]]+\] .+/, 'Title must look like "[UI][Feature] Behaviour"'),
  status: z.enum(TEST_STATUSES),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  labels: z.array(z.string()).min(2),
  precondition: z.string(),
  steps: z.array(StepSchema).min(1),
  gherkin: z.string().optional(),
  dataset: z.array(z.record(z.string(), z.string())).optional(),
  automation: z.object({ spec: z.string() }).nullable(),
  signoffs: z.array(z.object({ role: z.enum(SIGNOFF_ROLES), by: z.string(), at: z.string() })),
  history: z.array(HistoryEntry),
});

export const TaskSchema = z.object({
  id: z.string().regex(/^AT-\d+$/),
  testId: z.string(),
  summary: z.string(),
  status: z.enum(TASK_STATUSES),
  comments: z.array(z.object({ at: z.string(), by: z.string(), text: z.string() })),
  history: z.array(HistoryEntry),
});

/** Draft test case as written by the test-case-creator agent (fenced ```json block in the artifact). */
export const DraftTestCaseSchema = TestCaseSchema.pick({
  story: true,
  title: true,
  priority: true,
  labels: true,
  precondition: true,
  steps: true,
  gherkin: true,
  dataset: true,
}).extend({ draftId: z.string().regex(/^TC-\d+$/) });

export type TestCase = z.infer<typeof TestCaseSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type DraftTestCase = z.infer<typeof DraftTestCaseSchema>;

// ── Documents (epics/stories are markdown with a tiny front-matter header) ───
export interface Doc {
  id: string;
  meta: Record<string, string>;
  body: string;
  file: string;
}

export function parseFrontMatter(text: string): { meta: Record<string, string>; body: string } {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: text };
  const meta: Record<string, string> = {};
  for (const line of (m[1] ?? '').split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: m[2] ?? '' };
}

function listFiles(sub: string, ext: string): string[] {
  const dir = join(TRACKER, sub);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .sort()
    .map((f) => join(dir, f));
}

export function loadDocs(kind: 'epics' | 'stories'): Doc[] {
  return listFiles(kind, '.md').map((file) => {
    const { meta, body } = parseFrontMatter(readFileSync(file, 'utf8'));
    return { id: meta.id ?? '', meta, body, file };
  });
}

export function loadTests(): TestCase[] {
  return listFiles('tests', '.json').map((f) => TestCaseSchema.parse(JSON.parse(readFileSync(f, 'utf8'))));
}

export function loadTasks(): Task[] {
  return listFiles('tasks', '.json').map((f) => TaskSchema.parse(JSON.parse(readFileSync(f, 'utf8'))));
}

export const testPath = (id: string) => join(TRACKER, 'tests', `${id}.json`);
export const taskPath = (id: string) => join(TRACKER, 'tasks', `${id}.json`);

export function saveJson(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

export const now = () => new Date().toISOString();

export function slugify(text: string): string {
  return text
    .replace(/^\[[^\]]+\]\[[^\]]+\]\s*/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

/** Accepts "in_progress", "IN PROGRESS", "manual", "automation in progress" … */
export function matchStatus<T extends string>(input: string, options: readonly T[]): T | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/[_-]+/g, ' ').trim();
  return options.find((o) => norm(o) === norm(input));
}
