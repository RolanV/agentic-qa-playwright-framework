---
name: tracker-research
description: How to research the mock Jira/Xray tracker in this repo — where epics, stories, tests and tasks live, what each status means, and which commands are read-only. Load before planning, drafting or reviewing test cases.
user-invocable: false
---

# Researching the tracker

The tracker is a file-based stand-in for Jira + Xray + Slack (`tracker/`). Read freely; write only via the CLI.

| Thing | Location | Read with |
|---|---|---|
| Epic (goal + epic ACs) | `tracker/epics/<ID>.md` | `npm run tracker -- show SD-100` |
| Story (ACs) | `tracker/stories/<ID>.md` | `npm run tracker -- list stories` |
| Test (Xray-style manual test) | `tracker/tests/<ID>.json` | `npm run tracker -- show SD-T-301` |
| Automation task (board) | `tracker/tasks/AT-*.json` | `npm run tracker -- list tasks` |
| Notifications (mock Slack) | `tracker/notifications/*.md` | read the files |

## Test lifecycle
`Test Writing In Progress` → `Review Needed for Manual Test` → **Manual** (needs 3 sign-offs:
Primary QA, Developer, Second QA) → `Automation In Progress` → **Automation** (spec recorded).

## Task lifecycle
`TO DO` → `IN PROGRESS` → `DONE` (with a completion comment containing the PR link).

## Research checklist
- Quote ACs verbatim with their id (`SD-103/AC4`).
- For coverage: grep `"story": "<STORY>"` in `tracker/tests/`; check `automation.spec` for automated ones.
- For style: study existing tests of the same feature before drafting new ones.
- Test ids follow the story: story `SD-104` → tests `SD-T-401`, `SD-T-402` …
- Schemas (source of truth for shapes): `scripts/lib/tracker-lib.ts`.
