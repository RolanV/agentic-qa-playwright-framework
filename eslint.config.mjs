import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'test-results', 'blob-report', 'tests/.temp/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
  {
    // Quality gates the agents must also respect (see CLAUDE.md).
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error', // no hard waits
      'playwright/no-force-option': 'error', // no clicking through overlays
      'playwright/no-focused-test': 'error', // no test.only in commits
      'playwright/no-skipped-test': 'warn',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/expect-expect': ['error', { assertFunctionNames: ['expect*', '*.expect*', '*.assert*'] }],
    },
  },
);
