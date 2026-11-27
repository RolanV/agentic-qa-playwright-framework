# Test cases: SD-104 Product sorting (drafts)

Source: `tracker/stories/SD-104.md`, plan `artifacts/plans/test-plan-SD-100.md` section 6, prices from `tests/context/app-map.md`.
Style mirrored from SD-T-302 (dataset, `{{placeholder}}` steps), SD-T-203 (precondition wording), SD-T-303 (explicit money values).

## Duplicate check
No existing tracker test has `"story": "SD-104"` (checked SD-T-101..303, BK-T-*). Nothing is "already covered by". SD-T-203 touches cart persistence but not sorting.

## Summary

| draftId | Title | AC covered | Priority |
|---|---|---|---|
| TC-1 | [UI][Sorting] Sort dropdown offers the four sort options | AC1 | Low |
| TC-2 | [UI][Sorting] Products are sorted by name A to Z by default | AC2 | Low |
| TC-3 | [UI][Sorting] Each sort option re-orders all six products | AC1, AC3 (incl. A-Z / Z-A round trip) | Medium |
| TC-4 | [UI][Sorting] Price low to high sorts numerically | AC4 | Medium |
| TC-5 | [UI][Sorting] Price high to low sorts numerically | AC4 | Medium |
| TC-6 | [UI][Sorting] Changing the sort does not reload the page | AC3 | Medium |
| TC-7 | [UI][Sorting] Changing the sort does not change the cart contents | AC5 | Medium |

AC coverage: AC1 TC-1, TC-3 · AC2 TC-2 · AC3 TC-3, TC-6 · AC4 TC-4, TC-5 · AC5 TC-7. All 5 ACs mapped.

Product names used: Sauce Labs Backpack ($29.99), Sauce Labs Bike Light ($9.99), Sauce Labs Bolt T-Shirt ($15.99), Sauce Labs Fleece Jacket ($49.99), Sauce Labs Onesie ($7.99), Test.allTheThings() T-Shirt (Red) ($15.99).

## Notes
- Plan S9 (A-Z -> Z-A -> A-Z idempotence) is merged into TC-3 as its last two steps; no separate case.
- The two $15.99 items (Bolt T-Shirt, Test.allTheThings() T-Shirt (Red)) tie, and the story does not define their order. TC-3, TC-4 and TC-5 therefore expect them "in either order" and assert only that both sit between the neighbouring prices. Once the PO answers (below), the expectation can be tightened.
- Plan S5 wording: in high-to-low, Bike Light $9.99 must come after both $15.99 items (string comparison would put "$9.99" first).

## Not drafted, pending PO answers
- **S6 Tie order of the two $15.99 items in both price sorts** (AC4). Question: when two products have the same price, what order should they appear in for Price (low to high) and Price (high to low)? Fixed order (e.g. by name A-Z in both directions), or reversed with the direction?
- **S10 Sort persistence** (AC2 / open). Question: after choosing a sort, then opening the cart and returning to Products (or logging out and in again), should the selection be kept, or reset to Name (A to Z)?

## Cases

```json
{
  "draftId": "TC-1",
  "story": "SD-104",
  "title": "[UI][Sorting] Sort dropdown offers the four sort options",
  "priority": "Low",
  "labels": ["ui", "sorting", "regression", "positive"],
  "precondition": "Standard user is logged in and is on the Products page.",
  "steps": [
    {
      "action": "Open the sort dropdown on the Products page",
      "expected": "The dropdown lists exactly 4 options"
    },
    {
      "action": "Read the option labels from top to bottom",
      "expected": "Labels in order are: \"Name (A to Z)\", \"Name (Z to A)\", \"Price (low to high)\", \"Price (high to low)\""
    }
  ],
  "gherkin": "Given I am on the Products page\nWhen I open the sort dropdown\nThen I see exactly the options \"Name (A to Z)\", \"Name (Z to A)\", \"Price (low to high)\" and \"Price (high to low)\" in that order"
}
```

```json
{
  "draftId": "TC-2",
  "story": "SD-104",
  "title": "[UI][Sorting] Products are sorted by name A to Z by default",
  "priority": "Low",
  "labels": ["ui", "sorting", "regression", "positive"],
  "precondition": "Standard user has just logged in and is on the Products page; no sort option has been chosen.",
  "steps": [
    {
      "action": "Read the selected value of the sort dropdown",
      "expected": "The dropdown shows \"Name (A to Z)\""
    },
    {
      "action": "Read the product names from top to bottom",
      "expected": "Order is: Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket, Sauce Labs Onesie, Test.allTheThings() T-Shirt (Red)"
    }
  ],
  "gherkin": "Given I have just logged in as a standard user\nThen the sort dropdown shows \"Name (A to Z)\"\nAnd the six products are listed alphabetically by name"
}
```

```json
{
  "draftId": "TC-3",
  "story": "SD-104",
  "title": "[UI][Sorting] Each sort option re-orders all six products",
  "priority": "Medium",
  "labels": ["ui", "sorting", "regression", "positive"],
  "precondition": "Standard user is logged in and is on the Products page showing the default order.",
  "steps": [
    {
      "action": "Select the sort option {{option}}",
      "data": "dataset row",
      "expected": "The dropdown shows {{option}}"
    },
    {
      "action": "Read the product names from top to bottom",
      "expected": "{{order}}"
    },
    {
      "action": "Select \"Name (A to Z)\" again",
      "expected": "Order returns to: Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket, Sauce Labs Onesie, Test.allTheThings() T-Shirt (Red)"
    }
  ],
  "gherkin": "Given I am on the Products page\nWhen I select <option>\nThen the six products are listed in <order>\nAnd selecting \"Name (A to Z)\" again restores the original order",
  "dataset": [
    {
      "option": "Name (A to Z)",
      "order": "Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket, Sauce Labs Onesie, Test.allTheThings() T-Shirt (Red)"
    },
    {
      "option": "Name (Z to A)",
      "order": "Test.allTheThings() T-Shirt (Red), Sauce Labs Onesie, Sauce Labs Fleece Jacket, Sauce Labs Bolt T-Shirt, Sauce Labs Bike Light, Sauce Labs Backpack"
    },
    {
      "option": "Price (low to high)",
      "order": "Sauce Labs Onesie ($7.99), Sauce Labs Bike Light ($9.99), then Sauce Labs Bolt T-Shirt and Test.allTheThings() T-Shirt (Red) (both $15.99, either order), Sauce Labs Backpack ($29.99), Sauce Labs Fleece Jacket ($49.99)"
    },
    {
      "option": "Price (high to low)",
      "order": "Sauce Labs Fleece Jacket ($49.99), Sauce Labs Backpack ($29.99), then Sauce Labs Bolt T-Shirt and Test.allTheThings() T-Shirt (Red) (both $15.99, either order), Sauce Labs Bike Light ($9.99), Sauce Labs Onesie ($7.99)"
    }
  ]
}
```

```json
{
  "draftId": "TC-4",
  "story": "SD-104",
  "title": "[UI][Sorting] Price low to high sorts numerically",
  "priority": "Medium",
  "labels": ["ui", "sorting", "regression", "boundary"],
  "precondition": "Standard user is logged in and is on the Products page showing the default order.",
  "steps": [
    {
      "action": "Select \"Price (low to high)\"",
      "expected": "The dropdown shows \"Price (low to high)\""
    },
    {
      "action": "Read the prices from top to bottom",
      "expected": "Prices are: $7.99, $9.99, $15.99, $15.99, $29.99, $49.99"
    },
    {
      "action": "Compare the positions of Sauce Labs Onesie ($7.99) and the two $15.99 products",
      "expected": "Sauce Labs Onesie is listed before Sauce Labs Bolt T-Shirt and Test.allTheThings() T-Shirt (Red)"
    },
    {
      "action": "Compare the position of Sauce Labs Bike Light ($9.99) with the two $15.99 products",
      "expected": "Sauce Labs Bike Light is listed before both $15.99 products (a text-based sort would place \"$15.99\" first)"
    }
  ],
  "gherkin": "Given I am on the Products page\nWhen I select \"Price (low to high)\"\nThen prices read $7.99, $9.99, $15.99, $15.99, $29.99, $49.99\nAnd $9.99 comes before $15.99"
}
```

```json
{
  "draftId": "TC-5",
  "story": "SD-104",
  "title": "[UI][Sorting] Price high to low sorts numerically",
  "priority": "Medium",
  "labels": ["ui", "sorting", "regression", "boundary"],
  "precondition": "Standard user is logged in and is on the Products page showing the default order.",
  "steps": [
    {
      "action": "Select \"Price (high to low)\"",
      "expected": "The dropdown shows \"Price (high to low)\""
    },
    {
      "action": "Read the prices from top to bottom",
      "expected": "Prices are: $49.99, $29.99, $15.99, $15.99, $9.99, $7.99"
    },
    {
      "action": "Compare the position of Sauce Labs Bike Light ($9.99) with the two $15.99 products",
      "expected": "Sauce Labs Bike Light is listed after both Sauce Labs Bolt T-Shirt and Test.allTheThings() T-Shirt (Red) (a text-based sort would place \"$9.99\" before \"$15.99\")"
    },
    {
      "action": "Check the last product in the list",
      "expected": "Sauce Labs Onesie ($7.99) is last"
    }
  ],
  "gherkin": "Given I am on the Products page\nWhen I select \"Price (high to low)\"\nThen prices read $49.99, $29.99, $15.99, $15.99, $9.99, $7.99\nAnd $9.99 comes after both $15.99 products"
}
```

```json
{
  "draftId": "TC-6",
  "story": "SD-104",
  "title": "[UI][Sorting] Changing the sort does not reload the page",
  "priority": "Medium",
  "labels": ["ui", "sorting", "regression", "positive"],
  "precondition": "Standard user is logged in and is on the Products page. Assumption: \"immediately\" is read as the new order being visible with no manual action beyond choosing the option (threshold pending PO, see plan open question 1).",
  "steps": [
    {
      "action": "Note the page URL, then set a marker on the page that would be lost on reload",
      "expected": "The marker is set and the URL is the Products page URL"
    },
    {
      "action": "Select \"Price (high to low)\"",
      "expected": "The list is re-ordered with Sauce Labs Fleece Jacket first, without any further user action"
    },
    {
      "action": "Check the page URL and the marker",
      "expected": "URL is unchanged and the marker is still set (no navigation or reload happened)"
    }
  ],
  "gherkin": "Given I am on the Products page and have noted its URL\nWhen I select \"Price (high to low)\"\nThen the list is re-ordered immediately\nAnd the URL is unchanged\nAnd the page was not reloaded"
}
```

```json
{
  "draftId": "TC-7",
  "story": "SD-104",
  "title": "[UI][Sorting] Changing the sort does not change the cart contents",
  "priority": "Medium",
  "labels": ["ui", "sorting", "cart", "regression", "positive"],
  "precondition": "Standard user is logged in on the Products page with an empty cart.",
  "steps": [
    {
      "action": "Add \"Sauce Labs Backpack\" and \"Sauce Labs Onesie\" to the cart",
      "expected": "Cart badge shows 2; both products show a \"Remove\" button"
    },
    {
      "action": "Select the sort option {{option}}",
      "data": "dataset row",
      "expected": "Cart badge still shows 2; \"Remove\" buttons remain on Sauce Labs Backpack and Sauce Labs Onesie only; the other four products show \"Add to cart\""
    },
    {
      "action": "Open the cart",
      "expected": "Cart lists exactly Sauce Labs Backpack and Sauce Labs Onesie"
    }
  ],
  "gherkin": "Given my cart holds \"Sauce Labs Backpack\" and \"Sauce Labs Onesie\"\nWhen I choose <option> in the sort dropdown\nThen the cart badge still shows 2\nAnd the cart page lists the same two products",
  "dataset": [
    { "option": "Name (A to Z)" },
    { "option": "Name (Z to A)" },
    { "option": "Price (low to high)" },
    { "option": "Price (high to low)" }
  ]
}
```

pushedToTracker = false

Command the human would run (select what you approve):
`npm run tracker -- publish artifacts/test-cases/test-cases-SD-104.md --select TC-1,TC-2,TC-3,TC-4,TC-5,TC-6,TC-7`
