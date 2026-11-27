# Fidelity SD-T-402 (review mode, read-only)

Spec: tests/.temp/test-SD-T-402-products-are-sorted-by-name-a-to-z-by-default.spec.ts
Run: `--repeat-each=3` green (3/3 + setup). Lint not verifiable (tests/.temp is eslint-ignored).

| # | Tracker step | Spec step | Assertion | OK |
|---|---|---|---|---|
| 1 | Read selected value of sort dropdown -> shows "Name (A to Z)" | `1. Read the selected value of the sort dropdown` | `activeSortOption` toHaveText('Name (A to Z)') + `sortSelect` toHaveValue('az') | yes |
| 2 | Read product names top to bottom -> exact 6-name order | `2. Read the product names from top to bottom` | `itemNames` toHaveText(array of 6) (exact, ordered, length-checked) + independent `getNames()` == `[...names].sort()` | yes |

Traceability: title starts with SD-T-402, tags @regression + @SD-T-402, tracker annotation present, steps numbered 1-2 and 1:1 with the tracker. Fixture/alias imports OK; no hardcoded URL or credentials; no soft asserts, catch, conditionals, fixme.

## Questions
1. Mutation reasoning:
   - Z to A: toHaveText array fails (order), dropdown text/value fail. Fails.
   - Price order: names array mismatch. Fails.
   - Dropdown showing another option (e.g. "Name (Z to A)", "lohi"): step 1 text and value assertions fail. Fails. Even if only the label span were wrong, the value check catches the select, and vice versa.
2. The sorted-copy check is not vacuous. It compares the live DOM names to a sort of themselves, so it does not depend on the literal. It is partly redundant, because `toHaveText(literal)` already pins the exact order, and the literal is itself sorted. Its value is only as a guard if the literal is edited incorrectly. It is guarded by the length check. Default `.sort()` is code-unit order (not locale): fine for this catalogue, and the comment says so. "Test.allTheThings()" sorting after "Sauce" holds in either ordering.
3. Precondition: the test never calls sortBy and calls `inventoryPage.goto()` in a fresh context with saved storageState (login from setup). That is a faithful "no sort chosen" state because the sort is not persisted and each test gets a new context, but it is not literally "just logged in" through the UI login flow. Acceptable and consistent with the repo's isolation convention. The `title === 'Products'` check proves it is on the Products page.
4. Gaps (none critical):
   - Minor: precondition lines (`goto` and the title assertion) sit outside any `test.step`. They are setup and not a tracker step, so this is acceptable, but an expect outside a step is a small stylistic deviation.
   - Minor: the toHaveValue('az') check is extra to the tracker (stricter, not weaker). Fine.
   - Minor: the independent sort check uses plain `expect` on a snapshot (`getNames` is not retrying), but it runs after the web-first `toHaveText`, so the list is already rendered. No flake risk.
   - Cannot confirm lint cleanliness (eslint-ignored sandbox). No new raw selectors in the spec.

## Verdict basis
All steps and expecteds are faithfully asserted, none weakened, green 3x. The only unverifiable extra check is lint; repeat-each green and no raw selectors pass (2 of 3).

VERDICT: FIXED
