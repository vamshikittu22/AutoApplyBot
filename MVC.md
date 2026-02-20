# MVC — Minimum Viable Concept

> **AutoApply Copilot — v1 Scope Definition**
> 
> 🔗 Related files: [PROJECT_PLAN.md](./PROJECT_PLAN.md) | [PRD.md](./PRD.md) | [TECHSTACK.md](./TECHSTACK.md) | [AGENTS.md](./AGENTS.md)
> 
> This document defines the **absolute minimum scope** needed for v1 to be useful and launchable.
> Anything not listed here is NOT in v1, regardless of how good the idea is.
> Agents must use this file as the scope filter when PRD features feel too large.

---

## Product Vision (One Line)

> "Apply to any job in under 5 minutes — without risking bans, generating spam, or sacrificing quality."

---

## Core Problem (Restated for Scope Clarity)

1. Job seekers waste 10–20 minutes per application on repetitive data entry across identical ATS forms.
2. Existing tools either automate too aggressively (ban risk, low quality) or help too little (still 10+ mins of editing).
3. No tool is simultaneously fast, safe, accurate, and lightweight.

This product solves problems 1 and 3. It does NOT try to solve job discovery, resume optimization, or interview coaching.

---

## The 3 Safety Principles (Hard Constraints)

These are not features. They are product identity statements. If a feature violates any of these, it is not in v1.

1. **Assisted, not autonomous.** The user controls every submit. The extension fills; the user approves and submits.
2. **Quality over quantity.** We optimize for interview rate, not application count.
3. **Transparent and safe.** No CAPTCHA bypassing. No scraping. Minimal permissions. Clear data use.

---

## MVC Feature Set

### Must-Have (P0 — Without These, the Product Does Not Work)

- **Profile builder:** Paste resume text → parse into structured profile OR manually enter work history, education, skills, contact info, links.
- **ATS autofill on 3 core platforms (v1):** Workday, Greenhouse, Lever (priority order: Workday first for market share).
- **User-initiated only:** "Autofill Profile" button. No auto-typing. No auto-submit.
- **AI short-answer drafts (mock in dev):** 2–3 options per question, generated on user request, always editable. Uses mock responses during development.
- **Helper Mode:** Sidebar with copy-paste profile snippets for unsupported sites.
- **Application auto-log:** Log job title, company, date, platform on each submission.

### Should-Have (P1 — Important for Retention and Trust, but Launches Without Them if Needed)

- **Visual field highlighting:** Green (filled), Yellow (low confidence, needs review), Red (error).
- **CAPTCHA detection and pause:** Detect common CAPTCHA widgets; pause and notify user.
- **Per-site disable toggle:** Instantly disable extension on any domain.
- **Tracker view:** List of logged applications with status filter and manual entry support.
- **Data export and delete:** Full GDPR-compliant data controls.

### Nice-to-Have (P2 — Post-Launch Backlog)

- Custom domain field mappings (saved per-domain autofill for unsupported sites).
- Volume guardrail nudge (soft notice at >30 apps/day).
- Performance mode (ATS-pattern-only scanning to protect older machines).
- Role-specific domain sections (NPI for healthcare, GitHub for tech, licenses for finance).

---

## What Is Explicitly Out of v1

- **LinkedIn Easy Apply** (deferred to v2 due to ban risk — requires more research on detection patterns)
- **Indeed Apply, Ashby, other ATS platforms** (v2+ expansion after core 3 are validated)
- **File upload resume parsing** (v1 is paste-only; PDF/DOCX upload deferred to v2)
- **Per-JD resume tailoring** (v2 feature — requires AI analysis of job descriptions)
- Firefox support (performance risks; defer until Chrome is stable)
- Web dashboard (tracker lives in popup only for v1)
- Batch apply or multi-job queue
- Resume scoring or keyword optimization
- Job search or recommendation features
- Interview prep tools
- LinkedIn profile editing
- Multi-profile management

---

## v1 Supported Platforms

| Platform | Type | Priority | Notes |
|----------|------|----------|-------|
| Workday | ATS | **P0 (v1)** | 50% market share; highest technical complexity (Shadow DOM); build first to validate approach |
| Greenhouse | ATS | **P0 (v1)** | 25% market share; common in tech companies; iframe-based forms |
| Lever | ATS | **P0 (v1)** | 10% market share; common in startups; simplest DOM structure |
| LinkedIn Easy Apply | Job Board + Apply Flow | **Deferred to v2** | Ban risk too high; needs more research before implementation |
| Indeed Apply | Job Board + Apply Flow | **Deferred to v2** | High user demand but lower priority than core ATS |
| Ashby | ATS | **Deferred to v2** | Growing platform; add after v1 validation |

Any other platform gets Helper Mode (sidebar) by default.

---

## v1 Success Definition

The product is a success at v1 launch if:

1. A user can set up their profile in under 3 minutes.
2. Applying to a Greenhouse job from open-to-submit takes under 5 minutes.
3. The AI answer for "Why do you want to work here?" needs only minor editing (user agrees in feedback prompt).
4. Zero confirmed reports of LinkedIn/Indeed/Workday banning users due to extension behavior within the first 90 days.
5. Extension achieves ≥4.0 rating on Chrome Web Store within 60 days of launch.

---

## User Journey Map (v1 Only)

### First-Time Setup (Target: <3 minutes)
1. Install from Chrome Web Store.
2. Click extension icon → see onboarding overlay.
3. **Paste resume text** → review parsed fields → save profile.
4. Select role type (Tech / Healthcare / Finance / etc.).
5. Done. Extension is ready to assist.

### Applying on a Supported ATS (Target: <5 minutes)
1. Open job posting → click Apply.
2. Extension detects ATS → small toolbar appears (non-blocking).
3. User clicks "Autofill Profile" → form fills; highlighted fields appear.
4. User reviews filled fields; edits anything flagged yellow.
5. User clicks "Suggest Answer" on screening question → reviews 2–3 options → selects and inserts one.
6. User submits the form manually.
7. Extension logs the application automatically.

### Applying on an Unsupported Site (Target: <10 minutes)
1. Open job posting → click Apply.
2. Extension cannot detect ATS → Helper Mode sidebar appears.
3. User copies relevant snippets from sidebar into form fields.
4. User logs application manually to tracker.

---

*For detailed requirements and edge cases, see [PRD.md](./PRD.md).*
*For technical implementation details, see [TECHSTACK.md](./TECHSTACK.md).*
