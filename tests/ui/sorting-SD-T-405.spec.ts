import { test, expect } from '@fixtures';

/**
 * SD-T-405 — [UI][Sorting] Price high to low sorts numerically
 * Story: SD-104 (AC4: price sorting is numeric) · Priority: Medium · Labels: ui, sorting, regression, boundary
 * Precondition: Standard user is logged in and is on the Products page showing the default order.
 *
 * The string-vs-number trap in DESCENDING order: a text sort descending compares the first character,
 * so "$9.99" > "$7.99" > "$49.99" > "$29.99" > "$15.99" — i.e. Bike Light and Onesie would come FIRST.
 * Steps 3 and 4 guard exactly that.
 *
 * The two $15.99 products tie; their relative order is an OPEN product-owner question, so this test
 * asserts the PRICE sequence and relative positions — never the tie's name order.
 */

const BOLT_TSHIRT = 'Sauce Labs Bolt T-Shirt';
const RED_TSHIRT = 'Test.allTheThings() T-Shirt (Red)';
const BIKE_LIGHT = 'Sauce Labs Bike Light';
const ONESIE = 'Sauce Labs Onesie';

test(
  'SD-T-405 [UI][Sorting] Price high to low sorts numerically',
  {
    tag: ['@regression', '@SD-T-405'],
    annotation: { type: 'tracker', description: 'SD-T-405' },
  },
  async ({ inventoryPage }) => {
    // Precondition: Products page in its default order.
    await inventoryPage.goto();
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.activeSortOption).toHaveText('Name (A to Z)');

    await test.step('1. Select "Price (high to low)"', async () => {
      await inventoryPage.sortBy('hilo');
      await expect(inventoryPage.sortSelect).toHaveValue('hilo');
      await expect(inventoryPage.activeSortOption).toHaveText('Price (high to low)');
    });

    await test.step('2. Read the prices from top to bottom', async () => {
      // Tracker literal (web-first, retries until the list has re-rendered).
      await expect(inventoryPage.itemPrices).toHaveText([
        '$49.99',
        '$29.99',
        '$15.99',
        '$15.99',
        '$9.99',
        '$7.99',
      ]);

      // Numeric check: parsed prices equal the expected sequence and are descending by NUMBER.
      const prices = await inventoryPage.getPrices();
      expect(prices).toEqual([49.99, 29.99, 15.99, 15.99, 9.99, 7.99]);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    await test.step('3. Compare the position of Sauce Labs Bike Light ($9.99) with the two $15.99 products', async () => {
      // The products being compared carry the prices the tracker names.
      await expect(inventoryPage.item(BIKE_LIGHT).getByTestId('inventory-item-price')).toHaveText('$9.99');
      await expect(inventoryPage.item(BOLT_TSHIRT).getByTestId('inventory-item-price')).toHaveText('$15.99');
      await expect(inventoryPage.item(RED_TSHIRT).getByTestId('inventory-item-price')).toHaveText('$15.99');

      // A text-based descending sort would put "$9.99" before "$15.99" — this is the regression being guarded.
      const names = await inventoryPage.getNames();
      expect(names).toEqual(expect.arrayContaining([BIKE_LIGHT, BOLT_TSHIRT, RED_TSHIRT]));
      const bikeLight = names.indexOf(BIKE_LIGHT);
      expect(bikeLight, `${BIKE_LIGHT} after ${BOLT_TSHIRT}`).toBeGreaterThan(names.indexOf(BOLT_TSHIRT));
      expect(bikeLight, `${BIKE_LIGHT} after ${RED_TSHIRT}`).toBeGreaterThan(names.indexOf(RED_TSHIRT));
    });

    await test.step('4. Check the last product in the list', async () => {
      // A text-based descending sort would put "$7.99" second, not last.
      await expect(inventoryPage.itemNames.last()).toHaveText(ONESIE);
      await expect(inventoryPage.itemPrices.last()).toHaveText('$7.99');
      await expect(inventoryPage.item(ONESIE).getByTestId('inventory-item-price')).toHaveText('$7.99');
    });
  },
);
