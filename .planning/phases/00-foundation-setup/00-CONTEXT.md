# Phase 0: Foundation & Setup - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a fully configured, runnable Chrome extension development environment using WXT framework. This includes project structure, build system, dev server with hot reload, TypeScript strict mode, ESLint/Prettier configuration, and a basic extension shell that loads in Chrome without errors.

This phase establishes the foundation — no user-facing features, just the technical infrastructure needed for all subsequent phases.

</domain>

<decisions>
## Implementation Decisions

### Development workflow
- **Hot reload:** Full hot reload — changes immediately reflected without manual reload
- **Type checking:** Strict checking mode — TypeScript + ESLint run on every save, catching errors immediately (slower but safer)
- **Dev environment startup:** Claude's discretion — single command vs multiple terminals based on WXT best practices
- **Source maps:** Claude's discretion — include if helpful for debugging, exclude if build speed matters more

### Project structure
- **Component organization:** Hybrid approach
  - Shared/reusable components live in `src/components/`
  - Feature-specific components grouped by feature (e.g., `src/profile/components/`, `src/autofill/components/`)
- **Test file location:** Separate `tests/` directory mirroring `src/` structure
  - Unit tests: `tests/unit/`
  - E2E tests: `tests/e2e/`
- **ATS platform code:** Folder per ATS (Phase 2 prep)
  - `src/lib/ats/workday/` with detection, selectors, mapping inside
  - `src/lib/ats/greenhouse/` with detection, selectors, mapping inside
  - `src/lib/ats/lever/` with detection, selectors, mapping inside
- **Constants organization:** Claude's discretion — single file or split by domain based on size/complexity

### Extension manifest
- **Permissions:** All permissions upfront at install time
  - Clear privacy disclosure shown during onboarding
  - No progressive/optional permissions
- **Content script injection:** All pages
  - Detect ATS pages programmatically after injection
  - Lazy activation — only activate when job form detected
- **Content script timing (run_at):** Claude's discretion — balance early detection vs page performance based on ATS research
- **Execution world:** Claude's discretion — ISOLATED vs MAIN world based on Workday Shadow DOM requirements (research will inform this)

### Code quality gates
- **TypeScript blocking:** Claude's discretion — likely block commits given strict mode policy, but defer to best practices
- **ESLint blocking:** Claude's discretion — likely block errors, warn-only for warnings
- **Prettier enforcement:** Claude's discretion — auto-format on save recommended, enforcement level flexible
- **Pre-commit tests:** Claude's discretion — balance test suite speed vs commit friction (likely non-blocking for Phase 0)

</decisions>

<specifics>
## Specific Ideas

- Follow AGENTS.md structure exactly — no deviations from defined folder layout
- TECHSTACK.md locks technology choices (WXT, React, Zustand, Tailwind, Vitest, Playwright)
- Atomic commits policy: commit after every task, clear single-purpose messages
- Use pnpm exclusively (never npm or yarn)
- All commands defined in AGENTS.md must work after Phase 0 completes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 00-foundation-setup*
*Context gathered: 2026-02-20*
