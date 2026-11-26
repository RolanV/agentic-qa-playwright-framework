import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

const isCI = !!process.env.CI;

/**
 * Projects:
 *  - setup        logs in once and saves storageState (reused by UI tests → faster, isolated from login flakiness)
 *  - ui-chromium  browser tests for SauceDemo
 *  - api          restful-booker API tests (no browser)
 *  - temp         agent-generated specs in tests/.temp (Step 5 sandbox; never part of the main run)
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0, // retries only in CI — locally we want to SEE flakiness
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['blob'], ['github'], ['list']] : [['html', { open: 'never' }], ['list']],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: env.BASE_URL,
    testIdAttribute: 'data-test', // SauceDemo exposes data-test="..." on every interactive element
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /setup\/.*\.setup\.ts/ },
    {
      name: 'ui-chromium',
      testMatch: /ui\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: '.auth/standard-user.json' },
    },
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: { baseURL: env.API_URL, extraHTTPHeaders: { Accept: 'application/json' } },
    },
    {
      name: 'temp',
      testDir: './tests/.temp',
      testMatch: /.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: '.auth/standard-user.json' },
    },
  ],
});
