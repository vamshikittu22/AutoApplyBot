# PRD — AutoApply Copilot Browser Extension

> **Product Requirements Document — v1.0**
> 
> 🔗 Related files: [PROJECT_PLAN.md](./PROJECT_PLAN.md) | [MVC.md](./MVC.md) | [TECHSTACK.md](./TECHSTACK.md) | [AGENTS.md](./AGENTS.md)
> 
> Agents: Read [AGENTS.md](./AGENTS.md) before acting on this document.

---

## 1. Background & Strategic Context

### 1.1 Market Problem

Job seekers today apply to 50–200+ positions during a job search. Each application on a typical ATS (Applicant Tracking System) like Workday, Greenhouse, or Lever requires re-entering the same personal information, work history, and education data — costing 10–20 minutes per application.

Tools that attempt to solve this fail in one of two ways:

- **Volume-first tools** (Zippi by Zippia, Bulk Apply, JobCopilot, JobRight): Promise 100+ applications per day but produce generic output, risk account bans on platforms like LinkedIn, and generate applications that never convert to interviews. Users report near-zero ROI despite high volume.

- **Autofill utilities** (Simplify Copilot, JobFill AI, AutofillJobs): Reduce form-fill time but produce generic AI answers that still require 10–15 minutes of manual editing per application. Many suffer from performance issues (CPU spikes, browser freezes) and brittle integrations that break when ATS markup changes.

### 1.2 Opportunity

There is a clear gap for a **quality-first, safety-conscious, assisted application tool** that:
- Saves the majority of time spent on repetitive data entry.
- Generates tailored, domain-aware answer drafts that need only light editing.
- Stays within platform ToS at all times.
- Is lightweight enough not to degrade the user's browsing experience.
- Is trustworthy enough that users are not worried about data security or account safety.

### 1.3 Product Goals

**Primary goal:** Reduce time per job application from 15–20 minutes to 3–5 minutes for 80% of applications on supported platforms.

**Secondary goal:** Maintain or improve the user's interview-per-application conversion rate versus their pre-tool baseline.

**Tertiary goal:** Build trust as the safest, most responsible auto-apply tool on the market — explicitly distinct from "spray and pray" bulk appliers.

---

## 2. Non-Goals (v1)

- Fully automated, unattended background applying (no JobCopilot/BulkApply behavior).
- Resume optimization scoring or ATS keyword stuffing tools — focus is on application flow, not resume building.
- Multi-persona or multi-profile management.
- Native mobile application.
- LinkedIn profile editor or LinkedIn-specific optimization.
- Guaranteed anonymity or VPN-like features.
- Job search / job recommendation engine — the user finds jobs; the tool helps apply.

---

## 3. User Personas

### Persona 1 — Aisha (Early-Career Software Engineer)
- Applies through LinkedIn, Indeed, and Greenhouse portals.
- Sends 5–10 applications per week; each takes 10–15 minutes.
- Frustrated by repetitive forms; worried about tools that could get her LinkedIn account flagged.
- Wants: Fast, reliable autofill + short answer help + a tracker she doesn't have to manually update.

### Persona 2 — Max (Mid-Career Marketing Manager)
- Uses a spreadsheet to track 30–50 applications across multiple boards.
- Applies primarily to roles on Workday and Lever-based career pages.
- Has a strong resume but hates writing the same "Why are you interested in this role?" answer 30 times.
- Wants: Autofill for known fields + AI answer drafts that are not obviously robotic + integrated tracking.

### Persona 3 — Priya (Specialized Healthcare Professional)
- Applies to nursing and clinical roles that require licensing info, clinical specialties, and certifications.
- Generic autofill tools fail her because they don't know what fields to put her NPI number or specialty into.
- Wants: A tool that understands healthcare-specific fields and generates answers that mention clinical metrics.

---

## 4. Epics and User Stories

### Epic 1 — Candidate Profile & Resume Parsing

**Goal:** Let users build a single, reusable profile that powers all autofill and AI features.

**US1.1 — Resume Upload & Parsing**
- As a user, I want to upload my resume as a PDF or DOCX and have the extension extract my personal info, work history, education, skills, and links automatically so I don't have to type it all in.
- Acceptance criteria:
  - At least 80% of key fields parsed correctly from a typical resume on first import.
  - Unconfident or low-confidence fields are flagged for user review, not silently filled with wrong data.
  - User can edit every parsed field before saving.

**US1.2 — LinkedIn URL Import (Optional)**
- As a user, I want to paste my LinkedIn URL and have the extension pull my professional summary so I can skip resume upload if I prefer.
- Acceptance criteria:
  - Extension reads publicly available LinkedIn profile data only — no login credentials required.
  - User sees a preview before import is confirmed.

**US1.3 — Role Preference & Industry Setting**
- As a user, I want to select my target role type (Tech, Healthcare, Finance, Marketing, Operations, Other) so the AI answer engine emphasizes the right details from my profile.
- Acceptance criteria:
  - Role preference is stored and used in all subsequent AI prompts.
  - User can change role preference at any time from settings.

**US1.4 — Domain-Specific Profile Sections**
- As a healthcare user, I want dedicated fields for my NPI number, clinical specialty, certifications, and licensure so these are always available for autofill on healthcare-specific forms.
- As a tech user, I want dedicated fields for my GitHub URL, primary tech stack, and portfolio so these are filled in correctly on developer-focused applications.
- As a finance user, I want dedicated fields for my FINRA/CFA/CPA licenses and quantitative achievements.
- Acceptance criteria:
  - Domain-specific fields appear only when the matching role preference is selected.
  - These fields are mapped to the correct form inputs on domain-relevant ATSes.

**US1.5 — Data Privacy Controls**
- As a user, I want to export all my stored data as a JSON file and delete my account and all associated data with a single action.
- Acceptance criteria:
  - Export produces a complete, human-readable JSON of all profile and tracker data.
  - Delete is irreversible and confirmed by a second prompt; removes data from local storage and cloud (Supabase).

---

### Epic 2 — ATS Detection & Autofill Engine

**Goal:** Reliable, safe, user-initiated autofill on the 6 core ATS platforms.

**US2.1 — ATS Recognition**
- As a user, when I open a job application page on a supported ATS, I want the extension to automatically detect it and offer autofill without any configuration.
- Acceptance criteria:
  - Detection accuracy ≥95% on a curated test matrix of 20+ application URLs per supported ATS.
  - Supported ATSes v1: Workday, Greenhouse, Lever, Ashby, LinkedIn Easy Apply, Indeed Apply.
  - When detection fails or confidence is low, extension enters Helper Mode rather than attempting autofill.

**US2.2 — One-Click Profile Autofill**
- As a user, I want to click a single "Autofill Profile" button to fill all standard personal info, work history, and education fields on a detected ATS form.
- Acceptance criteria:
  - Autofill is triggered only by explicit user click — never on page load or form focus.
  - Every filled field is visually highlighted so users know what was filled.
  - User can undo any single field fill or undo all at once.
  - If the ATS script rejects an injected value, the extension surfaces a visible error message on that field.

**US2.3 — Field Mapping Confidence & Fallback**
- As a user, I want the extension to use contextual clues (field label, placeholder, form structure) to map unknown fields to my profile data, rather than leaving them blank or mis-filling them.
- Acceptance criteria:
  - Mapping confidence score is computed per field; fields below the confidence threshold are highlighted in yellow ("Needs your review") rather than auto-filled.
  - High-confidence fills are highlighted in green.
  - User can override any mapping.

**US2.4 — Helper Mode for Unsupported Sites**
- As a user, on a company career page that uses a custom or unsupported portal, I want a sidebar showing my profile data as copyable snippets so I can still apply faster.
- Acceptance criteria:
  - Helper Mode activates automatically when ATS detection fails.
  - Sidebar shows: personal info, work history bullets, education, skills, links — all as one-click copy snippets.
  - User can manually map "this field on this page" → "this profile attribute" and save it as a custom mapping for this domain.
  - Saved mappings persist and trigger quasi-autofill on future visits to the same domain.

---

### Epic 3 — AI-Assisted Answer Generation

**Goal:** High-quality, role-aware answer drafts for screening questions that need minimal editing.

**US3.1 — Short-Answer Draft Generation**
- As a user, when I see a short-answer screening question on an ATS form, I want to click "Suggest Answer" and receive 2–3 tailored draft options based on my profile and the job description.
- Acceptance criteria:
  - Generation is triggered only by explicit user click on the "Suggest Answer" button next to the detected question field.
  - 2–3 options are always shown — never a single answer forced on the user.
  - Each option has a distinct tone: Professional, Concise, Story-Driven.
  - User selects, edits, and manually clicks to insert the chosen answer into the field.
  - The extension never automatically types into a field with an AI-generated answer.

**US3.2 — Role-Specific Tuning**
- As a healthcare user, I want AI answers to mention clinical outcomes, patient volume, certifications, and licensure where relevant — not generic corporate phrases.
- As a tech user, I want answers that reference specific technologies, GitHub contributions, and engineering principles.
- As a finance user, I want answers that include quantitative results, compliance awareness, and financial instrument experience.
- Acceptance criteria:
  - Role preference from Epic 1 is injected into the AI prompt context.
  - Internal testing confirms Healthcare / Tech / Finance answers are demonstrably different in vocabulary and emphasis.

**US3.3 — Placeholder Markers for Incomplete Sections**
- As a user, I want AI-generated draft answers to clearly mark sections where I need to add personal specifics (e.g., project names, exact metrics) so I never accidentally submit a generic answer.
- Acceptance criteria:
  - All drafts include bracketed placeholders like [Insert project name], [Insert metric], [Insert company name].
  - Placeholders are visually styled differently (e.g., highlighted in the text) when inserted into the form field.

**US3.4 — Long-Form Essay Handling**
- As a user, on long-form questions (>500 words expected), I want the extension to provide a structured outline rather than a full draft, so I am guided without being given fake full answers.
- Acceptance criteria:
  - Extension detects likely essay questions by textarea size, character limits, or label keywords (e.g., "Describe in detail," "Tell us about a time").
  - For detected essays, offers a STAR-framework outline (Situation, Task, Action, Result) based on relevant profile sections instead of a full draft.
  - Clearly labels the response as "Outline — requires your personal story."

---

### Epic 4 — Job Tracker & Safety Controls

**Goal:** Automatic, low-friction tracking with soft guardrails against volume abuse.

**US4.1 — Auto-Log on Application Submit**
- As a user, I want every job application I complete with the extension to be automatically logged with title, company, ATS platform, URL, date, and status (Applied).
- Acceptance criteria:
  - Log entry is created on user submission confirmation — not on form open or autofill.
  - Tracker is accessible from the extension popup under an "Applications" tab.
  - Supports manual status updates: Applied → Interview → Offer → Rejected → Withdrawn.

**US4.2 — Manual Job Entry**
- As a user, I want to manually add a job to the tracker even when I didn't apply through the extension.
- Acceptance criteria:
  - Simple add-job form in the tracker tab: Company, Title, URL (optional), Applied Date, Notes.

**US4.3 — Volume Guardrail Nudge**
- As a user, I want the extension to surface a soft, dismissable notice if I apply to more than 30 jobs in a 24-hour period, reminding me to focus on fit over volume.
- Acceptance criteria:
  - Nudge is non-blocking — a dismissable banner, not a modal lock.
  - The threshold (30/day) is configurable from settings.
  - The nudge is educational in tone, not judgmental.

**US4.4 — Per-Site Disable Toggle**
- As a user, I want to turn the extension off for any specific site instantly so it doesn't interfere with my browsing or any site where it causes issues.
- Acceptance criteria:
  - Toggle appears in the extension popup when any page is active.
  - Toggling "Disable on this site" immediately removes all content script behavior from that domain.
  - Disabled sites list is visible and editable in settings.

**US4.5 — CAPTCHA Detection & Pause**
- As a user, I want the extension to automatically detect when a CAPTCHA is present on a form and pause all automation so I can complete it manually without interference.
- Acceptance criteria:
  - Common CAPTCHA widgets (reCAPTCHA v2/v3, hCaptcha, Cloudflare Turnstile) are detected.
  - When detected, all autofill and AI suggestion behaviors are paused and the user sees a notice: "CAPTCHA detected — complete it manually. Autofill will resume after."
  - The extension makes zero attempts to solve or bypass CAPTCHAs.

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Extension must not increase page load time by more than 10% on supported ATS pages.
- Extension must have negligible performance impact (<1% overhead) on all non-ATS pages.
- No sustained CPU spikes. Content scripts must enter idle state when no application form is detected.
- Maximum extension popup load time: 500ms on a mid-range device.

### 5.2 Reliability
- Autofill must degrade gracefully when ATS markup changes: disable and alert, never mis-fill.
- Minimum 99% uptime for the backend AI proxy API.
- Extension must handle network failure states gracefully — AI features show an error, but autofill from local profile still works offline.

### 5.3 Security
- Profile data stored encrypted at rest (AES-256) in local storage.
- Cloud sync (Supabase) uses Row-Level Security — users can only access their own data.
- AI prompts sent to backend proxy never include raw, full profile dumps — only relevant snippets scoped to the current form context.
- No collection of browsing history, non-job-application page data, or cross-site tracking.
- Extension permissions declared in manifest must match minimum required. No over-permissioning.

### 5.4 Compliance
- Chrome Web Store Developer Program Policies — compliant at every release.
- Edge Add-on Store Policies — compliant for Edge distribution.
- GDPR/CCPA-aware data handling — explicit consent at onboarding, data export/delete on demand.
- Major job board Terms of Service — no scraping, no credential sharing, no bot-like behavior.

---

## 6. Success Metrics

| Metric | Target |
|--------|--------|
| Time per application (assisted vs. baseline) | ≥60% reduction |
| ATS autofill field accuracy | ≥90% fields correctly filled without user edit |
| User-reported AI answer satisfaction | ≥70% rate answers as "used with minor edits" or better |
| Browser performance impact (non-ATS pages) | <1% overhead |
| Platform ban incidents attributable to extension | 0 confirmed cases |
| Weekly active users completing ≥5 applications | ≥60% of WAU |
| Chrome Web Store rating | ≥4.3 stars within 3 months of launch |

---

## 7. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| ATS markup changes breaking autofill | High | Graceful degradation; weekly test suite on live ATS URLs |
| LinkedIn/Indeed detecting and banning extension users | High | No bot behavior; user-initiated only; no background automation |
| Chrome Web Store policy violation leading to delisting | Critical | Pre-submission internal audit; conservative permissions; clear privacy policy |
| Performance issues (CPU spikes, page freeze) | High | Strict performance budget; lazy loading; scoped MutationObserver |
| AI-generated answers being clearly robotic/generic | Medium | Role-specific tuning; placeholder forcing; human-in-the-loop design |
| Data breach via Supabase misconfiguration | High | RLS from day one; no admin panel in production; regular security audits |

---

## 8. Post-v1 Roadmap (High Level)

- v1.1: Additional ATS templates; Firefox support with performance profiling
- v1.2: Web dashboard for tracker; deeper analytics (interview conversion insights)
- v2.0: Role-specific Application Playbooks; curated high-performing answer examples by domain
- v2.1: Controlled batch-apply with guardrails (high-fit-only filter, max 10 per session)

---

*See [MVC.md](./MVC.md) for v1 scope only. See [TECHSTACK.md](./TECHSTACK.md) for technical implementation decisions.*
