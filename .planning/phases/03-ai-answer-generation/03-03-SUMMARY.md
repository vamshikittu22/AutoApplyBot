---
phase: 03-ai-answer-generation
plan: 03
subsystem: ai
tags: [openai, anthropic, gpt-4o-mini, claude-3-5-sonnet, ai-providers, sdk-integration]

# Dependency graph
requires:
  - phase: 03-01
    provides: Base provider infrastructure, PromptBuilder, type system
  - phase: 03-02
    provides: PromptBuilder with system/user prompt generation
provides:
  - Real AI answer generation using OpenAI GPT-4o-mini
  - Real AI answer generation using Anthropic Claude 3.5 Sonnet
  - API key validation for both providers
  - Error handling (rate limits, auth errors, service errors)
  - Factory pattern for provider instantiation
affects: [03-04, 03-05]

# Tech tracking
tech-stack:
  added: [openai@6.25.0, @anthropic-ai/sdk@0.78.0]
  patterns:
    - Official SDK integration for browser environments
    - Parallel draft generation using Promise.all
    - dangerouslyAllowBrowser for Chrome extension context
    - Weighted error handling by status code
    - Placeholder validation with fallback reminder

key-files:
  created:
    - src/lib/ai/providers/integration.test.ts
    - src/lib/ai/providers/errors.test.ts
  modified:
    - src/lib/ai/providers/openai.ts
    - src/lib/ai/providers/anthropic.ts
    - src/lib/ai/factory.ts
    - src/lib/ai/index.ts
    - package.json (added AI SDKs)

key-decisions:
  - "Used official OpenAI and Anthropic SDKs instead of direct fetch calls"
  - "Set dangerouslyAllowBrowser: true for both providers (required for Chrome extension)"
  - "Generate 3 variants in parallel using PromptBuilder variations"
  - "Temperature 0.7 for balanced creativity/consistency"
  - "Max tokens: 400 for essays, 200 for short answers"
  - "API key validation uses lightweight calls (list models for OpenAI, minimal message for Anthropic)"

patterns-established:
  - "Provider error handling: categorize by status code (429→rate limit, 401/403→auth, 500/503→service)"
  - "Draft validation: check for placeholders, append reminder if missing"
  - "Factory fallback: return MockProvider when API key not found"

# Metrics
duration: 9 min
completed: 2026-02-26
---

# Phase 3 Plan 3: Real AI Providers (OpenAI + Anthropic) Summary

**OpenAI GPT-4o-mini and Anthropic Claude-3.5-Sonnet integration with official SDKs, parallel draft generation, API key validation, and comprehensive error handling**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-26T05:02:32Z
- **Completed:** 2026-02-26T05:11:26Z
- **Tasks:** 6
- **Files modified:** 6

## Accomplishments

- Implemented OpenAIProvider using official `openai@6.25.0` SDK with GPT-4o-mini model
- Implemented AnthropicProvider using official `@anthropic-ai/sdk@0.78.0` with Claude-3.5-Sonnet
- Both providers generate 3 distinct draft variants in parallel using PromptBuilder
- API key validation for both providers (lightweight, non-intrusive calls)
- Comprehensive error handling (rate limits, authentication, service unavailability)
- Factory pattern updated to instantiate real providers with fallback to mock
- Integration tests (skipped by default, require API keys)
- Error handling unit tests (4/4 passing)

## Task Commits

Each task was committed atomically:

1. **Tasks 1-2: Implement OpenAI and Anthropic providers** - `d07e45b` (feat)
   - Installed OpenAI and Anthropic SDKs
   - Implemented full provider classes extending BaseAIProvider
   - Generate 3 variants using PromptBuilder with parallel Promise.all
   - Set dangerouslyAllowBrowser: true for extension context
   - Added placeholder validation with fallback reminder

2. **Tasks 3-4: Update factory and exports** - `f88089c` (feat)
   - Uncommented provider instantiation in factory
   - Added fallback to MockProvider when no API key
   - Exported provider classes from index.ts

3. **Tasks 5-6: Create tests** - `0f08204` (test)
   - Created integration.test.ts (6 tests, skipped by default)
   - Created errors.test.ts (4 tests, all passing)
   - Fixed Anthropic dangerouslyAllowBrowser for test environment

**Plan metadata:** Will be committed with SUMMARY.md

## Files Created/Modified

- `src/lib/ai/providers/openai.ts` - OpenAI provider with GPT-4o-mini
- `src/lib/ai/providers/anthropic.ts` - Anthropic provider with Claude-3.5-Sonnet
- `src/lib/ai/factory.ts` - Factory with real provider instantiation
- `src/lib/ai/index.ts` - Exports for provider classes
- `src/lib/ai/providers/integration.test.ts` - Integration tests (skipped)
- `src/lib/ai/providers/errors.test.ts` - Error handling tests (passing)
- `package.json` - Added openai@6.25.0 and @anthropic-ai/sdk@0.78.0

## Decisions Made

**Use official SDKs instead of direct fetch calls**
- Rationale: SDKs handle retries, typing, and API changes automatically
- Impact: More robust error handling, better TypeScript types, less maintenance

**Set dangerouslyAllowBrowser: true for both providers**
- Rationale: Chrome extensions run in browser context but are sandboxed
- Impact: Required for OpenAI SDK, Anthropic SDK also needs it in test environment
- Security: User's API key stays in local Chrome Storage, never sent to our servers

**Generate 3 variants in parallel**
- Rationale: Faster UX (3 parallel calls vs 3 sequential), use PromptBuilder variations
- Impact: ~3x faster than sequential generation

**Temperature 0.7**
- Rationale: Balances creativity (variety between drafts) with consistency (professional quality)
- Impact: Drafts are distinct but maintain professional tone

**Max tokens: 400 for essays, 200 for short answers**
- Rationale: Short answers ~50-100 words, essays ~150-250 words. Buffer for safety.
- Impact: Cost-efficient token usage while allowing sufficient length

**API key validation with lightweight calls**
- Rationale: Don't waste tokens on validation, use minimal API surface
- Impact: OpenAI: list models (free), Anthropic: 10-token test message (minimal cost)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Issue 1: Anthropic SDK required dangerouslyAllowBrowser in test environment**
- Found during: Task 6 (error handling tests)
- Problem: Vitest runs in jsdom (browser-like), Anthropic SDK threw error
- Fix: Added `dangerouslyAllowBrowser: true` to both constructor and validateKey
- Verification: All 4 error handling tests pass
- No scope creep: This was necessary for tests to run

## User Setup Required

None - no external service configuration required.

Users will configure API keys through settings UI (Plan 03-05).

## Next Phase Readiness

**Ready for Plan 03-04: Question Detection & UI Integration**

This plan provides:
- ✅ Real AI providers fully implemented
- ✅ Factory pattern ready for UI consumption
- ✅ Error handling tested and working
- ✅ API key validation available for settings UI

Plan 03-04 can now:
- Detect questions on job application pages
- Call getAIProvider() to get configured provider
- Display "Suggest Answer" button
- Generate real AI drafts when user clicks button

## Self-Check

Verifying all claimed files and commits exist...

**Files created:**
- ✅ src/lib/ai/providers/integration.test.ts exists
- ✅ src/lib/ai/providers/errors.test.ts exists

**Files modified:**
- ✅ src/lib/ai/providers/openai.ts modified
- ✅ src/lib/ai/providers/anthropic.ts modified
- ✅ src/lib/ai/factory.ts modified
- ✅ src/lib/ai/index.ts modified

**Commits:**
- ✅ d07e45b: feat(03-03): implement OpenAI and Anthropic providers with official SDKs
- ✅ f88089c: feat(03-03): update factory and exports for real AI providers
- ✅ 0f08204: test(03-03): add integration and error handling tests for AI providers

## Self-Check: PASSED

All files exist, all commits present, all tests passing.

---
*Phase: 03-ai-answer-generation*
*Completed: 2026-02-26*
