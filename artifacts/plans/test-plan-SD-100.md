# Test plan: SD-100 SauceDemo purchase journey

Source: `tracker/epics/SD-100.md`, stories SD-101..SD-104, tests SD-T-101..104, 201..203, 301..303, `tests/context/app-map.md`.
Epic goal (verbatim): "A registered shopper can log in, find products, manage a cart and complete a purchase."

## 1 Scope & objectives
- Verify all 20 ACs (4 login, 3 cart, 5 checkout, 5 sorting, 3 epic-level).
- Close the two coverage gaps: SD-104 has no test cases; SD-103 tests SD-T-301..303 are signed off (status Manual, 3/3 sign-offs) but not automated (`automation: null`; AT-301..303 are TO DO).
- Challenge ambiguous ACs before test cases are written (section 10).

## 2 Out of scope
From the epic: payment providers (fake "SauceCard"), performance and visual regression. Also: `problem_user`, `performance_glitch_user`, `error_user`, `visual_user` (no AC mentions them), the restful-booker API (unrelated to this Epic).

## 3 Test approach
- Level: UI end-to-end (Playwright) only; SauceDemo exposes no API for this journey. API level not applicable.
- Existing automation: `tests/ui/login.spec.ts` (SD-T-101..104), `tests/ui/cart.spec.ts` (SD-T-201..203).
- To automate: SD-T-301..303 (existing signed-off Manual tests; automate as-is, steps 1:1).
- New: SD-104 cases follow ID range SD-T-401+ (drafting is a separate step; no tickets created here).
- Data-driven: SD-T-103 and SD-T-302 already use datasets; sorting and totals should be too.
- Locators and conventions per CLAUDE.md (data-test first, web-first assertions).

## 4 Environments & data
- SauceDemo at `BASE_URL`; user `standard_user` / `secret_sauce`; `locked_out_user` for lockout.
- Each test starts with a fresh context, so the cart (localStorage) is empty.
- Catalogue prices: Backpack 29.99, Bike Light 9.99, Bolt T-Shirt 15.99, Fleece Jacket 49.99, Onesie 7.99, Red T-Shirt 15.99 (note the 15.99 tie).
- Checkout info from factories in `src/data/factories.ts`.

## 5 AC traceability matrix
Legend: CA = Covered + Automated, CM = Covered-Manual, NC = Not covered, "partial" = existing tests touch the AC but do not fully prove it.

| AC | Text (verbatim) | Tests | Status | Spec |
|---|---|---|---|---|
| SD-101/AC1 | A valid user lands on the "Products" page after login. | SD-T-101 | CA | tests/ui/login.spec.ts |
| SD-101/AC2 | A locked-out user sees "Epic sadface: Sorry, this user has been locked out." and stays on the login page. | SD-T-102 | CA | tests/ui/login.spec.ts |
| SD-101/AC3 | Wrong or missing credentials show a specific validation error (username required / password required / no match). | SD-T-103 | CA | tests/ui/login.spec.ts |
| SD-101/AC4 | A logged-in user can log out from the burger menu and returns to the login form. | SD-T-104 | CA | tests/ui/login.spec.ts |
| SD-102/AC1 | Clicking "Add to cart" increments the cart badge and the button changes to "Remove". | SD-T-201 | CA | tests/ui/cart.spec.ts |
| SD-102/AC2 | Removing a product from the cart page removes it from the list and updates the badge. | SD-T-202 | CA | tests/ui/cart.spec.ts |
| SD-102/AC3 | Cart contents persist while navigating between inventory and cart. | SD-T-203 | CA | tests/ui/cart.spec.ts |
| SD-103/AC1 | From the cart, "Checkout" opens "Checkout: Your Information". | SD-T-301 (step 2) | CM | none |
| SD-103/AC2 | First name, last name and postal code are all required; each missing field shows its own error ("Error: First Name is required", "Error: Last Name is required", "Error: Postal Code is required"). | SD-T-302 (3 dataset rows) | CM | none |
| SD-103/AC3 | The overview lists every product in the cart with its price. | SD-T-301 (step 3), SD-T-303 (step 2) | CM | none |
| SD-103/AC4 | Item total = sum of item prices; Tax = 8% of item total (rounded to cents); Total = Item total + Tax. | SD-T-303 | CM | none |
| SD-103/AC5 | "Finish" shows "Thank you for your order!" and empties the cart. | SD-T-301 (steps 4-5) | CM | none |
| SD-104/AC1 | The sort dropdown offers: Name (A to Z), Name (Z to A), Price (low to high), Price (high to low). | none | NC | none |
| SD-104/AC2 | Default order is Name (A to Z). | none | NC | none |
| SD-104/AC3 | Choosing an option re-orders the list immediately, without a page reload. | none | NC | none |
| SD-104/AC4 | Price sorting is numeric (e.g. $7.99 comes before $15.99). | none | NC | none |
| SD-104/AC5 | The chosen sort does not change the cart contents. | none | NC | none |
| SD-100/AC-E1 | Every page after login shows the cart badge with the current item count. | SD-T-201, SD-T-203, SD-T-301 | partial (inventory/cart automated; checkout pages not checked) | cart.spec.ts (partial) |
| SD-100/AC-E2 | Error messages are shown inline and never navigate away from the current form. | SD-T-102, SD-T-103 (automated), SD-T-302 (manual) | partial (no explicit "no navigation" check on login errors) | login.spec.ts (partial) |
| SD-100/AC-E3 | The whole journey works for `standard_user`; `locked_out_user` can never get past login. | SD-T-101, SD-T-102 (automated), SD-T-301 (manual) | partial (journey manual only; no direct-URL bypass check for locked_out_user) | partial |

Totals: 20 ACs; 15 have at least one test (12 fully: 7 CA + 5 CM; 3 epic-level partial); 5 NC; 7 fully automated.
In the traceability JSON `automated` is true only for fully automated ACs; the three partial epic ACs are false.

## 6 Proposed scenarios per story
Risk uses user impact x likelihood x change frequency (after skeptic pass).

### SD-103 Checkout (automate existing; add gaps)
- Automate SD-T-301, SD-T-302 (3 rows), SD-T-303 as-is (AT-301..303). Risk High (purchase flow, money values).
- New: Tax rounding data-driven (items totalling e.g. 7.99, 9.99+7.99, 29.99+15.99+15.99) asserting item total/tax/total. Positive, boundary. High. Depends on the rounding question.
- New: all three fields empty, error shown is "First Name is required" (priority order). Negative. Medium.
- New: Cancel from overview returns to inventory and preserves cart. Positive. Low (no AC; propose only if PO wants it).
- New: Checkout with empty cart (not specified by AC; Open question candidate). Low.

### SD-104 Product sorting (all NC; proposed IDs from SD-T-401)
| # | Scenario | AC | Type | Risk |
|---|---|---|---|---|
| S1 | Dropdown contains exactly four options with exact labels in order | AC1 | Positive | Low |
| S2 | On first load the list is A-Z by name and dropdown shows Name (A to Z) | AC2 | Positive | Low |
| S3 | Select each of the 4 options; assert full order of 6 product names (data-driven) | AC1, AC3 | Data-driven | Medium |
| S4 | Price low-high: Onesie 7.99 is before Bolt/Red T-Shirt 15.99, which are before Backpack 29.99 and Fleece 49.99 | AC4 | Boundary | Medium |
| S5 | Price high-low: assert the numeric order is non-increasing; guards string sorting (e.g. "$9.99" vs "$15.99": Bike Light 9.99 must come after both $15.99 items) | AC4 | Boundary (guards string sorting) | Medium |
| S6 | Tie order for the two $15.99 items in both price sorts (assert after PO answer) | AC4 | Boundary | Low |
| S7 | Select a sort and assert no navigation/reload (URL unchanged, a page marker set before selection survives) | AC3 | Positive | Medium |
| S8 | Add item(s), change sort through all 4 options; badge count and each item's Remove button unchanged; cart page lists same items | AC5 | Positive | Medium |
| S9 | Switch sort A-Z -> Z-A -> A-Z returns to original order (idempotence) | AC3 | Negative/regression | Low |
| S10 | Sort then open cart and return; does selection persist? (expected value pending PO) | AC2/open | Exploratory | Low |

### SD-101 / SD-102 (covered; no new automation required)
- Optional additions: logout then browser Back must not reveal inventory (supports AC-E3, High, auth). Locked-out user direct navigation to `/inventory.html` blocked (AC-E3, High, auth).
- SD-102: cart persistence across page reload (Medium, pending question).

### Epic-level
- AC-E1: parametrise badge check over inventory, cart, checkout step 1, step 2 with 2 items (Medium).
- AC-E2: for login errors and checkout errors assert URL unchanged and form still visible (Medium).
- AC-E3: end-to-end `standard_user` journey (SD-T-301 automated covers it once done) plus locked_out_user direct-URL block (High).

## 7 Risk assessment
| Area | Risk | One-sentence justification |
|---|---|---|
| SD-103/AC1-AC5 (checkout, totals, order completion) | High | Touches money and order completion; currently manual only so regressions go undetected. |
| AC-E3 locked_out_user cannot pass login / direct-URL access | High | Auth boundary; only the error message is tested, not the bypass. |
| SD-101/AC1, AC2 | High | Auth gate for the whole journey; already automated. |
| SD-101/AC3, AC4 | Medium | Auth-adjacent UX; automated. |
| SD-102/AC1-AC3, AC-E1, AC-E2 | Medium | Cart state drives the order contents; automated or partial. |
| SD-104/AC3, AC4, AC5 | Medium | Wrong price ordering misleads shoppers and string-vs-numeric bugs are classic, but no money or data loss. |
| SD-104/AC1, AC2 | Low | Static UI content, low change frequency, easy to detect. |

Skeptic pass: kept SD-104 at Medium/Low, not High, because no money, auth or data loss is involved; AC5 held at Medium because it guards cart contents (the purchase basis). Upgraded AC-E3 to High because of auth. SD-104/AC1 and AC2 downgraded to Low (one-sentence justification: static content). The Cancel and empty-cart checkout scenarios are Low as they have no AC.

## 8 Regression impact
- Sorting changes the inventory list ordering: re-run SD-T-101 (Products landing), SD-T-201/203 (tests that add products by name must not depend on list position).
- Checkout automation (SD-T-301..303) depends on cart and inventory page objects; changes to `InventoryPage`/`CartPage` affect login, cart and checkout specs.
- Tag proposal: SD-T-301 smoke; others regression.

## 9 Entry / exit criteria
Entry: open questions for SD-104/AC3 and AC4 answered (or assumptions recorded); SD-104 test cases drafted, published and signed off (3/3); environment reachable; users valid.
Exit: every AC is Covered+Automated or has an accepted justification; SD-T-301..303 automated and green 3x via `npm run promote-test`; SD-104 cases green; no open High-risk defects; any app/tracker disagreement reported as a finding, never by weakening assertions.

## 10 Open questions
1. SD-104/AC3 "immediately, without a page reload": what threshold, and how is "no reload" verified?
2. SD-104/AC4 numeric price sorting: tie order of the two $15.99 items (Bolt T-Shirt, Red T-Shirt) in both directions?
3. SD-104/AC1: exact option labels, order and count?
4. SD-104/AC2: does the selected sort persist after cart navigation or re-login?
5. SD-104/AC5: which observables define "cart contents unchanged"?
6. AC-E1: should an empty cart hide the badge or show 0 (SD-T-301 expects hidden)? Which pages are in scope?
7. AC-E2: which forms/errors are in scope?
8. AC-E3: must direct navigation to protected pages without a session be blocked?
9. SD-103/AC4: rounding rule at half-cents; Total from rounded Tax?
10. SD-102/AC3: persistence across reload or logout/login?
11. SD-103: behaviour when checkout is started with an empty cart (no AC).

Full wording with PO questions: `artifacts/plans/missing-acs-SD-100.json`.
