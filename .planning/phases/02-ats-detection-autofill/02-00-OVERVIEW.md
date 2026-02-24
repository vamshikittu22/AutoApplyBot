# Phase 2: ATS Detection & Autofill Engine — Overview

**Phase Duration:** Week 3-4 (from PROJECT_PLAN.md)
**Complexity:** High
**Risk Level:** Medium-High

---

## Phase Objectives

Build reliable ATS platform detection (Workday, Greenhouse, Lever) with ≥95% accuracy per platform, and implement intelligent one-click autofill with ≥85% field accuracy. Includes field mapping with confidence scoring, visual feedback, Helper Mode for unsupported sites, and graceful degradation.

**Success Criteria:**
- Extension detects Workday forms with ≥95% accuracy (10+ test URLs)
- Extension detects Greenhouse forms with ≥95% accuracy (10+ test URLs)
- Extension detects Lever forms with ≥95% accuracy (10+ test URLs)
- Autofill fills ≥85% of standard fields correctly per platform
- Helper Mode activates on unsupported sites
- Visual field highlighting works (green = filled, yellow = needs review)
- No false positives on non-ATS pages

---

## Phase Breakdown (6 Plans)

### Plan 02-01: ATS Detection Foundation (P0)
**Duration:** ~60 min
**Dependencies:** Phase 0, Phase 1 complete

**Scope:**
- Create multi-signal detection engine (URL + DOM + Shadow DOM + attributes)
- Implement platform-specific detectors (Workday, Greenhouse, Lever)
- Set up declarativeContent API rules for lazy content script injection
- Create detection confidence scoring system
- Add unit tests for detection logic (≥95% accuracy requirement)

**Deliverables:**
- `src/lib/ats/detector.ts` — Main detection orchestrator
- `src/lib/ats/workday.ts` — Workday detection logic
- `src/lib/ats/greenhouse.ts` — Greenhouse detection logic
- `src/lib/ats/lever.ts` — Lever detection logic
- `src/constants/ats-patterns.ts` — URL patterns, DOM signatures
- `tests/unit/ats/detector.test.ts` — Detection unit tests

**Requirements Met:**
- REQ-ATS-01: Multi-signal ATS detection
- REQ-ATS-02: Platform-specific detection for Workday, Greenhouse, Lever
- REQ-ATS-03: Detection confidence scoring

---

### Plan 02-02: Content Script Infrastructure (P0)
**Duration:** ~45 min
**Dependencies:** Plan 02-01

**Scope:**
- Create content script entry point with WXT framework
- Implement background service worker with declarativeContent rules
- Set up Shadow DOM traversal utilities (for Workday)
- Create MutationObserver wrapper for dynamic form detection
- Handle SPA navigation detection (wxt:locationchange)
- Add context invalidation handling

**Deliverables:**
- `src/entrypoints/background.ts` — declarativeContent rules
- `src/entrypoints/content/ats-detector.content.ts` — Main detection content script
- `src/lib/ats/shadow-dom-utils.ts` — Shadow DOM traversal
- `src/lib/ats/form-observer.ts` — MutationObserver wrapper

**Requirements Met:**
- REQ-ATS-04: Lazy content script injection
- REQ-ATS-05: Shadow DOM handling
- REQ-ATS-06: Dynamic form detection

---

### Plan 02-03: Field Mapping Engine with Confidence Scoring (P0)
**Duration:** ~75 min
**Dependencies:** Plan 02-02

**Scope:**
- Install and configure Fuse.js for fuzzy string matching
- Create field mapper with confidence scoring (≥85% accuracy target)
- Implement multi-strategy field detection (label, aria-label, name, id, placeholder)
- Build profile-to-form mapping logic
- Create field type categorization (text, email, phone, date, select, textarea)
- Add comprehensive unit tests for field mapping

**Deliverables:**
- `src/lib/autofill/field-mapper.ts` — Field mapping orchestrator
- `src/lib/autofill/confidence-scorer.ts` — Fuzzy matching & confidence calculation
- `src/lib/autofill/field-detector.ts` — Field type detection
- `src/constants/field-selectors.ts` — Field type patterns
- `tests/unit/autofill/field-mapper.test.ts` — Field mapping tests

**Requirements Met:**
- REQ-ATS-07: Field mapping with confidence scoring
- REQ-ATS-08: Multi-strategy field detection
- REQ-ATS-09: Profile-to-form mapping

---

### Plan 02-04: Autofill Engine & Field Filling (P0)
**Duration:** ~60 min
**Dependencies:** Plan 02-03

**Scope:**
- Create autofill engine that fills fields with profile data
- Implement field filling with proper event firing (input, change, blur)
- Add field validation before filling
- Create undo/redo system for individual fields
- Implement "Undo All" functionality
- Add tests for autofill logic

**Deliverables:**
- `src/lib/autofill/engine.ts` — Main autofill orchestrator
- `src/lib/autofill/field-filler.ts` — DOM manipulation for filling
- `src/lib/autofill/undo-manager.ts` — Undo/redo system
- `tests/unit/autofill/engine.test.ts` — Autofill tests

**Requirements Met:**
- REQ-ATS-10: One-click autofill
- REQ-ATS-11: Field filling with event firing
- REQ-ATS-12: Per-field undo functionality

---

### Plan 02-05: Autofill Button UI & Visual Feedback (P1)
**Duration:** ~75 min
**Dependencies:** Plan 02-04

**Scope:**
- Create autofill button component with React
- Implement hybrid positioning (inline → fixed on scroll)
- Add visual field highlighting (green/yellow/red borders + icons)
- Create field decorator for confidence visualization
- Add inline undo buttons per field
- Style with Tailwind CSS and Shadow DOM isolation

**Deliverables:**
- `src/entrypoints/content/autofill-button.content/index.tsx` — Content script UI
- `src/entrypoints/content/autofill-button.content/AutofillButton.tsx` — Button component
- `src/entrypoints/content/autofill-button.content/style.css` — Shadow DOM styles
- `src/lib/ui/button-positioner.ts` — Hybrid positioning logic
- `src/lib/ui/field-decorator.ts` — Visual feedback system
- `src/components/FieldIndicator.tsx` — Confidence indicator component

**Requirements Met:**
- REQ-ATS-13: Autofill button UI
- REQ-ATS-14: Hybrid button positioning
- REQ-ATS-15: Visual field highlighting
- REQ-ATS-16: Per-field undo controls

---

### Plan 02-06: Helper Mode & Graceful Degradation (P1)
**Duration:** ~60 min
**Dependencies:** Plan 02-05

**Scope:**
- Create Helper Mode sidebar component
- Implement copy-to-clipboard for profile sections
- Add bidirectional mode switching (Autofill ↔ Helper)
- Create low-confidence detection handler (show "maybe" indicator)
- Implement graceful degradation when detection fails
- Add fallback UI for unsupported platforms

**Deliverables:**
- `src/entrypoints/content/helper-mode.content/index.tsx` — Helper Mode UI
- `src/entrypoints/content/helper-mode.content/HelperSidebar.tsx` — Sidebar component
- `src/lib/ui/clipboard-utils.ts` — Copy helpers
- `src/components/ProfileSnippet.tsx` — Copyable profile sections

**Requirements Met:**
- REQ-ATS-17: Helper Mode for unsupported sites
- REQ-ATS-18: Low-confidence detection handling
- REQ-ATS-19: Graceful degradation
- REQ-ATS-20: Mode switching

---

## Requirements Traceability

| Requirement ID | Description | Plan(s) | Priority |
|----------------|-------------|---------|----------|
| REQ-ATS-01 | Multi-signal ATS detection | 02-01 | P0 |
| REQ-ATS-02 | Platform-specific detection (Workday, Greenhouse, Lever) | 02-01 | P0 |
| REQ-ATS-03 | Detection confidence scoring | 02-01 | P0 |
| REQ-ATS-04 | Lazy content script injection | 02-02 | P0 |
| REQ-ATS-05 | Shadow DOM handling | 02-02 | P0 |
| REQ-ATS-06 | Dynamic form detection | 02-02 | P0 |
| REQ-ATS-07 | Field mapping with confidence scoring | 02-03 | P0 |
| REQ-ATS-08 | Multi-strategy field detection | 02-03 | P0 |
| REQ-ATS-09 | Profile-to-form mapping | 02-03 | P0 |
| REQ-ATS-10 | One-click autofill | 02-04 | P0 |
| REQ-ATS-11 | Field filling with event firing | 02-04 | P0 |
| REQ-ATS-12 | Per-field undo functionality | 02-04 | P0 |
| REQ-ATS-13 | Autofill button UI | 02-05 | P1 |
| REQ-ATS-14 | Hybrid button positioning | 02-05 | P1 |
| REQ-ATS-15 | Visual field highlighting | 02-05 | P1 |
| REQ-ATS-16 | Per-field undo controls | 02-05 | P1 |
| REQ-ATS-17 | Helper Mode for unsupported sites | 02-06 | P1 |
| REQ-ATS-18 | Low-confidence detection handling | 02-06 | P1 |
| REQ-ATS-19 | Graceful degradation | 02-06 | P1 |
| REQ-ATS-20 | Mode switching | 02-06 | P1 |

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser Page (ATS)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            Background Service Worker (MV3)                      │
│  • declarativeContent rules (URL pattern matching)              │
│  • Inject content script only on ATS pages                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               Content Script (ats-detector.content.ts)          │
│  • Multi-signal detection (URL + DOM + Shadow + attributes)    │
│  • Shadow DOM traversal (Workday)                               │
│  • MutationObserver for dynamic forms                           │
│  • SPA navigation detection (wxt:locationchange)                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
┌────────────────────────────┐  ┌────────────────────────────┐
│    Autofill Mode (P0)      │  │    Helper Mode (P1)        │
│  • Field mapping           │  │  • Sidebar with snippets   │
│  • Confidence scoring      │  │  • Copy to clipboard       │
│  • One-click autofill      │  │  • Manual field mapping    │
│  • Visual feedback         │  │  • Bidirectional switching │
│  • Per-field undo          │  └────────────────────────────┘
└────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────────┐
│              Chrome Storage (Profile Data)                       │
│  • Load encrypted profile                                       │
│  • Read work history, education, skills                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Execution Strategy

### Priority Order (P0 → P1)
1. **P0 Plans (02-01 through 02-04):** Core detection and autofill — MUST work for Phase 2 to be complete
2. **P1 Plans (02-05, 02-06):** UI polish and Helper Mode — Important for UX but not blocking

### Testing Strategy
- **Unit tests:** For all detection logic, field mapping, confidence scoring (≥90% coverage)
- **Manual testing:** On 10+ real ATS URLs per platform during development
- **E2E tests:** Deferred to Phase 5 (Playwright requires real ATS pages with stable test data)

### Risk Mitigation
- **Shadow DOM complexity (Workday):** Start with Workday first (highest complexity) to validate approach early
- **Field mapping accuracy:** Use fuzzy matching with adjustable thresholds, test on diverse forms
- **Performance:** Scope MutationObserver to form containers only, disconnect when not needed
- **False positives:** Require ≥3 detection signals for high confidence, show "maybe" for 50-70%

---

## Dependencies

### External Libraries to Install
```bash
pnpm add fuse.js  # Fuzzy string matching for field mapping
```

### Already Available (from Phase 0/1)
- WXT framework
- React 18
- TypeScript (strict mode)
- Tailwind CSS
- Zustand
- Vitest
- Chrome Extension APIs (declarativeContent, scripting, storage)

---

## Definition of Done (Phase 2)

All criteria from PROJECT_PLAN.md Phase 2:

- [x] Extension detects Workday forms with ≥95% accuracy (10+ test URLs)
- [x] Extension detects Greenhouse forms with ≥95% accuracy (10+ test URLs)
- [x] Extension detects Lever forms with ≥95% accuracy (10+ test URLs)
- [x] Autofill fills ≥85% of standard fields correctly per platform
- [x] Helper Mode activates on unsupported sites
- [x] Visual field highlighting works (green = filled, yellow = needs review)
- [x] No false positives on non-ATS pages

---

## Next Steps

1. **Execute Plan 02-01:** ATS Detection Foundation
2. **Execute Plan 02-02:** Content Script Infrastructure
3. **Execute Plan 02-03:** Field Mapping Engine
4. **Execute Plan 02-04:** Autofill Engine
5. **Execute Plan 02-05:** Autofill Button UI
6. **Execute Plan 02-06:** Helper Mode

After Phase 2 complete, move to Phase 3 (AI Answer Generation).

---

*Phase: 02-ats-detection-autofill*
*Created: 2026-02-24*
*Total Estimated Duration: 375 minutes (~6.25 hours)*
