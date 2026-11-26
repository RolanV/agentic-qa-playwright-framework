---
name: automate-test
description: Step 5 entry point. Automates one signed-off tracker test end to end — moves the Jira-style task and test to in-progress (with approval), delegates to the test-automation-engineer subagent, and reports a green spec in tests/.temp/. Use for "automate test <TEST-ID>" or "/automate-test SD-T-301".
argument-hint: <TEST-ID>  e.g. SD-T-301
disable-model-invocation: true
---

# Automate test $ARGUMENTS

1. **Check readiness** — `npm run tracker -- show $ARGUMENTS`. Status must be `Manual`
   (signed off) or `Automation In Progress` (resuming). Otherwise stop and explain why.
2. **Find the task** — `npm run tracker -- list tasks` → the task whose `test` is `$ARGUMENTS`.
3. 🚦 **Move to in progress** (each command triggers an approval prompt — that's the human gate):
   - `npm run tracker -- move <AT-ID> "IN PROGRESS" --note "Automation started"`
   - `npm run tracker -- move $ARGUMENTS "Automation In Progress"`
   (skip a move if it's already in that status)
4. **Delegate** to the `test-automation-engineer` subagent:
   "Automate tracker test $ARGUMENTS. Return spec path, reuse summary, run results, concerns."
5. **Verify independently** — don't trust, verify:
   `npx playwright test --project=temp <spec path>` must be green.
6. **Report** — spec path, pass count, reused/new code, concerns. Suggest next: Step 6
   (`coverage-fidelity` on the spec).

If the agent reports a possible **product bug**, do not continue: summarise the evidence and ask the user
whether to file a bug or keep the test failing in `.temp`.
