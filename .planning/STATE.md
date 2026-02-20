# AutoApply Copilot — Project State

> **This file tracks current project status, decisions, blockers, and progress**

---

## Current Status

**Last Updated:** 2026-02-19
**Current Phase:** Phase 0 (Foundation & Setup)
**Phase Status:** Not started
**Overall Progress:** 0% (Planning complete, execution pending)

---

## Phase Progress

| Phase | Status | Start Date | End Date | Progress |
|-------|--------|------------|----------|----------|
| Phase 0: Foundation & Setup | Not Started | - | - | 0% |
| Phase 1: Profile & Resume | Not Started | - | - | 0% |
| Phase 2: ATS Detection & Autofill | Not Started | - | - | 0% |
| Phase 3: AI Answer Generation | Not Started | - | - | 0% |
| Phase 4: Job Tracker & Safety | Not Started | - | - | 0% |
| Phase 5: Polish & Launch Prep | Not Started | - | - | 0% |
| Phase 6: Beta Testing & Launch | Not Started | - | - | 0% |

---

## Decisions Log

### 2026-02-19: Initial Scope Decisions

**Decision:** v1.0 will use paste-only resume input (no PDF/DOCX upload)
**Rationale:** Simplifies Phase 1, reduces dependencies (no pdf.js/mammoth.js), faster to market
**Impact:** PDF/DOCX upload deferred to v2
**Status:** LOCKED

---

**Decision:** Build Workday first, then Greenhouse, then Lever
**Rationale:** Workday has 50% market share and highest complexity (Shadow DOM) - validate hardest case first
**Impact:** Phase 2 prioritizes Workday detection and autofill
**Status:** LOCKED

---

**Decision:** LinkedIn Easy Apply excluded from v1
**Rationale:** Ban risk too high (similar to LinkedIn scrapers), needs more research on detection patterns
**Impact:** LinkedIn Easy Apply deferred to v2, v1 focuses on Workday/Greenhouse/Lever
**Status:** LOCKED

---

**Decision:** Mock AI responses in development, user can add real API key
**Rationale:** No backend infrastructure needed, user owns their AI usage/cost, faster v1 launch
**Impact:** Phase 3 builds mock system first, real AI is optional upgrade by user
**Status:** LOCKED

---

**Decision:** No backend, no Supabase in v1 (fully local-first)
**Rationale:** Reduces complexity, avoids infrastructure cost, improves privacy, faster to build
**Impact:** All data stored in Chrome local storage (encrypted), cloud sync deferred to v2
**Status:** LOCKED

---

**Decision:** Atomic git commits (commit after every task)
**Rationale:** Better traceability, easier to revert specific changes, clearer history
**Impact:** More frequent commits throughout development
**Status:** LOCKED

---

**Decision:** Standard planning depth (3-5 plans per phase)
**Rationale:** Balances detail vs. speed, user's phases are already well-scoped
**Impact:** Each phase will have 3-5 detailed execution plans
**Status:** LOCKED

---

**Decision:** Balanced testing strategy (test critical paths, not everything)
**Rationale:** 80% test coverage target for ATS detection, autofill, encryption - not every utility function
**Impact:** Write tests for risky components, skip tests for simple helpers
**Status:** LOCKED

---

**Decision:** Phase boundary checkpoints (pause at end of each phase for user review)
**Rationale:** User wants to review progress after each phase completes, not mid-phase
**Impact:** Claude pauses after Phase 0, 1, 2, 3, 4, 5, 6 for user verification
**Status:** LOCKED

---

## Active Blockers

*No blockers currently - project in planning stage*

---

## Pending Tasks

### Immediate (This Session)
- [ ] Create phase-specific research plans
- [ ] Spawn research agents for technical deep-dives
- [ ] Create detailed execution plans for Phase 0
- [ ] Get user approval on complete roadmap

### Next (After Approval)
- [ ] Execute Phase 0 (Foundation & Setup)
- [ ] Commit atomic changes per task
- [ ] Pause at Phase 0 completion for user review

---

## Deferred to v2

**Features explicitly out of v1.0:**
- PDF/DOCX file upload parsing
- LinkedIn Easy Apply integration
- Indeed Apply, Ashby, other ATS platforms
- Cloud sync / Supabase integration
- Per-JD resume tailoring (AI analysis of job descriptions)
- Firefox support
- Web dashboard for tracker
- Shared AI proxy with pooled keys
- Multi-profile management
- Resume scoring / keyword optimization

**Rationale:** Focus v1 on core value (paste → autofill → track) with minimal complexity, expand after validation

---

## Technical Debt

*None yet - project not started*

---

## Key Metrics Tracking

### Project Metrics
- **Total Requirements:** 27 (19 P0, 12 P1, 1 P2)
- **Requirements Complete:** 0/27 (0%)
- **Phases Complete:** 0/7 (0%)
- **Test Coverage:** 0% (not yet started)

### Code Metrics
- **Lines of Code:** 0
- **TypeScript Files:** 0
- **React Components:** 0
- **Test Files:** 0

---

## Research Completed

### RESEARCH_REPORT.md (Pre-Project, 829 lines)
- ✅ ATS platforms analysis (Workday, Greenhouse, Lever, LinkedIn, Indeed, Ashby)
- ✅ Competitor analysis (Simplify, Teal, LazyApply, Zippi, JobCopilot)
- ✅ Tech stack validation (WXT, React, Zustand, Web Crypto)
- ✅ Compliance & ToS review (LinkedIn ban risk, Chrome Web Store policies)
- ✅ Shadow DOM technical deep-dive (Workday implementation)
- ✅ Performance considerations (MutationObserver best practices)

### Research Needed Before Planning
- Phase 0: WXT framework setup patterns, Manifest v3 best practices
- Phase 1: Resume text parsing algorithms, Web Crypto API implementation
- Phase 2: Workday Shadow DOM field selectors, Greenhouse iframe handling, Lever DOM structure
- Phase 3: OpenAI/Claude prompt engineering for job applications, mock AI response generation
- Phase 4: Chrome Storage API patterns, CAPTCHA detection methods

---

## Communication Log

### 2026-02-19: Initial Setup Session
- User confirmed project decisions (10 questions + clarifications)
- Decided on paste-only resume, Workday-first, no LinkedIn v1, mock AI
- Updated all documentation (MVC, PRD, TECHSTACK, PROJECT_PLAN)
- Created GSD planning structure (.planning/ directory)
- Created config.json, PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md
- Ready to spawn research agents and create detailed plans

---

## Notes

### Project Context
- Solo developer (user) + AI implementer (Claude)
- User is product owner/visionary, Claude is builder
- Timeline: 8 weeks to v1.0 launch
- Quality over speed - no shortcuts on safety/compliance
- Atomic commits, phase checkpoints, research-driven planning

### Critical Constraints
- **Safety-first:** No auto-submit, no CAPTCHA bypass, user control always
- **Privacy-first:** Local-only storage, encrypted data, minimal permissions
- **Compliance-first:** Chrome Web Store policies, ATS ToS, no scraping
- **Quality-first:** 85%+ autofill accuracy, graceful degradation

### Success Definition
- User can apply to job in <5 minutes (vs 15-20 minutes baseline)
- Zero platform bans
- ≥4.0 Chrome Web Store rating
- Launch within 8 weeks

---

*This file will be updated after each phase completion and major project milestones*
