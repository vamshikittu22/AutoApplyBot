# AutoApply Copilot — Complete GSD Roadmap & Research Summary

> **Status:** Planning complete, awaiting approval to begin execution
> **Created:** 2026-02-19
> **Ready for:** Phase 0 execution

---

## ✅ What's Been Completed

### 1. Configuration & Decisions
- **Workflow preferences locked** (interactive → yolo after approval, standard depth, atomic commits)
- **Technical decisions finalized** (paste-only resume, Workday-first, no LinkedIn v1, mock AI)
- **GSD structure created** (`.planning/` with config.json, PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md)

### 2. Documentation Updates
All project documentation updated to reflect v1 scope:
- **MVC.md**: 3 ATS platforms (Workday/Greenhouse/Lever), paste-only, no LinkedIn
- **PRD.md**: Requirements updated with v1 constraints, LinkedIn/file-upload marked as v2
- **TECHSTACK.md**: Clarified paste-only parsing, mock AI development pattern
- **PROJECT_PLAN.md**: Revised phases (6 weeks → 8 weeks), clear deliverables per phase

### 3. Requirements Extracted
- **27 total requirements** mapped from PRD (19 P0, 12 P1, 1 P2)
- **4 epics** broken down: Profile Management, ATS Detection/Autofill, AI Generation, Tracker/Safety
- **Traceability matrix** created (requirement → PRD source → MVC priority → phase)

### 4. Research Completed
**Phase 0 Research** (WXT Framework Setup):
- WXT initialization commands & project structure
- Manifest v3 configuration patterns
- TypeScript/ESLint/Prettier setup
- Common pitfalls & solutions

**Phase 1 Research** (Resume Parsing & Encryption):
- Regex patterns for resume field extraction (email, phone, dates, work history)
- Web Crypto API encryption patterns (AES-GCM)
- Chrome Storage API best practices
- Profile schema design with role-specific fields

**Phase 2 Research** (ATS Detection & Autofill):
- Workday Shadow DOM traversal techniques
- Greenhouse iframe handling
- Lever standard DOM patterns
- Field mapping confidence scoring algorithm
- MutationObserver scoped setup patterns

**Phase 3 Research** (AI Answer Generation):
- Mock response generation (3 tone variants)
- OpenAI API integration (GPT-4o-mini)
- Anthropic Claude API integration (Haiku)
- Prompt engineering templates (role-specific)
- API key encryption & storage

---

## 📋 Phases Overview

### Phase 0: Foundation & Setup (Week 1)
**Goal:** Fully configured WXT extension that loads in Chrome
**Plans:** 3 plans (setup, config, verification)
**Autonomous:** Yes

**Deliverables:**
- WXT project initialized with React + TypeScript + Tailwind
- Extension loads without errors in Chrome DevTools
- Basic popup UI renders
- Git atomic commit workflow functional

---

### Phase 1: Profile Management (Week 2)
**Goal:** User can paste resume, edit profile, save encrypted locally
**Plans:** 4-5 plans (parser, editor UI, encryption, storage, validation)
**Autonomous:** Yes

**Deliverables:**
- Resume text parser (≥75% accuracy)
- Profile editor UI with role selector
- Encrypted Chrome Storage integration
- Data export/delete functionality

**Requirements Covered:** REQ-PRO-01 through REQ-PRO-06

---

### Phase 2: ATS Detection & Autofill (Weeks 3-4)
**Goal:** Reliable autofill on Workday, Greenhouse, Lever (≥85% field accuracy)
**Plans:** 5-7 plans (Workday detection/autofill, Greenhouse detection/autofill, Lever detection/autofill, Helper Mode, field mapping engine)
**Autonomous:** Yes

**Deliverables:**
- Workday Shadow DOM autofill
- Greenhouse iframe autofill
- Lever standard DOM autofill
- Field mapping confidence scoring
- Helper Mode sidebar for unsupported sites

**Requirements Covered:** REQ-ATS-01 through REQ-ATS-07

---

### Phase 3: AI Answer Generation (Week 5)
**Goal:** Mock AI system with option for real OpenAI/Claude API key
**Plans:** 4 plans (mock generator, question detector, API integration, settings UI)
**Autonomous:** Yes

**Deliverables:**
- Mock AI response system (3 tone variants)
- Role-specific answer tuning
- Settings page for API key input
- Encrypted API key storage
- Real API integration (OpenAI/Claude)

**Requirements Covered:** REQ-AI-01 through REQ-AI-05

---

### Phase 4: Job Tracker & Safety Controls (Week 6)
**Goal:** Working tracker with CAPTCHA detection, volume guardrails
**Plans:** 4 plans (tracker UI, auto-log, safety features, CAPTCHA detection)
**Autonomous:** Yes

**Deliverables:**
- Application tracking in popup
- Auto-log on submission
- Volume guardrail (30 apps/24h)
- Per-site disable toggle
- CAPTCHA detection & pause

**Requirements Covered:** REQ-TRK-01 through REQ-SAF-03

---

### Phase 5: Polish & Launch Prep (Week 7)
**Goal:** Extension ready for Chrome Web Store submission
**Plans:** 3 plans (performance audit, privacy/compliance, store materials)
**Autonomous:** Yes

**Deliverables:**
- Performance optimization (<10% overhead)
- Privacy disclosure UI
- Chrome Web Store listing prepared
- Test plan document
- Compliance audit passed

**Requirements Covered:** REQ-NFR-01 through REQ-NFR-04

---

### Phase 6: Beta Testing & Launch (Week 8)
**Goal:** Extension live on Chrome Web Store
**Plans:** 2 plans (testing/bug fixes, submission/launch)
**Autonomous:** Partial (submission requires user action)

**Deliverables:**
- Tested on ≥5 real job applications per ATS
- Beta feedback collected (5-10 users)
- Chrome Web Store approved
- Publicly available

---

## 🎯 Success Criteria (v1.0)

### Product Metrics
- ✅ User can set up profile in <3 minutes
- ✅ Applying to job takes <5 minutes (vs 15-20 min baseline)
- ✅ AI answers need only minor editing (user survey)
- ✅ Zero confirmed platform bans within 90 days
- ✅ ≥4.0 Chrome Web Store rating within 60 days

### Technical Metrics
- ✅ ≥75% resume parse accuracy
- ✅ ≥95% ATS detection accuracy per platform
- ✅ ≥85% autofill field accuracy
- ✅ <10% performance overhead on ATS pages
- ✅ <1% performance overhead on non-ATS pages
- ✅ 80%+ test coverage for core modules
- ✅ Zero critical security vulnerabilities

---

## 📊 Scope Summary

### ✅ v1.0 INCLUDES
- Paste-based resume parsing → structured profile
- Autofill on 3 ATS platforms (Workday, Greenhouse, Lever) — **Workday first**
- Mock AI answer generation (user can add own API key for real AI)
- Application tracking (local storage only, encrypted)
- Safety controls (CAPTCHA detection, per-site disable, volume guardrails)
- Chrome/Edge support

### ❌ v1.0 EXCLUDES (Deferred to v2)
- PDF/DOCX file upload parsing
- LinkedIn Easy Apply integration
- Indeed Apply, Ashby, other ATS platforms
- Per-JD resume tailoring (AI analysis of job descriptions)
- Cloud sync / Supabase
- Firefox support
- Web dashboard for tracker
- Shared AI proxy with pooled keys

---

## 🚀 Next Steps: Awaiting Your Approval

### What Happens After You Approve:

1. **I'll execute Phase 0** (Foundation & Setup) autonomously
   - Initialize WXT project
   - Configure all tooling (TypeScript, ESLint, Prettier, Tailwind)
   - Verify extension loads in Chrome
   - Commit atomically after each task
   - **Pause for your review at end of Phase 0**

2. **Then Phase 1** (Profile Management)
   - Build resume parser
   - Create profile editor UI
   - Implement encryption
   - **Pause for your review at end of Phase 1**

3. **Continue through Phases 2-6** with phase boundary checkpoints

### Your Approval Checklist:
- [ ] Review roadmap structure (Phases 0-6 breakdown above)
- [ ] Confirm scope decisions (paste-only, Workday-first, no LinkedIn v1, mock AI)
- [ ] Confirm workflow (atomic commits, phase checkpoints, research-driven planning)
- [ ] Approve to begin Phase 0 execution

---

## 📁 Generated Files Location

All planning files are in `.planning/` directory:
- **config.json** — Workflow preferences
- **PROJECT.md** — Project vision & context
- **REQUIREMENTS.md** — All 27 requirements with acceptance criteria
- **ROADMAP.md** — Phase structure with success criteria
- **STATE.md** — Project status & decision log

---

**Ready to proceed?** Reply with:
- **"Approved - start Phase 0"** → I'll begin execution immediately
- **"Changes needed: [your changes]"** → I'll revise the roadmap
- **"Question about [topic]"** → I'll clarify before starting

---

*This roadmap is your contract with the GSD framework. Once approved, I'll execute systematically with atomic commits and phase checkpoints.*
