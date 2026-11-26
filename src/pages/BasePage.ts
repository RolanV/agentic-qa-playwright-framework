import { type Locator, type Page, expect } from '@playwright/test';

/**
 * BasePage holds what every SauceDemo screen shares (header, cart badge, burger menu).
 * Page objects expose INTENT (`addToCart('Sauce Labs Backpack')`), not mechanics (`click('#btn-3')`).
 * Assertions about business outcomes live in specs; page objects may expose small `expect*` helpers
 * for checks that are reused across many specs.
 */
export abstract class BasePage {
  abstract readonly path: string;

  readonly title: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByTestId('title');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }

  /** Badge is absent when the cart is empty, so 0 is asserted as "not visible". */
  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toBeHidden();
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }
}
