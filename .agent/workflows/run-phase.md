---
description: Execute a GSD phase plan for AutoApply Copilot
---

## Steps

1. Read [PROJECT_PLAN.md](../../PROJECT_PLAN.md) to find the current phase and which plan to execute next.

2. Read [.planning/STATE.md](../../.planning/STATE.md) to check current progress and any active blockers.

3. Read the phase plan file from `.planning/phases/<phase>/` that corresponds to the next incomplete plan.

4. Follow the GSD execution loop in [AGENTS.md](../../AGENTS.md#phase-execution-workflow):
   - Read the phase description
   - List all P0 → P1 → P2 tasks
   - Build tasks in priority order
   - Commit after each task (atomic commits)
   - Verify against the Definition of Done

5. After completing the plan:
   - Update [.planning/STATE.md](../../.planning/STATE.md) with progress
   - Create a `SUMMARY.md` in the phase folder documenting what was built
   - Report: what was built, what was skipped, any open questions

6. Do **not** start the next phase until the user confirms completion.
