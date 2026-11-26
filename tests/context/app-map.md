# App map — context for agents

## SauceDemo (UI) — `BASE_URL`
| Screen | Path | Title (`data-test="title"`) | Page object |
|---|---|---|---|
| Login | `/` | — (logo) | `LoginPage` |
| Inventory | `/inventory.html` | `Products` | `InventoryPage` |
| Cart | `/cart.html` | `Your Cart` | `CartPage` |
| Checkout step 1 | `/checkout-step-one.html` | `Checkout: Your Information` | `CheckoutPage` |
| Checkout step 2 | `/checkout-step-two.html` | `Checkout: Overview` | `CheckoutPage` |
| Complete | `/checkout-complete.html` | `Checkout: Complete!` | `CheckoutPage` |

Users (password `secret_sauce`): `standard_user`, `locked_out_user`, `problem_user`,
`performance_glitch_user`, `error_user`, `visual_user`. Tests use `standard_user` unless the case says otherwise.

Facts worth knowing:
- Cart is stored in localStorage → each test (fresh context) starts with an empty cart.
- Tax is 8% of the item total, rounded to cents. Money labels: `Item total: $39.98`, `Tax: $3.20`, `Total: $43.18`.
- Error banner: `data-test="error"`, texts start with `Epic sadface:` (login) or `Error:` (checkout).
- Product prices: Backpack 29.99 · Bike Light 9.99 · Bolt T-Shirt 15.99 · Fleece Jacket 49.99 · Onesie 7.99 · Red T-Shirt 15.99.

## restful-booker (API) — `API_URL`
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth` | — | `{ username, password }` → `{ token }` |
| GET | `/booking` | — | `[{ bookingid }]`, filters `firstname`, `lastname` |
| GET | `/booking/{id}` | — | 404 when missing |
| POST | `/booking` | — | → `{ bookingid, booking }` |
| PUT/PATCH | `/booking/{id}` | Cookie `token=…` | 403 without token |
| DELETE | `/booking/{id}` | Cookie `token=…` | returns **201** (API quirk) |
| GET | `/ping` | — | 201 = healthy |

The public instance resets periodically and is shared by everyone → always create your own data.
