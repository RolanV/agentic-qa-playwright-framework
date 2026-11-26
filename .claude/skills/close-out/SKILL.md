---
name: close-out
description: Step 8. Closes the loop after the PR is open — moves the automation task to DONE with a completion comment, records the spec on the tracker test (status Automation) and posts a mock Slack announcement. Every write asks for approval. Use for "/close-out <TEST-ID>".
argument-hint: <TEST-ID>
disable-model-invocation: true
---

# Close out $ARGUMENTS

Gather: task id (`npm run tracker -- list tasks`), branch (`git branch --show-current`),
PR URL or local PR file, spec path, pass count (`npx playwright test --grep @$ARGUMENTS --reporter=line`).

1. 🚦 `npm run tracker -- comment <AT-ID> "Automated in <spec>. Branch <branch>. <X>/<Y> passing. PR: <url|file>."`
2. 🚦 `npm run tracker -- move <AT-ID> DONE --note "PR opened"`
3. 🚦 `npm run tracker -- move $ARGUMENTS Automation --spec <tests/ui/…spec.ts>`
   (the CLI refuses if the spec is still in `.temp`, missing, or doesn't contain the id)
4. 🚦 `npm run tracker -- notify "✅ $ARGUMENTS automated — <title>. <X>/<Y> passing. PR: <url|file>. Reviewers: see CODEOWNERS." --channel qa-automation`
5. `npm run validate` — must pass.
6. Final message: what changed in the tracker, and that the test now runs in `@regression`.
   Remind: the PR still needs human review + merge.
