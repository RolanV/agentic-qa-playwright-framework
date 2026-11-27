# Fidelity SD-T-404 (review mode, read-only)
Spec: tests/.temp/test-SD-T-404-price-low-to-high-sorts-numerically.spec.ts

| # | Tracker step | Spec step | Assertion(s) | OK |
|---|---|---|---|---|
| 1 | Select "Price (low to high)" -> dropdown shows it | `1. Select "Price (low to high)"` | sortSelect toHaveValue('lohi'); activeSortOption toHaveText('Price (low to high)') | OK |
| 2 | Read prices -> $7.99,$9.99,$15.99,$15.99,$29.99,$49.99 | `2. Read the prices...` | itemPrices toHaveText(exact 6-item list); getPrices toEqual numeric list; equals numeric ascending sort | OK |
| 3 | Onesie before Bolt T-Shirt and Red T-Shirt | `3. Compare ... Onesie` | positionOf (toContain guard) + toBeLessThan x2 | OK |
| 4 | Bike Light before both $15.99 products | `4. Compare ... Bike Light` | positionOf + toBeLessThan x2 | OK |

## Integrity checks
- No weakening: no regex/toBeTruthy/soft/catch/conditional/fixme. Exact literals from tracker.
- Tie order of the two $15.99 products is NOT asserted (only both-after relations). Correct per open PO question.
- Mutation reasoning (text sort): order would be $15.99,$15.99,$29.99,$49.99,$7.99,$9.99. Step 2 toHaveText fails; numeric toEqual fails; step 3 and 4 position checks also fail (Onesie/Bike Light after the $15.99s). Test would fail. getPrices cannot vacuously pass: a parse failure gives NaN, which breaks toEqual; empty list breaks toEqual.
- Helper positionOf fails loudly if a name is missing (toContain), no -1 vacuous pass.
- No hardcoded URLs/credentials; uses fixtures and page object locators (getByTestId). No raw selectors.
- Traceability: ID-first title, @regression + @SD-T-404 tags, tracker annotation, steps numbered 1-4 matching tracker 1:1.
- Run: --repeat-each=3 green (3/3 plus setup). Lint: file in tests/.temp is eslint-ignored, so lint result is not informative (not a failure).

## Findings (non-critical)
1. Precondition assertions (title 'Products', default 'Name (A to Z)') sit outside any test.step. Acceptable as precondition, not a tracker step.
2. Steps 3/4 read names via allTextContents (non-retrying), safe only because step 2 already awaited the settled list. Name-to-price pairing (Onesie=$7.99, Bike Light=$9.99) is not asserted directly; it is implied by position plus the price sequence. Minor residual gap; optional hardening: assert item(ONESIE) price is $7.99.
3. Lint could not be verified (ignored path); will be checked at promote.

VERDICT: FIXED
