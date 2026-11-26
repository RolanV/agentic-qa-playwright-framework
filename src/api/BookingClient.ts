import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { env } from '@config/env';
import type { BookingPayload } from '@data/factories';
import { AuthResponseSchema } from './schemas';

/**
 * Thin, typed wrapper over restful-booker.
 * Returns raw APIResponse so specs decide what to assert (status, headers, body/schema).
 * Tracks created ids so the fixture can clean up after each test.
 */
export class BookingClient {
  private token?: string;
  readonly createdIds: number[] = [];

  constructor(private readonly request: APIRequestContext) {}

  async authenticate(username = env.API_USER, password = env.API_PASSWORD): Promise<string> {
    const res = await this.request.post('/auth', { data: { username, password } });
    const body = AuthResponseSchema.parse(await res.json());
    this.token = body.token;
    return body.token;
  }

  private authHeaders(): Record<string, string> {
    if (!this.token) throw new Error('BookingClient: call authenticate() before write operations');
    return { Cookie: `token=${this.token}` };
  }

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  list(filter: Partial<{ firstname: string; lastname: string }> = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params: filter });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async create(payload: BookingPayload): Promise<APIResponse> {
    const res = await this.request.post('/booking', { data: payload });
    if (res.ok()) this.createdIds.push((await res.json()).bookingid);
    return res;
  }

  update(id: number, payload: BookingPayload): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: payload, headers: this.authHeaders() });
  }

  partialUpdate(id: number, patch: Partial<BookingPayload>): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: patch, headers: this.authHeaders() });
  }

  delete(id: number, withAuth = true): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: withAuth ? this.authHeaders() : {} });
  }

  /** Best-effort cleanup of everything this client created. */
  async cleanup(): Promise<void> {
    if (!this.token) await this.authenticate();
    for (const id of this.createdIds.splice(0)) {
      await this.delete(id).catch(() => undefined);
    }
  }
}
