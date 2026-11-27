import { test, expect } from '@fixtures';

/**
 * SD-T-402 — [UI][Sorting] Products are sorted by name A to Z by default
 * Story: SD-104 (AC2: default order is Name (A to Z)) · Priority: Low · Labels: ui, sorting, regression, positive
 * Precondition: Standard user has just logged in and is on the Products page; no sort option has been chosen.
 *
 * This test is about the DEFAULT order, so it never calls `sortBy()`. The fresh browser context starts from
 * the saved login state and the sort choice is not persisted, so landing on the page = "no option chosen".
 */

const EXPECTED_DEFAULT_ORDER = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)',
];

test(
  'SD-T-402 [UI][Sorting] Products are sorted by name A to Z by default',
  {
    tag: ['@regression', '@SD-T-402'],
    annotation: { type: 'tracker', description: 'SD-T-402' },
  },
  async ({ inventoryPage }) => {
    // Precondition: Products page, straight after login, no sort option chosen.
    await inventoryPage.goto();
    await expect(inventoryPage.title).toHaveText('Products');

    await test.step('1. Read the selected value of the sort dropdown', async () => {
      await expect(inventoryPage.activeSortOption).toHaveText('Name (A to Z)');
      // The visible label is a span over the native <select>; the select's own value must agree.
      await expect(inventoryPage.sortSelect).toHaveValue('az');
    });

    await test.step('2. Read the product names from top to bottom', async () => {
      // Tracker literal (web-first, retries until the list is rendered).
      await expect(inventoryPage.itemNames).toHaveText(EXPECTED_DEFAULT_ORDER);

      // Independent check: the rendered order IS alphabetical, so the literal above and the app
      // cannot silently agree on a wrong order. Default JS sort = UTF-16 code-unit order, which is
      // locale-independent (same result on every CI machine). For the current catalogue it is
      // identical to `localeCompare('en')`; they would only diverge on mixed-case/punctuation names.
      const names = await inventoryPage.getNames();
      expect(names).toHaveLength(EXPECTED_DEFAULT_ORDER.length);
      expect(names, 'default order is alphabetical A to Z').toEqual([...names].sort());
    });
  },
);
