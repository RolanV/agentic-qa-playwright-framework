---
name: branch-creator
description: Step 7d. Creates the feature branch test/<ID>-<slug>, stages only the intended files, commits with a conventional message and opens a PR (GitHub via gh if a remote exists, otherwise a local PR record). Every git write asks for approval. Use for "/branch-creator <TEST-ID>" after /pr-review passed.
argument-hint: <TEST-ID>
disable-model-invocation: true
---

# Branch + PR for $ARGUMENTS

Pre-conditions (stop if any fails):
- `artifacts/pr/PR_REVIEW_$ARGUMENTS.md` ends with `REVIEW: PASS`
- `artifacts/pr/PR_SUMMARY_$ARGUMENTS.md` exists
- `npm run check` passes

Steps (🚦 = approval prompt):
1. 🚦 `git switch -c test/$ARGUMENTS-<slug>` (slug from the tracker title, kebab-case, ≤ 40 chars)
2. 🚦 `git add` ONLY: the promoted spec(s), dataset JSON, changed `src/` files, the artifacts for this id,
   `.claude/agent-memory/` updates. Never `git add -A`; never anything in `tests/.temp/`.
3. Show `git diff --cached --stat` to the human.
4. 🚦 `git commit -m "test(<feature>): automate $ARGUMENTS <short title>" -m "Tracker: $ARGUMENTS"`
5. If `git remote get-url origin` succeeds and `gh` is installed:
   🚦 `git push -u origin HEAD` then 🚦 `gh pr create --title "[Automated Test] $ARGUMENTS: <title>" --body-file artifacts/pr/PR_SUMMARY_$ARGUMENTS.md`
   Otherwise: say "local PR mode" — the branch + PR_SUMMARY file are the PR record.
6. Report branch name, commit sha, PR URL (or local PR file). Remind: **humans merge; agents never do.**
