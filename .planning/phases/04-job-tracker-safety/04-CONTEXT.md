# Phase 4: Job Tracker & Safety Controls - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a working job application tracker with safety controls to prevent platform bans. The tracker automatically logs applications after successful submission and displays them in the extension popup with status management. Safety features include volume guardrails (30 apps/24h), per-site disable controls, and CAPTCHA detection that pauses autofill.

This phase does NOT include: analytics/insights, application reminders, browser notifications for status changes, or integration with external job boards. Those belong in future phases.

</domain>

<decisions>
## Implementation Decisions

### Tracker UI location
- **Primary location:** Extension popup (not options page)
- Tracker is the main view users see when opening the extension
- Advanced sorting/filtering: multi-criteria (sort by multiple fields, filter by status + platform + date range)

### Application logging behavior
- **Trigger:** After successful form submission (not on button click, requires confirmation submission completed)
- Logs automatically without manual confirmation prompt

### Safety guardrail (30 apps/24h)
- **Enforcement:** Warnings only (no hard block)
  - Show warning at threshold but never disable autofill
  - User retains full control to proceed
- **Window calculation:** Calendar day reset (midnight in user's timezone)
  - Not rolling 24h window
  - Clean daily reset is more intuitive

### CAPTCHA detection & pause
- **User notification:** Extension badge indicator
  - Persistent visual feedback while CAPTCHA is present
  - User knows autofill is paused without intrusive notifications

### Per-site disable control
- **Location:** Popup toggle (top-level control in extension popup)
- **Granularity:** Per-job (specific job posting, not domain-wide or path-level)
  - Most specific control — user can disable for problematic applications
  - Doesn't affect other jobs on the same ATS platform

### Claude's Discretion

The following areas are delegated to Claude during planning and implementation:

- **Display format:** Card-based, table, or collapsible list (optimize for popup space constraints)
- **Information density:** Which fields to show at a glance (balance visibility vs clutter)
- **Submission detection method:** Form events, network detection, URL change, or hybrid approach (choose most reliable)
- **Data capture scope:** Core fields only vs extended snapshot (balance usefulness vs storage)
- **Duplicate handling:** Prevent, warn, or allow duplicate applications (handle common scenarios)
- **Warning display mechanism:** Toast, modal, inline banner (choose least disruptive)
- **Warning message tone:** Safety-focused, quality-focused, or limit-focused (craft appropriate messaging)
- **CAPTCHA detection strategy:** Iframe-based, keyword-based, or multi-signal (choose most reliable)
- **CAPTCHA pause UI behavior:** Complete removal, disabled state, or warning on click (balance clarity vs discretion)
- **CAPTCHA resume behavior:** Auto-resume, manual re-enable, or hybrid (choose safest approach)
- **Per-site disable duration:** Permanent, session-only, or user-selectable (handle most common use case)
- **Re-enable process:** Toggle, settings-only, or explicit button (balance ease vs intentionality)
- **Status update method:** Inline dropdown, modal editor, or context menu (choose most efficient UX)
- **Available statuses:** Follow ROADMAP spec (Applied/Interview/Offer/Rejected/Withdrawn) or extend if needed
- **Bulk operations:** Support bulk status update, bulk delete, both, or neither (based on expected usage)
- **Status history tracking:** Full history, current only, or current + application date (balance usefulness vs complexity)

</decisions>

<specifics>
## Specific Ideas

- Tracker should feel like a lightweight CRM for job applications
- Volume guardrail philosophy: guide user behavior, don't restrict freedom
- CAPTCHA handling must be completely invisible to the platform (no bypass attempts, no detection signals)
- Per-job disable granularity chosen to handle edge cases where one specific application is problematic

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-job-tracker-safety*
*Context gathered: 2026-02-26*
