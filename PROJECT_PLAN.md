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

### Phase 0 — Project Setup & Architecture (Week 1–2)
- Initialize the Chrome Extension project using the chosen framework (see [TECHSTACK.md](./TECHSTACK.md))
- Set up monorepo structure: extension, backend API, shared types
- Configure CI/CD pipeline, linting, and formatting
- Set up Supabase project for auth and storage
- Define folder structure and file naming conventions
- Set up environment variable management

**Deliverable:** Empty but fully configured, runnable extension shell that loads in Chrome Dev mode.

---

### Phase 1 — Profile & Resume Engine (Week 3–4)
- Build the user onboarding flow: upload resume (PDF/DOCX) or paste LinkedIn URL
- Implement resume parser to extract: name, email, phone, work history, education, skills, links, certifications
- Build profile editor UI: user can review, edit, and save all parsed fields
- Add role preference selector: Tech / Healthcare / Finance / Marketing / Operations / Other
- Store profile encrypted in local storage with optional Supabase cloud sync
- Add "export my data" and "delete my data" controls

**Deliverable:** User can set up a full profile in under 2 minutes. Data persists across sessions.

**Reference:** [PRD.md → Epic 1: Candidate Profile](./PRD.md)

---

### Phase 2 — ATS Detection & Autofill Engine (Week 5–7)
- Build ATS signature detection for: Workday, Greenhouse, Lever, Ashby, LinkedIn Easy Apply, Indeed Apply
- Map detected form fields to profile attributes using label + placeholder + context heuristics
- Implement one-click autofill — user must explicitly click "Autofill"; no auto-typing on page load
- Highlight all filled fields visually; provide undo button for each field
- Implement graceful degradation: if ATS markup changes, disable autofill cleanly rather than mis-filling
- Build "Helper Mode" for unsupported sites: collapsible sidebar with profile snippets and click-to-paste
- Allow users to save custom field mappings per domain for reuse

**Deliverable:** Reliable autofill on 6 core ATS platforms with ≥90% field accuracy.

**Reference:** [PRD.md → Epic 2: Form Detection & Autofill](./PRD.md), [MVC.md → Core Capabilities](./MVC.md)

---

### Phase 3 — AI Answer Generation (Week 8–9)
- Integrate AI API (OpenAI GPT-4o or Anthropic Claude) via secure backend proxy
- On detection of open-ended text questions, show "Suggest Answer" button
- Feed job description text + relevant profile sections into AI prompt
- Return 2–3 draft options per question, each different in tone (professional / concise / story-driven)
- Highlight placeholder sections user must fill in (e.g., "[Insert specific project name]")
- Add role-specific tuning: Healthcare answers include clinical metrics and licensure; Tech includes stack + GitHub; Finance includes licenses and quantitative results
- Long-form or essay-style questions are always flagged for full manual review, never auto-submitted

**Deliverable:** AI answers that need only light editing and are demonstrably different per role type.

**Reference:** [PRD.md → Epic 3: AI Answers](./PRD.md)

---

### Phase 4 — Job Tracker & Safety Controls (Week 10–11)
- Auto-log each application on user submission: title, company, URL, ATS platform, date, status
- Build tracker view in the extension popup: list with filters by status, company, date
- Support manual job entry for non-extension applications
- Add soft volume guardrail: surface a non-blocking notice if user applies to >30 jobs in 24 hours
- Add per-site disable toggle: visible on every page, immediately disables content scripts
- Add performance mode option: restrict detection to known ATS URL patterns only
- Ensure extension does not interfere with CAPTCHA widgets; detect and pause automation near them

**Deliverable:** Working tracker, per-site controls, CAPTCHA-safe behavior verified on all supported ATSes.

**Reference:** [PRD.md → Epic 4: Tracker & Safety](./PRD.md), [MVC.md → Safety Principles](./MVC.md)

---

### Phase 5 — Polish, Performance, & Launch (Week 12–14)
- Run performance audit: content scripts must add <10% overhead on ATS pages, negligible elsewhere
- Implement lazy initialization and MutationObserver scoped to form elements only
- Complete privacy disclosure UI: clear explanation of what is stored, where, and for how long
- Add in-extension feedback widget: "Did this autofill work correctly?" (Yes / Partially / No)
- Prepare Chrome Web Store listing: screenshots, description, privacy policy, permissions justification
- Run internal review against Chrome Web Store Developer Program Policies and major job board ToS
- Soft launch to 50–100 beta users; monitor for performance regressions and edge cases
- Set up error tracking and usage telemetry (anonymized and aggregated only)

**Deliverable:** Extension passes Chrome Web Store review and is live for public install.

---

### Phase 6 — Post-Launch Iteration (Week 15+)
- Expand ATS coverage based on user-requested sites
- Add Firefox support with dedicated performance profiling
- Build lightweight web dashboard for tracker (beyond popup view)
- Add role-specific "Application Playbooks": curated examples of high-performing answers by domain
- Explore controlled batch-apply guardrails (max 10 filtered, high-fit jobs per session) for power users

**Reference:** [PRD.md → Roadmap Section](./PRD.md)

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
