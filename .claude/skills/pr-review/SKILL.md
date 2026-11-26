---
name: pr-review
description: Step 7a. Mandatory self code review of new/changed test code against the QA checklist and tracker alignment before any branch or PR is created. Writes artifacts/pr/PR_REVIEW_<ID>.md with PASS or CHANGES REQUIRED. Use for "/pr-review", "review my test changes" or when /qa-pipeline reaches Step 7.
argument-hint: "[TEST-ID or spec path] (defaults to uncommitted changes)"
---

# PR review

Scope: `$ARGUMENTS` — if empty, review everything changed: `git status`, `git diff`, plus any
newly promoted specs under `tests/ui|api`.

## Checklist (each item: ✔ / ✖ + file:line evidence)
**Correctness & fidelity**
- [ ] Every tracker step has a `test.step` with a real assertion; fidelity report exists and says FIXED
- [ ] No weakened assertions (exact texts/numbers where the tracker gives them)
**Framework conventions (CLAUDE.md)**
- [ ] ID-first title, `@smoke|@regression` + `@<ID>` tags, tracker annotation
- [ ] Fixtures + page objects used; no raw selectors in specs; new locators live in `src/pages`
- [ ] `getByTestId` / `getByRole` locators; no XPath/CSS chains
- [ ] Web-first assertions; no `waitForTimeout`, `force: true`, `test.only`, `page.pause`
- [ ] No hardcoded URLs/credentials; data from factories; API tests clean up
**Hygiene**
- [ ] `npm run lint`, `npm run typecheck`, `npm run validate` all pass (run them)
- [ ] Nothing from `tests/.temp/` is staged
- [ ] Page-object changes are backwards compatible (run `npm test` if any `src/` file changed)

## Output
Write `artifacts/pr/PR_REVIEW_<ID>.md`: checklist results, findings (must-fix / nice-to-have),
and a final line `REVIEW: PASS` or `REVIEW: CHANGES REQUIRED`.
If CHANGES REQUIRED → suggest `/fix-review`. 🚦 Ask the human to accept the review before continuing.
