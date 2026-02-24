# Phase 2: ATS Detection & Autofill Engine - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Detect when users are on Workday, Greenhouse, or Lever job application pages (≥95% accuracy per platform), then provide a button to intelligently autofill their profile data into form fields (≥85% field accuracy). Includes field mapping with confidence scoring, visual feedback, Helper Mode for unsupported sites, and graceful degradation when markup changes.

This phase covers:
- ATS platform detection (Workday, Greenhouse, Lever)
- One-click autofill functionality
- Field mapping with confidence scoring
- Visual feedback (color-coded fields)
- Helper Mode for unsupported/low-confidence sites
- Graceful degradation

</domain>

<decisions>
## Implementation Decisions

### Detection Trigger & Injection

**Content script injection:**
- Use declarativeContent API for injection (most efficient)
- Only inject content scripts on pages that match ATS URL patterns

**Detection confidence:**
- Claude's discretion on signal requirements (URL, DOM, Shadow DOM markers)
- Multiple signals preferred to reduce false positives

**Uncertain detection (50-70% confidence):**
- Show subtle "maybe" indicator rather than full autofill UI
- User can manually activate if they know it's an ATS form

**Shadow DOM handling:**
- Claude's discretion on traversal approach
- Platform-specific handling if needed (Workday uses Shadow DOM differently)

**Multi-page applications:**
- Claude's discretion on caching strategy
- Re-detect vs cache detection result per domain within session

**Performance optimization:**
- Claude's discretion on throttling/debouncing
- Balance between responsiveness and CPU usage

**iFrame handling:**
- Claude's discretion based on Greenhouse requirements
- Must handle iframes if Greenhouse uses them for forms

### Autofill Button Placement & Visibility

**Button placement:**
- Hybrid positioning: inline with form initially, becomes fixed when scrolling away
- Smart positioning that adapts to user scroll behavior

**Button prominence:**
- Small and subtle (minimal intrusion)
- Should not dominate the page or distract from application

**Expandable UI:**
- Primary action: click triggers autofill immediately
- Secondary options: right-click or hover shows options (preview, settings, manual select)

**Multi-step forms:**
- Claude's discretion on button persistence across pages
- Workday has 5-10 page flows - button behavior should adapt

### Field Confidence & User Feedback

**Confidence visualization:**
- Border + icon combination
- Green border + checkmark for high confidence (≥70%)
- Yellow border + warning icon for low confidence (<70%)
- Red border + error icon for mapping failures

**Low confidence fields:**
- Claude's discretion on skip vs fill-with-warning
- Balance between completeness and accuracy

**Pre-fill review:**
- Claude's discretion on immediate fill vs preview panel
- Consider showing "Undo All" option after fill

**Field-level controls:**
- Each filled field has inline undo/edit button
- User can undo individual fields without clearing everything

### Helper Mode Behavior

**Helper Mode trigger:**
- Always available as an option (user can manually toggle)
- Automatically activates on unknown platforms or very low confidence
- User can switch between Autofill Mode and Helper Mode anytime

**Helper Mode UI:**
- Claude's discretion on sidebar vs floating dialog vs dropdown
- Must be accessible and non-intrusive

**Copy granularity:**
- Both section-level and field-level copying
- Section-level: copy all work experience, all education, all skills
- Field-level: copy individual job title, one skill, etc.

**Mode switching:**
- User can switch from Autofill Mode to Helper Mode anytime
- Bidirectional switching supported (Helper → Autofill if confidence improves)

### Claude's Discretion

- Detection timing: page load only vs continuous monitoring
- Detection signal requirements: single vs multiple signals
- Shadow DOM traversal approach
- Multi-page caching strategy
- Performance throttling/debouncing
- iFrame detection and handling specifics
- Button behavior on multi-step forms
- Low confidence field handling (skip vs fill-with-warning)
- Pre-fill review (immediate vs preview panel)
- Helper Mode UI choice (sidebar, floating dialog, or dropdown)

</decisions>

<specifics>
## Specific Ideas

- **Hybrid button positioning:** Start inline with form, become fixed when user scrolls away - adapts to user behavior
- **Small and subtle button:** Minimal intrusion, doesn't dominate the page
- **Border + icon feedback:** Clear visual signal for confidence without being overwhelming
- **Per-field undo:** Users can selectively undo fills without clearing everything
- **Always-available Helper Mode:** Even on supported platforms, users can toggle to manual copy mode if autofill isn't working well
- **Bidirectional mode switching:** Users can try autofill, fall back to Helper Mode, then try autofill again if needed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

All discussed features (detection, autofill, confidence scoring, Helper Mode) are part of Phase 2 requirements.

</deferred>

---

*Phase: 02-ats-detection-autofill*
*Context gathered: 2026-02-24*
