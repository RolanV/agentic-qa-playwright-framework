import { test, expect } from '@fixtures';

/**
 * SD-T-401 — [UI][Sorting] Sort dropdown offers the four sort options
 * Story: SD-104 (AC1: the sort dropdown offers the four options) · Priority: Low · Labels: ui, sorting, regression, positive
 * Precondition: Standard user is logged in and is on the Products page.
 *
 * Option VALUES (az/za/lohi/hilo) are deliberately not asserted: the tracker and AC1 only specify what the
 * shopper sees (labels, count, order). The values are internal keys; they are already exercised by
 * SD-T-402/404/405, which select by value and assert `toHaveValue(...)` together with the visible label.
 */

const EXPECTED_SORT_LABELS = ['Name (A to Z)', 'Name (Z to A)', 'Price (low to high)', 'Price (high to low)'];

test(
  'SD-T-401 [UI][Sorting] Sort dropdown offers the four sort options',
  {
    tag: ['@regression', '@SD-T-401'],
    annotation: { type: 'tracker', description: 'SD-T-401' },
  },
  async ({ inventoryPage }) => {
    // Precondition: Products page.
    await inventoryPage.goto();
    await expect(inventoryPage.title).toHaveText('Products');

    await test.step('1. Open the sort dropdown on the Products page', async () => {
      // The dropdown is a native <select>: its <option> elements are always in the DOM and the
      // accessibility tree, and the open popup is drawn by the browser/OS (not part of the page), so a
      // click would neither reveal nor verify anything. "Opening" is therefore satisfied by locating the
      // visible, enabled dropdown and reading its options directly (confirmed on the live app via MCP).
      await expect(inventoryPage.sortSelect).toBeVisible();
      await expect(inventoryPage.sortSelect).toBeEnabled();
      await expect(inventoryPage.sortOptions).toHaveCount(EXPECTED_SORT_LABELS.length); // exactly 4
    });

    await test.step('2. Read the option labels from top to bottom', async () => {
      // Count alone (step 1) would still pass with a misspelled, renamed or re-ordered label; the
      // ordered labels alone would not state the "exactly 4" intent of step 1. Both are asserted, and
      // `toHaveText([...])` with an array is itself exact-length + exact-order + exact-text (retrying).
      await expect(inventoryPage.sortOptions).toHaveText(EXPECTED_SORT_LABELS);
    });
  },
);
