# test-automation-engineer — lessons learned
Read at the start of every run; append 1–3 short lessons at the end. Keep it under 50 lines.

- SauceDemo exposes `data-test` on every interactive element; config sets `testIdAttribute: 'data-test'` → use `getByTestId`.
- Product cards contain more than one button; scope with `item(name).getByRole('button', { name: 'Remove' })`.
- Cart badge is absent (not "0") when the cart is empty → assert `toBeHidden()` (see `BasePage.expectCartCount`).
- Checkout money labels look like `Item total: $39.98`, `Tax: $3.20` → parse with `CheckoutPage.money()`.
- UI tests start logged in via storageState; login specs must reset it with `test.use({ storageState: { cookies: [], origins: [] } })`.
- Sort dropdown: native `<select data-test="product-sort-container">` (values az/za/lohi/hilo); its visible label is `data-test="active-option"` → `InventoryPage.activeSortOption`.
- Price sorts have a $15.99 tie (Bolt T-Shirt, Red T-Shirt); tie order is an open PO question → assert prices/relative positions, never the tie's name order.
- For order checks: first a web-first `toHaveText([...])` on the list (waits for re-render), then read `getPrices()`/`getNames()` for numeric/position asserts.
- Name sorts: for the 6-product catalogue, default `[...names].sort()` (code-unit) == `localeCompare('en')`; prefer code-unit (locale-independent). They diverge only on mixed case/punctuation (e.g. 'a' vs 'B').
- Text-sort trap, descending: `['$..'].sort().reverse()` = `$9.99 $7.99 $49.99 $29.99 $15.99 $15.99` → for hilo, "Bike Light after both $15.99" + "Onesie last" are the discriminating checks.
- "X is last" steps: use web-first `itemNames.last()`/`itemPrices.last()` `toHaveText`, plus `item(name).getByTestId('inventory-item-price')` to tie the name to its price.
- Default-state tests (no `sortBy()`): fresh context = no sort chosen (not persisted); assert both `activeSortOption` label and `sortSelect` `toHaveValue('az')`.
- Sort options: `InventoryPage.sortOptions` = `sortSelect.getByRole('option')` (a11y name "Sort products"); native options resolve without clicking → "open the dropdown" = assert select visible+enabled, never fake a click.
- List-content checks: pair `toHaveCount(n)` with `toHaveText([...])` (array = exact length + order + full text, retrying); count alone misses misspelled/re-ordered items.
