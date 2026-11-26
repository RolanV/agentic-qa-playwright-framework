---
name: playwright-standards
description: Team standards for writing Playwright + TypeScript tests in this repo — locator priority, web-first assertions, fixtures, page objects, data factories, tags and traceability. Load before writing, reviewing or healing any spec or page object.
user-invocable: false
---

# Playwright standards (this repo)

## Structure
- Specs import `test, expect` from `@fixtures` — never from `@playwright/test` directly (setup files excepted).
- Ask for fixtures, not `page`: `async ({ inventoryPage, cartPage, checkoutPage }) => …`.
- Page objects (`src/pages`) expose **intent** methods and `readonly` locators; they contain no test logic.
  Reusable checks may be `expect*` helpers (e.g. `expectCartCount`).
- Test data from `src/data/factories.ts`; named users from `src/data/users.ts`.

## Locator priority
1. `page.getByTestId('checkout')` — SauceDemo has `data-test` everywhere (configured as testIdAttribute)
2. `getByRole('button', { name: 'Add to cart' })` — accessible and readable
3. `getByLabel` / `getByPlaceholder` / `getByText(…, { exact: true })`
4. CSS — last resort, must be justified in a comment. Never XPath. Never nth-child chains.
Scope inside a container: `items.filter({ has: page.getByTestId('inventory-item-name').getByText(name, { exact: true }) })`.

## Assertions
- Web-first only: `await expect(locator).toHaveText('…')`, `toBeVisible()`, `toHaveCount(n)`, `toHaveURL(/…/)`.
- Exact expected values from the tracker. Numbers: compute expected values in the test (e.g. tax = round(subtotal × 0.08, 2))
  AND assert against the tracker's literal where it gives one.
- No `expect(await locator.textContent()).toBe(…)` for UI state — it doesn't retry.
- Never: `waitForTimeout`, `force: true`, `test.only`, `page.pause`, empty catch blocks.

## Traceability
```ts
test('SD-T-301 [UI][Checkout] …', {
  tag: ['@smoke', '@SD-T-301'],
  annotation: { type: 'tracker', description: 'SD-T-301' },
}, async ({ … }) => {
  await test.step('1. <tracker step 1 action>', async () => { /* act + assert expected */ });
});
```

## Isolation
Every test independent and parallel-safe: own data, no ordering assumptions, UI tests start from the saved
login state, API tests clean up through the `bookingApi` fixture.
