---
name: pr-summary
description: Step 7c. Writes artifacts/pr/PR_SUMMARY_<ID>.md — the pull-request description (what, why, tracker links, X/Y passing, review status, how to run). Use for "/pr-summary" or "write the PR description".
argument-hint: <TEST-ID>
---

# PR summary for $ARGUMENTS

Collect facts (do not invent any):
- tracker test + story (`npm run tracker -- show $ARGUMENTS`), task id
- spec path(s) and changed `src/` files (`git status`, `git diff --stat`)
- results: run `npx playwright test --grep @$ARGUMENTS --reporter=line` → X/Y passing
- review verdict from `artifacts/pr/PR_REVIEW_$ARGUMENTS.md`, fidelity verdict from `artifacts/fidelity/`

Write `artifacts/pr/PR_SUMMARY_$ARGUMENTS.md` using `.github/pull_request_template.md` as the skeleton:

```
Title: [Automated Test] <ID>: <tracker title>
## What      – one paragraph
## Tracker   – test <ID> · story <STORY> · task <AT-ID>
## Changes   – table: file · change
## Evidence  – X/Y passing (repeat-each=3), fidelity VERDICT, review REVIEW: PASS
## How to run – npx playwright test --grep @<ID>
## Checklist – copied from the template, ticked honestly
```
