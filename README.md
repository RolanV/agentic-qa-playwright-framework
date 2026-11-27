# Agentic QA Framework

[![CI](https://github.com/RolanV/agentic-qa-playwright-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/RolanV/agentic-qa-playwright-framework/actions/workflows/ci.yml)

An **educational, real-world-style** test automation framework: **Playwright + TypeScript**, driven by
**Claude Code subagents and skills**, with **humans approving every write**.

**Start here (5 minutes):** read [docs/HOW-IT-WORKS.md](docs/HOW-IT-WORKS.md), run `npm test`, then look at
[A real run](docs/WALKTHROUGH.md#a-real-run-sd-104-sorting--sd-t-404-merged-what-it-looked-like) to see one story
go through all 8 steps.

It takes a requirement from an Epic to a merged, green regression test in 8 steps:

```
1 Plan → 2 Test cases → 3 Publish 🚦 → 4 Sign-off 🚦 → 5 Generate & heal → 6 Fidelity → 7 Review & PR 🚦 → 8 Close out 🚦
```

Apps under test: [SauceDemo](https://www.saucedemo.com) (UI) and [restful-booker](https://restful-booker.herokuapp.com) (API).
A file-based **mock Jira/Xray/Slack** in `tracker/` makes the whole workflow run offline.

## Quick start
```bash
npm install
npx playwright install chromium
cp .env.example .env        # already done if .env exists
npm test                    # UI + API tests
npm run check               # lint + typecheck + tracker validation + guard-hook tests
npm run tracker -- list     # see the mock tracker
```
Then open Claude Code **in this folder** (`claude`), check `/agents` and `/mcp`, and run:
```
/automate-test SD-T-301
```

## Documentation
| Doc | Read it for |
|---|---|
| **[docs/HOW-IT-WORKS.md](docs/HOW-IT-WORKS.md)** | Architecture, the 8 steps, agent anatomy, guardrails, tracker, CI (start here) |
| [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md) | 11 hands-on labs, plus a real run of one story (SD-104) with the lesson from each step |
| [docs/BEST-PRACTICES.md](docs/BEST-PRACTICES.md) | Every design decision and *why* |
| [docs/INTERVIEW-GUIDE.md](docs/INTERVIEW-GUIDE.md) | 30-second pitch, 10-minute demo script, Q&A |
| [CLAUDE.md](CLAUDE.md) | The rules every agent follows |

## Map
```
src/            framework: config, page objects, API client, fixtures, data
tests/          ui/ api/ setup/ (committed) · .temp/ (AI sandbox) · context/ (app knowledge for agents)
scripts/        tracker CLI, create-test, promote-test, validate (deterministic, no AI)
tracker/        mock Jira + Xray + Slack
artifacts/      hand-off files between agents (plans, test cases, reviews, fidelity, PR)
.claude/        agents/ skills/ hooks/ settings.json agent-memory/
.github/        CI workflow, CODEOWNERS, PR template
```

## Agents and skills
| Agents (`.claude/agents`) | Skills (`/slash` commands) |
|---|---|
| `test-plan-creator` (sonnet) | `/qa-pipeline` (orchestrator) |
| `test-case-creator` (sonnet) | `/automate-test` · `/publish-tests` |
| `test-case-reviewer` (sonnet) | `/pr-review` · `/fix-review` · `/pr-summary` · `/branch-creator` |
| `test-automation-engineer` (opus + Playwright MCP) | `/close-out` · `/heal-test` |
| `coverage-fidelity` (sonnet) | knowledge: `playwright-standards`, `tracker-research` |
| `failure-triage` (haiku) | |

`/qa-pipeline`, `/automate-test`, `/publish-tests`, `/branch-creator` and `/close-out` are **user-triggered only**
(the model cannot start them on its own), because they change the tracker or git.

## Status
- **Test suite:** 19 UI and API tests (13 UI, 6 API; plus one login setup step), all passing in CI together with lint, typecheck, tracker validation and 17 unit tests.
- **Worked example:** story SD-104 (product sorting) went through the full workflow. Four of its seven tests
  (SD-T-401, 402, 404, 405) are automated and merged. SD-T-403, 406 and 407 are reworked and waiting for sign-off.
- **Still open for practice:** checkout (SD-103) is signed off but not automated (SD-T-301 to 303).
- **Guardrails:** `main` is protected on GitHub (pull request and four passing checks required, no force pushes);
  agents cannot sign off or merge.

Based on the *QA Agentic Workflows* course design (Epic → plan → test cases → Xray → spec → PR).
