# AutoApply Copilot — Project Roadmap

> **This roadmap maps all phases to requirements and defines success criteria**

---

## Project Overview

**Project:** AutoApply Copilot v1.0
**Timeline:** 8 weeks (Phases 0-6)
**Current Phase:** Phase 0 (Project Setup)
**Started:** 2026-02-19

---

## Roadmap Structure

### Phase 0: Foundation & Setup
**Timeline:** Week 1
**Goal:** Fully configured, runnable Chrome extension shell with complete tech stack
**Requirements Covered:** REQ-NFR-02 (security setup), REQ-NFR-04 (manifest setup)

**Plans:** 4 plans in 3 waves

Plans:
- [ ] 00-01-PLAN.md — Bootstrap WXT project + folder structure (Wave 1)
- [ ] 00-02-PLAN.md — Configure TypeScript strict + ESLint + Prettier (Wave 2)
- [ ] 00-03-PLAN.md — Set up Vitest + Playwright testing (Wave 3)
- [ ] 00-04-PLAN.md — Integrate Tailwind CSS + Zustand state (Wave 3)

**Definition of Done:**
- [ ] Extension loads in Chrome without errors
- [ ] `pnpm dev` starts development server with hot reload
- [ ] TypeScript strict mode passes
- [ ] ESLint and Prettier configured
- [ ] Git repository initialized with atomic commits
- [ ] WXT framework configured
- [ ] Basic manifest.json created
- [ ] Testing infrastructure functional (Vitest + Playwright)
- [ ] Complete tech stack integrated (React + Tailwind + Zustand)

---

### Phase 1: Profile Management & Resume Parsing
**Timeline:** Week 2
**Goal:** User can paste resume, edit profile, and save encrypted locally
**Requirements Covered:** REQ-PRO-01 through REQ-PRO-06

**Key Requirements:**
- REQ-PRO-01: Paste resume & parse (≥75% accuracy)
- REQ-PRO-02: Profile editor UI
- REQ-PRO-03: Role preference selection
- REQ-PRO-04: Domain-specific fields
- REQ-PRO-05: Encrypted local storage
- REQ-PRO-06: Data export & delete

**Plans:** [To be planned]

**Definition of Done:**
- [ ] User can paste resume text and see parsed fields
- [ ] At least 75% of key fields parsed correctly
- [ ] Profile editor functional (add/edit/delete entries)
- [ ] Role preference selector working
- [ ] Profile saved encrypted to Chrome local storage
- [ ] Profile persists after browser restart
- [ ] Data export produces valid JSON
- [ ] Data delete clears all storage
- [ ] All Phase 1 requirements tested and passing

---

### Phase 2: ATS Detection & Autofill Engine
**Timeline:** Weeks 3-4
**Goal:** Reliable autofill on Workday, Greenhouse, Lever with ≥85% accuracy
**Requirements Covered:** REQ-ATS-01 through REQ-ATS-07

**Key Requirements:**
- REQ-ATS-01: Workday detection (≥95% accuracy)
- REQ-ATS-02: Greenhouse detection (≥95% accuracy)
- REQ-ATS-03: Lever detection (≥95% accuracy)
- REQ-ATS-04: One-click autofill (≥85% field accuracy)
- REQ-ATS-05: Field mapping confidence scoring
- REQ-ATS-06: Helper Mode for unsupported sites
- REQ-ATS-07: Graceful degradation

**Plans:** [To be planned]

**Definition of Done:**
- [ ] Workday forms detected with ≥95% accuracy (10+ test URLs)
- [ ] Greenhouse forms detected with ≥95% accuracy (10+ test URLs)
- [ ] Lever forms detected with ≥95% accuracy (10+ test URLs)
- [ ] Autofill fills ≥85% of fields correctly per platform
- [ ] Field highlighting works (green/yellow/red)
- [ ] Helper Mode activates on unsupported sites
- [ ] No false positives on non-ATS pages
- [ ] Graceful degradation tested (simulated markup changes)
- [ ] All Phase 2 requirements tested and passing

---

### Phase 3: AI Answer Generation
**Timeline:** Week 5
**Goal:** Mock AI system with option for user to add real API key
**Requirements Covered:** REQ-AI-01 through REQ-AI-05

**Key Requirements:**
- REQ-AI-01: Mock AI response system (3 draft options)
- REQ-AI-02: User-provided API key support (encrypted storage)
- REQ-AI-03: Role-specific AI tuning
- REQ-AI-04: Placeholder markers in drafts
- REQ-AI-05: Essay question handling (STAR outline)

**Plans:** [To be planned]

**Definition of Done:**
- [ ] "Suggest Answer" button appears on text questions
- [ ] Mock AI returns 3 distinct draft options
- [ ] Each option has unique tone (Professional/Concise/Story-Driven)
- [ ] Placeholders clearly marked in drafts
- [ ] Settings page has API key input field
- [ ] API key stored encrypted
- [ ] With real key, extension uses real AI (OpenAI/Claude)
- [ ] Role-specific differences visible in responses
- [ ] Essay questions get STAR outline instead of full draft
- [ ] All Phase 3 requirements tested and passing

---

### Phase 4: Job Tracker & Safety Controls
**Timeline:** Week 6
**Goal:** Working tracker with safety features (CAPTCHA detection, volume guardrails)
**Requirements Covered:** REQ-TRK-01 through REQ-SAF-03

**Key Requirements:**
- REQ-TRK-01: Auto-log application on submission
- REQ-TRK-02: Tracker UI in popup
- REQ-TRK-03: Manual job entry
- REQ-TRK-04: Status updates
- REQ-SAF-01: Volume guardrail (30 apps/24h)
- REQ-SAF-02: Per-site disable toggle
- REQ-SAF-03: CAPTCHA detection & pause

**Plans:** [To be planned]

**Definition of Done:**
- [ ] Applications auto-logged after submission
- [ ] Tracker displays all applications with filters
- [ ] User can manually add applications
- [ ] Status updates work (Applied/Interview/Offer/Rejected/Withdrawn)
- [ ] Volume guardrail notice appears after 30 apps
- [ ] Per-site disable toggle works instantly
- [ ] CAPTCHA detection pauses autofill (all 3 platforms tested)
- [ ] No extension behavior during CAPTCHA
- [ ] All Phase 4 requirements tested and passing

---

### Phase 5: Polish, Performance, & Launch Prep
**Timeline:** Week 7
**Goal:** Extension ready for Chrome Web Store submission
**Requirements Covered:** REQ-NFR-01 through REQ-NFR-04

**Key Requirements:**
- REQ-NFR-01: Performance (<10% overhead on ATS, <1% on non-ATS)
- REQ-NFR-02: Security (encrypted storage, minimal permissions)
- REQ-NFR-03: Reliability (graceful degradation, error handling)
- REQ-NFR-04: Compliance (Chrome Web Store policies)

**Plans:** [To be planned]

**Definition of Done:**
- [ ] Performance audit: <10% overhead on ATS pages, <1% on non-ATS
- [ ] MutationObserver scoped to form containers only
- [ ] Privacy disclosure visible in onboarding and settings
- [ ] Feedback widget functional
- [ ] Chrome Web Store listing materials prepared
- [ ] Test plan document covers all user stories
- [ ] Zero TypeScript errors, zero ESLint warnings
- [ ] All phases 0-4 features working end-to-end
- [ ] Security audit passed
- [ ] Compliance checklist completed

---

### Phase 6: Beta Testing & Launch
**Timeline:** Week 8
**Goal:** Extension live on Chrome Web Store
**Requirements Covered:** All requirements validated in production

**Plans:** [To be planned]

**Definition of Done:**
- [ ] Extension tested on ≥5 real job applications per ATS
- [ ] Beta feedback collected from 5-10 testers
- [ ] P0 bugs fixed
- [ ] Chrome Web Store submission approved
- [ ] Extension publicly available
- [ ] Post-launch monitoring active
- [ ] v1.0 officially launched

---

## Requirements Coverage Matrix

| Phase | Requirements | P0 Count | P1 Count | P2 Count |
|-------|--------------|----------|----------|----------|
| Phase 0 | Setup/Foundation | 2 | 0 | 0 |
| Phase 1 | REQ-PRO-01 to REQ-PRO-06 | 3 | 3 | 0 |
| Phase 2 | REQ-ATS-01 to REQ-ATS-07 | 5 | 2 | 0 |
| Phase 3 | REQ-AI-01 to REQ-AI-05 | 2 | 2 | 1 |
| Phase 4 | REQ-TRK-01 to REQ-SAF-03 | 3 | 5 | 0 |
| Phase 5 | REQ-NFR-01 to REQ-NFR-04 | 4 | 0 | 0 |
| Phase 6 | Validation | - | - | - |
| **Total** | **27 requirements** | **19** | **12** | **1** |

---

## Success Criteria (Overall v1.0)

### Product Success
- [ ] User can set up profile in <3 minutes
- [ ] Applying to Greenhouse job takes <5 minutes (open-to-submit)
- [ ] AI answers need only minor editing (user feedback survey)
- [ ] Zero confirmed platform bans within 90 days
- [ ] ≥4.0 rating on Chrome Web Store within 60 days

### Technical Success
- [ ] ≥75% resume parse accuracy
- [ ] ≥95% ATS detection accuracy per platform
- [ ] ≥85% autofill field accuracy
- [ ] <10% performance overhead on ATS pages
- [ ] <1% performance overhead on non-ATS pages
- [ ] Zero critical security vulnerabilities
- [ ] 80%+ test coverage for core modules

### Launch Success
- [ ] Chrome Web Store submission approved
- [ ] Extension publicly available
- [ ] 100+ active users in first month
- [ ] 60% week-over-week retention
- [ ] <5% error rate on supported platforms

---

## Dependency Graph

```
Phase 0 (Foundation)
    ↓
Phase 1 (Profile) ────────┐
    ↓                      ↓
Phase 2 (Autofill) ───→ Phase 3 (AI)
    ↓                      ↓
    └──────→ Phase 4 (Tracker) ←──┘
              ↓
         Phase 5 (Polish)
              ↓
         Phase 6 (Launch)
```

**Parallel opportunities:**
- Phase 3 (AI) can start while Phase 2 (Autofill) is in progress (different codebases)
- Phase 4 (Tracker) depends on Phase 1 (profile schema) and Phase 2 (form submission detection)

---

## Risk Register

| Risk | Phase | Severity | Mitigation |
|------|-------|----------|------------|
| Workday Shadow DOM complexity breaks autofill | Phase 2 | HIGH | Research Shadow DOM extensively, build fallback Helper Mode |
| LinkedIn-style ban risk affects Workday too | Phase 2 | MEDIUM | User-initiated only, no auto-submit, conservative rate limiting |
| Chrome Web Store rejection | Phase 5 | CRITICAL | Early compliance review, minimal permissions, clear privacy policy |
| AI hallucination produces wrong answers | Phase 3 | MEDIUM | Placeholder markers, user review required, clear disclaimers |
| Resume parsing accuracy <75% | Phase 1 | MEDIUM | Manual editing UI, flag low-confidence fields |
| Performance issues on older machines | Phase 5 | LOW | Lazy loading, scoped MutationObserver, performance mode option |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-19 | Initial roadmap created from PRD/MVC/PROJECT_PLAN |

---

*This roadmap will be updated as phases are planned and executed. Each phase will have detailed plans created before execution.*
