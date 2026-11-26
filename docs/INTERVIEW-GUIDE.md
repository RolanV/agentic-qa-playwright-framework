# Interview guide

## 30-second pitch
> "I built an agentic QA framework on Playwright and TypeScript. It takes a requirement from an epic all the way
> to a merged, green regression test, using specialist AI agents for planning, test-case design,
> automation, fidelity checking and review. The key design choices: **specialists instead of one big prompt**,
> **files as the contract between steps**, **deterministic scripts for anything that must be exactly right**,
> and **humans approving every write**, enforced by fail-closed hooks that have their own unit tests."

## 10-minute live demo script
| Min | Show | Say |
|---|---|---|
| 0–1 | `docs/HOW-IT-WORKS.md` diagram | "Four layers: framework, deterministic scripts, AI agents, guardrails." |
| 1–2 | `npm test` → report, expand steps | "Plain Playwright: POM, fixtures, storageState, factories. Steps map 1:1 to the tracker test." |
| 2–3 | `npm run tracker -- list` | "Mock Jira/Xray. SD-T-301 is signed off but not automated, so let's automate it." |
| 3–4 | `.claude/agents/test-automation-engineer.md` | "An agent = model + instructions + tools + skills + guardrails. Opus here; Haiku for triage." |
| 4–8 | `/automate-test SD-T-301` | Narrate the approval prompts, the red scaffold, reuse of CheckoutPage, run → heal → green ×3. |
| 8–9 | Ask Claude to "sign off SD-T-301" → denied | "Fail-closed hook. Sign-offs and merges are human-only. The hook has unit tests." |
| 9–10 | `ci.yml` + `npm run validate` | "Fast gates first, sharded UI, merged report. `validate` proves every spec tag maps to a requirement." |

**Backup plan** if the live site or network is down: show the pre-recorded `.claude/audit.log`, the
promoted spec from a previous run on a branch, and the CI run on GitHub.

## Likely questions and strong answers

**Why not let one agent do everything?**
Long, multi-purpose prompts degrade. Specialists have focused instructions, their own tool permissions and their own
model and cost. They're also independently testable and replaceable. And the agent that writes a test shouldn't be the one
that grades it.

**How do you stop the AI from making tests pass by cheating?**
Four layers. (1) A rule in CLAUDE.md and the heal-test skill that forbids weakening assertions. (2) An independent fidelity
agent that compares spec steps and assertions to the tracker test and returns BLOCKED on weakening. (3) A review
checklist. (4) A human PR review. Also, the promotion gate rejects placeholders and hard waits.

**What's deterministic and what's AI?**
AI handles reading requirements, drafting cases, choosing locators, writing and healing code, and reviewing.
Deterministic code handles IDs, statuses, transitions, sign-off counting, scaffolding, promotion and validation. Rule of thumb: if
being wrong 1% of the time is unacceptable, it's code.

**How do humans stay in control?**
Every write is an `ask` in settings.json and in the approval-gate hook, so tracker moves, commits, pushes and PRs all need approval.
Sign-offs and merges are denied to agents completely. Guards fail closed, and the scripts double-check transitions.

**What if a hook has a bug?**
It denies (fail-closed), and the hooks have unit tests in CI (`npm run test:unit`). One trade-off I hit for real:
regex-based guards over-block. The gate once blocked a heredoc that only *mentioned* the sign-off command. For a guard,
over-blocking is the right failure mode.

**How does the agent find selectors?**
It reuses page objects first. If something is missing, it browses the real app through Playwright MCP, reads the
accessibility snapshot and adds the locator to the page object. It never guesses.

**Flaky tests?**
There are no hard waits (lint error), and web-first assertions retry automatically. Data is isolated through factories, and the login state is reused.
Generated specs must pass `--repeat-each=3` before promotion, and retries only happen in CI, where flakiness stays visible in the report.

**How would this scale to a real company?**
Swap the file tracker for Jira/Xray (an MCP server or REST client behind the same CLI). Add cost and turn budgets per agent,
and run agents headless in CI (e.g. nightly "heal suggestions" as PRs). Add more environments through `.env`, and add more browsers as
projects. The guardrail model stays the same.

**Cost control?**
The model is matched to the job (Haiku for triage). Agents receive artifact paths instead of large contexts,
and deterministic scripts do the cheap work. Agents should be bounded by turn and time limits.

**What did you learn?**
"AI makes generating tests cheap, so the value moves to **verification and governance**: proving a test is faithful,
stable and approved."

## Vocabulary to use naturally
Subagent · skill · MCP server · tool permissions / least privilege · ReAct loop · human-in-the-loop ·
fail-closed · artifact contract · traceability · fidelity · self-healing (with limits) · storageState ·
web-first assertions · sharding · blob report · CODEOWNERS.
