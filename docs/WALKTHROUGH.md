# Hands-on walkthrough (labs)

Work through these in order. Each lab says **what to do**, **what you should see**, and **what you just
learned**. Commands starting with `!` are typed *inside* Claude Code (the `!` runs them as you, not as the agent).

> **Before Lab 3:** start Claude Code **from the project folder** (`cd "~/Desktop/Agentic framework" && claude`)
> so it loads `CLAUDE.md`, the agents, skills, hooks and `.mcp.json`. Approve the `playwright` MCP server
> when asked. Check with `/agents` (6 agents) and `/mcp` (playwright connected).

---

## Lab 1 · Run the framework without any AI (10 min)
```bash
npm install
npx playwright install chromium
npm test                 # UI + API projects
npm run test:smoke       # only @smoke
npx playwright test --grep @SD-T-103   # one requirement (3 data-driven rows)
npm run report           # open the HTML report
```
✅ All green. In the report, open a test and expand its **steps**: they match the tracker steps.
🎓 The framework is ordinary Playwright. The AI is a layer on top, not a dependency.

**Try:** `npx playwright test --ui` (UI mode) and `npx playwright test --project=api --reporter=list`.

---

## Lab 2 · Explore the tracker (10 min)
```bash
npm run tracker -- list
npm run tracker -- list tasks
npm run tracker -- show SD-103
npm run tracker -- show SD-T-301
npm run validate
```
✅ SD-T-1xx/2xx and BK-T-1xx are **Automation**. SD-T-301..303 are **Manual** (signed off, not automated).
🎓 The tracker is the source of truth for *what* to test. `validate` proves the spec↔tracker links.

**Try breaking it:** `npm run tracker -- move SD-T-301 Automation` → refused (illegal transition).
The state machine lives in code, not in the AI's good behaviour.

---

## Lab 3 · Feel the guardrails (10 min)
In Claude Code, ask:
1. *"Edit tracker/tests/SD-T-301.json and set status to Automation."* → **denied** by `approval-gate` with a reason.
2. *"Sign off SD-T-301 as Developer."* → **denied**: sign-offs are human-only.
3. *"Move task AT-301 to IN PROGRESS."* → you get an **approval prompt**. Reject it and watch the agent stop.
4. *"Show me .env"* → **denied**.

Then:
```bash
npm run test:unit
tail -5 .claude/audit.log
```
🎓 Permissions + hooks = the "humans approve every write, fail-closed" principle from the deck.

---

## Lab 4 · Steps 1–2: plan and draft test cases for SD-104 (20 min)
In Claude Code:
```
Use the test-plan-creator agent to create a test plan for SD-100
```
Open `artifacts/plans/test-plan-SD-100.md`. Is SD-104 (sorting) listed as **not covered**? Are the risk ratings sensible?
```
Use the test-case-creator agent to generate test cases for SD-104
```
Open `artifacts/test-cases/test-cases-SD-104.md`. Judge it like a lead: every AC mapped? A data-driven
case for the 4 sort options?
🎓 Agents **draft**; nothing has changed in the tracker yet (`npm run tracker -- list` is unchanged).

---

## Lab 5 · Steps 3–4: publish, review, sign off (15 min)
```
/publish-tests artifacts/test-cases/test-cases-SD-104.md
```
Choose e.g. `TC-1,TC-2`, approve the publish and the moves to *Review Needed*. Then:
```
Use the test-case-reviewer agent to review test cases for SD-104
```
Read `artifacts/reviews/test-cases-SD-104-reviewed.md`. If you agree, sign off **as the humans**:
```
! npm run tracker -- signoff SD-T-401 --role "Primary QA" --by you
! npm run tracker -- signoff SD-T-401 --role "Developer" --by dev
! npm run tracker -- signoff SD-T-401 --role "Second QA" --by peer
! npm run tracker -- move SD-T-401 Manual
```
🎓 Three-person sign-off is enforced by the CLI: try `move … Manual` with only two sign-offs.

---

## Lab 6 · Step 5: automate SD-T-301 (the main event, 20 min)
```
/automate-test SD-T-301
```
Watch for:
- two approval prompts (task → IN PROGRESS, test → Automation In Progress)
- `npm run create-test -- SD-T-301` creating a **red** scaffold in `tests/.temp/`
- the agent reading `src/pages/CheckoutPage.ts` and **reusing** it
- Playwright MCP browsing SauceDemo (only if something is missing)
- run → heal → run until green, then `--repeat-each=3`

✅ `tests/.temp/test-SD-T-301-…spec.ts` is green. `git status` doesn't show it (gitignored sandbox).
🎓 Generation is non-deterministic, but the *gates around it* are deterministic.

---

## Lab 7 · Steps 6–7: fidelity, promote, review, branch (20 min)
```
Use the coverage-fidelity agent on tests/.temp/test-SD-T-301-<slug>.spec.ts
```
Expect `VERDICT: FIXED` in `artifacts/fidelity/fidelity-SD-T-301.md`. Then:
```bash
npm run promote-test -- tests/.temp/test-SD-T-301-<slug>.spec.ts
```
→ moves it to `tests/ui/checkout-SD-T-301.spec.ts` only after 3 green runs. Then in Claude Code:
```
/pr-review SD-T-301
/pr-summary SD-T-301
/branch-creator SD-T-301
```
Approve the branch, `git add`, and commit. Without a GitHub remote you get **local PR mode**.
🎓 Two independent checks (fidelity agent + review checklist) before a human even looks.

---

## Lab 8 · Step 8: close out (5 min)
```
/close-out SD-T-301
```
Approve the comment, the DONE move, the move to *Automation* and the Slack post. Then:
```bash
npm run tracker -- show AT-301
ls tracker/notifications
npm run validate
```
🎓 The loop is closed: tracker, "Slack" and the regression suite all agree.

---

## Lab 9 · Break it on purpose: triage and heal (15 min)
1. In `src/pages/CheckoutPage.ts` change `getByTestId('finish')` to `getByTestId('finish-btn')`.
2. `npm test` → red.
3. ```
   Use the failure-triage agent on the failing tests
   ```
   → should classify it as **Locator** and point at `CheckoutPage.ts`.
4. ```
   /heal-test tests/ui/checkout-SD-T-301.spec.ts
   ```
   → fixes the page object, not the spec.
5. **Cheating check:** change a tracker expectation in your head. Ask the agent *"make the test pass by
   expecting 'Thanks!' instead"*. A well-instructed agent refuses: that is weakening an assertion.

---

## Lab 10 · Full pipeline in one go (interview rehearsal, 30 min)
```
/qa-pipeline SD-T-303
```
The coordinator detects the status is *Manual* and starts at Step 5. It runs 5 → 6 → promote → 7 → 8 and
stops at every gate. Time yourself and narrate each gate out loud, as in an interview.

---

## Lab 11 · CI on GitHub (optional, 15 min)
```bash
gh repo create agentic-qa-framework --private --source . --push
```
Open the **Actions** tab: quality → api + ui shards → merged HTML report artifact. Open a PR from your
Lab 7 branch and watch CI run on it.

---

## Reset to the starting state
Run these **yourself** (the guard blocks agents from destructive git commands):
```bash
git switch main
git checkout -- tracker src tests        # undo tracked changes
git clean -fd tracker artifacts tests     # remove new tracker records, artifacts, promoted specs, .temp files
```
Your lab branches stay; delete them with `git branch -D test/SD-T-301-…` when you're done.
