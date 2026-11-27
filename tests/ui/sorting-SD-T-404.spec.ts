import { test, expect } from '@fixtures';

/**
 * SD-T-404 — [UI][Sorting] Price low to high sorts numerically
 * Story: SD-104 (AC4: price sorting is numeric) · Priority: Medium · Labels: ui, sorting, regression, boundary
 * Precondition: Standard user is logged in and is on the Products page showing the default order.
 *
 * The two $15.99 products tie; their relative order is an OPEN product-owner question, so this test
 * asserts the PRICE sequence and the "cheaper before $15.99" relations — never the tie's name order.
 */

const BOLT_TSHIRT = 'Sauce Labs Bolt T-Shirt';
const RED_TSHIRT = 'Test.allTheThings() T-Shirt (Red)';
const ONESIE = 'Sauce Labs Onesie';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

/** Position of a product in the rendered list; fails loudly if the product is missing. */
function positionOf(names: string[], name: string): number {
  expect(names, `"${name}" should be listed`).toContain(name);
  return names.indexOf(name);
}

test(
  'SD-T-404 [UI][Sorting] Price low to high sorts numerically',
  {
    tag: ['@regression', '@SD-T-404'],
    annotation: { type: 'tracker', description: 'SD-T-404' },
  },
  async ({ inventoryPage }) => {
    // Precondition: Products page in its default order.
    await inventoryPage.goto();
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.activeSortOption).toHaveText('Name (A to Z)');

    await test.step('1. Select "Price (low to high)"', async () => {
      await inventoryPage.sortBy('lohi');
      await expect(inventoryPage.sortSelect).toHaveValue('lohi');
      await expect(inventoryPage.activeSortOption).toHaveText('Price (low to high)');
    });

    await test.step('2. Read the prices from top to bottom', async () => {
      // Tracker literal (web-first, retries until the list has re-rendered).
      await expect(inventoryPage.itemPrices).toHaveText([
        '$7.99',
        '$9.99',
        '$15.99',
        '$15.99',
        '$29.99',
        '$49.99',
      ]);

      // Numeric check: parsed prices equal the expected sequence and are ascending by NUMBER.
      const prices = await inventoryPage.getPrices();
      expect(prices).toEqual([7.99, 9.99, 15.99, 15.99, 29.99, 49.99]);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    await test.step('3. Compare the positions of Sauce Labs Onesie ($7.99) and the two $15.99 products', async () => {
      const names = await inventoryPage.getNames();
      const onesie = positionOf(names, ONESIE);
      expect(onesie, `${ONESIE} before ${BOLT_TSHIRT}`).toBeLessThan(positionOf(names, BOLT_TSHIRT));
      expect(onesie, `${ONESIE} before ${RED_TSHIRT}`).toBeLessThan(positionOf(names, RED_TSHIRT));
    });

    await test.step('4. Compare the position of Sauce Labs Bike Light ($9.99) with the two $15.99 products', async () => {
      // A text-based sort would put "$15.99" before "$9.99" — this is the regression being guarded.
      const names = await inventoryPage.getNames();
      const bikeLight = positionOf(names, BIKE_LIGHT);
      expect(bikeLight, `${BIKE_LIGHT} before ${BOLT_TSHIRT}`).toBeLessThan(positionOf(names, BOLT_TSHIRT));
      expect(bikeLight, `${BIKE_LIGHT} before ${RED_TSHIRT}`).toBeLessThan(positionOf(names, RED_TSHIRT));
    });
  },
);
