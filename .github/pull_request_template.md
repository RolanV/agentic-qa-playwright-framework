## What
<!-- One paragraph: what this PR automates/changes and why. -->

## Tracker
- Test: <!-- SD-T-xxx --> · Story: <!-- SD-1xx --> · Task: <!-- AT-xxx -->

## Evidence
- [ ] Spec green locally with `--repeat-each=3` (X/Y passing)
- [ ] Fidelity report: `VERDICT: FIXED` (artifacts/fidelity/)
- [ ] Self review: `REVIEW: PASS` (artifacts/pr/)

## Checklist
- [ ] Tracker steps map 1:1 to `test.step()`; no weakened assertions
- [ ] ID-first title, `@smoke|@regression` + `@<ID>` tags, tracker annotation
- [ ] Page objects / fixtures reused; new locators live in `src/pages`
- [ ] No `waitForTimeout`, `force: true`, `test.only`, hardcoded URLs or credentials
- [ ] `npm run check` passes
- [ ] Nothing from `tests/.temp/` committed

## How to run
```bash
npx playwright test --grep @<ID>
```
