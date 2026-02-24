---
description: Verify a phase is complete against its Definition of Done checklist
---

## Steps

1. Read the current phase's Definition of Done from [PROJECT_PLAN.md](../../PROJECT_PLAN.md).

2. Read [.planning/STATE.md](../../.planning/STATE.md) for what has been completed.

3. Run all checks:

// turbo
   ```bash
   pnpm type-check
   ```

// turbo
   ```bash
   pnpm lint
   ```

// turbo
   ```bash
   pnpm test
   ```

4. For Phase 2+ (ATS Detection): Manually verify on real ATS URLs by loading the extension in Chrome Dev mode (`pnpm dev`) and testing on:
   - A Workday job posting (myworkdayjobs.com)
   - A Greenhouse job posting (boards.greenhouse.io)
   - A Lever job posting (jobs.lever.co)

5. Produce a verdict:
   - ✅ **PASS** — All Definition of Done criteria met → update STATE.md, mark phase complete
   - ❌ **FAIL** — List which criteria are unmet → create tasks to fix before moving on

6. Update `Phase Status` in [.planning/STATE.md](../../.planning/STATE.md) to `Complete` only when all criteria pass.
