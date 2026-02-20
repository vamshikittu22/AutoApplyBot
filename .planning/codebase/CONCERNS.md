# Codebase Concerns

**Analysis Date:** 2026-02-20

## Tech Debt

**No implementation yet — Planning phase only:**
- Issue: Project is in planning/documentation phase with no source code implemented
- Files: Documentation only (`PROJECT_PLAN.md`, `PRD.md`, `TECHSTACK.md`, `AGENTS.md`, `MVC.md`)
- Impact: All implementation risks below are **proactive concerns** based on planned architecture
- Fix approach: Address during implementation phases 0-6

---

**Shadow DOM traversal complexity (Workday platform):**
- Issue: Workday uses heavy Shadow DOM encapsulation requiring recursive traversal to access form fields
- Files: Will affect `src/lib/ats/workday.ts` (not yet created)
- Impact: High complexity, brittle if DOM structure changes, potential performance overhead from recursive searches
- Fix approach: Build robust shadow DOM utility (`src/lib/ats/shadow-dom-utils.ts`) with caching, test extensively on real Workday sites, implement fallback to Helper Mode if detection fails

---

**Dynamic field ID brittleness:**
- Issue: Workday and Indeed generate randomized field IDs like `input-abc123xyz` that change on every page load
- Files: `src/lib/ats/workday.ts`, `src/constants/ats-selectors.ts` (not yet created)
- Impact: Selector-based autofill will break frequently; requires semantic field detection by label text, aria-label, or placeholder
- Fix approach: Implement fallback chain (aria-label → label[for] → placeholder → proximity search), maintain per-platform selector strategies with confidence scoring

---

**ATS platform markup volatility:**
- Issue: ATS platforms (Workday, Greenhouse, Lever) can change form markup without notice, breaking autofill logic
- Files: All files in `src/lib/ats/` (not yet created)
- Impact: Extension could mis-fill fields or fail silently after ATS updates; user trust risk
- Fix approach: Implement confidence scoring per field, graceful degradation to Helper Mode when detection confidence <70%, field mapping validation before fill, user feedback widget to detect breakage early

---

**Bot detection exposure:**
- Issue: Instant field filling or improper event dispatching can trigger bot detection on LinkedIn, Indeed, or Workday
- Files: `src/lib/autofill/autofill-engine.ts` (not yet created)
- Impact: Could cause user account flags or application rejections
- Fix approach: Implement human-like typing simulation (50-150ms per character), proper event sequence (keydown → input → keyup → change), random delays between fields (500-2000ms), field focus/blur patterns

---

**Mock AI to real AI transition technical debt:**
- Issue: Phase 3 builds mock AI system first, then adds real AI as optional upgrade; maintaining two code paths increases complexity
- Files: `src/lib/ai/` (not yet created)
- Impact: Duplicate logic for mock vs. real responses, testing burden, potential bugs in mode switching
- Fix approach: Design clean abstraction layer (`AIProvider` interface) from start, use strategy pattern to switch providers, ensure mock responses match real response shape exactly

---

**Encryption key management complexity:**
- Issue: Profile data encrypted with Web Crypto API requires key derivation and secure storage; key loss = data loss
- Files: `src/lib/storage/encryption.ts` (not yet created)
- Impact: User could lose all profile data if encryption key is lost or corrupted; no recovery mechanism in v1
- Fix approach: Derive key from stable device identifier, store key derivation salt in chrome.storage, implement data export (unencrypted JSON) as backup option, clear warning on data deletion

---

**No backend means no centralized error tracking:**
- Issue: Local-first architecture means no way to aggregate errors across users in v1
- Files: All source files
- Impact: Hard to detect widespread issues like ATS markup changes affecting many users; relies on individual user feedback
- Fix approach: Implement detailed local error logging, in-extension feedback widget ("Did this work?"), encourage users to report issues, consider opt-in anonymous telemetry in v2

---

## Known Bugs

**No bugs yet — no implementation exists:**
- Current status: Project is in planning phase (Phase 0 not started)
- Files: No source code written
- Note: This section will be populated during Phases 0-6 as issues are discovered

---

## Security Considerations

**API key exposure via Chrome DevTools:**
- Risk: User's OpenAI/Claude API key stored encrypted in chrome.storage.local is accessible via Chrome DevTools → Application → Storage
- Files: `src/lib/storage/encryption.ts`, `src/lib/ai/` (not yet created)
- Current mitigation: Web Crypto API encryption, key never sent anywhere except directly to AI provider
- Recommendations: Add clear warning in settings UI ("Keep DevTools closed when using public computers"), consider additional obfuscation layer, document risk in privacy policy

---

**Content script injection scope:**
- Risk: Extension requests `activeTab` permission and injects content scripts on ATS domains; malicious ATS site could attempt to exfiltrate profile data via injected script
- Files: `manifest.json`, `src/entrypoints/content/` (not yet created)
- Current mitigation: Content scripts only activate on known ATS URL patterns, profile data fetched only on user click
- Recommendations: Implement strict Content Security Policy (CSP), validate ATS domain against allowlist before injection, never expose full profile to page context (only to isolated content script)

---

**Clipboard access security:**
- Risk: Helper Mode provides "click to copy" snippets; clipboard could be monitored by malicious page scripts
- Files: `src/components/helper-mode/` (not yet created)
- Current mitigation: User explicitly clicks copy button, only copies requested snippet (not full profile)
- Recommendations: Clear clipboard after 30 seconds, show toast notification on copy, never auto-paste

---

**Man-in-the-Middle on AI API calls:**
- Risk: Direct API calls from extension to OpenAI/Anthropic could be intercepted on untrusted networks
- Files: `src/lib/ai/` (not yet created)
- Current mitigation: HTTPS enforced by OpenAI/Anthropic endpoints
- Recommendations: Add network security check (warn if on public WiFi when using AI features), consider certificate pinning in v2

---

**Profile data in memory exposure:**
- Risk: Decrypted profile data held in extension memory could be accessed by other extensions with debugger permission
- Files: `src/lib/storage/`, `src/hooks/useProfile.ts` (not yet created)
- Current mitigation: Data decrypted only when needed, not stored globally
- Recommendations: Clear sensitive data from memory after use, implement auto-lock after 15 minutes of inactivity in v2

---

**Chrome Web Store account compromise:**
- Risk: If developer's Chrome Web Store account is compromised, malicious update could be pushed to all users
- Files: Entire extension codebase
- Current mitigation: None in v1 (relies on Chrome Web Store account 2FA)
- Recommendations: Enable 2FA on Chrome Web Store developer account, implement code signing, maintain public changelog with hashes

---

## Performance Bottlenecks

**Recursive Shadow DOM traversal on complex pages:**
- Problem: Workday pages can have deeply nested Shadow DOM (5-10 levels); recursive search is O(n) where n = total DOM nodes
- Files: `src/lib/ats/shadow-dom-utils.ts` (not yet created)
- Cause: No shadow root caching, traversal runs on every field detection attempt
- Improvement path: Cache shadow roots per page, limit recursion depth to 5 levels, early exit on first match, run traversal once and store field references

---

**MutationObserver firing on entire document:**
- Problem: AGENTS.md specifies "scoped to form elements only" but implementation risk of attaching to entire document
- Files: `src/entrypoints/content/` (not yet created)
- Cause: Incorrect MutationObserver target selection could cause observer to fire on every DOM change (ads, analytics, etc.)
- Improvement path: Attach MutationObserver only to detected form containers, disconnect observer after autofill completes, use `subtree: false` when possible

---

**Human-like typing delays cause slow autofill:**
- Problem: 50-150ms per character + 500-2000ms per field = 10-20 seconds for 10 fields
- Files: `src/lib/autofill/autofill-engine.ts` (not yet created)
- Cause: Bot detection mitigation requires realistic typing speed
- Improvement path: Allow user to toggle "Fast Mode" (no delays, higher risk) vs. "Safe Mode" (full delays), batch-fill fields that don't trigger bot detection (hidden fields, dropdowns)

---

**Profile decryption on every autofill:**
- Problem: Web Crypto API decryption is CPU-intensive (AES-GCM); doing it on every page load adds latency
- Files: `src/lib/storage/encryption.ts` (not yet created)
- Cause: No caching of decrypted profile data in memory
- Improvement path: Decrypt once on extension popup open, cache in memory for 15 minutes, clear on browser idle

---

**Large application tracker list rendering:**
- Problem: After 100+ applications, rendering full list in popup UI could cause jank
- Files: `src/components/tracker/` (not yet created)
- Cause: No virtualization or pagination on tracker list
- Improvement path: Implement virtual scrolling (react-window), paginate by date range, lazy load old applications

---

## Fragile Areas

**Workday platform detection and autofill:**
- Files: `src/lib/ats/workday.ts` (not yet created, highest priority in Phase 2)
- Why fragile: Heavy Shadow DOM, dynamic IDs, multi-step forms with conditional fields, iframe isolation, highest complexity (9/10 per `RESEARCH_REPORT.md`)
- Safe modification: Always test on 10+ real Workday URLs (different companies use different Workday versions), maintain fallback to Helper Mode, never assume field structure is stable
- Test coverage: Must achieve 95%+ detection accuracy per `PROJECT_PLAN.md` Phase 2 Definition of Done

---

**Resume text parser:**
- Files: `src/lib/parser/resume-parser.ts` (not yet created, Phase 1 deliverable)
- Why fragile: Resume formats are highly variable (chronological vs. functional, bullet styles, date formats, international formats)
- Safe modification: Use regex fallback chains, validate extracted data before saving, flag low-confidence fields for user review, test on 20+ diverse resume samples
- Test coverage: Must achieve 75%+ parsing accuracy per `PROJECT_PLAN.md` Phase 1 Definition of Done

---

**AI prompt engineering:**
- Files: `src/lib/ai/prompt-builder.ts` (not yet created, Phase 3 deliverable)
- Why fragile: Role-specific prompts must produce demonstrably different output (Tech vs. Healthcare vs. Finance); subtle prompt changes can cause generic responses
- Safe modification: Maintain prompt templates per role in separate files, version prompts, A/B test prompt changes, require placeholder markers in all AI outputs
- Test coverage: Manual verification with example questions for each role type per `AGENTS.md` Quality Rules

---

**Field mapping confidence scoring:**
- Files: `src/lib/autofill/field-mapper.ts` (not yet created, Phase 2 critical component)
- Why fragile: Low confidence threshold (<70%) causes skipped fields; high threshold (>90%) causes mis-fills; balance is critical
- Safe modification: Log all confidence scores and outcomes to local storage, allow user to adjust threshold in settings, default to conservative (skip on doubt)
- Test coverage: Test with ambiguous field labels, multi-language forms, unusual field types

---

**Chrome Storage API quota limits:**
- Files: `src/lib/storage/` (not yet created)
- Why fragile: chrome.storage.local has 10MB quota; large application tracker (1000+ applications) + profile + field mappings could hit limit
- Safe modification: Implement storage usage monitoring, warn user at 80% quota, auto-archive old applications (>6 months) to exported JSON, compress stored data
- Test coverage: Test with 500+ logged applications to verify quota handling

---

## Scaling Limits

**chrome.storage.local quota (10MB):**
- Current capacity: 0 bytes (not yet implemented)
- Limit: 10MB total for all extension data (profile + applications + field mappings + settings)
- Scaling path: Implement data compression, archive old applications to exported files, add opt-in cloud sync in v2 (Supabase per `TECHSTACK.md` deferred features)

---

**Single-tab operation only:**
- Current capacity: Extension operates one ATS page at a time (activeTab permission)
- Limit: Cannot autofill multiple job applications in parallel across tabs
- Scaling path: Not a problem for v1 (user can only review one application at a time anyway); parallel autofill is out of scope and risky

---

**Profile data model inflexibility:**
- Current capacity: Single hardcoded profile schema (`personal`, `workHistory`, `education`, `skills`, `links`, `domainExtras`)
- Limit: Cannot store custom fields or multi-profile scenarios (job seeker vs. freelancer resume)
- Scaling path: Add `customFields: Record<string, any>` to profile schema in v2, implement multi-profile management in v2 per `MVC.md` deferred features

---

**ATS platform coverage (3 platforms in v1):**
- Current capacity: Workday, Greenhouse, Lever only
- Limit: 75% of job seekers encounter at least one unsupported platform (LinkedIn Easy Apply, Indeed, Ashby, etc.)
- Scaling path: Add LinkedIn Easy Apply in v2 (requires ban risk mitigation research), add Indeed Apply and Ashby per `TECHSTACK.md` and `MVC.md` v2 scope

---

**No analytics or usage tracking:**
- Current capacity: Zero visibility into how users interact with extension (which ATS platforms fail most, which fields mis-fill frequently)
- Limit: Cannot prioritize bug fixes or feature improvements based on data
- Scaling path: Implement opt-in anonymous telemetry in v2 (e.g., "ATS platform X detected, autofill success rate Y%"), aggregate on backend

---

## Dependencies at Risk

**WXT framework (github.com/wxt-dev/wxt):**
- Risk: Relatively new framework (9.2K stars per `RESEARCH_REPORT.md`); less mature than Plasmo
- Impact: Breaking changes in WXT updates could affect build system, manifest generation, or content script injection
- Migration plan: Pin WXT version in package.json, test updates in dev environment before upgrading, maintain migration guide in docs, fallback to manual Vite + Manifest v3 setup if WXT is abandoned

---

**OpenAI/Anthropic API stability (optional dependency):**
- Risk: AI providers can change API pricing, rate limits, or deprecate models (e.g., GPT-4o-mini → GPT-5)
- Impact: User's AI features could break or become expensive
- Migration plan: Support multiple AI providers (OpenAI + Anthropic already planned), allow user to switch providers in settings, implement graceful fallback to mock responses if API call fails, add API error handling per `AGENTS.md` Error Handling rules

---

**Chrome Manifest v3 policy changes:**
- Risk: Chrome could tighten extension permissions or restrict content script capabilities (history: Manifest v2 sunset in 2024)
- Impact: Extension could be removed from Web Store or require major rewrite
- Migration plan: Stay within minimal permissions (`activeTab`, `storage` only per `TECHSTACK.md`), avoid experimental APIs, monitor Chrome Extensions Developer Relations blog, maintain fallback to web app version in v2

---

**Web Crypto API deprecation:**
- Risk: Low risk but theoretically possible if browser vendors move to different encryption standard
- Impact: Encrypted profile data could become inaccessible
- Migration plan: Implement data export to unencrypted JSON as backup, add migration utility in future version, use stable crypto primitives (AES-GCM is NIST standard)

---

**React 18 + TypeScript 5.x:**
- Risk: React 19 could introduce breaking changes; TypeScript 6.x could have strict mode changes
- Impact: Build failures or type errors on dependency updates
- Migration plan: Pin major versions in package.json, use Renovate/Dependabot for gradual updates, maintain 80% test coverage target to catch breaking changes

---

## Missing Critical Features

**No data recovery mechanism:**
- Problem: If encryption key is lost or corrupted, all profile data is permanently lost
- Blocks: User trust, enterprise adoption, users with multiple devices
- Priority: Medium (add in Phase 1 alongside encryption implementation)
- Fix approach: Implement unencrypted data export to JSON in settings, show export reminder on first profile save

---

**No CAPTCHA detection:**
- Problem: Extension could attempt autofill during CAPTCHA challenge, causing form errors or ban flags
- Blocks: Safe operation on sites with aggressive bot detection (LinkedIn, Indeed)
- Priority: High (add in Phase 4 alongside safety controls)
- Fix approach: Detect CAPTCHA widgets (reCAPTCHA, hCaptcha, Cloudflare Turnstile) by DOM signature, pause all autofill when CAPTCHA present, show user notification per `AGENTS.md` Safety Rules

---

**No field validation before autofill:**
- Problem: Extension could fill email into phone field or vice versa if field detection confidence is wrong
- Blocks: User trust, autofill accuracy goal (85%+ per `PROJECT_PLAN.md`)
- Priority: High (add in Phase 2 alongside autofill engine)
- Fix approach: Validate field type (email regex, phone regex, date format) before filling, skip field if validation fails, highlight skipped fields in yellow

---

**No multi-step form handling:**
- Problem: Workday and Greenhouse use multi-page forms; extension must detect "Next" button and pause for user navigation
- Blocks: Workday autofill (50% of target market per `RESEARCH_REPORT.md`)
- Priority: High (add in Phase 2 Workday implementation)
- Fix approach: Detect form progress indicators, show "Continue to next page" prompt instead of auto-clicking, save partial form state in chrome.storage

---

**No offline mode indicator:**
- Problem: User may not realize AI features require internet; clicking "Suggest Answer" could fail silently
- Blocks: User experience, AI feature adoption
- Priority: Medium (add in Phase 3 AI implementation)
- Fix approach: Check `navigator.onLine` before AI calls, show offline indicator in extension popup, provide clear error message per `TECHSTACK.md` AI Activation rules

---

**No application duplicate detection:**
- Problem: User could log same job multiple times if they visit same URL multiple times
- Blocks: Clean tracker data, accurate application count
- Priority: Low (add in Phase 4 tracker implementation)
- Fix approach: Hash job URL + company + title, check for duplicate before logging, prompt user "Already logged on [date], log again?"

---

**No browser compatibility (Firefox, Safari):**
- Problem: Extension only works in Chrome/Edge (Manifest v3, chrome.storage API)
- Blocks: 30%+ of browser market (Firefox 7%, Safari 20%+ on Mac)
- Priority: Low (explicitly deferred to v2 per `MVC.md` and `STATE.md`)
- Fix approach: Use WebExtension Polyfill for cross-browser APIs, test on Firefox Developer Edition, publish to Firefox Add-ons store in v2

---

## Test Coverage Gaps

**No tests yet — implementation not started:**
- What's not tested: All functionality (project is in planning phase)
- Files: No source files exist
- Risk: All implementation risks are hypothetical until code is written
- Priority: High (write tests during each phase per `AGENTS.md` Testing Requirements)

---

**ATS detection logic (Phase 2 critical):**
- What's not tested: Workday Shadow DOM detection, Greenhouse iframe handling, Lever form structure parsing
- Files: `src/lib/ats/workday.test.ts`, `src/lib/ats/greenhouse.test.ts`, `src/lib/ats/lever.test.ts` (not yet created)
- Risk: False positives (detecting non-ATS pages) or false negatives (missing real ATS forms) breaks core value proposition
- Priority: P0 (must achieve 95%+ detection accuracy per `PROJECT_PLAN.md` Phase 2 Definition of Done)
- Test approach: Vitest unit tests with mocked DOM, Playwright E2E tests on 10+ real URLs per platform per `TECHSTACK.md` Testing stack

---

**Field mapping and autofill engine (Phase 2 critical):**
- What's not tested: Field label matching, confidence scoring, Shadow DOM field injection, event dispatching
- Files: `src/lib/autofill/autofill-engine.test.ts`, `src/lib/autofill/field-mapper.test.ts` (not yet created)
- Risk: Mis-filled fields cause user to submit incorrect data, damaging trust and causing application rejections
- Priority: P0 (must achieve 85%+ field accuracy per `PROJECT_PLAN.md` Phase 2 Definition of Done)
- Test approach: Unit tests with diverse field label variations, E2E tests on real forms with known expected mappings

---

**Encryption and decryption (Phase 1 critical):**
- What's not tested: Web Crypto API key derivation, AES-GCM encryption/decryption, key storage
- Files: `src/lib/storage/encryption.test.ts` (not yet created)
- Risk: Data corruption or loss if encryption implementation has bugs; user's entire profile becomes unusable
- Priority: P0 (data loss is unacceptable)
- Test approach: Unit tests with sample profile data, test key derivation consistency, test encryption round-trip, test error handling on corrupted data

---

**Resume text parsing (Phase 1 critical):**
- What's not tested: Regex patterns for name/email/phone extraction, work history parsing, education parsing, skills extraction
- Files: `src/lib/parser/resume-parser.test.ts` (not yet created)
- Risk: Poor parsing accuracy frustrates users during onboarding, forces manual data entry
- Priority: P0 (must achieve 75%+ parsing accuracy per `PROJECT_PLAN.md` Phase 1 Definition of Done)
- Test approach: Test with 20+ real resume samples (different formats, industries, countries), validate extracted fields against expected output

---

**AI prompt builder and response handling (Phase 3 important):**
- What's not tested: Role-specific prompt differences, placeholder marker insertion, mock vs. real AI switching
- Files: `src/lib/ai/prompt-builder.test.ts`, `src/lib/ai/ai-provider.test.ts` (not yet created)
- Risk: Generic AI responses fail quality bar, role-specific tuning doesn't work as expected per `AGENTS.md` Quality Rules
- Priority: P1 (important for retention but not blocking if mock responses are good)
- Test approach: Manual verification with example questions per role (Tech, Healthcare, Finance), unit tests verify prompt template structure

---

**Chrome Storage API usage (all phases):**
- What's not tested: Profile save/load, application logging, field mapping persistence, quota handling
- Files: `src/lib/storage/storage.test.ts` (not yet created)
- Risk: Data loss, quota exceeded errors, race conditions on concurrent writes
- Priority: P0 (storage is critical infrastructure)
- Test approach: Unit tests with WXT test utilities per `TECHSTACK.md`, test quota limits with large datasets, test concurrent read/write scenarios

---

**Content script injection and cleanup (Phase 2):**
- What's not tested: Content script lifecycle, MutationObserver attachment/detachment, memory leaks from observers
- Files: `src/entrypoints/content/content.test.ts` (not yet created)
- Risk: Extension degrades browser performance, observers left attached cause memory leaks
- Priority: P1 (performance is important but not blocking if monitored)
- Test approach: Playwright E2E tests verify script injection, manual testing with Chrome DevTools Performance tab, verify observer cleanup on page unload

---

**Error handling and graceful degradation (all phases):**
- What's not tested: Network errors on AI calls, chrome.storage errors, ATS detection failures, field mapping confidence <70%
- Files: All source files per `AGENTS.md` Error Handling rules
- Risk: Extension crashes or fails silently instead of showing helpful error messages
- Priority: P1 (good UX but not blocking if basic error handling exists)
- Test approach: Unit tests with mocked errors, integration tests with network offline, test edge cases (empty profile, missing fields, etc.)

---

*Concerns audit: 2026-02-20*
