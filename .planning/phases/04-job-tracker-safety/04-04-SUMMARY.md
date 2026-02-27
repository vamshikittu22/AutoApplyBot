---
phase: 04-job-tracker-safety
plan: 04
subsystem: tracker
tags: [react, zustand, tracker-ui, filtering, sorting, chrome-storage, material-design]

# Dependency graph
requires:
  - phase: 04-01
    provides: Tracker data layer (storage, types, utils)
  - phase: 00-04
    provides: Zustand state management patterns and Tailwind CSS styling
  - phase: 01-04
    provides: React component patterns and Chrome Storage integration
provides:
  - TrackerList component with filtering, sorting, and empty states
  - ApplicationCard component with inline status editing and delete
  - TrackerFilters component with multi-criteria filtering
  - Zustand store for tracker UI state management
  - Real-time Chrome Storage sync via onChanged listener
affects: [04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zustand store with persist middleware for filter/sort preferences"
    - "Chrome Storage onChanged listener for real-time sync"
    - "Computed state pattern (filteredApplications)"
    - "Component composition (TrackerList > TrackerFilters + ApplicationCard[])"
    - "Inline editing pattern (dropdown status selector)"
    - "Conditional empty states (no data vs. no results from filters)"
    - "Material Design card layout with status-specific colors"

key-files:
  created:
    - src/lib/store/tracker-store.ts
    - src/lib/store/tracker-store.test.ts
    - src/entrypoints/popup/components/TrackerFilters.tsx
    - src/entrypoints/popup/components/ApplicationCard.tsx
    - src/entrypoints/popup/components/TrackerList.tsx
  modified:
    - src/entrypoints/popup/App.tsx

key-decisions:
  - "Zustand store for UI state management (not React state)"
  - "Persist only filter/sort preferences (not application data)"
  - "Inline status dropdown (not modal) for faster editing"
  - "Grid layout for filters (2 columns for status/platform, single row for sort)"
  - "Card-based design for applications (not table layout)"
  - "Two distinct empty states (no data vs. no filter results)"
  - "Real-time Chrome Storage sync for automatic updates"
  - "Relative date formatting (Today, Yesterday, X days ago)"

patterns-established:
  - "Pattern 1: Zustand store with Chrome Storage integration and real-time sync"
  - "Pattern 2: Computed state pattern for filtering and sorting (filteredApplications())"
  - "Pattern 3: Component composition with clear separation of concerns"
  - "Pattern 4: Inline editing pattern for status updates (dropdown in card)"
  - "Pattern 5: Confirmation dialogs for destructive actions (delete)"

# Metrics
duration: 7 min
completed: 2026-02-26
---

# Phase 4 Plan 04: Tracker List UI Summary

**React-based tracker UI with Zustand state management, multi-criteria filtering (status, platform, date), sorting (date/company/status), inline status editing, and real-time Chrome Storage sync**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-26T20:03:44-06:00
- **Completed:** 2026-02-26T20:05:45-06:00
- **Tasks:** 4 completed
- **Files created:** 5 (4 implementation + 1 test file)
- **Files modified:** 1

## Accomplishments

- Complete Zustand store with filtering (status, platform, date range), sorting (date/company/status, asc/desc), and Chrome Storage sync
- TrackerFilters component with 2-row compact layout for status/platform filters and sort controls
- ApplicationCard component with inline status dropdown, delete button, ATS platform badges, and status-specific colors
- TrackerList component integrating filters, cards, loading state, and two distinct empty states
- Comprehensive unit tests (11 tests) covering filtering logic, sorting logic, and state management
- Tab navigation in popup (Tracker/Profile/Settings) with tracker as default view
- Real-time sync via chrome.storage.onChanged listener for automatic updates when content script logs new application

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Zustand store for tracker UI state** - `3749600` (feat)
   - TrackerStore with filtering (status, platform, date range)
   - Sorting by date/company/status (asc/desc)
   - Chrome Storage sync via onChanged listener
   - Real-time updates when applications added
   - CRUD operations (update status, delete)
   - Persist filter/sort preferences (not application data)
   - Comprehensive unit tests (11 tests passing)

2. **Task 2: Build ApplicationCard component** - `a7cb54f` (feat)
   - Compact card layout optimized for 400px popup width
   - Inline status dropdown with color-coded badges (blue/yellow/green/red/gray)
   - Delete button with confirmation dialog
   - ATS platform badge (Workday/Greenhouse/Lever/Unknown)
   - Relative date formatting (Today, Yesterday, X days ago)
   - Status-specific background colors for visual differentiation
   - Hover shadow effect for interactivity

3. **Task 3: Build TrackerFilters component** - `9f152f1` (feat)
   - Status filter dropdown (All, Applied, Interview, Offer, Rejected, Withdrawn)
   - Platform filter dropdown (All, Workday, Greenhouse, Lever, Unknown)
   - Sort by dropdown (Date, Company, Status)
   - Sort order toggle button (Asc/Desc with directional icons)
   - Clear filters button (disabled when no filters active)
   - Compact 2-row grid layout for popup constraints
   - Connected to Zustand store for state management

4. **Task 4: Build TrackerList and integrate into popup** - `1a4f634` (feat)
   - TrackerList component with filters, cards, empty states, loading state
   - Application count display ("X applications")
   - Empty state: no data ("No applications tracked yet")
   - Empty state: no results ("No applications match your filters")
   - Tab navigation in popup (Tracker, Profile, Settings)
   - Tracker tab as default view
   - Profile/Settings tabs redirect to options page
   - Fixed popup dimensions (400x600px)
   - Scrollable application list with proper overflow handling

## Files Created/Modified

**Created:**
- `src/lib/store/tracker-store.ts` (200 lines) - Zustand store with filtering, sorting, Chrome Storage sync, real-time updates via onChanged listener, CRUD operations, computed filteredApplications()
- `src/lib/store/tracker-store.test.ts` (202 lines) - Unit tests covering filtering (status, platform, date range), sorting (date/company/status, asc/desc), filter combinations, clear filters
- `src/entrypoints/popup/components/ApplicationCard.tsx` (123 lines) - Card component with inline status dropdown, delete button with confirmation, ATS platform badges, relative date formatting, status-specific colors
- `src/entrypoints/popup/components/TrackerFilters.tsx` (153 lines) - Filter controls with status/platform dropdowns, sort by/order controls, clear filters button, 2-row compact layout
- `src/entrypoints/popup/components/TrackerList.tsx` (112 lines) - Main list component integrating TrackerFilters and ApplicationCard, loading state, two distinct empty states, application count display

**Modified:**
- `src/entrypoints/popup/App.tsx` - Added tab navigation (Tracker/Profile/Settings), integrated TrackerList, added placeholder tabs for Profile/Settings (redirect to options page), fixed popup dimensions (400x600px)

## Decisions Made

**Why Zustand store instead of React state?**
- Rationale: Needed to persist filter/sort preferences, share state across components, and integrate with Chrome Storage sync
- Impact: Cleaner component code, automatic state persistence, real-time sync capability via onChanged listener

**Why inline status dropdown instead of modal?**
- Rationale: Faster UX for common action (status updates happen frequently during job search)
- Impact: One click to change status (not open modal → select → save → close), saves vertical space in compact popup

**Why card-based design instead of table layout?**
- Rationale: Table requires horizontal scrolling in 400px popup width, cards adapt better to narrow layout
- Impact: Each application gets visual breathing room, status colors more prominent, easier touch targets for mobile testing

**Why two distinct empty states?**
- Rationale: User needs to know if they have no data (haven't applied yet) vs. filters returned no results (try different filters)
- Impact: Clear guidance on next action (apply to job vs. adjust filters), reduces confusion

**Why grid layout for filters?**
- Rationale: Needed to fit 4 controls (status, platform, sort by, sort order) in minimal vertical space
- Impact: 2-row compact layout fits above scrollable list, all controls visible without scrolling

**Why relative date formatting?**
- Rationale: "2 days ago" is more meaningful than "Feb 25, 2026" for recent applications
- Impact: Faster visual scanning, clearer recency context

**Why persist only filter/sort preferences (not application data)?**
- Rationale: Application data lives in Chrome Storage (source of truth), UI state should reflect current Storage state
- Impact: No stale data in persisted store, Chrome Storage sync updates UI automatically

**Why Chrome Storage onChanged listener?**
- Rationale: Content script logs applications directly to Chrome Storage, popup needs to update automatically
- Impact: User sees new applications appear in tracker immediately without manual refresh

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all implementations followed 04-RESEARCH.md Zustand patterns and Phase 01-04 React component patterns exactly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 04-05: Volume warning and per-job disable controls**

The tracker UI is complete and tested:
- ✅ TrackerList component renders applications with filters and sorting
- ✅ TrackerFilters component provides multi-criteria filtering
- ✅ ApplicationCard component supports inline status editing and deletion
- ✅ Zustand store manages UI state with Chrome Storage sync
- ✅ Real-time updates when content script logs new application
- ✅ Empty states guide user when no data or no filter results
- ✅ Unit tests verify filtering and sorting logic (11 tests passing)
- ✅ Tab navigation in popup with tracker as default view

Next plan can build:
- Volume warning banner in tracker tab
- Per-job disable toggle in tracker tab
- Integration with autofill/AI content scripts for safety controls

**Integration contract:**
- VolumeWarning component can use `getApplicationsToday()` from tracker storage
- SiteDisableToggle component can be placed in tracker tab above TrackerList
- Content scripts can check disable state and cleanup UI when disabled

## Self-Check: PASSED

All claimed files and commits verified:

```bash
# Check created files exist
$ ls -1 src/lib/store/tracker-store.ts src/lib/store/tracker-store.test.ts src/entrypoints/popup/components/TrackerFilters.tsx src/entrypoints/popup/components/ApplicationCard.tsx src/entrypoints/popup/components/TrackerList.tsx
src/entrypoints/popup/components/ApplicationCard.tsx
src/entrypoints/popup/components/TrackerFilters.tsx
src/entrypoints/popup/components/TrackerList.tsx
src/lib/store/tracker-store.test.ts
src/lib/store/tracker-store.ts

# Check commits exist
$ git log --oneline | grep -E "(3749600|a7cb54f|9f152f1|1a4f634)"
1a4f634 feat(04-04): build TrackerList and integrate into popup
9f152f1 feat(04-04): build TrackerFilters component
a7cb54f feat(04-04): build ApplicationCard component
3749600 feat(04-04): create Zustand store for tracker UI state
```

✓ All 5 created files exist
✓ All 1 modified file exists
✓ All 4 task commits present in git history

---
*Phase: 04-job-tracker-safety*
*Plan: 04*
*Completed: 2026-02-26*
