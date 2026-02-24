---
description: Create an atomic git commit following project conventions
---

## Steps

Per [AGENTS.md](../../AGENTS.md) — all commits must be atomic (one action, one commit).

1. Identify exactly what changed and which requirement/user story it satisfies.
   - Reference the PRD Epic and User Story (e.g., `feat(01-02): resume parser`)

2. Stage only the files relevant to this single change:
   ```bash
   git add src/lib/parser/resume-parser.ts src/lib/parser/resume-parser.test.ts
   # Never use: git add -A
   ```

3. Write the commit message using conventional commits format:
   ```
   <type>(<scope>): <short description>

   type: feat | fix | test | docs | chore | refactor
   scope: phase-plan reference (e.g., 01-02) or feature area (e.g., ats-detect)
   ```

4. Verify with `pnpm type-check` and `pnpm lint` before committing if code changed.

5. Commit:
   ```bash
   git commit -m "feat(02-01): add ATS detection engine for Workday/Greenhouse/Lever"
   ```
