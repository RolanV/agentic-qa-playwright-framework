---
name: heal-test
description: Playbook for healing a failing Playwright test without cheating — diagnose from the error and snapshot, fix locators/waits/navigation/data, and stop on genuine product bugs. Load whenever a spec is red. Also usable directly as "/heal-test <spec>".
argument-hint: <spec path>
---

# Heal a failing test: $ARGUMENTS

## Loop (max 5 iterations, then stop and report)
1. Run it: `npx playwright test --reporter=line $ARGUMENTS` (add `--project=temp` for `.temp` specs).
2. Read the error + `test-results/**/error-context.md` (it contains the page snapshot at failure).
3. Classify and apply the matching fix:

| Symptom | Likely cause | Fix |
|---|---|---|
| `strict mode violation: resolved to N elements` | locator too broad | scope to a container / filter by text / use role+name |
| `element(s) not found` | wrong data-test / text | confirm with Playwright MCP `browser_snapshot`; update the PAGE OBJECT |
| timeout on click/fill | wrong page / overlay / not navigated | assert the URL/title of the previous step first |
| assertion text differs slightly | whitespace/casing | use the exact text from the snapshot ONLY if it matches the tracker intent |
| passes alone, fails in parallel | shared data/state | factories, unique data, independent setup |
| network / 5xx / DNS | environment | not a test bug — report, don't change the test |

4. Re-run. Green → `--repeat-each=3` to confirm stability.

## Forbidden "fixes" (these are cheating)
- Changing an expected value so it matches what the app shows when it contradicts the tracker
  → that's a **product bug**: stop and report with evidence (expected vs actual + screenshot path).
- Adding `waitForTimeout`, `force: true`, retries inside the test, try/catch around assertions,
  `if (visible)` guards, `test.fixme/skip`, or loosening exact text to a regex/`toBeTruthy`.
