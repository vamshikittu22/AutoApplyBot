# AutoApply Copilot — v1.0 Requirements

> **Extracted from PRD.md and MVC.md**
> This document defines all functional and non-functional requirements for v1.0

---

## Scope Summary

**v1.0 includes:**
- Paste-based resume parsing → structured profile
- Autofill on 3 ATS platforms (Workday, Greenhouse, Lever)
- Mock AI answer generation (user can add own API key for real AI)
- Application tracking (local storage only)
- Safety controls (CAPTCHA detection, per-site disable, volume guardrails)

**v2.0+ deferred:**
- PDF/DOCX file upload
- LinkedIn Easy Apply
- Per-JD resume tailoring
- Cloud sync
- Firefox support

---

## Epic 1: Profile Management

### REQ-PRO-01: Paste Resume & Parse
**Priority:** P0 (Must-Have)
**Source:** PRD US1.1
**Description:** User pastes resume text, extension extracts structured data
**Acceptance Criteria:**
- User can paste plain text resume into profile setup
- Parser extracts: name, email, phone, location, work history, education, skills, links
- At least 75% of key fields parsed correctly
- Low-confidence fields flagged for manual review
- User can edit all fields before saving
**Test Cases:**
- TC-PRO-01-01: Paste chronological resume format → verify extraction accuracy
- TC-PRO-01-02: Paste resume with special characters → verify no parsing errors
- TC-PRO-01-03: Paste minimal resume (name + contact only) → verify graceful handling

---

### REQ-PRO-02: Profile Editor
**Priority:** P0 (Must-Have)
**Source:** PRD US1.1, MVC Must-Have
**Description:** UI for user to review and edit parsed profile data
**Acceptance Criteria:**
- Form-based editor with sections: Personal Info, Work History, Education, Skills, Links
- User can add/edit/delete work experience entries
- User can add/edit/delete education entries
- User can add/remove skills (tags)
- Save button persists to encrypted Chrome local storage
**Test Cases:**
- TC-PRO-02-01: Edit name field → save → reload extension → verify persistence
- TC-PRO-02-02: Add new work experience → save → verify appears in profile
- TC-PRO-02-03: Delete education entry → save → verify removal

---

### REQ-PRO-03: Role Preference Selection
**Priority:** P0 (Must-Have)
**Source:** PRD US1.3
**Description:** User selects target role type for AI tuning
**Acceptance Criteria:**
- Dropdown with options: Tech, Healthcare, Finance, Marketing, Operations, Other
- Selection stored with profile
- Selection affects AI prompt context (when AI is enabled)
- User can change preference anytime from settings
**Test Cases:**
- TC-PRO-03-01: Select "Tech" → save → verify stored in profile
- TC-PRO-03-02: Change from "Tech" to "Healthcare" → verify AI responses change tone

---

### REQ-PRO-04: Domain-Specific Profile Fields
**Priority:** P1 (Should-Have)
**Source:** PRD US1.4
**Description:** Role-specific fields for Tech/Healthcare/Finance users
**Acceptance Criteria:**
- Tech users see: GitHub URL, tech stack (tags), portfolio URL
- Healthcare users see: NPI number, clinical specialty, certifications, license numbers
- Finance users see: FINRA/CFA/CPA licenses, quantitative achievements
- Fields visible only when matching role preference selected
**Test Cases:**
- TC-PRO-04-01: Select "Tech" → verify GitHub/portfolio fields visible
- TC-PRO-04-02: Select "Healthcare" → verify NPI/license fields visible

---

### REQ-PRO-05: Encrypted Local Storage
**Priority:** P0 (Must-Have)
**Source:** TECHSTACK.md, PRD 5.3
**Description:** Profile data stored encrypted using Web Crypto API
**Acceptance Criteria:**
- Profile encrypted with AES-GCM before storage
- Encryption key managed by browser (no user password in v1)
- Data stored in Chrome Storage API (local)
- No data sent to external servers
**Test Cases:**
- TC-PRO-05-01: Inspect Chrome Storage → verify profile data is encrypted (not plaintext)
- TC-PRO-05-02: Save profile → close browser → reopen → verify decryption works

---

### REQ-PRO-06: Data Export & Delete
**Priority:** P1 (Should-Have)
**Source:** PRD US1.5, MVC Should-Have
**Description:** User can export all data or delete everything
**Acceptance Criteria:**
- "Export Data" button produces JSON file download
- JSON includes: profile, application history, settings
- "Delete All Data" button shows confirmation prompt
- Delete removes all Chrome local storage data
- Delete action is irreversible
**Test Cases:**
- TC-PRO-06-01: Export data → verify JSON structure is valid and complete
- TC-PRO-06-02: Delete all data → verify Chrome Storage cleared → verify profile empty

---

## Epic 2: ATS Detection & Autofill

### REQ-ATS-01: Workday Detection
**Priority:** P0 (Must-Have)
**Source:** PRD US2.1, MVC Must-Have
**Description:** Detect Workday application forms with ≥95% accuracy
**Acceptance Criteria:**
- Detection uses URL patterns + DOM signatures + Shadow DOM markers
- Confidence score ≥95% on 10+ real Workday job URLs
- False positive rate <5% on non-Workday pages
- Detection triggers content script injection
**Test Cases:**
- TC-ATS-01-01: Open Workday job URL → verify detection success
- TC-ATS-01-02: Open non-Workday career page → verify no false detection
- TC-ATS-01-03: Test 10 different Workday URLs → verify ≥95% accuracy

---

### REQ-ATS-02: Greenhouse Detection
**Priority:** P0 (Must-Have)
**Source:** PRD US2.1, MVC Must-Have
**Description:** Detect Greenhouse application forms with ≥95% accuracy
**Acceptance Criteria:**
- Detection uses URL patterns + iframe markers + data attributes
- Confidence score ≥95% on 10+ real Greenhouse job URLs
- Handles iframe-based forms correctly
**Test Cases:**
- TC-ATS-02-01: Open Greenhouse job URL → verify detection success
- TC-ATS-02-02: Test 10 different Greenhouse URLs → verify ≥95% accuracy

---

### REQ-ATS-03: Lever Detection
**Priority:** P0 (Must-Have)
**Source:** PRD US2.1, MVC Must-Have
**Description:** Detect Lever application forms with ≥95% accuracy
**Acceptance Criteria:**
- Detection uses URL patterns + CSS classes + form structure
- Confidence score ≥95% on 10+ real Lever job URLs
- Simplest ATS to detect (standard DOM structure)
**Test Cases:**
- TC-ATS-03-01: Open Lever job URL → verify detection success
- TC-ATS-03-02: Test 10 different Lever URLs → verify ≥95% accuracy

---

### REQ-ATS-04: One-Click Autofill
**Priority:** P0 (Must-Have)
**Source:** PRD US2.2, MVC Must-Have
**Description:** User clicks button to autofill all profile fields
**Acceptance Criteria:**
- "Autofill Profile" button appears on detected ATS forms
- Triggered only by explicit user click (never on page load)
- Fills all standard fields: name, email, phone, address, work history, education
- ≥85% of fields filled correctly per platform
- Visual highlighting: green (filled), yellow (low confidence), red (error)
**Test Cases:**
- TC-ATS-04-01: Click autofill on Workday → verify ≥85% fields filled correctly
- TC-ATS-04-02: Click autofill on Greenhouse → verify ≥85% fields filled correctly
- TC-ATS-04-03: Click autofill on Lever → verify ≥85% fields filled correctly
- TC-ATS-04-04: Verify highlighting: green for high-confidence, yellow for low-confidence

---

### REQ-ATS-05: Field Mapping Confidence
**Priority:** P0 (Must-Have)
**Source:** PRD US2.3
**Description:** Confidence scoring for field mappings
**Acceptance Criteria:**
- Each field mapping has confidence score (0-100%)
- Fields <70% confidence highlighted yellow (needs review)
- Fields ≥70% confidence highlighted green (auto-filled)
- User can override any mapping
- Undo button available per field
**Test Cases:**
- TC-ATS-05-01: Verify low-confidence fields highlighted yellow
- TC-ATS-05-02: Click undo on field → verify value cleared

---

### REQ-ATS-06: Helper Mode for Unsupported Sites
**Priority:** P1 (Should-Have)
**Source:** PRD US2.4, MVC Should-Have
**Description:** Sidebar with copyable profile snippets for unsupported ATSes
**Acceptance Criteria:**
- Activates when ATS detection fails or confidence <50%
- Sidebar shows: personal info, work history bullets, education, skills, links
- Each section has "Copy" button
- User can manually paste into form fields
- Optional: user can save custom field mapping for domain
**Test Cases:**
- TC-ATS-06-01: Open unsupported career page → verify Helper Mode activates
- TC-ATS-06-02: Click "Copy" on work history → verify clipboard contains formatted text

---

### REQ-ATS-07: Graceful Degradation
**Priority:** P0 (Must-Have)
**Source:** PRD US2.2, TECHSTACK.md
**Description:** Extension fails safely when ATS markup changes
**Acceptance Criteria:**
- If field selectors fail, autofill disables cleanly (no mis-filling)
- User sees error message: "Autofill unavailable - ATS may have changed"
- Helper Mode offered as fallback
- No extension errors in browser console
**Test Cases:**
- TC-ATS-07-01: Simulate changed ATS markup → verify autofill disables without errors
- TC-ATS-07-02: Verify Helper Mode activates after autofill failure

---

## Epic 3: AI Answer Generation

### REQ-AI-01: Mock AI Response System
**Priority:** P0 (Must-Have)
**Source:** PRD US3.1 (modified for v1)
**Description:** Mock AI system for development, with option for real AI
**Acceptance Criteria:**
- "Suggest Answer" button appears next to detected text question fields
- On click, displays 3 mock draft options (Professional, Concise, Story-Driven)
- Each option includes placeholder markers like [Insert project name]
- User selects option → can edit → clicks to insert into field
- Extension never auto-types AI content
**Test Cases:**
- TC-AI-01-01: Click "Suggest Answer" → verify 3 options displayed
- TC-AI-01-02: Verify options have distinct tones
- TC-AI-01-03: Verify placeholders marked clearly (e.g., in brackets)

---

### REQ-AI-02: User-Provided API Key Support
**Priority:** P1 (Should-Have)
**Source:** TECHSTACK.md, PRD US3.1
**Description:** User can add OpenAI/Claude API key for real AI
**Acceptance Criteria:**
- Settings page has "AI API Key" input field
- Supports OpenAI and Anthropic Claude
- Key stored encrypted in Chrome local storage
- When key present, extension uses real AI instead of mock responses
- Key never sent anywhere except directly to AI provider
**Test Cases:**
- TC-AI-02-01: Add OpenAI key → verify encrypted storage
- TC-AI-02-02: Add key → click "Suggest Answer" → verify real API call made
- TC-AI-02-03: Remove key → verify extension falls back to mock responses

---

### REQ-AI-03: Role-Specific AI Tuning
**Priority:** P1 (Should-Have)
**Source:** PRD US3.2
**Description:** AI answers tailored to user's role preference
**Acceptance Criteria:**
- Tech role: answers mention technologies, GitHub, engineering principles
- Healthcare role: answers mention clinical outcomes, certifications, patient volume
- Finance role: answers mention quantitative results, compliance, financial instruments
- Mock responses demonstrate clear differences per role
**Test Cases:**
- TC-AI-03-01: Set role to "Tech" → generate answer → verify tech-specific language
- TC-AI-03-02: Set role to "Healthcare" → generate answer → verify clinical language

---

### REQ-AI-04: Placeholder Markers
**Priority:** P0 (Must-Have)
**Source:** PRD US3.3
**Description:** AI drafts include clear placeholders for user to fill
**Acceptance Criteria:**
- All AI-generated drafts include bracketed placeholders
- Examples: [Insert company name], [Insert metric], [Insert project name]
- Placeholders visually distinct (highlighted or colored)
- User cannot accidentally submit without replacing placeholders
**Test Cases:**
- TC-AI-04-01: Generate answer → verify placeholders present and marked
- TC-AI-04-02: Verify placeholder format is consistent across all drafts

---

### REQ-AI-05: Essay Question Handling
**Priority:** P2 (Nice-to-Have)
**Source:** PRD US3.4
**Description:** Long-form questions get outline instead of full draft
**Acceptance Criteria:**
- Detect essay questions by textarea size or character limit >500
- Provide STAR framework outline (Situation, Task, Action, Result)
- Label as "Outline — requires your personal story"
- No full draft provided (avoid fake stories)
**Test Cases:**
- TC-AI-05-01: Detect long textarea → verify outline format provided
- TC-AI-05-02: Verify outline includes STAR sections

---

## Epic 4: Job Tracker & Safety Controls

### REQ-TRK-01: Auto-Log Application
**Priority:** P0 (Must-Have)
**Source:** PRD US4.1, MVC Must-Have
**Description:** Automatically log job after user submits form
**Acceptance Criteria:**
- Log entry created on form submission (not on autofill)
- Captures: job title, company, ATS platform, URL, date, status (Applied)
- Stored in Chrome local storage
- Visible in tracker view in extension popup
**Test Cases:**
- TC-TRK-01-01: Submit application → verify logged in tracker
- TC-TRK-01-02: Verify log includes all required fields

---

### REQ-TRK-02: Tracker UI
**Priority:** P0 (Must-Have)
**Source:** PRD US4.1
**Description:** View all logged applications in extension popup
**Acceptance Criteria:**
- "Applications" tab in popup shows list view
- Filter by status: Applied, Interview, Offer, Rejected, Withdrawn
- Filter by date range
- Sort by date (newest first)
- Click entry to see details
**Test Cases:**
- TC-TRK-02-01: Log 5 applications → verify all visible in tracker
- TC-TRK-02-02: Filter by "Interview" → verify only Interview status shown

---

### REQ-TRK-03: Manual Job Entry
**Priority:** P1 (Should-Have)
**Source:** PRD US4.2
**Description:** User can manually add job to tracker
**Acceptance Criteria:**
- "Add Job" button in tracker view
- Form fields: Company, Title, URL (optional), Applied Date, Notes
- Entry saved to tracker like auto-logged entries
**Test Cases:**
- TC-TRK-03-01: Manually add job → verify appears in tracker

---

### REQ-TRK-04: Status Updates
**Priority:** P1 (Should-Have)
**Source:** PRD US4.1
**Description:** User can update application status
**Acceptance Criteria:**
- Click entry → see status dropdown
- Options: Applied, Interview, Offer, Rejected, Withdrawn
- Change saved immediately
**Test Cases:**
- TC-TRK-04-01: Change status from "Applied" to "Interview" → verify saved

---

### REQ-SAF-01: Volume Guardrail
**Priority:** P1 (Should-Have)
**Source:** PRD US4.3, MVC Should-Have
**Description:** Soft notice after 30 applications in 24 hours
**Acceptance Criteria:**
- Notice appears after 30th application
- Non-blocking banner (dismissible, not modal)
- Message: "You've applied to 30+ jobs today. Consider focusing on quality over quantity."
- Threshold configurable in settings (default 30)
**Test Cases:**
- TC-SAF-01-01: Submit 30 applications in 24h → verify notice appears
- TC-SAF-01-02: Dismiss notice → verify does not reappear for same 24h period

---

### REQ-SAF-02: Per-Site Disable Toggle
**Priority:** P1 (Should-Have)
**Source:** PRD US4.4, MVC Should-Have
**Description:** User can disable extension on any site
**Acceptance Criteria:**
- Toggle visible in extension popup on every page
- Click "Disable on this site" → content scripts unload immediately
- Disabled sites list visible in settings
- User can re-enable from settings
**Test Cases:**
- TC-SAF-02-01: Disable on example.com → verify content script inactive
- TC-SAF-02-02: Verify site appears in disabled list

---

### REQ-SAF-03: CAPTCHA Detection & Pause
**Priority:** P0 (Must-Have)
**Source:** PRD US4.5, MVC Must-Have
**Description:** Detect CAPTCHAs and pause all automation
**Acceptance Criteria:**
- Detect reCAPTCHA v2/v3, hCaptcha, Cloudflare Turnstile
- When detected, all autofill/AI features paused
- Notice: "CAPTCHA detected — complete it manually. Autofill will resume after."
- Extension makes zero attempts to solve or bypass CAPTCHAs
**Test Cases:**
- TC-SAF-03-01: Load page with reCAPTCHA → verify autofill paused
- TC-SAF-03-02: Complete CAPTCHA → verify autofill resumes

---

## Non-Functional Requirements

### REQ-NFR-01: Performance
**Priority:** P0 (Must-Have)
**Source:** PRD 5.1
**Acceptance Criteria:**
- Extension adds <10% overhead on ATS pages
- Extension adds <1% overhead on non-ATS pages
- No sustained CPU spikes
- Content scripts idle when no form detected
- Popup loads in <500ms

---

### REQ-NFR-02: Security
**Priority:** P0 (Must-Have)
**Source:** PRD 5.3, TECHSTACK.md
**Acceptance Criteria:**
- Profile data encrypted with AES-GCM (Web Crypto API)
- No data sent to external servers (except user's AI API calls)
- No collection of browsing history
- Minimal permissions (activeTab, storage only)

---

### REQ-NFR-03: Reliability
**Priority:** P0 (Must-Have)
**Source:** PRD 5.2
**Acceptance Criteria:**
- Autofill degrades gracefully when ATS markup changes
- Extension handles network failures (AI offline → show error, autofill still works)
- No browser crashes or freezes

---

### REQ-NFR-04: Compliance
**Priority:** P0 (Must-Have)
**Source:** PRD 5.4
**Acceptance Criteria:**
- Chrome Web Store Developer Program Policies compliant
- No scraping, no credential sharing, no bot-like behavior
- GDPR/CCPA-aware (data export/delete available)

---

## Success Metrics (v1.0)

| Metric | Target |
|--------|--------|
| Resume parse accuracy | ≥75% fields correct |
| ATS detection accuracy | ≥95% per platform |
| Autofill field accuracy | ≥85% fields correct |
| Performance overhead (ATS pages) | <10% |
| Performance overhead (non-ATS pages) | <1% |
| User reports of platform bans | 0 confirmed cases |
| Chrome Web Store rating (after 3 months) | ≥4.0 stars |

---

## Traceability Matrix

| Requirement | PRD Source | MVC Priority | Phase |
|-------------|------------|--------------|-------|
| REQ-PRO-01 | US1.1 | P0 | Phase 1 |
| REQ-PRO-02 | US1.1 | P0 | Phase 1 |
| REQ-PRO-03 | US1.3 | P0 | Phase 1 |
| REQ-PRO-04 | US1.4 | P1 | Phase 1 |
| REQ-PRO-05 | 5.3 | P0 | Phase 1 |
| REQ-PRO-06 | US1.5 | P1 | Phase 1 |
| REQ-ATS-01 | US2.1 | P0 | Phase 2 |
| REQ-ATS-02 | US2.1 | P0 | Phase 2 |
| REQ-ATS-03 | US2.1 | P0 | Phase 2 |
| REQ-ATS-04 | US2.2 | P0 | Phase 2 |
| REQ-ATS-05 | US2.3 | P0 | Phase 2 |
| REQ-ATS-06 | US2.4 | P1 | Phase 2 |
| REQ-ATS-07 | US2.2 | P0 | Phase 2 |
| REQ-AI-01 | US3.1 | P0 | Phase 3 |
| REQ-AI-02 | US3.1 | P1 | Phase 3 |
| REQ-AI-03 | US3.2 | P1 | Phase 3 |
| REQ-AI-04 | US3.3 | P0 | Phase 3 |
| REQ-AI-05 | US3.4 | P2 | Phase 3 |
| REQ-TRK-01 | US4.1 | P0 | Phase 4 |
| REQ-TRK-02 | US4.1 | P0 | Phase 4 |
| REQ-TRK-03 | US4.2 | P1 | Phase 4 |
| REQ-TRK-04 | US4.1 | P1 | Phase 4 |
| REQ-SAF-01 | US4.3 | P1 | Phase 4 |
| REQ-SAF-02 | US4.4 | P1 | Phase 4 |
| REQ-SAF-03 | US4.5 | P0 | Phase 4 |
| REQ-NFR-01 | 5.1 | P0 | Phase 5 |
| REQ-NFR-02 | 5.3 | P0 | All |
| REQ-NFR-03 | 5.2 | P0 | All |
| REQ-NFR-04 | 5.4 | P0 | Phase 5 |
