# CLAUDE.md — project rules for every agent and every session

This repo is an **agentic QA framework**: Playwright + TypeScript tests, driven by Claude Code
subagents and skills, with humans approving every write. Full explanation: `docs/HOW-IT-WORKS.md`.

## The workflow (8 steps)
1 Plan → 2 Test cases → 3 Publish → 4 Sign-off → 5 Generate & heal → 6 Fidelity → 7 Review & PR → 8 Close out.
Orchestrated by the `/qa-pipeline` skill. Each step's output is a **file** (the contract for the next step).

## Hard rules (non-negotiable)
1. **Never commit a failing or unimplemented test.** Generated specs live in `tests/.temp/` until
   `npm run promote-test` proves them green 3× in a row.
2. **Never weaken an assertion to get a pass.** If the app disagrees with the tracker test, it's a finding:
   report it (possible product bug), do not edit the expectation.
3. **No hardcoded URLs or credentials.** Use `baseURL` and `src/config/env.ts`. Never read `.env`.
4. **Tracker records change only via `npm run tracker -- …`.** Never edit `tracker/**` files directly.
5. **Humans approve every write** (tracker moves, commits, pushes, PRs, notifications). Sign-offs and merges
   are human-only. If a guard blocks you, stop and tell the user — do not look for a workaround.
6. **Reuse before you write.** Check `src/pages`, `src/fixtures`, `src/data`, `src/api` first. Extend an
   existing page object rather than creating a near-duplicate.

## Test conventions
- One `test()` per tracker test ID. Title starts with the ID: `'SD-T-301 [UI][Checkout] …'`.
- Tags: `@smoke` or `@regression` + `@<TEST-ID>`; annotation `{ type: 'tracker', description: '<ID>' }`.
- Tracker steps map **1:1** to `test.step('<n>. <action>')`.
- Locators: `getByTestId` (data-test) → `getByRole` → `getByLabel/Text`. No CSS/XPath unless unavoidable.
- Web-first assertions only (`await expect(locator).toHaveText(...)`). No `waitForTimeout`, no `force: true`.
- Test data from factories in `src/data/factories.ts` (random, parallel-safe). API tests clean up via fixture.
- Import from aliases: `@fixtures`, `@pages/*`, `@data/*`, `@api/*`, `@config/*`.

## Commands
| Purpose | Command |
|---|---|
| All tests | `npm test` (UI + API) · `npm run test:smoke` · `npm run test:temp` (sandbox) |
| Quality gates | `npm run check` (lint + typecheck + tracker validation + hook tests) |
| Tracker read | `npm run tracker -- list [tests\|tasks\|stories]` · `npm run tracker -- show <ID>` |
| Tracker write (gated) | `npm run tracker -- move <ID> "<STATUS>"` · `comment` · `publish` · `notify` |
| Step 5 helpers | `npm run create-test -- <TEST-ID>` · `npm run promote-test -- <tests/.temp/…spec.ts>` |

## Where things go
- Agent outputs → `artifacts/{plans,test-cases,reviews,fidelity,pr}/`
- Lessons learned → `.claude/agent-memory/<agent>/` (read at start, append at end)
- App knowledge for agents → `tests/context/`
