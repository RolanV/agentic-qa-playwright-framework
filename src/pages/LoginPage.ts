import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { User } from '@data/users';

export class LoginPage extends BasePage {
  readonly path = '/';

  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
  }

  async login(user: Pick<User, 'username' | 'password'>): Promise<void> {
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.loginButton.click();
  }
}
