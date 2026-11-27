# Fidelity report: SD-T-405 (review mode, read-only)

Spec: tests/.temp/test-SD-T-405-price-high-to-low-sorts-numerically.spec.ts
Run: `--repeat-each=3` on the spec path: 3/3 green (plus the auth setup), no flakiness.

## Step-by-step comparison

| # | Tracker step / expected | Spec step | Assertion(s) | OK |
|---|---|---|---|---|
| pre | Standard user on Products page, default order | outside any step (goto, title "Products", active option "Name (A to Z)") | toHaveText x2 | OK (minor: setup outside test.step, as intended for a precondition) |
| 1 | Select "Price (high to low)" / dropdown shows "Price (high to low)" | `1. Select "Price (high to low)"` | sortBy('hilo'); sortSelect toHaveValue('hilo'); activeSortOption toHaveText('Price (high to low)') | OK |
| 2 | Read prices / $49.99, $29.99, $15.99, $15.99, $9.99, $7.99 | `2. Read the prices from top to bottom` | itemPrices toHaveText([6 literals]) (web-first, also pins count); getPrices toEqual numeric array; toEqual of its own numeric descending sort | OK |
| 3 | Bike Light ($9.99) is after both Bolt T-Shirt and Red T-Shirt | `3. Compare the position of ...` | Three price-by-name checks ($9.99, $15.99, $15.99); names arrayContaining all three; indexOf(Bike Light) > indexOf(Bolt) and > indexOf(Red) | OK |
| 4 | Last product is Onesie ($7.99) | `4. Check the last product in the list` | itemNames.last() toHaveText(Onesie); itemPrices.last() toHaveText('$7.99'); Onesie card price '$7.99' | OK |

Steps are numbered 1 to 4, in order, none merged or skipped. Every expected result has a real assertion inside its step.

## Specific questions

1. Text-descending mutation ($9.99, $7.99, $49.99, $29.99, $15.99, $15.99). The test FAILS in three places:
   - Step 2: the `toHaveText` literal array fails (position 1 is $9.99, not $49.99). `getPrices` toEqual also fails.
   - Step 3: Bike Light is at index 0, so `toBeGreaterThan(indexOf(Bolt))` and `(indexOf(Red))` both fail.
   - Step 4: last would be a $15.99 product, so `itemNames.last()` toHaveText(Onesie) fails. `itemPrices.last()` also fails ($15.99, not $7.99).
   - Step 1 would still pass, since the dropdown label is unaffected. Step 3's three price-by-name checks would also still pass, because they are data checks, not order checks. The guard lives in the index comparisons.
2. Ascending instead of descending. FAILS in step 2 (first price $7.99, not $49.99). Step 3 would also fail (Bike Light before the $15.99 items), and so would step 4 (last is Bolt/Red at $49.99, not Onesie). Step 1 would also fail on `toHaveValue('hilo')` / the label if the UI were really in lohi; if only the order were wrong, the step 2 to 4 assertions still catch it.
3. Tie order. NOT pinned. Step 2 pins prices only (both tie positions are "$15.99"). Step 3 compares Bike Light against each T-shirt independently via indexOf, with no relation between Bolt and Red. Step 4 does not touch the tie. Swapping Bolt and Red keeps the test green.
4. Gaps versus the tracker, all minor or non-blocking:
   - Step 3 reads names via `getNames()` (a one-shot `allTextContents`, no retry). It is safe here because step 2 has already waited for the re-rendered list, but if step 2 were removed it would be racy. Order dependence between steps is a mild design smell.
   - `indexOf` returns the first match. If a name were duplicated or missing, `arrayContaining` guards missing names, but not duplicates. Negligible in this catalogue.
   - Step 3's price-by-name assertions go slightly beyond the tracker, which is harmless (the card prices stay tied to the named products).
   - The precondition assertions sit outside `test.step`. Acceptable, as the tracker's precondition is not a numbered step.
   - Lint cannot be verified in `tests/.temp/` (eslint-ignored); not run. Raw selectors: none, all page-object/testid locators. No hardcoded URLs or credentials. No static data needs a factory.
   - Step 4's tracker expected result mentions "($7.99)"; it is asserted twice (last price and Onesie card price), which is fully covered.

## Assertion integrity

No `toBeTruthy`, no regex weakening, no soft asserts, no `.catch`, no conditional `isVisible` skips, no `fixme`/`fail`. Helpers (`getPrices`, `getNames`) return live values; a NaN parse would fail the toEqual, and an empty list would fail `toHaveText` with six entries. No vacuous passes found.

## Traceability

Title starts with `SD-T-405`, tags `@regression` and `@SD-T-405`, annotation `{ type: 'tracker', description: 'SD-T-405' }`, step labels numbered 1 to 4 and match the tracker actions verbatim.

## Verdict

All steps and assertions are faithful, green 3/3, no new raw selectors. Lint could not be checked in `.temp` (so 2 of 3 extra checks confirmed). Only non-critical notes above remain.

VERDICT: FIXED
