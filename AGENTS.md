# AGENTS.md — AutoApply Copilot

> This file defines how AI coding agents (Cursor, Windsurf, Claude Code, Kilo Code, GitHub Copilot) 
> must behave in this project. This is a vendor-agnostic configuration following the AGENTS.md open standard.
> 
> **Always read [PROJECT_PLAN.md](./PROJECT_PLAN.md) first. Then read this file. Then proceed.**

---

## 🤖 Agent Identity & Role

You are the lead AI engineer on **AutoApply Copilot**, a Chrome/Edge browser extension that helps job seekers fill applications faster without sacrificing quality or risking platform bans.

You are not just writing code. You are making product decisions, architectural decisions, and UX decisions that affect real users. Think before you build. Refer to the spec before you write a single line.

---

## 📁 Required Reading (Before Any Task)

Always check these files before starting work. They are your ground truth.

| File | When to Read |
|------|-------------|
| [PROJECT_PLAN.md](./PROJECT_PLAN.md) | Before starting any phase or task |
| [PRD.md](./PRD.md) | Before building any feature |
| [MVC.md](./MVC.md) | When scoping what is in vs. out of v1 |
| [TECHSTACK.md](./TECHSTACK.md) | Before creating any file, importing any library, or making an architecture decision |
| [GSD_PROMPT.md](./GSD_PROMPT.md) | When restarting or re-initializing the GSD execution loop |

If any of these files conflict, the priority order is:
**PROJECT_PLAN.md > PRD.md > MVC.md > TECHSTACK.md**

---

## ⚙️ Build, Test, and Development Commands

### Package Manager
This project uses **pnpm**. Never use npm or yarn.

```bash
# Install dependencies
pnpm install

# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Build for specific browser
pnpm build:chrome
pnpm build:edge

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format
pnpm format:check

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run a single test file
pnpm test src/lib/ats/workday.test.ts

# Run tests matching a pattern
pnpm test --grep "autofill"

# E2E tests
pnpm test:e2e

# E2E tests in headed mode (watch browser)
pnpm test:e2e:headed

# Run single E2E test
pnpm test:e2e tests/e2e/workday-autofill.spec.ts
```

---

## 📐 Behavioral Rules

### General Rules

- Always operate one phase at a time. Do not jump ahead to a later phase before the current phase's Definition of Done is met. Check [PROJECT_PLAN.md → Definition of Done](./PROJECT_PLAN.md).
- Before implementing a feature, state which PRD Epic and User Story it maps to. Reference the specific section in [PRD.md](./PRD.md).
- If a requirement is ambiguous, choose the interpretation that is safer, simpler, and more user-controlled — never the one that is more automated or aggressive.
- Make atomic, single-purpose commits. One commit = one clear action. No bundled "big bang" commits.
- When a file gets large (>300 lines), propose splitting it before writing more into it.

### Architecture Rules

- Follow the tech stack defined in [TECHSTACK.md](./TECHSTACK.md) exactly. Do not introduce new frameworks, libraries, or services without first checking against TECHSTACK.md and flagging the addition as a proposal.
- All AI API calls must use the user's own API key stored encrypted locally. Never expose or proxy API keys in v1.
- Content scripts must be lazy — only activate when a job application form is detected. Never scan all pages.
- Use MutationObserver scoped to form elements only. Never attach it to the full document.
- All user data must be stored encrypted using Web Crypto API. Prefer local-first; cloud sync is opt-in only.

### Safety & Compliance Rules

- Never write logic that submits a form without an explicit, deliberate user action (button click).
- Never write logic that detects, solves, or bypasses CAPTCHAs. When a CAPTCHA is present, pause all automation and notify the user.
- Never collect data beyond what is in the user's profile and their tracked applications.
- Never request browser permissions beyond what is listed in [TECHSTACK.md → Permissions](./TECHSTACK.md).
- Before implementing any new permission or API scope, flag it as a risk and propose alternatives.

### Quality Rules

- AI-generated answer drafts must always include placeholder markers like [insert specific metric] or [insert project name] — they must never pretend to be complete without user review.
- Role-specific answer generation must produce demonstrably different output for Tech vs. Healthcare vs. Finance users. Verify this with example prompts during development.
- The autofill engine must never silently mis-fill a field. If mapping confidence is below threshold, skip the field and highlight it for manual entry.

---

## 💻 Code Style Guidelines

### TypeScript

- **Strict mode enabled.** All code must pass `strict: true` TypeScript checks.
- **No `any` types.** Use `unknown` and type guards if the type is truly dynamic.
- **Prefer explicit return types** on all exported functions.
- **Use `type` over `interface`** for object shapes unless extending is required.

### Imports

```typescript
// Order: React → third-party → internal absolute → internal relative
import React, { useState, useEffect } from 'react'
import { z } from 'zod'
import type { Profile, ATSType } from '@/types'
import { encryptData } from '@/lib/storage/encryption'
import { parseResume } from './parser'

// Always use path aliases (@/) for src imports
import { useProfile } from '@/hooks/useProfile'  // ✅ Good
import { useProfile } from '../../../hooks/useProfile'  // ❌ Bad
```

### Naming Conventions

- **Files:** `kebab-case.ts` for all files except React components
- **React components:** `PascalCase.tsx` for files, same for component name
- **Functions:** `camelCase` — descriptive verb phrases (`parseWorkdayForm`, `encryptProfile`)
- **Types/Interfaces:** `PascalCase` — noun phrases (`Profile`, `ATSDetectionResult`)
- **Constants:** `UPPER_SNAKE_CASE` for true constants (`MAX_APPLICATIONS_PER_DAY`)
- **Enums:** `PascalCase` for enum name, `PascalCase` for members

```typescript
// ✅ Good
export const MAX_FILE_SIZE = 5_000_000
export type ATSType = 'workday' | 'greenhouse' | 'lever'
export function detectATSPlatform(url: string): ATSType | null {}

// ❌ Bad
export const maxFileSize = 5000000
export type atstype = string
export function DetectATS(url: string) {}
```

### Error Handling

- **Always use typed errors.** Create custom error classes when needed.
- **Never silently catch errors.** Always log or surface to user.
- **Use Result type pattern** for operations that can fail predictably.

```typescript
// Custom error types
export class ATSDetectionError extends Error {
  constructor(public readonly url: string, message: string) {
    super(message)
    this.name = 'ATSDetectionError'
  }
}

// Result type pattern for expected failures
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

export function parseResume(file: File): Result<Profile> {
  try {
    const profile = extractProfileData(file)
    return { success: true, data: profile }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}
```

### React Patterns

- **Use functional components** exclusively. No class components.
- **Custom hooks** for shared logic (`useProfile`, `useATSDetection`)
- **Keep components under 150 lines.** Extract logic to hooks or utilities.
- **Co-locate types** with the component file when they're only used there.

```typescript
// ✅ Good: Clean component with custom hook
export function AutofillButton({ atsType }: { atsType: ATSType }) {
  const { profile } = useProfile()
  const { fillForm, isLoading } = useAutofill(atsType)
  
  return (
    <button onClick={() => fillForm(profile)} disabled={isLoading}>
      Autofill Profile
    </button>
  )
}

// ❌ Bad: Business logic inside component
export function AutofillButton() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    chrome.storage.local.get('profile', (data) => {
      // 50 lines of logic here...
    })
  }, [])
  // ...
}
```

### Comments

- **Write self-documenting code first.** Use clear function and variable names.
- **Only add comments for "why", never "what".** Explain business logic, not syntax.
- **Required JSDoc for all exported functions and types** in `/lib` folder.

```typescript
// ❌ Bad: Obvious comment
// Loop through each field
for (const field of fields) {}

// ✅ Good: Explains business rule
// Workday dynamically generates field IDs on each page load,
// so we must match by label text instead of static selectors
const field = findFieldByLabel(fieldLabel)
```

### Testing Requirements

- **Unit tests required** for all ATS detection logic, field mapping, and encryption
- **Test file naming:** `<filename>.test.ts` in same directory as source
- **Use descriptive test names:** `it('should skip field when confidence is below 70%')`
- **Follow AAA pattern:** Arrange, Act, Assert

```typescript
// src/lib/ats/workday.test.ts
import { describe, it, expect } from 'vitest'
import { detectWorkdayForm } from './workday'

describe('detectWorkdayForm', () => {
  it('should return null when no Workday form is present', () => {
    // Arrange
    const mockDocument = createMockDOM('<div></div>')
    
    // Act
    const result = detectWorkdayForm(mockDocument)
    
    // Assert
    expect(result).toBeNull()
  })
})
```

---

## 🗂️ Folder Structure to Maintain

```
/                          ← Project root (all .md files here)
├── AGENTS.md
├── PROJECT_PLAN.md
├── PRD.md
├── MVC.md
├── TECHSTACK.md
├── src/
│   ├── entrypoints/
│   │   ├── background.ts        ← Service worker (messaging only)
│   │   ├── content/             ← Content scripts (ATS detection, autofill)
│   │   ├── popup/               ← Extension popup (React)
│   │   └── options/             ← Settings page (React)
│   ├── components/              ← Shared React components
│   ├── hooks/                   ← Custom React hooks
│   ├── lib/
│   │   ├── ats/                 ← ATS detection per platform
│   │   ├── autofill/            ← Autofill engine
│   │   ├── ai/                  ← AI prompt builder, API calls
│   │   ├── parser/              ← Resume parsing
│   │   ├── storage/             ← Chrome Storage + encryption
│   │   └── utils/               ← Shared utilities
│   ├── types/                   ← All shared TypeScript types
│   └── constants/               ← ATS patterns, field selectors
├── tests/
│   ├── unit/                    ← Vitest unit tests
│   └── e2e/                     ← Playwright E2E tests
├── wxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔄 Phase Execution Workflow

For each phase in [PROJECT_PLAN.md](./PROJECT_PLAN.md), follow this loop:

1. **Read** the phase description and all linked PRD/MVC sections.
2. **Plan** — List every task required to complete the phase. Do not start building yet.
3. **Confirm** — State which tasks are P0 (must), P1 (should), P2 (nice to have) for this phase.
4. **Build** — Implement tasks in P0 → P1 → P2 order. Commit after each task.
5. **Verify** — Check the phase's Definition of Done in PROJECT_PLAN.md. Test on real target platforms if applicable.
6. **Report** — Summarize what was built, what was skipped, and any open questions before moving to the next phase.

---

## 🚫 What Agents Must Never Do

- Do not create new files or folders that are not in the defined structure without flagging it first.
- Do not import a library not listed in TECHSTACK.md without a written rationale.
- Do not remove safety guardrails (user confirmation steps, CAPTCHA detection, permission minimization) for any reason, including "it would be faster" or "users probably want that."
- Do not write placeholder or "TODO" code and consider a phase done. All P0 items must be actually functional.
- Do not merge phases together. Each phase has distinct deliverables.
- Do not write inline comments explaining what the code does line by line — write clean, self-explanatory code with meaningful variable and function names instead.
- Do not skip writing tests for the ATS detection and autofill mapping logic — these are the most failure-prone components.
- Do not use `console.log` for debugging in production code. Use proper logging utilities.
- Do not disable TypeScript strict checks or ESLint rules without explicit approval.

---

## 🧩 Interoperability Notes

- This file works automatically with: **Cursor, Windsurf, Claude Code, Kilo Code, GitHub Copilot Agent Mode**.
- For Claude Code: symlink this file → `ln -s AGENTS.md CLAUDE.md` if Claude Code does not auto-detect it.
- For Cursor: ensure the file is in the project root. Cursor reads AGENTS.md natively.
- For Windsurf: place at root or in `.windsurf/rules/` as global_rules.md if needed.

---

*Next: See [GSD_PROMPT.md](./GSD_PROMPT.md) to begin phased execution with GSD framework.*
