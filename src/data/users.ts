import { env } from '@config/env';

/** Named personas keep tests readable: `users.lockedOut` says more than a raw username. */
export const users = {
  standard: { username: env.STANDARD_USER, password: env.USER_PASSWORD },
  lockedOut: { username: env.LOCKED_USER, password: env.USER_PASSWORD },
  invalid: { username: 'not_a_user', password: 'wrong_password' },
} as const;

export type User = (typeof users)[keyof typeof users];
