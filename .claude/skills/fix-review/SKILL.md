---
name: fix-review
description: Step 7b. Applies the must-fix findings from the latest artifacts/pr/PR_REVIEW_<ID>.md, re-runs the affected tests and quality gates, then hands back to /pr-review. Use for "/fix-review" or "fix the review findings".
argument-hint: "[TEST-ID]"
---

# Fix review findings

1. Open the newest `artifacts/pr/PR_REVIEW_*.md` (or the one for `$ARGUMENTS`). List the must-fix items.
2. Fix them one by one. Rules: never weaken an assertion; keep step titles 1:1 with the tracker;
   prefer moving raw locators into page objects over inline fixes.
3. Re-run: the affected spec(s) with `--repeat-each=3`, then `npm run lint && npm run typecheck && npm run validate`.
4. Append a "Fixes applied" section to the review file (item → what changed → file:line).
5. Tell the user to run `/pr-review` again — a fix is not done until the review passes.
