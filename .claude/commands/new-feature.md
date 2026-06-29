---
description: Build one end-to-end feature slice by orchestrating the specialised agents
---

Build the feature described below as a complete vertical slice, delegating to the specialised subagents in order. Do not write all the code yourself — orchestrate.

Feature: $ARGUMENTS

Run this sequence, verifying each step before the next:

1. **backend-api** — design the endpoint(s): DTO with `class-validator` rules, service logic, controller route with correct HTTP verb + status, auth decorators (`@Public()` / `@Roles('admin')` / ownership check). Enforce money/stock integrity server-side.
2. **api-integration** — add a typed function in `src/lib/api.ts` and wire the relevant Zustand store. Confirm the route/param/response shape against the controller first.
3. **frontend-ui** — build the page/component against the NOIR design system, with loading/empty/error states and client-side validation mirroring the DTO.
4. **qa-testing** — add meaningful tests for the logic and authorization boundaries; run the suite and report exact pass/fail.
5. If anything is red or observably broken → **bug-fixer** (root cause, not symptom).
6. Once green → **code-optimizer** may tighten queries/types without changing behaviour.

Report back: files changed per agent, the contract wired, and the final test result. Be honest about anything left incomplete or mocked.
