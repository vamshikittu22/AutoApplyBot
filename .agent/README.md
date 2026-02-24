# .agent — Antigravity Configuration

> This folder configures how the **Antigravity AI coding assistant** behaves in this project.
> For vendor-agnostic agent rules (Cursor, Windsurf, Claude Code, etc.), see [AGENTS.md](../AGENTS.md) in the root.

---

## Folder Structure

```
.agent/
├── README.md          ← You are here
└── workflows/         ← Project-specific slash-command workflows
    ├── run-phase.md        → /run-phase  — Execute a GSD phase plan
    ├── new-commit.md       → /new-commit — Atomic commit helper
    └── verify-phase.md     → /verify-phase — Phase definition-of-done checklist
```

---

## Global Skills (Available Across All Projects)

These skills are installed globally at `C:\Users\kittu\.gemini\antigravity\skills\`
and are available in **every project** without copying them here.

| Skill | Purpose |
|-------|---------|
| `ui-ux-pro-max` | Premium UI/UX design — 50 styles, 21 palettes, 50 font pairings |
| `code-review` | Code review for bugs, style issues, best practices |
| `documentation-writer` | Clear, concise docs and README files |
| `unit-test-generator` | Unit tests for Python and JavaScript/TypeScript |

To use a skill, just reference it naturally:
- *"Using the ui-ux-pro-max skill, design the extension popup UI"*
- *"Review this file with the code-review skill"*

---

## Project-Specific Context Files

| File | Purpose |
|------|---------|
| [AGENTS.md](../AGENTS.md) | Vendor-agnostic agent rules — **read this first** |
| [PROJECT_PLAN.md](../PROJECT_PLAN.md) | Phased delivery plan — current phase status |
| [PRD.md](../PRD.md) | Full product requirements |
| [MVC.md](../MVC.md) | v1 scope definition |
| [TECHSTACK.md](../TECHSTACK.md) | Tech stack decisions |
| [.planning/STATE.md](../.planning/STATE.md) | Current progress tracker |
