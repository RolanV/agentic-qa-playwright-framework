# QA Review: SD-104 Product sorting (SD-T-401 to SD-T-407)

Reviewer: QA review agent (advisory only; no sign-off given, no status moved).
Inputs: `tracker/stories/SD-104.md`, `tracker/tests/SD-T-401..407.json` (all "Review Needed for Manual Test", 0 sign-offs), `artifacts/plans/test-plan-SD-100.md` (sections 6 and 10).
Precedent checked: signed-off SD-T-302 already uses `{{field}}` / `{{error}}` placeholders with `"data": "dataset row"`, so placeholders are an accepted house convention. The criticism below is about how they are used in 403 and 407, not the convention itself.

## 1. Score table (1-5)

| Test | Title clarity | Precondition | Step atomicity | Expected verifiable | Data coverage | Language/consistency | Total /30 |
|---|---|---|---|---|---|---|---|
| SD-T-401 | 5 | 5 | 5 | 5 | 4 | 5 | 29 |
| SD-T-402 | 5 | 5 | 5 | 5 | 4 | 5 | 29 |
| SD-T-403 | 3 | 3 | 3 | 2 | 3 | 3 | 17 |
| SD-T-404 | 5 | 5 | 4 | 5 | 4 | 5 | 28 |
| SD-T-405 | 5 | 5 | 4 | 5 | 4 | 5 | 28 |
| SD-T-406 | 4 | 3 | 2 | 3 | 2 | 4 | 18 |
| SD-T-407 | 4 | 3 | 3 | 4 | 3 | 3 | 20 |

### One-line reasons

**SD-T-401**
- Title 5: names the object and the outcome.
- Precondition 5: user and page stated.
- Atomicity 5: open (step 1), read labels (step 2).
- Verifiable 5: exact labels and order at step 2, count at step 1.
- Data 4: static content, no negatives apply. Does not check which option is pre-selected, but that belongs to 402.
- Language 5: consistent with the Gherkin.

**SD-T-402**
- Title 5: clear.
- Precondition 5: "just logged in, no sort chosen" pins the state.
- Atomicity 5: one read per step.
- Verifiable 5: exact six-name order at step 2.
- Data 4: the order is hardcoded. This is acceptable for a fixed catalogue, but there is no negative (for example, default state after re-login), which is a plan open question.
- Language 5: consistent.

**SD-T-403**
- Title 3: "Each sort option re-orders all six products" is wrong for row 1. Selecting A-Z on the default list re-orders nothing.
- Precondition 3: says "showing the default order", but dataset row 1 selects the already-selected option, so step 1 is a no-op for that row.
- Atomicity 3: step 3 is a second concern (idempotence, plan S9) bolted onto a parametrised step. For row 1 it is vacuous, because A-Z is restored to A-Z.
- Verifiable 2: step 2 `expected` is only `{{order}}`, with no standalone content. Rows 3 and 4 contain "either order" for the $15.99 tie, so the oracle is not deterministic.
- Data 3: all four options are covered, but the two price rows cannot fail on the tie, and there are no extra data points.
- Language 3: the Gherkin uses `<option>`/`<order>` while the steps use `{{option}}`/`{{order}}`. The `order` cells mix names with prices in prose ("Sauce Labs Onesie ($7.99), ... then ... (both $15.99, either order), ...").

**SD-T-404**
- Title 5: clear.
- Precondition 5: fine.
- Atomicity 4: steps 3 and 4 are fully implied by step 2's price sequence ($7.99, $9.99, $15.99, $15.99, ...). They are redundant checks, not atomic distinct behaviours.
- Verifiable 5: the price sequence is exact, and the tie is avoided by asserting prices rather than names. The text-sort remark at step 4 is correct (lexicographic ascending would give "$15.99" first).
- Data 4: tests the AC4 example ($7.99 vs $15.99) and the $9.99 vs $15.99 trap. No check that each price belongs to the right product.
- Language 5: consistent.

**SD-T-405**
- Title 5: clear.
- Precondition 5: fine.
- Atomicity 4: step 4 ("Onesie last") is implied by step 2's final price of $7.99.
- Verifiable 5: exact descending sequence. The step 3 remark is correct (a text sort would put "$9.99" before "$15.99").
- Data 4: same as 404.
- Language 5: consistent.

**SD-T-406**
- Title 4: clear, but "does not reload" is the whole of AC3, and "immediately" is not addressed in the title.
- Precondition 3: records the "immediately" assumption (good), but not the tooling a manual tester needs to set the marker.
- Atomicity 2: step 1 does two actions (note the URL AND set a marker). Step 3 checks two things (URL and marker).
- Verifiable 3: step 1 never says HOW to "set a marker". For a manual tester this is the sole real no-reload oracle, and it is unspecified (see section 4). "Without any further user action" at step 2 has no time bound.
- Data 2: only "Price (high to low)" is exercised (step 2). The other three options are never checked for reload.
- Language 4: consistent with the Gherkin. "Marker" is undefined.

**SD-T-407**
- Title 4: clear.
- Precondition 3: says "empty cart", but with a dataset the state between rows is undefined (see must-fix).
- Atomicity 3: step 1 adds two products in one step. Step 2 `expected` bundles three checks (badge, Remove buttons on two, Add to cart on four).
- Verifiable 4: the step 2 and 3 expectations are concrete. Step 2 `{{option}}` is only the input, so this is fine.
- Data 3: row 1 ("Name (A to Z)") is the default option and changes nothing. Only the cart badge and button state are checked, not quantities or prices on the cart page (step 3 lists names only).
- Language 3: Gherkin `<option>` vs step `{{option}}`.

## 2. AC coverage matrix

| AC | Text | Covered by | Strength | Notes |
|---|---|---|---|---|
| SD-104/AC1 | Dropdown offers 4 options | SD-T-401 (steps 1-2); also 403 dataset | Full | None. |
| SD-104/AC2 | Default order is Name (A to Z) | SD-T-402 (steps 1-2) | Full | Persistence after cart nav or re-login is an open PO question (plan Q4), not covered. |
| SD-104/AC3 | Re-orders immediately, no reload | SD-T-403 (re-order), SD-T-406 (no reload) | Partial | "Immediately" has no threshold (plan Q1). No-reload is verified for one option only (406 step 2). Reload check relies on an unspecified manual marker (406 step 1). |
| SD-104/AC4 | Price sort is numeric | SD-T-404, SD-T-405 (primary); 403 rows 3-4 (overlap) | Full for numeric order | Tie order of the two $15.99 items is deliberately unasserted (open PO question, plan Q2). 403 rows 3-4 tolerate either order. |
| SD-104/AC5 | Sort does not change cart contents | SD-T-407 (steps 1-3, 4 dataset rows) | Partial | Row state is undefined between rows. Only badge, buttons and names are checked. Plan S8 also wants the cart page after the sort, which 407 step 3 does cover for names. |

Every AC has at least one test. No AC is completely uncovered. AC3 and AC5 have specific weaknesses (above).

### Overlap analysis (403 vs 404 vs 405, and 402)

| Check | 402 | 403 | 404 | 405 |
|---|---|---|---|---|
| A-Z full name order | step 2 | row 1 + step 3 | no | no |
| Z-A full name order | no | row 2 | no | no |
| Price low to high | no | row 3 | steps 1-4 | no |
| Price high to low | no | row 4 | no | steps 1-4 |

- 403 row 1 duplicates 402 step 2 and its own step 3.
- 403 rows 3 and 4 repeat the same actions as 404 and 405 and check a weaker oracle: "either order" for the tie, versus 404/405 which assert exact price sequences.
- The one thing 403 does uniquely is the Z-A order (row 2) and the full product-name order for the price sorts.
- Recommendation: keep 403 as the "name sorts and full-order" test (A-Z, Z-A), or, if price rows are kept, make the price rows assert the price sequence only and cross-reference 404/405. Otherwise the same behaviour is executed three times by three manual testers and, later, automated three times.

## 3. Missing scenarios

| # | Scenario | AC | Priority | Why |
|---|---|---|---|---|
| M1 | Tie order of the two $15.99 products in both price sorts, assert after PO answers plan Q2 (plan S6) | AC4 | Low | Currently deliberately tolerated ("either order" in 403 rows 3-4). Needs a single deterministic expected result once the PO answers. |
| M2 | Sort persistence: sort, open cart, return, check dropdown and order (plan S10); also after logout and login | AC2 | Low (exploratory) | Open PO question, plan Q4. Write the case but leave the expected value as pending or mark it exploratory. |
| M3 | No-reload check for all four options, not only "Price (high to low)" | AC3 | Medium | 406 step 2 covers one option only. |
| M4 | Reload check by a sort-then-browser-refresh: after sorting, refresh and record what the dropdown shows | AC2/AC3 | Low | Same open PO question as M2. Useful to document the actual behaviour. |
| M5 | Cart interaction after sorting: add and remove a product from the re-sorted list, then check badge and cart page | AC5 | Medium | 407 only checks pre-added items; sort-then-add is unexercised. Also catches a bug where the "Add" button maps to the wrong product after re-ordering. |
| M6 | Cart contents unchanged: verify quantities/prices on the cart page, not names only | AC5 | Low | 407 step 3 lists names only. |
| M7 | Idempotence: A-Z to Z-A to A-Z returns the original order (plan S9) | AC3 | Low | Partly present as 403 step 3, but vacuous for row 1. Make it an explicit step with a row that is not the default. |

Not proposed: anything on sorting inside the cart or on the checkout pages, since AC1-AC5 do not specify it.

## 4. Specific concerns raised in the request

1. **`{{placeholder}}` dataset steps (403, 407).**
   - 403 step 1: `data` is the vague string "dataset row", and the action is incomplete without the dataset. 403 step 2: the whole `expected` is `{{order}}`. A reader of the step list sees no expected result at all and must look at a separate field.
   - The convention is accepted (SD-T-302 uses it), but 302's `expected` still contains words around the placeholder (`Error "{{error}}" is shown`). 403 step 2 has none. Rewrite as e.g. `Products are listed in the order given in the dataset column "order"`.
   - 403 `order` cells are free-text prose mixing names, prices and the phrase "either order". This is hard to turn into a 1:1 automated assertion. Split into a clean ordered list of names for each row, with the price in a separate field if needed.
   - 407 step 2 and the Gherkin use different placeholder syntax (`{{option}}` vs `<option>`, same in 403).
2. **"Either order" tie handling (403 rows 3-4).**
   - It is honest about the open PO question (plan Q2), but it makes those two rows unfalsifiable on the tie and will not translate into a single deterministic automated assertion.
   - The consequence: rows 3-4 pass whichever tie order the app produces, so they add no regression protection for the tie. Fine as a stopgap, but flag as Must-fix to either (a) remove the tie from 403 and assert only the unambiguous positions, or (b) get the PO answer first. 404 and 405 avoid the problem correctly by asserting prices, not names.
3. **TC-6 (SD-T-406) no-reload verification is manual.**
   - Step 1 gives no method for setting the marker. The only dependable no-reload oracle is something that disappears on reload, and the tester must be told how. For example, in DevTools console run `window.__sortMarker = 1` before step 2, and `window.__sortMarker` must still equal 1 at step 3. Alternatively, a text edit on the page (for example typing into a DevTools-modified DOM node) would be lost on reload.
   - The URL check (step 3) is a weak proof: a reload also leaves the URL unchanged. Only the marker proves no reload. The expected result should say so.
   - Add a Network panel check as a second confirmation (no new document request after the select), and list DevTools as a precondition/tool requirement.
   - It is manual-only: acceptable for sign-off, but note for the automation step that Playwright can do this with `page.evaluate` plus a navigation listener, and the automated version should drop the manual wording.
   - "Immediately" is still without a threshold (plan Q1). The assumption recorded in the precondition is reasonable, but state explicitly that the time aspect is not tested.
4. **Overlap 403/404/405.** See the overlap analysis above.

## 5. Draft comment to the author

> Thanks for the SD-104 cases. 401, 402, 404 and 405 are clear, exact and independently verifiable, and the text-sort guard remarks in 404 step 4 and 405 step 3 are correct and valuable. Nice work in 406 recording the "immediately" assumption in the precondition.
>
> **Must-fix (blocks sign-off)**
> 1. **SD-T-403, step 2:** `expected` is only `{{order}}`, so the step has no readable expected result. Reword so the sentence stands on its own and the dataset supplies only the data. Also fix step 1, where `data` is the vague "dataset row".
> 2. **SD-T-403, dataset rows 3 and 4:** "either order" for the two $15.99 items makes the tie assertion unfalsifiable. Either drop the tie from this test (assert only the unambiguous positions, as 404 and 405 do) or hold the row until the PO answers plan Q2. Also give each row a clean ordered list rather than prose with prices in parentheses.
> 3. **SD-T-403, overlap:** rows 3 and 4 duplicate 404 and 405 with a weaker oracle, and row 1 duplicates 402 step 2 and your own step 3 (selecting A-Z on a list that is already A-Z). Decide the scope: for example name sorts only here, price sorts in 404 and 405. Move the idempotence check (step 3) to a row where it is not vacuous.
> 4. **SD-T-406, step 1:** "set a marker on the page that would be lost on reload" does not say how. Give the exact method (for example the DevTools console command and the check at step 3), and split step 1 into (a) note the URL and (b) set the marker. Also state in step 3's expected that the marker, not the URL, is the proof of no reload.
> 5. **SD-T-407, steps 1-3 with the dataset:** it is undefined whether each dataset row starts from the precondition. Step 3 leaves the tester on the cart page, so row 2 would begin on the wrong page. Add a reset (return to Products and restore the cart) or state that each row is run from the precondition. Also, row 1 selects the default option, so it changes nothing. Use the three non-default options or a sequence that starts from a changed sort.
>
> **Nice-to-have**
> - 404 steps 3-4 and 405 step 4 are implied by step 2. Keep them only if you want the explicit named-product check, and say so.
> - 406: check no-reload for all four options, or add a short second dataset. Currently only "Price (high to low)" is exercised (step 2).
> - 407: add sort-then-add/remove, and check quantities and prices on the cart page at step 3, not names only.
> - 403 and 407: use the same placeholder syntax in the Gherkin as in the steps (`<option>` vs `{{option}}`).
> - Add a persistence exploratory case (plan S10) and a tie-order case (plan S6), both pending PO answers (plan Q2 and Q4).

## 6. Verdict per test

| Test | Verdict | Blocking reasons |
|---|---|---|
| SD-T-401 | **READY FOR SIGN-OFF** | None. |
| SD-T-402 | **READY FOR SIGN-OFF** | None. |
| SD-T-403 | **CHANGES REQUESTED** | Step 2 `expected` is a bare placeholder; rows 3-4 "either order"; step 3 vacuous for row 1; overlap with 402, 404, 405. |
| SD-T-404 | **READY FOR SIGN-OFF** | None blocking. Steps 3-4 are redundant with step 2 (nice-to-have). The tie order is intentionally not asserted. |
| SD-T-405 | **READY FOR SIGN-OFF** | None blocking. Step 4 redundant with step 2 (nice-to-have). |
| SD-T-406 | **CHANGES REQUESTED** | Step 1 does not specify the marker method and combines two actions; only one option tested. |
| SD-T-407 | **CHANGES REQUESTED** | Row state undefined between dataset rows (steps 2-3); row 1 is the default option and is a no-op. |

Caveat: 404 and 405 are ready on the assumption that leaving the $15.99 tie unasserted is accepted until the PO answers plan Q2, and that "immediately" has no threshold until plan Q1 is answered. If the human reviewers disagree, they should say so at sign-off.

## 7. Sign-off (human-only)

The agent has not signed off anything and has not changed any status. Three humans must sign off each test they accept: **Primary QA, Developer, Second QA**. Each runs the `signoff` tracker command themselves with the `!` prefix in the Claude Code prompt. Agents are blocked from it by design.
