import { z } from 'zod';

/**
 * Contract schemas for restful-booker. Validating responses against a schema catches
 * "field renamed / type changed" regressions that a status-code check would miss.
 */
export const BookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: z.object({ checkin: z.iso.date(), checkout: z.iso.date() }),
  additionalneeds: z.string().optional(),
});

export const CreatedBookingSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdListSchema = z.array(z.object({ bookingid: z.number().int() }));

export const AuthResponseSchema = z.object({ token: z.string().min(1) });

export type Booking = z.infer<typeof BookingSchema>;
