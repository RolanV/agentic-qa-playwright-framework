import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { users } from '@data/users';

/**
 * Runs once before the UI project: log in through the UI and save the session.
 * Every UI test then starts already authenticated → faster and not coupled to the login screen.
 * (Login itself is still tested explicitly in tests/ui/login.spec.ts.)
 */
setup('authenticate as standard user', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(users.standard);
  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: '.auth/standard-user.json' });
});
