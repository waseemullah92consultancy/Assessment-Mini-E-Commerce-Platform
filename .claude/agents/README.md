# Agent Orchestration — NOIR MARKET

This project was built by **driving Claude Code as the orchestrator**, delegating scoped work to a set of specialised subagents. This directory holds those subagent definitions. They are the tangible artifact of the *Agentic workflow & orchestration* dimension of the assessment — evidence of **how** the app was built, not a feature inside the app.

## The agent roster

| Agent | Owns | Invoked for |
|---|---|---|
| [`backend-api`](backend-api.md) | NestJS modules, services, DTOs, schemas, guards | Every server-side feature (auth, products, cart, orders, analytics, recommendations) |
| [`frontend-ui`](frontend-ui.md) | Next.js pages/components, MUI design system | Storefront + admin UI work |
| [`api-integration`](api-integration.md) | Axios client, typed API layer, Zustand stores | Wiring UI ↔ backend, fixing contract mismatches |
| [`bug-fixer`](bug-fixer.md) | Cross-stack defect diagnosis | Anything observably broken with unknown root cause |
| [`code-optimizer`](code-optimizer.md) | Behaviour-preserving refactors, query/perf tuning | After a feature works + is tested |
| [`qa-testing`](qa-testing.md) | Jest unit/integration tests, edge-case verification | Pinning down logic + authorization boundaries |

## How they were orchestrated

The top-level Claude Code session acted as the **orchestrator**: it scoped each slice of work, picked the right agent, fed it only the context it needed, then verified the result before moving on. A typical feature flowed:

```
orchestrator
  ├─ backend-api        → build the endpoint + DTO validation + service logic
  ├─ api-integration    → expose a typed client function + wire the store
  ├─ frontend-ui        → build the page/component against the design system
  ├─ qa-testing         → write tests, run the suite, probe edge cases
  ├─ bug-fixer          → (on a red test / observed defect) find root cause, fix
  └─ code-optimizer     → (once green) tighten queries/types without changing behaviour
```

### Context management
- `CLAUDE.md` at the repo root is the shared project-context file every agent inherits — stack, conventions, and the hard-won gotchas (response envelope, cart keying, MUI v9 changes). This stops each agent re-discovering the same traps.
- Each agent's system prompt encodes its **lane** and the **regressions it must not reintroduce**, so delegated work stays consistent across sessions.

### Recovery when an agent went off track
Several defects were caught by `qa-testing` running the suite, then handed to `bug-fixer` — e.g. the cart "add same product twice created a duplicate row instead of incrementing quantity" bug, and the `GET /orders` response being treated as an array. These corrections are documented in [`../../NOTES.md`](../../NOTES.md).

## Reusable prompts
See [`../commands/`](../commands/) for the repeatable instructions used to launch a new feature slice and to run a review pass.
