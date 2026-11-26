import { faker } from '@faker-js/faker';

/**
 * Data factories: every test gets fresh, random-but-valid data.
 * → tests are parallel-safe (no two tests fight over the same record)
 * → overrides let a test pin only the fields it cares about.
 */
export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const buildCheckoutInfo = (overrides: Partial<CheckoutInfo> = {}): CheckoutInfo => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  postalCode: faker.location.zipCode('#####'),
  ...overrides,
});

export interface BookingPayload {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export const buildBooking = (overrides: Partial<BookingPayload> = {}): BookingPayload => {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = faker.date.soon({ days: 7, refDate: checkin });
  return {
    firstname: faker.person.firstName(),
    lastname: `qa-${faker.string.alphanumeric(8)}`, // prefix makes test data easy to spot/clean
    totalprice: faker.number.int({ min: 50, max: 900 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: { checkin: isoDate(checkin), checkout: isoDate(checkout) },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
};
