import { test as base, expect } from '@playwright/test';
import { LoginPage, InventoryPage, CartPage, CheckoutPage } from '@pages/index';
import { BookingClient } from '@api/BookingClient';

/**
 * Custom fixtures = dependency injection for tests.
 * A spec asks for what it needs (`async ({ inventoryPage }) => ...`) and gets a ready object.
 * Setup + teardown live here once, not copy-pasted into every spec.
 */
interface Fixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  bookingApi: BookingClient;
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  bookingApi: async ({ request }, use) => {
    const client = new BookingClient(request);
    await client.authenticate();
    await use(client);
    await client.cleanup(); // teardown: delete every booking the test created
  },
});

export { expect };
