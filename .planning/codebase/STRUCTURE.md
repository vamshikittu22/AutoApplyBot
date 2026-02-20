# Codebase Structure

**Analysis Date:** 2026-02-20

## Directory Layout

```
AutoApplyBot/
├── .planning/              # GSD framework planning artifacts
├── .git/                   # Git repository metadata
├── src/                    # Source code (to be created in Phase 0)
│   ├── entrypoints/        # Browser extension entry points
│   │   ├── background.ts   # Service worker
│   │   ├── content/        # Content scripts
│   │   ├── popup/          # Extension popup (React app)
│   │   └── options/        # Settings page (React app)
│   ├── components/         # Shared React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core business logic
│   │   ├── ats/            # ATS detection per platform
│   │   ├── autofill/       # Autofill engine
│   │   ├── ai/             # AI prompt builder and API calls
│   │   ├── parser/         # Resume parsing
│   │   ├── storage/        # Chrome Storage + encryption
│   │   └── utils/          # Shared utilities
│   ├── types/              # TypeScript type definitions
│   └── constants/          # ATS patterns, field selectors
├── public/                 # Extension icons and static assets
├── tests/                  # Test suites
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright E2E tests
├── wxt.config.ts           # WXT framework configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
├── AGENTS.md               # Agent behavior rules
├── PROJECT_PLAN.md         # Master project plan
├── PRD.md                  # Product requirements
├── MVC.md                  # v1 scope definition
├── TECHSTACK.md            # Technology stack decisions
└── RESEARCH_REPORT.md      # Market research findings
```

## Directory Purposes

**`.planning/`:**
- Purpose: GSD framework metadata and phase tracking
- Contains: Codebase analysis docs, phase plans, roadmap, state tracking
- Key files: `STATE.md`, `ROADMAP.md`, `config.json`, `codebase/ARCHITECTURE.md`

**`src/entrypoints/`:**
- Purpose: Browser extension lifecycle entry points (Manifest V3)
- Contains: Background service worker, content script injectors, React app entry points for popup/options
- Key files: `background.ts`, `content/index.ts`, `popup/index.tsx`, `options/index.tsx`

**`src/entrypoints/content/`:**
- Purpose: Content scripts that run on job application pages
- Contains: ATS detection orchestration, toolbar injection, autofill coordination
- Key files: Content script main entry, helper mode sidebar component

**`src/entrypoints/popup/`:**
- Purpose: Extension popup UI (opened from browser toolbar)
- Contains: React app for tracker view, quick actions, application list
- Key files: `index.tsx`, popup-specific components

**`src/entrypoints/options/`:**
- Purpose: Extension settings page (full-page UI)
- Contains: React app for profile editor, API key settings, preferences
- Key files: `index.tsx`, profile editor components

**`src/components/`:**
- Purpose: Shared React components used across popup, options, and injected toolbars
- Contains: Field highlighters, sidebar, toolbar, modal overlays, tracker list items
- Key files: Reusable UI components following React functional component pattern

**`src/hooks/`:**
- Purpose: Custom React hooks for shared stateful logic
- Contains: `useProfile`, `useTracker`, `useATS`, `useAutofill`, `useAI`
- Key files: Custom hooks encapsulating Chrome Storage access, Zustand stores

**`src/lib/ats/`:**
- Purpose: ATS platform-specific detection and field mapping
- Contains: One module per supported ATS (Workday, Greenhouse, Lever)
- Key files: `workday.ts`, `greenhouse.ts`, `lever.ts`, `detector.ts`

**`src/lib/autofill/`:**
- Purpose: Platform-agnostic autofill engine
- Contains: Field writing logic, undo system, confidence scoring, field highlighting
- Key files: `engine.ts`, `field-writer.ts`, `confidence.ts`, `undo.ts`

**`src/lib/ai/`:**
- Purpose: AI answer generation system
- Contains: Prompt builder, API client wrappers, offline guards, mock response system
- Key files: `prompt-builder.ts`, `openai-client.ts`, `anthropic-client.ts`, `mock-responses.ts`

**`src/lib/parser/`:**
- Purpose: Resume text parsing to structured profile
- Contains: Text-based resume parser (v1), future PDF/DOCX parsers (v2)
- Key files: `text-parser.ts`, `profile-extractor.ts`

**`src/lib/storage/`:**
- Purpose: Encrypted Chrome Storage abstraction layer
- Contains: Storage wrappers, Web Crypto encryption/decryption, type-safe accessors
- Key files: `encryption.ts`, `profile.ts`, `applications.ts`, `settings.ts`

**`src/lib/utils/`:**
- Purpose: Shared utility functions
- Contains: DOM helpers, string formatters, date utilities, validation helpers
- Key files: Utility modules used across multiple layers

**`src/types/`:**
- Purpose: All TypeScript type definitions and interfaces
- Contains: Profile types, ATS types, Application types, Settings types, Result types
- Key files: `profile.ts`, `ats.ts`, `application.ts`, `settings.ts`, `common.ts`

**`src/constants/`:**
- Purpose: Static configuration and constants
- Contains: ATS URL patterns, field selector maps, role categories, confidence thresholds
- Key files: `ats-patterns.ts`, `field-selectors.ts`, `roles.ts`

**`public/`:**
- Purpose: Static assets for browser extension
- Contains: Extension icons (16x16, 48x48, 128x128), manifest JSON overrides
- Key files: Icon files in PNG format

**`tests/unit/`:**
- Purpose: Vitest unit tests for business logic
- Contains: Tests for ATS detection, field mapping, encryption, parsing
- Key files: `*.test.ts` files co-located with source or mirrored structure

**`tests/e2e/`:**
- Purpose: Playwright end-to-end tests on real ATS pages
- Contains: Full user flow tests for autofill, AI answers, tracker logging
- Key files: `*.spec.ts` files organized by feature area

## Key File Locations

**Entry Points:**
- `src/entrypoints/background.ts`: Service worker - message routing, storage coordination
- `src/entrypoints/content/index.ts`: Content script injected into ATS pages
- `src/entrypoints/popup/index.tsx`: Extension popup React app
- `src/entrypoints/options/index.tsx`: Settings page React app

**Configuration:**
- `wxt.config.ts`: WXT framework configuration (entry points, manifest, build options)
- `tsconfig.json`: TypeScript compiler configuration (strict mode enabled)
- `tailwind.config.ts`: Tailwind CSS configuration
- `package.json`: Dependencies, scripts, project metadata

**Core Logic:**
- `src/lib/ats/detector.ts`: Main ATS detection orchestrator
- `src/lib/autofill/engine.ts`: Autofill execution engine
- `src/lib/storage/encryption.ts`: Web Crypto API encryption wrapper
- `src/lib/ai/prompt-builder.ts`: AI prompt construction logic

**Testing:**
- `tests/unit/ats/workday.test.ts`: Workday ATS detection tests
- `tests/e2e/workday-autofill.spec.ts`: End-to-end autofill flow test

**Documentation:**
- `PROJECT_PLAN.md`: Master plan and phased delivery
- `PRD.md`: Product requirements document
- `TECHSTACK.md`: Technology stack decisions
- `AGENTS.md`: Agent behavior rules

## Naming Conventions

**Files:**
- Source code: `kebab-case.ts` (e.g., `field-writer.ts`, `openai-client.ts`)
- React components: `PascalCase.tsx` (e.g., `AutofillButton.tsx`, `TrackerList.tsx`)
- Test files: `<source-name>.test.ts` or `<source-name>.spec.ts`
- Config files: Framework-specific conventions (`wxt.config.ts`, `tailwind.config.ts`)

**Directories:**
- All lowercase, single words preferred: `src`, `lib`, `types`, `constants`
- Multi-word: `kebab-case` (not used in current structure)

**Functions:**
- `camelCase` with verb phrases: `detectATSPlatform()`, `encryptProfile()`, `parseResume()`

**React Components:**
- `PascalCase` matching filename: `AutofillButton` in `AutofillButton.tsx`

**Types/Interfaces:**
- `PascalCase` noun phrases: `Profile`, `ATSType`, `ATSDetectionResult`

**Constants:**
- `UPPER_SNAKE_CASE`: `MAX_APPLICATIONS_PER_DAY`, `ATS_URL_PATTERNS`

**Custom Hooks:**
- `camelCase` with `use` prefix: `useProfile()`, `useTracker()`, `useATS()`

## Where to Add New Code

**New ATS Platform Support:**
- Primary code: `src/lib/ats/<platform-name>.ts`
- Tests: `tests/unit/ats/<platform-name>.test.ts`
- E2E tests: `tests/e2e/<platform-name>-autofill.spec.ts`
- Update: `src/constants/ats-patterns.ts` with URL pattern
- Update: `src/lib/ats/detector.ts` to call new platform detector

**New React Component:**
- Implementation: `src/components/<ComponentName>.tsx` (if shared) or within `src/entrypoints/popup/` or `src/entrypoints/options/` (if context-specific)
- Tests: Co-locate as `<ComponentName>.test.tsx` or mirror in `tests/unit/components/`

**New Custom Hook:**
- Implementation: `src/hooks/use<HookName>.ts`
- Tests: `tests/unit/hooks/use<HookName>.test.ts`

**New TypeScript Type:**
- Shared types: `src/types/<domain>.ts` (e.g., add field mapping types to `src/types/ats.ts`)
- Component-specific types: Co-locate in component file if only used there

**New Utility Function:**
- Shared helpers: `src/lib/utils/<category>.ts` (e.g., `dom-helpers.ts`, `validators.ts`)
- Domain-specific: Within relevant `src/lib/<domain>/` subdirectory

**New Feature (Full Stack):**
1. Define types in `src/types/`
2. Implement business logic in `src/lib/`
3. Create UI components in `src/components/` or context-specific entrypoint
4. Add custom hook in `src/hooks/` if stateful
5. Write unit tests in `tests/unit/`
6. Write E2E tests in `tests/e2e/`
7. Update constants if needed (`src/constants/`)

## Special Directories

**`.planning/`:**
- Purpose: GSD framework metadata - not part of application runtime
- Generated: No - manually maintained by GSD commands
- Committed: Yes - version-controlled planning artifacts

**`node_modules/`:**
- Purpose: npm/pnpm package installation directory
- Generated: Yes - by `pnpm install`
- Committed: No - listed in `.gitignore`

**`dist/` or `.output/`:**
- Purpose: WXT build output - compiled extension bundle
- Generated: Yes - by `pnpm build`
- Committed: No - build artifacts excluded from git

**`.wxt/`:**
- Purpose: WXT framework cache and intermediate build files
- Generated: Yes - by WXT during dev/build
- Committed: No - framework cache excluded from git

**`public/`:**
- Purpose: Static assets copied to build output
- Generated: No - manually created assets
- Committed: Yes - extension icons are source files

**`tests/`:**
- Purpose: Test suites separate from source code
- Generated: No - manually written tests
- Committed: Yes - tests are part of codebase quality

---

*Structure analysis: 2026-02-20*
