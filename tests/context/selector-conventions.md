# Selector conventions

1. `getByTestId('<data-test value>')` — first choice. Find values with Playwright MCP `browser_snapshot`
   or DevTools. Product-specific ids (`add-to-cart-sauce-labs-backpack`) are avoided: scope by product
   name instead (`inventoryPage.item(name)`), so new products don't need new code.
2. `getByRole(role, { name })` — for buttons/links whose text is part of the requirement.
3. Text locators with `{ exact: true }`.
4. Never: XPath, `nth-child`, generated class names (`.btn_inventory`), absolute CSS paths.

Locators belong in page objects as `readonly` fields or small methods returning `Locator`.
A spec may build a locator inline only from a page-object locator (e.g. `inventoryPage.item(x).getByRole(…)`).
