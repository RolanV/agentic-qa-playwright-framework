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
