import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { CheckoutInfo } from '@data/factories';

/**
 * Covers the 3 checkout screens (information → overview → complete).
 * One class is fine here because the screens form a single linear flow;
 * split it if the screens start to grow independent behaviour.
 */
export class CheckoutPage extends BasePage {
  readonly path = '/checkout-step-one.html';

  // Step one: your information
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;
  // Step two: overview
  readonly overviewItems: Locator;
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  // Complete
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.error = page.getByTestId('error');
    this.overviewItems = page.getByTestId('inventory-item');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async fillInformation(info: Partial<CheckoutInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstName.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastName.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCode.fill(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  /** Parses "$12.34" style labels, e.g. "Item total: $29.99" → 29.99 */
  static money(label: string): number {
    const match = label.match(/\$(\d+(?:\.\d{1,2})?)/);
    if (!match?.[1]) throw new Error(`No money value in label: "${label}"`);
    return Number(match[1]);
  }

  async getAmounts(): Promise<{ items: number[]; subtotal: number; tax: number; total: number }> {
    const items = (await this.itemPrices.allTextContents()).map(CheckoutPage.money);
    return {
      items,
      subtotal: CheckoutPage.money((await this.subtotal.textContent()) ?? ''),
      tax: CheckoutPage.money((await this.tax.textContent()) ?? ''),
      total: CheckoutPage.money((await this.total.textContent()) ?? ''),
    };
  }
}
