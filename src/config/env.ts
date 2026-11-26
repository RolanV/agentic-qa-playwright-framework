import 'dotenv/config';
import { z } from 'zod';

/**
 * Single source of truth for environment configuration.
 * Validated at startup: a missing/typo'd variable fails fast with a clear message
 * instead of producing a confusing test failure later.
 * Rule (CLAUDE.md): tests and page objects NEVER hardcode URLs or credentials.
 */
const EnvSchema = z.object({
  BASE_URL: z.url().default('https://www.saucedemo.com'),
  API_URL: z.url().default('https://restful-booker.herokuapp.com'),
  STANDARD_USER: z.string().min(1).default('standard_user'),
  LOCKED_USER: z.string().min(1).default('locked_out_user'),
  USER_PASSWORD: z.string().min(1).default('secret_sauce'),
  API_USER: z.string().min(1).default('admin'),
  API_PASSWORD: z.string().min(1).default('password123'),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
export type Env = typeof env;
