---
phase: 02-ats-detection-autofill
plan: 06
subsystem: ui
tags: [helper-mode, fallback, copy-clipboard, graceful-degradation, sidebar, react]

# Dependency graph
requires:
  - phase: 00-foundation-setup
    provides: WXT framework, React, Tailwind CSS
  - phase: 01-profile-system
    provides: Profile type structure, profile storage
  - phase: 02-01
    provides: ATS detection with confidence scoring
provides:
  - Helper Mode sidebar for manual field copying
  - Copy-to-clipboard utilities with fallback support
  - Collapsible profile snippet components
  - Shadow DOM isolated sidebar UI
  - Mode toggling between autofill and helper
  - Background script message handling for helper mode
affects: [03-ai-integration, 04-job-tracker]

# Tech tracking
tech-stack:
  added: []
  patterns: [Shadow DOM isolation, clipboard API with fallback, collapsible components, graceful degradation]

key-files:
  created:
    - src/lib/ui/clipboard-utils.ts
    - src/components/ProfileSnippet.tsx
    - src/entrypoints/content/helper-mode.content/HelperSidebar.tsx
    - src/entrypoints/content/helper-mode.content/index.tsx
    - src/entrypoints/content/helper-mode.content/style.css
  modified:
    - src/entrypoints/background.ts

key-decisions:
  - "Clipboard API primary with execCommand fallback for older browsers"
  - "Profile snippets collapsible by default to reduce sidebar height"
  - "Helper Mode activates when: no ATS detected, low confidence (<70%), or manual toggle"
  - "Shadow DOM isolation prevents CSS conflicts with ATS platforms"
  - "Work/education show most recent entry only (array[0])"

patterns-established:
  - "Pattern: Graceful degradation - fallback UI when automation fails"
  - "Pattern: Clipboard utilities with async/legacy fallback support"
  - "Pattern: Collapsible sections for space-efficient UIs"
  - "Pattern: Background script message passing for mode control"

# Metrics
duration: 7 min
completed: 2026-02-24
---

# Phase 2 Plan 6: Helper Mode & Graceful Degradation Summary

**Copy-to-clipboard Helper Mode sidebar with collapsible profile sections, Shadow DOM isolation, and message-based mode toggling for unsupported ATS platforms**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-24T18:56:07Z
- **Completed:** 2026-02-24T19:03:51Z
- **Tasks:** 6
- **Files modified:** 6 (5 created, 1 modified)

## Accomplishments

- Built clipboard utilities with Clipboard API + execCommand fallback for cross-browser support
- Created collapsible ProfileSnippet component for space-efficient profile display
- Implemented complete HelperSidebar with 6 profile sections (personal, current work, education, skills, links, role-specific)
- Created helper mode content script with Shadow DOM isolation and message-based activation
- Integrated Tailwind CSS styles into Shadow DOM via @import
- Extended background script with TOGGLE_HELPER_MODE message handler
- All implementations pass TypeScript strict mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Clipboard Utils** - `2f95994` (feat)
2. **Task 2: Create ProfileSnippet Component** - `0adcc35` (feat)
3. **Task 3: Create HelperSidebar Component** - `48c4ad3` (feat)
4. **Task 4: Create Helper Mode Content Script** - `fd85b7f` (feat)
5. **Task 5: Create Shadow DOM Styles** - `3efc5e9` (feat)
6. **Task 6: Update Background Script** - `a0261ad` (feat)

**Plan metadata:** (will be committed after STATE.md update)

## Files Created/Modified

- `src/lib/ui/clipboard-utils.ts` - Copy-to-clipboard with Clipboard API + execCommand fallback (42 lines)
- `src/components/ProfileSnippet.tsx` - Collapsible profile section with copy button (79 lines)
- `src/entrypoints/content/helper-mode.content/HelperSidebar.tsx` - Main sidebar with profile sections (287 lines)
- `src/entrypoints/content/helper-mode.content/index.tsx` - Content script with Shadow DOM mounting (121 lines)
- `src/entrypoints/content/helper-mode.content/style.css` - Shadow DOM styles with Tailwind (64 lines)
- `src/entrypoints/background.ts` - Added TOGGLE_HELPER_MODE message handler (modified)

## Decisions Made

**Clipboard API with execCommand fallback**
- Primary: Clipboard API (navigator.clipboard.writeText) for modern browsers
- Fallback: document.execCommand('copy') for older browsers or permission-denied cases
- Rationale: Ensures copy functionality works across all supported browsers and permission contexts

**Collapsible profile sections**
- ProfileSnippet component uses expand/collapse state
- Sections collapsed by default to reduce initial sidebar height
- User can expand sections as needed
- Rationale: Profile has 6+ sections; showing all expanded would require excessive scrolling

**Helper Mode activation logic**
- Auto-activates when: no ATS detected (null), low confidence (<70%)
- Manual activation: extension popup toggle sends TOGGLE_HELPER_MODE message
- Manual override even when autofill available
- Rationale: Covers both automatic fallback and user preference scenarios

**Profile section formatting**
- Work/education: Show most recent entry only (workHistory[0], education[0])
- Skills: Comma-separated list from skills array
- Role-specific: Show domainExtras fields based on rolePreference
- Rationale: Forms typically ask for current position/education, not full history

**Shadow DOM style isolation**
- Helper Mode sidebar rendered in Shadow DOM
- Tailwind CSS imported via @import in style.css
- React root created inside shadowRoot
- Rationale: Prevents ATS platform CSS from breaking extension sidebar UI

## Deviations from Plan

None - plan executed exactly as written. All implementations match specifications.

## Issues Encountered

None - plan executed smoothly with all tasks completing as specified.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Phase 2 COMPLETE (6/6 plans done)**

This plan completes all Phase 2 requirements:
- ✅ ATS detection for Workday, Greenhouse, Lever (Plan 02-01)
- ✅ Content script infrastructure with Shadow DOM support (Plan 02-02)
- ✅ Field mapping engine with confidence scoring (Plan 02-03)
- ✅ Autofill engine with undo capability (Plan 02-04)
- ✅ Autofill button UI with visual feedback (Plan 02-05)
- ✅ Helper Mode fallback for unsupported platforms (Plan 02-06)

**Phase 2 delivers:**
- Multi-signal ATS detection (≥95% accuracy)
- Shadow DOM traversal for Workday forms
- Fuzzy field matching (100% accuracy on standard fields)
- Autofill with confidence thresholds (≥70% auto-fill)
- Visual feedback (colored borders, confidence badges, undo buttons)
- Helper Mode fallback (copy-to-clipboard for unsupported ATSs)

**Ready for Phase 3: AI Answer Generation**

Phase 3 should implement:
- Mock AI response system for development
- User API key configuration for OpenAI/Claude
- Role-specific prompt templates (Tech/Healthcare/Finance)
- Question field detection and answering
- Answer preview/edit UI before autofill
- REQ-AI-21 through REQ-AI-26 coverage

---

*Phase: 02-ats-detection-autofill*
*Completed: 2026-02-24*

## Self-Check: PASSED

All created files exist on disk:
- ✅ src/lib/ui/clipboard-utils.ts
- ✅ src/components/ProfileSnippet.tsx
- ✅ src/entrypoints/content/helper-mode.content/HelperSidebar.tsx
- ✅ src/entrypoints/content/helper-mode.content/index.tsx
- ✅ src/entrypoints/content/helper-mode.content/style.css

Modified files exist:
- ✅ src/entrypoints/background.ts

All commits exist in git history:
- ✅ 2f95994 (Task 1)
- ✅ 0adcc35 (Task 2)
- ✅ 48c4ad3 (Task 3)
- ✅ fd85b7f (Task 4)
- ✅ 3efc5e9 (Task 5)
- ✅ a0261ad (Task 6)

All verification checks pass:
- ✅ TypeScript compiles without errors
- ✅ Clipboard utilities with fallback implemented
- ✅ ProfileSnippet component with collapse/expand
- ✅ HelperSidebar with 6 profile sections
- ✅ Shadow DOM content script with message listener
- ✅ Tailwind CSS integration in Shadow DOM
- ✅ Background script handles TOGGLE_HELPER_MODE
