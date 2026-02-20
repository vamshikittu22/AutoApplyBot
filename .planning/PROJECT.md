# AutoApply Copilot — Project Context

## Vision

**AutoApply Copilot** is a Chrome/Edge browser extension that helps job seekers fill application forms faster without sacrificing quality or risking platform bans.

### The Problem
- Job seekers spend 30-45 minutes per application manually filling repetitive fields
- Copy-pasting from resumes leads to formatting errors and missed required fields
- Generic "spray and pray" applications hurt success rates
- Existing tools either auto-submit (risky) or provide poor quality answers

### The Solution
AutoApply Copilot automates the tedious parts while keeping users in control:
- **One-click profile autofill** — Intelligently map resume data to form fields
- **AI-powered answer generation** — Draft tailored responses to open-ended questions
- **Application tracking** — Remember what you applied to and when
- **Safety-first approach** — Never auto-submit, always require user review

### Success Criteria
- Reduce time per application from 30-45 min → 10-15 min (60%+ reduction)
- Support top 3 ATS platforms (Workday, Greenhouse, Lever) with 85%+ autofill accuracy
- Zero platform bans or Chrome Web Store violations
- 70%+ of beta users complete 5+ applications in first week

## Scope Boundaries

### v1.0 INCLUDES (Phases 0-3)
- Resume parsing (PDF/DOCX → structured profile)
- Workday + Greenhouse + Lever detection & autofill
- AI-powered draft generation (OpenAI/Claude via user API key)
- Application tracking (local-only, encrypted storage)
- Role-specific prompt templates (Tech/Healthcare/Finance)
- Basic rate limiting (max 10 apps/day)
- CAPTCHA detection (pause, don't bypass)

### v1.0 EXCLUDES (Future Phases)
- ❌ LinkedIn Easy Apply (deferred to Phase 2.5 due to ban risk)
- ❌ Cloud sync / multi-device support
- ❌ Browser automation beyond form filling
- ❌ Job search / application discovery features
- ❌ Cover letter generation (separate feature)
- ❌ Interview prep tools

### Non-Negotiable Principles
1. **User control** — No auto-submit, no hidden actions
2. **Safety-first** — Detect CAPTCHAs, respect rate limits, avoid detection patterns
3. **Quality over quantity** — Encourage tailoring, not spray-and-pray
4. **Privacy** — Local-first, encrypt sensitive data, no telemetry without consent
5. **Transparency** — Show what's being filled, why, and allow edits before submit

## Tech Stack

### Core Framework
- **WXT** — Modern browser extension framework (Vite-powered, TypeScript-first)
- **React 18** — UI components (popup, options page, content overlays)
- **TypeScript** (strict mode) — Type safety across all code
- **Tailwind CSS** — Utility-first styling with shadcn/ui components

### State & Storage
- **Zustand** — Lightweight state management (profile, settings, tracking)
- **Chrome Storage API** — Encrypted local storage via Web Crypto API
- **No backend for v1** — Fully offline-first

### Document Processing
- **pdf.js** — Resume parsing (PDF → text extraction)
- **mammoth.js** — DOCX parsing (Word docs → HTML/text)
- **Custom parser** — Text → structured profile (regex + heuristics)

### AI Integration
- **OpenAI API** (GPT-4) — User's own API key, encrypted storage
- **Claude API** (optional) — Alternative LLM for draft generation
- **Local prompt templates** — Role-specific, context-aware prompts

### Content Scripts
- **MutationObserver** — Scoped to form containers (not full DOM)
- **Shadow DOM handling** — Workday/Greenhouse use Shadow DOM for forms
- **Lazy activation** — Only inject when ATS platform detected

### Testing
- **Vitest** — Unit tests for parsing, detection, field mapping
- **Playwright** — E2E tests on real Workday/Greenhouse demo sites
- **Mock Chrome APIs** — Test extension behavior without browser

### Build & Tooling
- **pnpm** — Fast, deterministic package manager
- **ESLint + Prettier** — Enforce code style
- **Husky** — Pre-commit hooks for linting/type-checking

## Target Platforms

### Primary ATS Systems (v1)
1. **Workday** — 50% market share, Shadow DOM, dynamic field IDs
2. **Greenhouse** — 25% market share, iframe-based forms
3. **Lever** — 10% market share, simpler DOM structure

### Browser Support
- Chrome 120+ (primary)
- Edge 120+ (Chromium-based, full compatibility)
- Firefox deferred to v1.1 (Manifest v3 differences)

## User Personas

### Primary: Sarah — Tech Professional (65% of users)
- 8+ years experience, looking for Senior SWE roles
- Applies to 10-15 jobs per week
- Values quality over quantity, tailors each application
- Comfortable with AI tools, has OpenAI API key
- Pain: Copy-pasting experience bullets, answering "why this role?" 50 times

### Secondary: Michael — Career Changer (25% of users)
- Transitioning from retail management → operations role
- Less tech-savvy, needs clear instructions
- Applies to 20-30 jobs per week (higher volume)
- May not have API key initially
- Pain: Manually typing same work history repeatedly

### Tertiary: Dr. Patel — Healthcare Professional (10% of users)
- Physician applying to hospital systems
- High regulatory sensitivity (HIPAA, credential verification)
- Fewer applications (2-5/week) but very detailed forms
- Pain: Long compliance questionnaires, license number entry

## Critical Risks & Mitigations

### Risk 1: LinkedIn Account Bans (CRITICAL)
**Impact:** User loses access to primary job search platform
**Mitigation:**
- Defer LinkedIn Easy Apply to Phase 2.5 (after v1.0 validation)
- Study LinkedIn's detection patterns before implementing
- Implement conservative rate limiting (max 3 Easy Apply/hour)
- Add disclaimer: "Use at your own risk, LinkedIn TOS may prohibit automation"

### Risk 2: Chrome Web Store Rejection (HIGH)
**Impact:** Cannot distribute extension, project fails
**Mitigation:**
- Follow Manifest v3 best practices (no remote code execution)
- Minimal permissions (activeTab, storage, no broad host access)
- Clear privacy policy (no data collection beyond local storage)
- Never auto-submit forms (requires explicit user click)
- Submit for review early (Phase 3) to identify issues

### Risk 3: Shadow DOM Complexity (MEDIUM)
**Impact:** Autofill fails on 50% of Workday forms
**Mitigation:**
- Deep dive into Workday's Shadow DOM structure (Phase 1)
- Use `attachShadow` mode detection + `shadowRoot` traversal
- Fallback to label-based matching if ID selectors fail
- Test on 5+ real Workday job postings before launch

### Risk 4: AI Hallucination in Answers (MEDIUM)
**Impact:** User submits wrong information, damages reputation
**Mitigation:**
- Always show AI draft BEFORE filling form (never silent fill)
- Add placeholders like `[INSERT SPECIFIC METRIC]` for unknowns
- Provide "edit draft" button before autofill
- Add disclaimer: "AI-generated draft — always review before submitting"

### Risk 5: False Positive ATS Detection (LOW)
**Impact:** Extension activates on non-job-application pages
**Mitigation:**
- Multi-signal detection (URL pattern + DOM structure + page title)
- Require 3/3 signals for activation
- Add manual disable button if user reports false positive

## Development Phases

### Phase 0: Foundation & Setup (Week 1)
- WXT project scaffolding
- TypeScript config, ESLint, Prettier
- Chrome extension manifest (Manifest v3)
- Basic popup UI (React + Tailwind)
- Git repo + commit conventions

### Phase 1: Resume Parsing (Week 2)
- PDF/DOCX file upload
- Text extraction (pdf.js + mammoth.js)
- Structured profile parser (name, email, phone, experience, education, skills)
- Profile editor UI (manual corrections)
- Encrypted storage (Web Crypto API)

### Phase 2: ATS Detection (Week 3)
- Workday pattern detection (URL + Shadow DOM markers)
- Greenhouse pattern detection (iframe + data attributes)
- Lever pattern detection (CSS classes + form structure)
- Content script injection (lazy, per-tab)
- Detection confidence scoring

### Phase 3: Autofill Engine (Week 4-5)
- Field mapping logic (profile key → form field)
- Workday autofill (Shadow DOM traversal)
- Greenhouse autofill (iframe messaging)
- Lever autofill (standard DOM)
- Confidence threshold (skip if <70% match)
- Visual feedback (highlight filled fields)

### Phase 4: AI Integration (Week 6)
- OpenAI/Claude API client (user-provided key)
- Prompt template system (role-specific)
- Draft generation UI (show before fill)
- Context extraction (job description → prompt)
- Error handling (API failures, rate limits)

### Phase 5: Application Tracking (Week 7)
- Track applied jobs (company, role, date, status)
- View application history (popup UI)
- Duplicate detection (already applied warning)
- Export data (CSV/JSON)

### Phase 6: Polish & Launch (Week 8)
- E2E testing on real job postings
- Chrome Web Store submission
- User documentation (README, FAQ)
- Beta user recruitment (5-10 users)
- Bug fixes from beta feedback

## Architectural Principles

### 1. Content Script Isolation
Content scripts run in isolated worlds — cannot access page's JavaScript, only DOM. Use message passing to background service worker for storage/API calls.

### 2. Lazy Activation
Never inject content scripts on every page. Wait for ATS detection signals, then inject. Reduces memory footprint and avoids false positives.

### 3. Encryption by Default
All sensitive data (profile, API keys) encrypted with AES-GCM using Web Crypto API. Keys derived from user password (optional) or browser-generated.

### 4. Offline-First
No network calls except AI API (user-initiated). All functionality works without internet for profile management and tracking.

### 5. Graceful Degradation
If AI API fails → show manual input option. If autofill fails → show manual fill button. Never block user from applying.

### 6. No Remote Code
Manifest v3 requires no remote code execution. All logic bundled at build time. No `eval()`, no inline scripts in HTML.

## Design System

### Color Palette
- Primary: Blue (#3B82F6) — Trust, professionalism
- Success: Green (#10B981) — Filled fields, successful actions
- Warning: Amber (#F59E0B) — Low confidence fills, missing data
- Error: Red (#EF4444) — API errors, detection failures
- Neutral: Gray (#6B7280) — Text, borders, backgrounds

### Typography
- Font: Inter (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI")
- Sizes: 12px (small), 14px (body), 16px (headings), 20px (titles)

### Components (shadcn/ui)
- Button, Input, Textarea, Select, Checkbox, Radio
- Card, Dialog, Tooltip, Badge, Alert
- Tabs, Accordion, Dropdown, Toast

### Spacing
- Tailwind's default spacing scale (4px base unit)
- Consistent padding/margin (p-4, m-2, gap-3)

## Quality Standards

### Code Quality
- TypeScript strict mode (no `any`, explicit return types)
- 80%+ test coverage for core logic (parsing, detection, autofill)
- ESLint zero warnings
- Prettier auto-format on save

### Performance
- Content script injection <100ms
- Autofill execution <500ms
- AI draft generation <5s (depends on API)
- Extension popup opens <200ms

### Accessibility
- WCAG 2.1 AA compliance for popup/options UI
- Keyboard navigation support (tab order, focus styles)
- Screen reader labels for all interactive elements

### Security
- No inline scripts (CSP compliance)
- XSS prevention (sanitize all user input)
- Encrypted storage (AES-GCM 256-bit)
- Minimal permissions (activeTab, storage only)

## Success Metrics

### Product Metrics
- **Adoption:** 100 active users in first month
- **Retention:** 60% return week-over-week
- **Efficiency:** 60%+ reduction in time per application (user surveys)
- **Accuracy:** 85%+ autofill accuracy (correct field mapping)

### Technical Metrics
- **Reliability:** <5% error rate on supported ATS platforms
- **Performance:** P95 autofill latency <1s
- **Test Coverage:** 80%+ for core modules
- **Zero critical bugs** (data loss, security vulnerabilities)

## Open Questions

1. **API Key Management:** Should we offer a "lite mode" without AI (just autofill)?
2. **Rate Limiting:** Is 10 apps/day too restrictive? Too permissive?
3. **Data Retention:** How long should we keep application history? 30 days? 90 days? Forever?
4. **Browser Support:** Should we prioritize Firefox v1.1 or Safari v1.2?
5. **Pricing:** Freemium (10 apps/month free) or one-time purchase ($29)?

---

*This document is the source of truth for all project decisions. When in doubt, refer back here.*
