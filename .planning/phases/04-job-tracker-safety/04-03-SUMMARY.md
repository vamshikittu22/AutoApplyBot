---
phase: 04-job-tracker-safety
plan: 03
subsystem: tracker
tags: [submission-logging, volume-tracking, hybrid-detection, captcha-integration]

# Dependency graph
requires:
  - phase: 04-01
    provides: Tracker data layer (storage, utils)
  - phase: 04-02
    provides: CAPTCHA detection and monitoring
provides:
  - Automatic application logging after successful submission
  - Hybrid submission detection (form events + URL change monitoring)
  - Volume tracking with calendar day reset
  - Integration with CAPTCHA blocking

affects: [05-polish-launch-prep, tracker-ui]

# Tech tracking
tech-stack:
  added: [jsdom (for DOM testing)]
  patterns:
    - Hybrid event detection (form submit + URL change)
    - Session storage for pending submissions (10s timeout)
    - Calendar day reset for volume tracking
    - Debounced MutationObserver for URL monitoring

key-files:
  created:
    - src/lib/safety/volume-limiter.ts
    - src/lib/safety/volume-limiter.test.ts
    - src/entrypoints/content/submission-logger.ts
    - src/entrypoints/content/submission-logger.test.ts
    - src/entrypoints/content/job-tracker.content.ts
  modified: []

key-decisions:
  - "Volume threshold set at 15 apps/day (soft warning only, per CONTEXT.md)"
  - "Calendar day reset at midnight (user's local timezone, not rolling 24h window)"
  - "Hybrid detection: form submit event stores pending submission, URL change confirms"
  - "10-second timeout for pending submissions (prevents stale logging)"
  - "CAPTCHA blocking integrated via window.isCaptchaBlocking() exposed function"
  - "Duplicate detection warns but doesn't block (user may reapply intentionally)"
  - "300ms debounce for URL change monitoring (prevents excessive triggers)"

patterns-established:
  - "Pattern 1: Session storage for ephemeral state (pending submissions)"
  - "Pattern 2: Hybrid detection avoids false positives from form submits without confirmation"
  - "Pattern 3: Separate content script files in WXT (job-tracker.content.ts)"
  - "Pattern 4: Conditional initialization (only on pages with forms)"

# Metrics
duration: 4 min
completed: 2026-02-27
---

# Phase 4 Plan 03: Automatic Submission Logging Summary

**Hybrid submission detection with volume tracking, CAPTCHA integration, and automatic application logging after successful form submission**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-27T01:52:32Z
- **Completed:** 2026-02-27T01:56:54Z
- **Tasks:** 3 completed
- **Files modified:** 5 created

## Accomplishments

- Volume limiter with calendar day reset (15 apps/day warning threshold)
- Hybrid submission detection combining form events + URL change monitoring
- Automatic job metadata extraction (title, company, ATS type)
- CAPTCHA blocking integration (no logging when CAPTCHA present)
- Duplicate detection with 7-day threshold (warns but doesn't block)
- Session storage for pending submissions with 10-second timeout
- Separate content script for tracker initialization

## Task Commits

Each task was committed atomically:

1. **Task 1: Volume limiter** - `fa8c868` (feat)
2. **Task 2: Submission logger** - `8deac45` (feat)
3. **Task 3: Content script integration** - `c624bc5` (feat)

## Files Created/Modified

### Created

- `src/lib/safety/volume-limiter.ts` (84 lines) - Volume tracking with calendar day reset
- `src/lib/safety/volume-limiter.test.ts` (208 lines) - 15 passing unit tests
- `src/entrypoints/content/submission-logger.ts` (452 lines) - Hybrid submission detection
- `src/entrypoints/content/submission-logger.test.ts` (220 lines) - 14 passing unit tests
- `src/entrypoints/content/job-tracker.content.ts` (68 lines) - Main tracker content script

### Modified

- `package.json` - Added jsdom dependency for DOM testing
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made

### Volume Tracking

**Decision:** 15 apps/day threshold with calendar day reset at midnight (local timezone)

**Rationale:** 
- CONTEXT.md specified "warnings only" (no hard block) 
- Calendar day reset is more intuitive than rolling 24h window
- 15 apps/day is conservative threshold before showing soft warning

**Impact:** Users retain full control, warning guides behavior without restricting freedom

---

### Hybrid Submission Detection

**Decision:** Combine form submit events + URL change monitoring (two-phase confirmation)

**Rationale:**
- Form submit alone has false positives (users may cancel, validation may fail)
- URL change to success pattern confirms actual submission completed
- Pattern from 04-RESEARCH.md Pattern 2

**Impact:** Reliable logging with minimal false positives, works across ATS platforms

---

### Pending Submission Timeout

**Decision:** 10-second timeout for pending submissions in session storage

**Rationale:**
- Most successful submissions redirect within 2-3 seconds
- 10 seconds handles slower platforms while preventing indefinite stale data
- Session storage clears automatically on tab close

**Impact:** Prevents logging of abandoned applications where user clicked submit but closed tab before redirect

---

### CAPTCHA Integration

**Decision:** Use window.isCaptchaBlocking() exposed by captcha.content.ts

**Rationale:**
- Simpler than message passing for synchronous checks
- Captcha content script already monitors CAPTCHA presence
- Submission logger checks before storing pending submission

**Impact:** Zero logging during CAPTCHA challenges, prevents platform detection

---

### Duplicate Handling

**Decision:** Warn in console but don't block duplicate applications (7-day threshold)

**Rationale:**
- CONTEXT.md specified "warn" not "prevent"
- User may reapply intentionally (updated resume, different referral)
- 7-day threshold catches accidental re-applications

**Impact:** User sees warning but retains ability to proceed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Issue 1: Test date dependency**

- **Found during:** Task 1 (volume limiter tests)
- **Issue:** Tests using "yesterday" date were failing because test execution date happened to be "2026-02-26" (same as hardcoded "yesterday" value)
- **Fix:** Changed test dates to use "2026-01-01" (clearly in the past) instead of relative "yesterday"
- **Verification:** All 15 tests pass with date-independent values
- **Committed in:** fa8c868 (Task 1 commit)

---

**Total issues:** 1 auto-fixed (date-independent test values)

**Impact on plan:** No scope creep - cosmetic test fix to avoid date dependency

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 04-04:** Tracker UI in extension popup

**Dependencies satisfied:**
- Volume tracking operational (getVolumeData, shouldShowVolumeWarning)
- Application storage working (getApplications, updateApplication, deleteApplication)
- Automatic logging functional (pending manual E2E verification)

**Manual E2E testing needed before Plan 04-04:**

1. **Happy path test:**
   - Open Workday/Greenhouse/Lever job page
   - Fill application form (manually or with autofill from Phase 2)
   - Submit application
   - Verify redirected to confirmation page
   - Check tracker: application logged with correct company, job title, date, status=applied
   - Check volume: count incremented

2. **CAPTCHA blocking test:**
   - Find page with CAPTCHA
   - Submit form
   - Verify application NOT logged while CAPTCHA present
   - Complete CAPTCHA, resubmit
   - Verify application now logged

3. **Duplicate detection test:**
   - Apply to job
   - Apply to same job URL again immediately
   - Check console: duplicate warning present
   - Verify both submissions logged (no hard block)

4. **Volume tracking test:**
   - Log 15 applications
   - Check shouldShowVolumeWarning(): returns true
   - Wait until midnight (or mock getTodayDateString() to next day)
   - Verify volume resets to 0

**No blockers** - plan complete and ready for next plan execution.

---

*Phase: 04-job-tracker-safety*
*Completed: 2026-02-27*


## Self-Check: PASSED

**Files verification:**
- ✅ src/lib/safety/volume-limiter.ts - FOUND
- ✅ src/lib/safety/volume-limiter.test.ts - FOUND
- ✅ src/entrypoints/content/submission-logger.ts - FOUND
- ✅ src/entrypoints/content/submission-logger.test.ts - FOUND
- ✅ src/entrypoints/content/job-tracker.content.ts - FOUND

**Commits verification:**
- ✅ fa8c868 - feat(04-03): implement volume limiter with calendar day reset
- ✅ 8deac45 - feat(04-03): implement hybrid submission detection and logging
- ✅ c624bc5 - feat(04-03): integrate submission logger into content script

All deliverables present and committed.
