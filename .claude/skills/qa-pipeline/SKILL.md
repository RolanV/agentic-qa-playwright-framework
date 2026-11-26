---
name: qa-pipeline
description: Orchestrates the full 8-step QA workflow (plan → test cases → publish → sign-off → generate & heal → fidelity → review & PR → close out) by delegating to specialist subagents and stopping at every human gate. Use when the user says "run the QA pipeline", "full QA pipeline for <ID>", or "/qa-pipeline <ID>".
argument-hint: <EPIC-ID | STORY-ID | TEST-ID>  e.g. SD-104 or SD-T-301
disable-model-invocation: true
---

# QA pipeline orchestrator

You (the main session) are the **coordinator**. Subagents cannot call each other, so YOU chain them,
pass artifact paths between them, and stop at every gate. Input: **$ARGUMENTS**

## 0. Decide the entry point
Run `npm run tracker -- show $ARGUMENTS` (and `list tests`) and pick where to start:

| Input looks like | Current state | Start at |
|---|---|---|
| Epic (`SD-100`) | — | Step 1 |
| Story with no tests (`SD-104`) | — | Step 2 (Step 1 optional) |
| Test in `Test Writing In Progress` / `Review Needed…` | drafted | Step 4 |
| Test in `Manual` | signed off | Step 5 |
| Story whose tests are all `Manual` (`SD-103`) | signed off | Step 5, one test at a time |

Print a short plan (which steps will run, which gates the human will see) and wait for "go".

## Test design (Steps 1–4)
1. **Plan** → delegate to `test-plan-creator` with the Epic id.
   Output: `artifacts/plans/test-plan-<EPIC>.md`. Show the summary. 🚦 GATE: "Continue to test cases?"
2. **Test cases** → delegate to `test-case-creator` with the Story id (+ plan path).
   Output: `artifacts/test-cases/test-cases-<STORY>.md`. 🚦 GATE: the human reads the file.
3. **Publish** → run the `/publish-tests` flow: ask which draftIds to keep, then
   `npm run tracker -- publish <file> --select …` (approval prompt), then move each new test to
   `Review Needed for Manual Test` (approval prompt).
4. **Sign-off** → delegate to `test-case-reviewer`. Output: `artifacts/reviews/…-reviewed.md`.
   🚦 GATE (human-only): tell the user the 3 sign-off commands and the final move to `Manual`.
   You cannot run sign-offs — the guard blocks it. Wait until the user confirms they're done.

## Automation (Steps 5–8) — per test id
5. **Generate & heal** → follow `/automate-test <TEST-ID>` (tracker moves + `test-automation-engineer`).
6. **Fidelity** → delegate to `coverage-fidelity` with the `.temp` spec path.
   `BLOCKED` → back to step 5 with the findings (max 2 loops, then stop and report).
   `FIXED` → `npm run promote-test -- <spec>`.
7. **Review & PR** → `/pr-review` (→ `/fix-review` if needed → `/pr-review` again) → `/pr-summary` →
   `/branch-creator`. Declining the review stops the run.
8. **Close out** → `/close-out <TEST-ID>`.

## Rules
- Never skip a gate, never batch approvals the human didn't ask to batch.
- If a guard hook denies something, stop and explain — do not work around it.
- After each step print one status line: `✔ Step N <name> → <artifact path>`.
- End with a summary table: step · result · artifact · who approved.
