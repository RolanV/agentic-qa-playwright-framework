import { test, expect } from '@fixtures';

/**
 * Story SD-102 — Cart.  Traceability: tracker/stories/SD-102.md
 * Starts authenticated via storageState (see tests/setup/auth.setup.ts).
 */
test.describe('SD-102 Cart', { tag: '@cart' }, () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test(
    'SD-T-201 [UI][Cart] Adding a product updates the cart badge',
    {
      tag: ['@smoke', '@SD-T-201'],
      annotation: { type: 'tracker', description: 'SD-T-201' },
    },
    async ({ inventoryPage }) => {
      await test.step('1. Cart badge is not shown for an empty cart', async () => {
        await inventoryPage.expectCartCount(0);
      });

      await test.step('2. Add "Sauce Labs Backpack" to the cart', async () => {
        await inventoryPage.addToCart('Sauce Labs Backpack');
      });

      await test.step('3. Badge shows 1 and the button switches to Remove', async () => {
        await inventoryPage.expectCartCount(1);
        await expect(
          inventoryPage.item('Sauce Labs Backpack').getByRole('button', { name: 'Remove' }),
        ).toBeVisible();
      });
    },
  );

  test(
    'SD-T-202 [UI][Cart] Removing a product from the cart page empties it',
    {
      tag: ['@regression', '@SD-T-202'],
      annotation: { type: 'tracker', description: 'SD-T-202' },
    },
    async ({ inventoryPage, cartPage }) => {
      await test.step('1. Add "Sauce Labs Bike Light" and open the cart', async () => {
        await inventoryPage.addToCart('Sauce Labs Bike Light');
        await inventoryPage.openCart();
        await expect(cartPage.itemNames).toHaveText(['Sauce Labs Bike Light']);
      });

      await test.step('2. Remove the product', async () => {
        await cartPage.remove('Sauce Labs Bike Light');
      });

      await test.step('3. Cart is empty and badge is gone', async () => {
        await expect(cartPage.items).toHaveCount(0);
        await cartPage.expectCartCount(0);
      });
    },
  );

  test(
    'SD-T-203 [UI][Cart] Cart keeps several products across navigation',
    {
      tag: ['@regression', '@SD-T-203'],
      annotation: { type: 'tracker', description: 'SD-T-203' },
    },
    async ({ inventoryPage, cartPage }) => {
      const products = ['Sauce Labs Backpack', 'Sauce Labs Onesie'];

      await test.step('1. Add two products', async () => {
        await inventoryPage.addToCart(...products);
        await inventoryPage.expectCartCount(2);
      });

      await test.step('2. Open cart, then Continue Shopping, then open cart again', async () => {
        await inventoryPage.openCart();
        await cartPage.continueShoppingButton.click();
        await expect(inventoryPage.title).toHaveText('Products');
        await inventoryPage.openCart();
      });

      await test.step('3. Both products are still listed', async () => {
        await expect(cartPage.itemNames).toHaveText(products);
      });
    },
  );
});
