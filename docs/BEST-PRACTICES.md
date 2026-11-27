# Best practices and the reasons behind them

Each practice below says **what** the repo does, **why**, and **where** to see it. Being able to explain the
*why* is what separates a senior answer from a junior one in interviews.

## A. Test automation practices

| Practice | Why | Where |
|---|---|---|
| **Page Object Model** with intent methods (`addToCart(name)`) | Specs read like requirements; a UI change is fixed in one place | `src/pages/` |
| **Custom fixtures** for page objects and the API client | Dependency injection: setup/teardown written once, tests ask for what they need | `src/fixtures/index.ts` |
| **Locator priority**: test-id → role → text; never XPath | Stable against styling/layout changes; role locators also check accessibility | `tests/context/selector-conventions.md` |
| **Scope by business key** (product name), not generated ids | New products need zero code changes | `InventoryPage.item()` |
| **Web-first assertions** only | Auto-retry until timeout → no flakiness from timing, no hard waits | lint rule `prefer-web-first-assertions` |
| **No `waitForTimeout`, no `force: true`** (lint errors) | Hard waits are slow *and* flaky; force-clicks hide real UI bugs | `eslint.config.mjs` |
| **Login once via storageState** | Faster suite; only login tests depend on the login screen | `tests/setup/auth.setup.ts` |
| **Factories with random data** | Parallel-safe, no collisions on shared environments | `src/data/factories.ts` |
| **Automatic API cleanup** in fixture teardown | Shared public API stays clean; tests don't depend on leftovers | `bookingApi` fixture |
| **Contract tests with zod schemas** | Catch renamed or retyped fields that status-code checks miss | `src/api/schemas.ts` |
| **Validated config, no hardcoded URLs** | Same tests run on any environment by changing `.env` | `src/config/env.ts` |
| **Tags** `@smoke/@regression/@<ID>` | Select suites by risk or by requirement | every spec |
| **One test per requirement ID, steps 1:1** | Traceability: a failure maps straight to a requirement | `test.step('1. …')` |
| **Data-driven tests** from a dataset | One requirement, many inputs, no copy-paste | `SD-T-103` in `login.spec.ts` |
| **Retries only in CI** | Locally you *see* flakiness; CI doesn't block on a one-off network blip | `playwright.config.ts` |
| **Trace/screenshot/video on failure** | Debug CI failures without re-running | `playwright.config.ts` |
| **Sharding + blob report merge** | Linear speed-up, still one HTML report | `.github/workflows/ci.yml` |
| **Fast gates first in CI** | Don't spend browser minutes on code that doesn't compile | `quality` job |

## B. AI / agentic practices

| Practice | Why | Where |
|---|---|---|
| **Specialists, not one giant prompt** | Smaller focused prompts are more reliable; each can have its own model, tools and budget | `.claude/agents/` |
| **Pick the model per job** | Opus for code generation (hard), Sonnet for writing/review, Haiku for cheap triage. Cost vs quality is a dial | `model:` frontmatter |
| **Least privilege tools** | A planner that can't run Bash can't break anything; read-only reviewers can't "fix" what they review | `tools:` frontmatter |
| **Artifacts are the contract** | Reviewable, resumable, diffable hand-offs; agents don't need each other's context | `artifacts/` |
| **Deterministic scripts for bookkeeping** | IDs, statuses and file moves must be 100% right, so don't let an LLM improvise them | `scripts/` |
| **Humans approve every write** | AI drafts; accountability stays with people | `settings.json` `ask` rules |
| **Fail-closed guards, tested** | A broken guard must block, not allow. Guards are code, so they get tests | `.claude/hooks/` |
| **Defence in depth** | Prompt rules + permission rules + hooks + script validation; any single layer can fail | sections 4–5 of HOW-IT-WORKS |
| **Sandbox for generated code** | AI output is untrusted until proven: `.temp` → ESLint → green 3× → promote | `promote-test.ts` |
| **Independent verification** | The agent that wrote the spec doesn't grade it: the fidelity agent and the coordinator re-run it | `coverage-fidelity`, `/automate-test` step 5 |
| **Never weaken assertions to pass** | Otherwise "green" means nothing; app ≠ requirement is a *finding* | `CLAUDE.md` rule 2, `heal-test` |
| **Reuse before write** | Prevents near-duplicate page objects (the most common AI test-code smell) | agent phase 2 |
| **Ground the agent in the real app** | Playwright MCP snapshot → real locators instead of hallucinated ones | `.mcp.json` |
| **Project memory** | Lessons survive between runs; fewer repeated mistakes | `.claude/agent-memory/` |
| **Observability** | Audit log of every tool call answers "what did the AI actually do?" | `audit-log.mjs` |
| **Pin versions of AI tooling** | `@playwright/mcp@0.0.86`, not `@latest`; reproducible behaviour | `.mcp.json` |

## C. Anti-patterns this framework prevents

- ❌ AI commits a test that "passes" because an assertion was loosened → fidelity agent + `heal-test` rules + review checklist
- ❌ AI edits ticket JSON to skip a workflow step → hook denies direct edits; CLI enforces transitions
- ❌ AI merges its own PR → `gh pr merge` denied in both settings and hook
- ❌ Flaky generated test lands in the suite → `promote-test` requires ESLint-clean code and `--repeat-each=3`
- ❌ Hallucinated selectors → MCP exploration + "never guess locators" rule
- ❌ Secrets leak into context → `.env` read denied; `.env.example` documents variable names
