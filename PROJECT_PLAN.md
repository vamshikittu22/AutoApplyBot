# AutoApply Copilot — Project Plan

> **This is the single source of truth for this project.**
> All agents, AI tools, and contributors must read this file first before touching any other file.

## 🔗 File Index (Read These In Order)

| File | Purpose |
|------|---------|
| [PROJECT_PLAN.md](./PROJECT_PLAN.md) | ← You are here. Master plan & phases |
| [AGENTS.md](./AGENTS.md) | Agent behavior rules & execution instructions |
| [PRD.md](./PRD.md) | Full Product Requirements Document |
| [MVC.md](./MVC.md) | Minimum Viable Concept — v1 scope only |
| [TECHSTACK.md](./TECHSTACK.md) | Tech stack decisions with rationale |
| [GSD_PROMPT.md](./GSD_PROMPT.md) | Single master prompt for GSD framework execution |

---

## 🧭 Product Vision

**AutoApply Copilot** is a browser extension that cuts job application time from 15–20 minutes down to 3–5 minutes per application — without sacrificing quality, risking platform bans, or producing generic spam.

It is NOT a bulk auto-apply bot. It is a smart, user-controlled assistant that automates repetitive form-filling, generates role-aware answer drafts, and tracks applications — all within the user's explicit approval at every step.

---

## 🎯 Core Problem (From Research)

- Job seekers waste hours re-entering identical information across different ATS portals and job boards.
- Existing tools (Simplify, Teal, LazyApply, Zippi, Bulk Apply, JobCopilot) either:
  - **Over-automate** → risk bans, spam rejections, low interview yield, platform ToS violations.
  - **Under-deliver** → still require 10–15 mins of manual editing per application due to generic AI output.
- No current tool balances speed + quality + safety in a lightweight extension.

**Reference:** [PRD.md → Section 1: Background](./PRD.md) and [MVC.md → Problem Statement](./MVC.md)

---

## 🗂️ Phased Delivery Plan

### Phase 0 — Project Setup & Architecture (Week 1)
- Initialize the Chrome Extension project using **WXT framework** (see [TECHSTACK.md](./TECHSTACK.md))
- Set up project structure: extension entrypoints, components, lib folders
- Configure TypeScript (strict mode), ESLint, Prettier, pnpm
- Configure CI/CD pipeline with atomic git commits
- Set up basic Chrome extension manifest (Manifest v3)
- **No backend, no Supabase** (v1 is fully local-first)
- Define folder structure and file naming conventions per AGENTS.md

**Deliverable:** Empty but fully configured, runnable extension shell that loads in Chrome Dev mode.

**Definition of Done:**
- Extension loads in Chrome without errors
- `pnpm dev` starts development server with hot reload
- TypeScript strict mode passes with zero errors
- ESLint and Prettier configured and passing
- Git repository initialized with atomic commit strategy

---

### Phase 1 — Profile & Resume Engine (Week 2)
- Build the user onboarding flow: **paste resume text** (no file upload in v1)
- Implement **text-based resume parser** to extract: name, email, phone, work history, education, skills, links
- Build profile editor UI: user can review, edit, and save all parsed fields
- Add role preference selector: Tech / Healthcare / Finance / Marketing / Operations / Other
- Store profile **encrypted** in Chrome local storage using Web Crypto API
- Add "export my data" and "delete my data" controls
- **Deferred to v2:** PDF/DOCX file upload, LinkedIn import, cloud sync

**Deliverable:** User can paste resume and set up a full profile in under 2 minutes. Data persists across sessions locally.

**Definition of Done:**
- User can paste resume text and see parsed fields in editor
- At least 75% of key fields parsed correctly from typical resume format
- Profile saved encrypted to Chrome local storage
- Profile persists after browser restart
- Data export produces valid JSON
- Data delete clears all local storage

**Reference:** [PRD.md → Epic 1: Candidate Profile](./PRD.md)

---

### Phase 2 — ATS Detection & Autofill Engine (Week 3–4)
- Build ATS signature detection for: **Workday (priority 1), Greenhouse (priority 2), Lever (priority 3)**
- Map detected form fields to profile attributes using label + placeholder + context heuristics
- Implement one-click autofill — user must explicitly click "Autofill"; no auto-typing on page load
- Highlight all filled fields visually; provide undo button for each field
- Implement graceful degradation: if ATS markup changes, disable autofill cleanly rather than mis-filling
- Build "Helper Mode" for unsupported sites: collapsible sidebar with profile snippets and click-to-paste
- Allow users to save custom field mappings per domain for reuse
- **Deferred to v2:** LinkedIn Easy Apply, Indeed Apply, Ashby

**Deliverable:** Reliable autofill on 3 core ATS platforms (Workday, Greenhouse, Lever) with ≥85% field accuracy.

**Definition of Done:**
- Extension detects Workday forms with ≥95% accuracy (10+ test URLs)
- Extension detects Greenhouse forms with ≥95% accuracy (10+ test URLs)
- Extension detects Lever forms with ≥95% accuracy (10+ test URLs)
- Autofill fills ≥85% of standard fields correctly per platform
- Helper Mode activates on unsupported sites
- Visual field highlighting works (green = filled, yellow = needs review)
- No false positives on non-ATS pages

**Reference:** [PRD.md → Epic 2: Form Detection & Autofill](./PRD.md), [MVC.md → Core Capabilities](./MVC.md)

---

### Phase 3 — AI Answer Generation (Week 5)
- Implement **mock AI response system** for development (no real API calls initially)
- On detection of open-ended text questions, show "Suggest Answer" button
- Return 2–3 mock draft options per question, each different in tone (professional / concise / story-driven)
- Highlight placeholder sections user must fill in (e.g., "[Insert specific project name]")
- Add role-specific tuning in mock responses: Healthcare answers include clinical metrics; Tech includes stack + GitHub; Finance includes licenses
- Long-form or essay-style questions are always flagged for full manual review, never auto-submitted
- Create settings UI for user to add their own OpenAI/Claude API key (encrypted storage)
- **Real AI integration:** User adds their own API key, extension switches from mock to real responses
- **Deferred to v2:** Shared AI proxy with pooled keys, JD-specific tailoring

**Deliverable:** Mock AI answer system working, with option for user to enable real AI via their own API key.

**Definition of Done:**
- Mock AI returns 3 draft options for detected question fields
- Each option has distinct tone (Professional, Concise, Story-Driven)
- Mock responses include placeholder markers for user to fill
- Settings page has API key input field
- API key stored encrypted in Chrome local storage
- When user adds real key, extension switches to real AI calls
- Role-specific differences visible in mock responses

**Reference:** [PRD.md → Epic 3: AI Answers](./PRD.md)

---

### Phase 4 — Job Tracker & Safety Controls (Week 6)
- Auto-log each application on user submission: title, company, URL, ATS platform, date, status
- Build tracker view in the extension popup: list with filters by status, company, date
- Support manual job entry for non-extension applications
- Add soft volume guardrail: surface a non-blocking notice if user applies to >30 jobs in 24 hours
- Add per-site disable toggle: visible on every page, immediately disables content scripts
- Add performance mode option: restrict detection to known ATS URL patterns only
- Ensure extension does not interfere with CAPTCHA widgets; detect and pause automation near them

**Deliverable:** Working tracker, per-site controls, CAPTCHA-safe behavior verified on all 3 supported ATSes.

**Definition of Done:**
- Application auto-logged after user submits form
- Tracker displays all logged applications with status filter
- User can manually add application to tracker
- Volume guardrail notice appears after 30 applications in 24 hours
- Per-site disable toggle works instantly
- CAPTCHA detection pauses autofill on all supported platforms
- No extension behavior during CAPTCHA completion

**Reference:** [PRD.md → Epic 4: Tracker & Safety](./PRD.md), [MVC.md → Safety Principles](./MVC.md)

---

### Phase 5 — Polish, Performance, & Launch Prep (Week 7)
- Run performance audit: content scripts must add <10% overhead on ATS pages, negligible elsewhere
- Implement lazy initialization and MutationObserver scoped to form elements only
- Complete privacy disclosure UI: clear explanation of what is stored locally and why
- Add in-extension feedback widget: "Did this autofill work correctly?" (Yes / Partially / No)
- Prepare Chrome Web Store listing: screenshots, description, privacy policy, permissions justification
- Run internal review against Chrome Web Store Developer Program Policies
- Create test plan document covering all 3 ATS platforms
- Set up error tracking (anonymized, local-only logging for debugging)

**Deliverable:** Extension ready for Chrome Web Store submission (not yet live, but submission-ready).

**Definition of Done:**
- Performance overhead <10% on ATS pages, <1% on non-ATS pages
- MutationObserver scoped to form containers only
- Privacy disclosure visible in onboarding and settings
- Feedback widget functional in extension UI
- Chrome Web Store listing materials prepared
- Test plan document covers all user stories
- Zero TypeScript errors, zero ESLint warnings
- All phases 0-4 features working end-to-end

**Reference:** [MVC.md → v1 Success Definition](./MVC.md)

---

### Phase 6 — Beta Testing & Launch (Week 8)
- Load extension as unpacked in Chrome for internal testing
- Test on real job postings across all 3 ATS platforms (Workday, Greenhouse, Lever)
- Document any edge cases or bugs, fix P0/P1 issues
- Recruit 5-10 beta testers (friends, colleagues, online communities)
- Collect feedback via in-extension widget
- Fix critical bugs reported by beta testers
- Submit to Chrome Web Store for review
- Monitor submission status, respond to reviewer feedback if needed
- **Once approved:** Announce v1 launch

**Deliverable:** Extension live on Chrome Web Store, available for public install.

**Definition of Done:**
- Extension tested on ≥5 real job applications per ATS platform
- Beta feedback collected and P0 bugs fixed
- Chrome Web Store submission approved
- Extension publicly available with download link
- Post-launch monitoring in place (user feedback, error logs)

**Reference:** [MVC.md → v1 Success Definition](./MVC.md)

---

## 🚦 Key Guardrails (Non-Negotiable)

- The extension **never submits a form without explicit user action**. No ghost browsing, no background applying.
- The extension **never attempts to bypass CAPTCHAs**.
- The extension **never scrapes or sells user data**.
- The extension **must pass Chrome Web Store review** at every release.
- All AI-generated answers **require user review before insertion** into any form field.

---

## ✅ Definition of Done (Per Phase)

Each phase is complete when:
1. The feature works end-to-end on at least the defined target platforms.
2. No performance regressions detected on baseline test pages.
3. No open P0/P1 bugs related to that phase's scope.
4. Code is reviewed, merged, and committed with atomic commits.
5. Relevant section of PRD is marked ✅ complete.

---

*See [AGENTS.md](./AGENTS.md) for agent execution rules. See [GSD_PROMPT.md](./GSD_PROMPT.md) for the GSD framework kickoff prompt.*
