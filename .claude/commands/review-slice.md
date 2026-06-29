---
description: Adversarial review + verification pass over a feature before considering it done
---

Run a verification pass over the area described below. The goal is to catch what the build agents missed — review, don't rubber-stamp.

Area to review: $ARGUMENTS

Check, in order:

1. **Spec compliance** — does it actually do what the requirement asks, end to end? Click through the real flow, don't assume.
2. **Data integrity** — order totals computed server-side? stock decremented only after validation? can a user order more than is in stock? is a price ever trusted from the client?
3. **Authorization** — can a customer reach another user's data or any `/admin/*` route? Is every route's `@Public()` / `@Roles` correct?
4. **Validation & errors** — bad input returns 400 with a clean message, never a 500 stack trace? client and server both validate?
5. **Contract correctness** — frontend reads `.data.data`; response shapes match types; cart routes key on `productId`.
6. **Tests** — is the important logic covered? Run the suite (`npm test` in both `backend/` and root) and report exact counts.

Output a findings list with severity (blocker / should-fix / nice-to-have), each with `file:line` and a concrete fix. If you find nothing in a category, say so explicitly rather than skipping it.
