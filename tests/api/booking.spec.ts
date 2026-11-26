import { test, expect } from '@fixtures';
import { buildBooking } from '@data/factories';
import { BookingSchema, BookingIdListSchema, CreatedBookingSchema } from '@api/schemas';

/**
 * Epic BK-200 — Booking API (restful-booker).  Traceability: tracker/stories/BK-201.md
 * Pattern: Arrange (factory) → Act (client) → Assert (status + schema + values).
 * Cleanup is automatic: the bookingApi fixture deletes everything it created.
 */
test.describe('BK-201 Booking CRUD', { tag: '@api' }, () => {
  test(
    'BK-T-101 [API][Booking] Create booking returns id and echoes payload',
    {
      tag: ['@smoke', '@BK-T-101'],
    },
    async ({ bookingApi }) => {
      const payload = buildBooking();
      const res = await bookingApi.create(payload);

      expect(res.status()).toBe(200);
      const body = CreatedBookingSchema.parse(await res.json());
      expect(body.booking).toEqual(payload);
    },
  );

  test(
    'BK-T-102 [API][Booking] Get booking by id matches the created data',
    {
      tag: ['@regression', '@BK-T-102'],
    },
    async ({ bookingApi }) => {
      const payload = buildBooking();
      const { bookingid } = CreatedBookingSchema.parse(await (await bookingApi.create(payload)).json());

      const res = await bookingApi.get(bookingid);
      expect(res.status()).toBe(200);
      expect(BookingSchema.parse(await res.json())).toEqual(payload);
    },
  );

  test(
    'BK-T-103 [API][Booking] Update without a token is rejected (403)',
    {
      tag: ['@regression', '@security', '@BK-T-103'],
    },
    async ({ bookingApi, request }) => {
      const { bookingid } = CreatedBookingSchema.parse(
        await (await bookingApi.create(buildBooking())).json(),
      );

      // Raw request on purpose: the client always sends the token.
      const res = await request.put(`/booking/${bookingid}`, { data: buildBooking() });
      expect(res.status()).toBe(403);
    },
  );

  test(
    'BK-T-104 [API][Booking] Partial update changes only the patched fields',
    {
      tag: ['@regression', '@BK-T-104'],
    },
    async ({ bookingApi }) => {
      const original = buildBooking();
      const { bookingid } = CreatedBookingSchema.parse(await (await bookingApi.create(original)).json());

      const res = await bookingApi.partialUpdate(bookingid, { firstname: 'Patched', totalprice: 111 });
      expect(res.status()).toBe(200);
      expect(BookingSchema.parse(await res.json())).toEqual({
        ...original,
        firstname: 'Patched',
        totalprice: 111,
      });
    },
  );

  test(
    'BK-T-105 [API][Booking] Deleted booking can no longer be fetched',
    {
      tag: ['@regression', '@BK-T-105'],
    },
    async ({ bookingApi }) => {
      const { bookingid } = CreatedBookingSchema.parse(
        await (await bookingApi.create(buildBooking())).json(),
      );

      const del = await bookingApi.delete(bookingid);
      expect(del.status()).toBe(201); // restful-booker quirk: DELETE returns 201 Created
      expect((await bookingApi.get(bookingid)).status()).toBe(404);
    },
  );

  test(
    'BK-T-106 [API][Booking] Booking list matches the contract',
    {
      tag: ['@smoke', '@contract', '@BK-T-106'],
    },
    async ({ bookingApi }) => {
      const res = await bookingApi.list();
      expect(res.status()).toBe(200);
      const list = BookingIdListSchema.parse(await res.json());
      expect(list.length).toBeGreaterThan(0);
    },
  );
});
