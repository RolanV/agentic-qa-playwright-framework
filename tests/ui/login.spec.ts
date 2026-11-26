import { test, expect } from '@fixtures';
import { users } from '@data/users';

/**
 * Story SD-101 — Login.  Traceability: tracker/stories/SD-101.md, tracker/tests/SD-T-10x.json
 * Conventions shown here (copied by agents):
 *  - one test() per tracker test ID, ID first in the title
 *  - tags: @smoke/@regression + the test ID (filter with --grep @SD-T-101)
 *  - tracker steps map 1:1 to test.step()
 */
test.describe('SD-101 Login', { tag: '@login' }, () => {
  // Login tests must start logged OUT, so drop the saved session for this file.
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    'SD-T-101 [UI][Login] Standard user logs in and lands on Products',
    {
      tag: ['@smoke', '@SD-T-101'],
      annotation: { type: 'tracker', description: 'SD-T-101' },
    },
    async ({ loginPage, inventoryPage, page }) => {
      await test.step('1. Enter valid username and password and submit', async () => {
        await loginPage.login(users.standard);
      });

      await test.step('2. Products page is shown with the inventory list', async () => {
        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.title).toHaveText('Products');
        await expect(inventoryPage.items.first()).toBeVisible();
      });
    },
  );

  test(
    'SD-T-102 [UI][Login] Locked-out user sees a lockout error',
    {
      tag: ['@regression', '@SD-T-102'],
      annotation: { type: 'tracker', description: 'SD-T-102' },
    },
    async ({ loginPage, page }) => {
      await test.step('1. Submit credentials of the locked-out user', async () => {
        await loginPage.login(users.lockedOut);
      });

      await test.step('2. Error explains the user is locked out and user stays on login', async () => {
        await expect(loginPage.error).toHaveText('Epic sadface: Sorry, this user has been locked out.');
        await expect(page).not.toHaveURL(/inventory\.html/);
      });
    },
  );

  const invalidCases = [
    {
      name: 'wrong password',
      creds: { username: users.standard.username, password: 'nope' },
      error: 'Epic sadface: Username and password do not match any user in this service',
    },
    {
      name: 'empty username',
      creds: { username: '', password: 'x' },
      error: 'Epic sadface: Username is required',
    },
    {
      name: 'empty password',
      creds: { username: 'someone', password: '' },
      error: 'Epic sadface: Password is required',
    },
  ];

  // Data-driven: one tracker test (SD-T-103) with a dataset → one Playwright test per row.
  for (const { name, creds, error } of invalidCases) {
    test(
      `SD-T-103 [UI][Login] Invalid login is rejected — ${name}`,
      {
        tag: ['@regression', '@SD-T-103'],
        annotation: { type: 'tracker', description: 'SD-T-103' },
      },
      async ({ loginPage }) => {
        await test.step('1. Submit invalid credentials', async () => {
          await loginPage.login(creds);
        });

        await test.step('2. Matching validation error is displayed', async () => {
          await expect(loginPage.error).toHaveText(error);
        });
      },
    );
  }

  test(
    'SD-T-104 [UI][Login] User can log out from the menu',
    {
      tag: ['@regression', '@SD-T-104'],
      annotation: { type: 'tracker', description: 'SD-T-104' },
    },
    async ({ loginPage, inventoryPage, page }) => {
      await test.step('1. Log in as standard user', async () => {
        await loginPage.login(users.standard);
        await expect(inventoryPage.title).toHaveText('Products');
      });

      await test.step('2. Open menu and click Logout', async () => {
        await inventoryPage.logout();
      });

      await test.step('3. Login form is shown again', async () => {
        await expect(loginPage.loginButton).toBeVisible();
        await expect(page).not.toHaveURL(/inventory\.html/);
      });
    },
  );
});
