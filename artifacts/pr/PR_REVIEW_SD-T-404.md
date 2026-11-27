# PR review: SD-T-404 [UI][Sorting] Price low to high sorts numerically

Scope: `tests/ui/sorting-SD-T-404.spec.ts` (new, promoted from the sandbox) and `src/pages/InventoryPage.ts` (+3 lines).
Inputs: `tracker/tests/SD-T-404.json`, `artifacts/fidelity/fidelity-SD-T-404.md`, spec line numbers below.

## Checklist

### Correctness and fidelity
- [x] Every tracker step has a `test.step` with a real assertion; fidelity report says FIXED.
  Step 1 lines 35-39, step 2 lines 41-56, step 3 lines 58-63, step 4 lines 65-71. `artifacts/fidelity/fidelity-SD-T-404.md` ends `VERDICT: FIXED`.
- [x] No weakened assertions. Step 2 asserts the tracker's literal price list (lines 43-50) and the parsed numeric sequence (line 54), plus an ascending-by-number check (line 55). No regex, `toBeTruthy`, soft asserts or `.catch`. Pattern search found none.

### Framework conventions
- [x] ID-first title (line 24), `@regression` + `@SD-T-404` tags (line 26), tracker annotation (line 27). The tracker labels include `regression`, so the tag matches.
- [x] Fixture and page object used (`inventoryPage`, line 29). No raw selectors in the spec. The one new locator lives in `src/pages/InventoryPage.ts` (`activeSortOption`).
- [x] Locators are `getByTestId` (the new locator). No XPath or CSS chains.
- [x] Web-first assertions (`toHaveText`, `toHaveValue`). No `waitForTimeout`, `force: true`, `test.only` or `page.pause`.
- [x] No hardcoded URLs or credentials. `inventoryPage.goto()` uses the base URL. Product names are constants (lines 12-15) because the catalogue is fixed and the tracker names them; no data is created, so no factory is needed.
- [x] The two $15.99 products' order is never asserted (open product owner question). Lines 61-62 and 69-70 compare only against cheaper items.

### Hygiene
- [x] `npm run lint`, `npm run typecheck`, `npm run validate` all pass. The spec is now under `tests/ui/`, so lint covers it.
- [x] Nothing from `tests/.temp/` is staged; the folder holds only `.gitkeep`.
- [x] Page-object change is additive (3 lines) and backwards compatible. Full suite: 17 of 17 passed after the change.

## Findings

**Must-fix:** none.

**Nice-to-have**
1. Lines 31-33: precondition assertions sit outside any `test.step`. Acceptable for a precondition; wrap in a step only if the team wants them in the report.
2. Lines 59 and 67: `getNames()` uses `allTextContents`, which does not retry. This is safe only because step 2 already waited for the list to settle. If steps are ever reordered or step 2 removed, this becomes a race.
3. Lines 60 and 68: the pairing "Onesie is $7.99, Bike Light is $9.99" is implied by position plus the price sequence, not asserted directly. Acceptable; add a product-to-price check if a stricter test is wanted.

## Scope note for the branch step (important)
`git status` shows modified files that are NOT part of this test: `scripts/tracker.ts`, `scripts/lib/tracker-lib.ts`, `scripts/tracker.test.ts`, `.claude/hooks/*`, `.claude/settings.json`, `.claude/skills/automate-test/SKILL.md`, `CLAUDE.md` (the new `update` and `create-task` commands), plus untracked tracker records for SD-T-401..407 and tasks AT-401..405. They belong in a separate commit. The SD-T-404 branch should stage only:
- `tests/ui/sorting-SD-T-404.spec.ts`
- `src/pages/InventoryPage.ts`
- the SD-T-404 artifacts (`artifacts/fidelity/fidelity-SD-T-404.md`, `artifacts/pr/*SD-T-404*`)
- agent memory updates (`.claude/agent-memory/**`)

## Framework observation (not part of this PR)
`scripts/promote-test.ts` does not run ESLint, so the promotion gate cannot catch lint errors; this spec was checked by hand (clean). Recommend adding an ESLint run (with the `.temp` ignore removed) to the gate.

REVIEW: PASS
