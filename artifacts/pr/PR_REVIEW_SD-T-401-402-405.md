# PR review (batch): SD-T-401, SD-T-402, SD-T-405 (story SD-104, product sorting)

Scope: three new specs promoted from the sandbox and one additive page-object change.
- `tests/ui/sorting-SD-T-401.spec.ts` (43 lines): sort dropdown offers the four options (AC1)
- `tests/ui/sorting-SD-T-402.spec.ts` (51 lines): default order is Name (A to Z) (AC2)
- `tests/ui/sorting-SD-T-405.spec.ts` (77 lines): price high to low sorts numerically (AC4)
- `src/pages/InventoryPage.ts` (+3 lines): `sortOptions` locator

Inputs: `tracker/tests/SD-T-401|402|405.json`, `artifacts/fidelity/fidelity-SD-T-401|402|405.md`.

## Checklist

### Correctness and fidelity
- [x] Every tracker step has a `test.step` with a real assertion, and each fidelity report says FIXED.
  - SD-T-401: tracker has 2 steps; steps at lines 26 and 36. Verdict `VERDICT: FIXED`.
  - SD-T-402: tracker has 2 steps; steps at lines 32 and 38. Verdict `VERDICT: FIXED`.
  - SD-T-405: tracker has 4 steps; steps at lines 33, 39, 56 and 70. Verdict `VERDICT: FIXED`.
- [x] No weakened assertions. Each test asserts the tracker's exact labels, names or prices with retrying `toHaveText` / `toHaveCount`. A pattern search for `toBeTruthy`, `.catch(`, `.soft`, `.only` found nothing in any of the three files. The fidelity reports also show, by reasoning or a scratch run, that each test fails on the wrong behaviour (misspelled/swapped label, wrong default order, text-based descending price sort).

### Framework conventions
- [x] ID-first titles (401 line 16, 402 line 22, 405 line 22), `@regression` + `@SD-T-40x` tags (lines 18, 24, 24), tracker annotation (lines 19, 25, 25). All three tracker tests carry the `regression` label.
- [x] Fixtures and page objects used (`inventoryPage`). No raw selectors in the specs. The one new locator, `sortOptions`, lives in `src/pages/InventoryPage.ts`. SD-T-405 builds a per-card price locator inline from a page-object locator (`item(name).getByTestId(...)`), which the selector conventions allow.
- [x] Locators are `getByTestId` / `getByRole`. No XPath or CSS chains (search for `.locator(`, `xpath`, `nth-child` found nothing).
- [x] Web-first assertions. No `waitForTimeout`, `force: true`, `test.only`, `page.pause` (search found nothing).
- [x] No hardcoded URLs or credentials (search for `http(s)://` found nothing). Tests start from the saved login state and `inventoryPage.goto()` uses the base URL. No data is created, so no factory is needed; product names and labels are literals because the catalogue is fixed and the tracker names them.

### Hygiene
- [x] `npm run lint`, `npm run typecheck`, `npm run validate` pass. Validation reports 17 test tags across 7 specs all resolving to tracker tests.
- [x] `npm run format:check` clean.
- [x] Nothing from `tests/.temp/` is staged (0 staged files; the sandbox holds only `.gitkeep`).
- [x] Page-object change is additive and backwards compatible: one new `readonly` locator and its assignment, nothing renamed or removed. Full suite after the change: 20 of 20 passed.

## Findings

**Must-fix:** none.

**Nice-to-have**
1. SD-T-402, sorted-copy check (`[...names].sort()`): mostly redundant with the exact `toHaveText` list above it (the fidelity report agrees). It only protects against a wrongly edited literal. Keep or drop; harmless.
2. SD-T-402 and SD-T-405 read names once with `getNames()` (no retry). Safe only because an earlier retrying assertion in the same test has already waited for the list to settle. If steps are ever reordered, this becomes a race.
3. SD-T-401, count is `EXPECTED_SORT_LABELS.length`, derived from the same list as the labels. Acceptable (the list is a literal in the test); a literal `4` would read closer to the tracker but is not stronger.
4. Precondition assertions (`goto`, title) sit outside `test.step` in all three. Acceptable: they are not numbered tracker steps.
5. SD-T-404 (merged) and SD-T-405 each implement "position of a product" checks differently. A shared helper could remove the duplication. Out of scope for this PR; do not refactor merged SD-T-404 here.
6. Open product owner questions are visible in the code and not asserted: the order of the two $15.99 products (SD-T-405), and which comparison rule "alphabetical" means (SD-T-402, default sort vs `localeCompare`).

## Scope note for the branch step
Intended in this PR:
- the three promoted specs and `src/pages/InventoryPage.ts`
- `artifacts/fidelity/fidelity-SD-T-401|402|405.md` and `artifacts/pr/*` for this batch
- `.claude/agent-memory/**` updates
- the tracker moves already made for these tests and tasks (`tracker/tests/SD-T-401|402|405.json`, `tracker/tasks/AT-401|402|405.json`)

Nothing else in the working tree should be staged. Step 8 (close-out) will change the same tracker files again; as with SD-T-404 it can be its own follow-up commit.

REVIEW: PASS
