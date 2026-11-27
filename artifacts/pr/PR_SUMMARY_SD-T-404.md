Title: [Automated Test] SD-T-404: [UI][Sorting] Price low to high sorts numerically

## What
Automates the signed-off manual test SD-T-404 for story SD-104 (product sorting, AC4: price sorting is numeric).
The test selects "Price (low to high)" on the Products page and asserts the exact price sequence
($7.99, $9.99, $15.99, $15.99, $29.99, $49.99), the same sequence as parsed numbers, and that the Onesie and the
Bike Light come before both $15.99 products. These checks fail if the app ever sorts prices as text
(where "$15.99" would sort before "$7.99"). The order of the two tied $15.99 products is deliberately not asserted:
it is an open product owner question.

## Tracker
- Test: SD-T-404 · Story: SD-104 · Task: AT-404
- Current tracker state: test "Automation In Progress", task "IN PROGRESS". Both move on in Step 8 (close out) after the PR is open.

## Changes
| File | Change |
|---|---|
| `tests/ui/sorting-SD-T-404.spec.ts` | New spec: 4 tracker steps mapped 1:1 to `test.step`, tags `@regression` `@SD-T-404`, tracker annotation |
| `src/pages/InventoryPage.ts` | +3 lines: `activeSortOption` locator (`data-test="active-option"`), the visible label of the sort dropdown |
| `artifacts/fidelity/fidelity-SD-T-404.md` | Fidelity audit report |
| `artifacts/pr/PR_REVIEW_SD-T-404.md`, `artifacts/pr/PR_SUMMARY_SD-T-404.md` | Self-review and this summary |
| `.claude/agent-memory/**` | Lessons recorded by the automation and fidelity agents |

## Evidence
- 3/3 passing with `--repeat-each=3` (re-run while writing this summary; the login setup test is not counted).
- Full suite after the page-object change: 17/17 passed.
- Fidelity: `VERDICT: FIXED` (`artifacts/fidelity/fidelity-SD-T-404.md`).
- Self-review: `REVIEW: PASS`, no must-fix findings (`artifacts/pr/PR_REVIEW_SD-T-404.md`).
- `npm run lint`, `npm run typecheck`, `npm run validate` all pass.

## How to run
```bash
npx playwright test --grep @SD-T-404
```

## Checklist
- [x] Spec green locally with `--repeat-each=3` (3/3 passing)
- [x] Fidelity report: `VERDICT: FIXED` (artifacts/fidelity/)
- [x] Self review: `REVIEW: PASS` (artifacts/pr/)
- [x] Tracker steps map 1:1 to `test.step()`; no weakened assertions
- [x] ID-first title, `@regression` + `@SD-T-404` tags, tracker annotation
- [x] Page objects / fixtures reused; new locator lives in `src/pages`
- [x] No `waitForTimeout`, `force: true`, `test.only`, hardcoded URLs or credentials
- [x] `npm run check` passes
- [x] Nothing from `tests/.temp/` committed
