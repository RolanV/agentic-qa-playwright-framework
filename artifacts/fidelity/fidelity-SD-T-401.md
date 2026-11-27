# Fidelity report SD-T-401 (review mode, read-only)

Spec: tests/.temp/test-SD-T-401-sort-dropdown-offers-the-four-sort-options.spec.ts
Run: `--repeat-each=3` on the spec path: 3/3 green (plus setup).

## Step comparison

| # | Tracker step / expected | Spec step | Assertion(s) | OK |
|---|---|---|---|---|
| 1 | Open the sort dropdown / lists exactly 4 options | `1. Open the sort dropdown on the Products page` | `sortSelect` toBeVisible, toBeEnabled, `sortOptions` toHaveCount(4) | yes |
| 2 | Read labels top to bottom / exact 4 labels in order | `2. Read the option labels from top to bottom` | `sortOptions` toHaveText([4 exact labels]) | yes |

Precondition (goto + title "Products") sits outside test.step: acceptable, minor.

## Failure cases (the user's question)

Proof method: scratch spec at /private/tmp/claude-501/-Users-rolanvataev-Desktop-Agentic-framework/ad04b0db-8964-4b2a-b837-279df85e8b11/scratchpad/m/mut.spec.ts. It builds a `<select data-test="product-sort-container">` via setContent and runs the same locator and assertion expressions as the spec (`getByTestId(...).getByRole('option')`, same label list). No repo file was edited. This is a real Playwright run on a mock of the select, not on the live app. The spec's own green run proves the baseline on the live app.

| Case | Assertion that breaks | Result | Proof |
|---|---|---|---|
| (a) one label misspelled | step 2 toHaveText (step 1 still passes) | FAILS | run |
| (b) two labels swapped | step 2 toHaveText (step 1 still passes) | FAILS | run |
| (c) fifth option added | step 1 toHaveCount (4 vs 5) and step 2 toHaveText (array length mismatch) | FAILS | run |
| (d) one option missing | step 1 toHaveCount and step 2 toHaveText | FAILS | run |
| (e1) select hidden (display:none) | step 1 toBeVisible; count and text also fail (hidden options are absent from the role tree) | FAILS | run |
| (e2) select disabled | step 1 toBeEnabled only; count and text still pass | FAILS (single point of protection) | run |

Baseline row in the same scratch run: all four assertions pass.

## Answers to the additional questions

1. `EXPECTED_SORT_LABELS.length` for the count: acceptable, not a real weakness. The expected labels are a literal list in the spec, not read from the app, and the count is only the length of that literal. Adding a fifth option in the app fails both count and text (case c). The only risk is a future editor adding a label to the list, which would also change the text assertion, so it is not independent protection. A literal `4` would read closer to the tracker ("exactly 4") and cost nothing. Cosmetic, optional.
2. The native-select comment is correct. The `<option>` elements are in the DOM and accessibility tree, and the popup is browser/OS chrome that Playwright cannot assert on. Locating a visible, enabled select and reading its options honestly satisfies step 1. This is not a skipped step. The comment says "confirmed via MCP" and I did not independently re-verify that. My own run of the spec on the live app does prove the options are readable by role.
3. Gaps (all minor, none critical):
   - No `click` or interaction with the dropdown, so "open" is covered by the visibility and enabled checks only. This is justified by point 2.
   - Disabled-select detection rests on one assertion (toBeEnabled). This is adequate.
   - Option `value` attributes (az/za/lohi/hilo) are not asserted, and the spec comment states this deliberately. They are covered by SD-T-402/404/405.
   - A hidden or disabled individual option would not be detected. A hidden option drops out of the role tree and fails count; a disabled option still passes. The tracker does not specify this.
   - Specs in tests/.temp are eslint-ignored, so lint-clean cannot be verified there.

## Assertion integrity
No `toBeTruthy`, regex, soft asserts, catch blocks, conditional skips, or fixme. Exact-text array assertion, web-first. No hardcoded URLs or credentials (uses `inventoryPage.goto()`). Locators are `getByTestId` and `getByRole` through the page object (`sortOptions` added to InventoryPage, a role-based locator, no raw selectors).

## Traceability
ID-first title, `@regression` and `@SD-T-401` tags, tracker annotation, steps numbered `1.` and `2.`. All present.

## Verdict basis
Steps and assertions are faithful, the run is green 3x, repeat-each is green, there are no raw selectors, and lint cannot be checked in the sandbox (2 of 3 extra checks pass). Only cosmetic notes remain.

VERDICT: FIXED
