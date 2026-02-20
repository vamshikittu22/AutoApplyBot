# Architecture

**Analysis Date:** 2026-02-20

## Pattern Overview

**Overall:** Browser Extension Architecture (Manifest V3) with Offline-First Client-Side Pattern

**Key Characteristics:**
- Content script injection model with lazy activation on ATS detection
- Local-first data persistence with encrypted storage
- No backend dependency for core features (profile, autofill, tracker)
- Optional online-only AI enhancement layer
- Event-driven communication between extension contexts (background, content, popup)

## Layers

**Extension Entry Points:**
- Purpose: Browser extension lifecycle management and context initialization
- Location: `src/entrypoints/`
- Contains: Background service worker, content scripts, popup UI, options page
- Depends on: Chrome Extension APIs, lib modules, components
- Used by: Browser runtime (Chrome/Edge)

**Background Service Worker:**
- Purpose: Minimal messaging hub and lifecycle coordinator
- Location: `src/entrypoints/background.ts`
- Contains: Message routing between content scripts and UI contexts
- Depends on: Chrome Storage API
- Used by: Content scripts, popup, options page

**Content Scripts:**
- Purpose: Page-level ATS detection, form manipulation, and autofill execution
- Location: `src/entrypoints/content/`
- Contains: ATS detection logic, DOM manipulation, field mapping, floating toolbar injection
- Depends on: `src/lib/ats/`, `src/lib/autofill/`, `src/lib/storage/`
- Used by: Injected into job application pages matching URL patterns

**UI Layer (React):**
- Purpose: User-facing interfaces for profile management, settings, and tracker
- Location: `src/entrypoints/popup/`, `src/entrypoints/options/`, `src/components/`
- Contains: React components, custom hooks, Zustand state management
- Depends on: `src/lib/storage/`, `src/hooks/`, shared components
- Used by: Extension popup and options page contexts

**Business Logic (Core Libraries):**
- Purpose: Platform-agnostic business logic for ATS handling, autofill, AI, parsing
- Location: `src/lib/`
- Contains: ATS platform adapters, autofill engine, AI prompt builder, resume parser, encryption utilities
- Depends on: Chrome Storage API, Web Crypto API, native browser APIs
- Used by: Content scripts, UI components, background worker

**Data Persistence:**
- Purpose: Encrypted local storage for profile, applications, settings
- Location: `src/lib/storage/`
- Contains: Chrome Storage API abstraction, Web Crypto encryption/decryption wrappers
- Depends on: Web Crypto API (AES-GCM), Chrome Storage API
- Used by: All layers requiring data persistence

**Type System:**
- Purpose: Shared TypeScript type definitions across all modules
- Location: `src/types/`
- Contains: Profile, ATS, Application, Settings type definitions
- Depends on: Nothing (pure type definitions)
- Used by: All TypeScript modules

**Configuration Layer:**
- Purpose: Static configuration for ATS patterns, field selectors, URL patterns
- Location: `src/constants/`
- Contains: ATS URL matching patterns, field selector maps, role category definitions
- Depends on: Nothing (static constants)
- Used by: ATS detection, autofill engine, content script injection rules

## Data Flow

**Autofill Flow (Core Feature):**

1. User navigates to job application page
2. WXT framework injects content script based on URL pattern match
3. Content script calls `src/lib/ats/` detection module
4. Detection module analyzes URL + DOM signature → returns ATS type or null
5. If supported ATS detected → inject floating toolbar component
6. User clicks "Autofill Profile" button
7. Content script sends message to background worker requesting profile
8. Background worker retrieves encrypted profile from Chrome Storage
9. Background worker decrypts profile using Web Crypto API
10. Background worker sends decrypted profile to content script
11. Content script passes profile to autofill engine (`src/lib/autofill/`)
12. Autofill engine loads ATS-specific field mapping template
13. Autofill engine writes values to DOM fields with confidence scoring
14. Content script highlights fields: green (filled), yellow (low confidence), red (error)
15. User reviews and manually submits form
16. Content script logs application to tracker in Chrome Storage

**AI Answer Generation Flow (Optional, Online-Only):**

1. Content script detects open-ended textarea field
2. "Suggest Answer" button appears next to field
3. User clicks button
4. Content script checks `navigator.onLine` status
5. If offline → show offline message, halt
6. Content script retrieves encrypted AI API key from Chrome Storage
7. If no key → prompt user to add key in settings, halt
8. Content script builds prompt from profile context + question text
9. Content script makes direct HTTP call to OpenAI/Anthropic API (user's own key)
10. AI provider returns response
11. Content script parses response into 2-3 draft options
12. Content script displays options in modal overlay
13. User selects option, edits, clicks "Insert"
14. Content script writes answer to field (never auto-types)

**State Management:**
- Zustand stores (in-memory): UI state for popup, sidebar visibility, current ATS type
- Chrome Storage (persistent): Profile, applications tracker, settings, field mappings
- No global state synchronization needed (each context is isolated)

## Key Abstractions

**ATSDetector:**
- Purpose: Polymorphic ATS platform detection and field mapping
- Examples: `src/lib/ats/workday.ts`, `src/lib/ats/greenhouse.ts`, `src/lib/ats/lever.ts`
- Pattern: Strategy pattern - each ATS has dedicated detector module with `detect()` and `getFieldMap()` methods

**AutofillEngine:**
- Purpose: Platform-agnostic field population with confidence scoring
- Examples: `src/lib/autofill/engine.ts`, `src/lib/autofill/field-writer.ts`
- Pattern: Command pattern - autofill actions are reversible operations

**EncryptedStorage:**
- Purpose: Type-safe encrypted persistence abstraction over Chrome Storage
- Examples: `src/lib/storage/profile.ts`, `src/lib/storage/encryption.ts`
- Pattern: Repository pattern with encryption middleware

**Profile:**
- Purpose: Normalized candidate data model
- Examples: `src/types/profile.ts`
- Pattern: Domain model with nested structures (personal, workHistory, education, skills)

## Entry Points

**Background Service Worker:**
- Location: `src/entrypoints/background.ts`
- Triggers: Browser startup, extension install/update, message from other contexts
- Responsibilities: Message routing, storage access coordination, lifecycle management

**Content Script (ATS Pages):**
- Location: `src/entrypoints/content/index.ts`
- Triggers: Page load on URLs matching ATS patterns (defined in `wxt.config.ts`)
- Responsibilities: ATS detection, toolbar injection, autofill execution, field monitoring

**Popup UI:**
- Location: `src/entrypoints/popup/index.tsx`
- Triggers: User clicks extension icon in toolbar
- Responsibilities: Tracker view, quick actions, application status display

**Options Page:**
- Location: `src/entrypoints/options/index.tsx`
- Triggers: User clicks "Settings" in popup or right-clicks extension icon → Options
- Responsibilities: Profile editor, API key configuration, site disable toggles, data export/delete

## Error Handling

**Strategy:** Defensive programming with graceful degradation

**Patterns:**
- Result type pattern for expected failures (ATS detection, field mapping)
- Custom error classes for domain-specific errors (ATSDetectionError, EncryptionError)
- Try-catch with explicit error logging at boundaries (API calls, storage operations)
- Fail-safe defaults: if ATS detection fails, activate Helper Mode instead of crashing
- Never throw errors that break the page - content scripts must be non-intrusive

## Cross-Cutting Concerns

**Logging:** Console logging in development mode only; error logs stored locally for debugging (opt-in)

**Validation:** Zod schema validation for user inputs in profile editor; runtime type checking at storage boundaries

**Authentication:** Not applicable - no user accounts in v1; all data is local per browser profile

**Authorization:** Not applicable - single-user, local extension

**Performance:** Lazy content script injection; MutationObserver scoped to form elements only; debounced field detection

**Security:** Web Crypto API (AES-GCM) for profile encryption; API keys stored encrypted; no data leaves user's device except AI API calls

---

*Architecture analysis: 2026-02-20*
