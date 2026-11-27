Title: [Automated Tests] SD-T-401, SD-T-402, SD-T-405: SD-104 product sorting (dropdown options, default order, price high to low)

## What
Automates three signed-off manual tests for story SD-104 (product sorting), completing the batch started with SD-T-404.
- **SD-T-401** (AC1): the sort dropdown offers exactly four options, with the exact labels in the exact order. It asserts both the count and the ordered labels, so a misspelled, swapped, missing or extra option fails it.
- **SD-T-402** (AC2): on first load the dropdown shows "Name (A to Z)" and the six products are in alphabetical order.
- **SD-T-405** (AC4): "Price (high to low)" sorts numerically. It fails if the app sorts prices as text, which would put `$9.99` and `$7.99` first.

Open product owner questions are visible in the code and deliberately not asserted: the order of the two $15.99 products, and which comparison rule "alphabetical" means (the current catalogue gives the same order under both common rules).

## Tracker
| Test | Story | Task | Priority |
|---|---|---|---|
| SD-T-401 [UI][Sorting] Sort dropdown offers the four sort options | SD-104 | AT-401 | Low |
| SD-T-402 [UI][Sorting] Products are sorted by name A to Z by default | SD-104 | AT-402 | Low |
| SD-T-405 [UI][Sorting] Price high to low sorts numerically | SD-104 | AT-405 | Medium |

Current tracker state: tests "Automation In Progress", tasks "IN PROGRESS". They move to "Automation" and "DONE" at close-out, after this PR is open.

## Changes
| File | Change |
|---|---|
| `tests/ui/sorting-SD-T-401.spec.ts` | New spec, 2 tracker steps mapped 1:1 to `test.step` |
| `tests/ui/sorting-SD-T-402.spec.ts` | New spec, 2 tracker steps mapped 1:1 to `test.step` |
| `tests/ui/sorting-SD-T-405.spec.ts` | New spec, 4 tracker steps mapped 1:1 to `test.step` |
| `src/pages/InventoryPage.ts` | +3 lines: `sortOptions` locator (`sortSelect.getByRole('option')`). Additive, nothing renamed or removed |
| `tracker/tests/SD-T-401\|402\|405.json`, `tracker/tasks/AT-401\|402\|405.json` | Status moves made during Step 5 (approved at each prompt) |
| `artifacts/fidelity/fidelity-SD-T-401\|402\|405.md` | Independent fidelity audits |
| `artifacts/pr/PR_REVIEW_SD-T-401-402-405.md`, `artifacts/pr/PR_SUMMARY_SD-T-401-402-405.md` | Self-review and this summary |
| `.claude/agent-memory/**` | Lessons recorded by the automation and fidelity agents |

## Evidence
- 9/9 passing for these three tests with `--repeat-each=3` (3 tests x 3 runs; the login setup test is not counted).
- Full suite after the page-object change: 20/20 passed.
- Fidelity: `VERDICT: FIXED` for each of the three (`artifacts/fidelity/`).
- Self-review: `REVIEW: PASS`, no must-fix findings (`artifacts/pr/PR_REVIEW_SD-T-401-402-405.md`).
- `npm run check` (lint, typecheck, tracker validation, unit tests) and `npm run format:check` pass.
- Each spec passed the promotion gate: ESLint with the sandbox ignore lifted, then 3 consecutive green runs.

## How to run
```bash
npx playwright test --grep "@SD-T-401|@SD-T-402|@SD-T-405"
```

## Checklist
- [x] Specs green locally with `--repeat-each=3` (9/9 passing)
- [x] Fidelity reports: `VERDICT: FIXED` (artifacts/fidelity/)
- [x] Self review: `REVIEW: PASS` (artifacts/pr/)
- [x] Tracker steps map 1:1 to `test.step()`; no weakened assertions
- [x] ID-first titles, `@regression` + `@<ID>` tags, tracker annotation
- [x] Page objects / fixtures reused; the new locator lives in `src/pages`
- [x] No `waitForTimeout`, `force: true`, `test.only`, hardcoded URLs or credentials
- [x] `npm run check` passes
- [x] Nothing from `tests/.temp/` committed
