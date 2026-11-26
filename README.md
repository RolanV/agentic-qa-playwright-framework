# Agentic QA Framework

An **educational, real-world-style** test automation framework: **Playwright + TypeScript**, driven by
**Claude Code subagents and skills**, with **humans approving every write**.

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
| [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md) | 11 hands-on labs, from "run tests" to the "full pipeline" |
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

Based on the *QA Agentic Workflows* course design (Epic → plan → test cases → Xray → spec → PR).
