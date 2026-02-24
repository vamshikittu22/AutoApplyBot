---
phase: 02-ats-detection-autofill
plan: 02
subsystem: content-scripts
tags: [content-scripts, background-worker, shadow-dom, mutation-observer, spa-navigation, wxt]

# Dependency graph
requires:
  - phase: 00-foundation-setup
    provides: WXT framework, TypeScript configuration
  - phase: 02-01
    provides: ATS detection engine (detectATS function)
provides:
  - Background service worker with declarativeContent for lazy content script injection
  - Shadow DOM traversal utilities for Workday compatibility
  - MutationObserver wrapper for dynamic form detection
  - Main content script with SPA navigation handling
affects: [02-03-field-mapping, 02-04-autofill-engine]

# Tech tracking
tech-stack:
  added: []
  patterns: [lazy content script injection, Shadow DOM traversal, debounced MutationObserver, SPA navigation handling]

key-files:
  created:
    - src/entrypoints/background.ts
    - src/lib/ats/shadow-dom-utils.ts
    - src/lib/ats/form-observer.ts
    - src/entrypoints/content/ats-detector.content.ts
  modified: []

key-decisions:
  - "declarativeContent API for lazy content script injection (only loads on ATS pages)"
  - "MutationObserver scoped to form elements only with 300ms debouncing"
  - "SPA navigation handling via wxt:locationchange + standard MutationObserver"
  - "Context invalidation handled gracefully (cleanup on error)"

patterns-established:
  - "Pattern: Content scripts only load on matching URL patterns via declarativeContent rules"
  - "Pattern: Shadow DOM utilities provide deep traversal for Workday's Shadow DOM components"
  - "Pattern: FormObserver debounces detection and only fires callbacks on significant changes"
  - "Pattern: Content scripts handle SPA navigation by re-initializing detection"

# Metrics
duration: 4 min
completed: 2026-02-24
---

# Phase 2 Plan 2: Content Script Infrastructure Summary

**Lazy-loading content script infrastructure with Shadow DOM support, MutationObserver-based dynamic form detection, and SPA navigation handling for Workday, Greenhouse, and Lever**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-24T18:19:09Z
- **Completed:** 2026-02-24T18:23:46Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments

- Configured background service worker with declarativeContent rules for lazy content script injection on ATS pages only
- Created Shadow DOM traversal utilities (querySelectorDeep, traverseShadowDOM, getAllShadowRoots) for Workday compatibility
- Built MutationObserver wrapper class with form-scoped detection and 300ms debouncing
- Implemented main content script with SPA navigation handling, context invalidation recovery, and detection result broadcasting

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure Background Service Worker** - `16cbf4c` (feat)
2. **Task 2: Create Shadow DOM Utilities** - `8d504f4` (feat)
3. **Task 3: Create MutationObserver Wrapper** - `50741f7` (feat)
4. **Task 4: Create Main Content Script** - `f2a91e4` (feat)

**Plan metadata:** (will be committed separately)

## Files Created/Modified

- `src/entrypoints/background.ts` - Background service worker with declarativeContent API setup, message handling for ATS detection results
- `src/lib/ats/shadow-dom-utils.ts` - Shadow DOM utilities: getAllShadowRoots, querySelectorDeep, traverseShadowDOM, findByAttributeDeep, isInShadowDOM, getShadowHost
- `src/lib/ats/form-observer.ts` - FormObserver class wrapping MutationObserver with form-specific logic, debouncing, and change tracking
- `src/entrypoints/content/ats-detector.content.ts` - Main content script with URL pattern matching, initial detection, MutationObserver setup, SPA navigation handling

## Decisions Made

**declarativeContent for lazy content script injection**
- Background service worker registers URL pattern rules for Workday, Greenhouse, and Lever
- Content script only loads when URL matches ATS patterns (not on every page)
- Reduces memory usage and avoids unnecessary processing on non-ATS pages
- Rationale: Chrome extension best practice - only activate on relevant pages

**MutationObserver scoped to form elements only**
- Observer watches for changes to forms, inputs, selects, textareas
- Attribute filter includes data-automation-id, data-qa, data-lever, class, id
- 300ms debouncing prevents excessive detection re-runs
- Rationale: Minimizes performance impact by avoiding full-document observation

**SPA navigation handling**
- Listens for wxt:locationchange event (WXT-provided)
- Also uses MutationObserver to detect URL changes via standard navigation
- Re-initializes detection on navigation by cleaning up and restarting observer
- Rationale: Many ATS platforms are SPAs (Greenhouse, Lever) - must detect navigation without page reload

**Context invalidation graceful handling**
- Content script catches "Extension context invalidated" errors
- Cleanup observers and stop processing on context invalidation
- Prevents console errors when extension updates or reloads
- Rationale: Improves user experience during development and updates

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - plan executed smoothly with all tasks completing as specified.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 02-03: Field Mapping Engine**

This plan provides:
- Content script infrastructure that runs detection on ATS pages
- Background script that stores detection results for popup access
- Shadow DOM utilities ready for Workday form field scanning
- MutationObserver ready to detect dynamically loaded form fields
- SPA navigation handling ensures detection works across multi-step forms

Next plan should:
- Create field mapping engine to map profile fields to ATS input fields
- Implement confidence scoring for field matches
- Build field scanner that uses Shadow DOM utilities and detection results
- Prepare for autofill engine (Plan 02-04)

---

*Phase: 02-ats-detection-autofill*
*Completed: 2026-02-24*

## Self-Check: PASSED

All created files exist on disk:
- ✅ src/entrypoints/background.ts
- ✅ src/lib/ats/shadow-dom-utils.ts
- ✅ src/lib/ats/form-observer.ts
- ✅ src/entrypoints/content/ats-detector.content.ts

All commits exist in git history:
- ✅ 16cbf4c (Task 1)
- ✅ 8d504f4 (Task 2)
- ✅ 50741f7 (Task 3)
- ✅ f2a91e4 (Task 4)
