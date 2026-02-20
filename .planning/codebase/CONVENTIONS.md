# Coding Conventions

**Analysis Date:** 2026-02-20

## Naming Patterns

**Files:**
- `kebab-case.ts` for all TypeScript files except React components
- `PascalCase.tsx` for React component files (must match component name)
- `<filename>.test.ts` for unit tests (co-located with source)
- `<filename>.spec.ts` for E2E tests (in `tests/e2e/` directory)

**Functions:**
- `camelCase` — descriptive verb phrases
- Examples: `parseWorkdayForm()`, `encryptProfile()`, `detectATSPlatform()`
- Must describe action clearly without abbreviations

**Variables:**
- `camelCase` for all variables
- Descriptive names that convey purpose
- No single-letter variables except in loops (`i`, `j`) or common patterns (`x`, `y`)

**Types:**
- `PascalCase` — noun phrases
- Examples: `Profile`, `ATSDetectionResult`, `ATSType`
- Use `type` keyword over `interface` for object shapes unless extending is required
- Use union types for enums: `type ATSType = 'workday' | 'greenhouse' | 'lever'`

**Constants:**
- `UPPER_SNAKE_CASE` for true constants only
- Examples: `MAX_FILE_SIZE`, `MAX_APPLICATIONS_PER_DAY`, `DEFAULT_CONFIDENCE_THRESHOLD`
- Use numeric separators: `5_000_000` not `5000000`

## Code Style

**Formatting:**
- Handled by Prettier (configuration pending - will be added in Phase 0.2)
- 2-space indentation
- Single quotes for strings (unless template literals required)
- Semicolons required
- Trailing commas in multi-line objects/arrays

**Linting:**
- ESLint with TypeScript plugin (configuration pending - will be added in Phase 0.2)
- Strict mode enabled
- No `any` types allowed — use `unknown` with type guards if type is truly dynamic
- No `console.log` in production code — use proper logging utilities

**TypeScript Strict Mode:**
- `strict: true` must be enabled in `tsconfig.json`
- All exported functions must have explicit return types
- No implicit `any` types
- Strict null checks enabled

## Import Organization

**Order:**
1. React imports (if applicable)
2. Third-party library imports
3. Internal absolute imports (using `@/` alias)
4. Internal relative imports (same directory)
5. Type-only imports last

**Path Aliases:**
- `@/` — maps to `src/` root
- Always use `@/` for imports from `src/` directory
- Never use relative paths like `../../../hooks/useProfile`

**Example:**
```typescript
// 1. React
import React, { useState, useEffect } from 'react'

// 2. Third-party
import { z } from 'zod'

// 3. Internal absolute (with @/ alias)
import type { Profile, ATSType } from '@/types'
import { encryptData } from '@/lib/storage/encryption'
import { useProfile } from '@/hooks/useProfile'

// 4. Internal relative (same directory)
import { parseResume } from './parser'
```

## Error Handling

**Patterns:**
- Always use typed errors — create custom error classes when needed
- Never silently catch errors — always log or surface to user
- Use Result type pattern for operations that can fail predictably

**Custom Error Classes:**
```typescript
export class ATSDetectionError extends Error {
  constructor(public readonly url: string, message: string) {
    super(message)
    this.name = 'ATSDetectionError'
  }
}
```

**Result Type Pattern:**
```typescript
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

## Logging

**Framework:** Native console methods wrapped in utility (to be created)

**Patterns:**
- Never use `console.log` directly in source code
- Create logging utility in `src/lib/utils/logger.ts` with log levels
- Log levels: `error`, `warn`, `info`, `debug`
- Include context in all log messages (component name, operation, relevant IDs)

**When to Log:**
- All errors and error recovery attempts
- ATS detection results (success/failure with detected type)
- Autofill operations (start, field mappings, completion)
- AI API calls (request sent, response received, errors)
- Security operations (encryption/decryption, key storage)

## Comments

**When to Comment:**
- Explain "why" decisions were made, never "what" the code does
- Document business rules and constraints
- Explain non-obvious algorithms or data structures
- Add context for browser API limitations or workarounds
- Flag security-sensitive operations

**JSDoc/TSDoc:**
- Required for all exported functions and types in `/lib` folder
- Include `@param` for all parameters with description
- Include `@returns` with description
- Include `@throws` if function can throw errors
- Include `@example` for complex functions

**Example:**
```typescript
/**
 * Detects ATS platform type from URL and DOM structure
 * 
 * @param url - Current page URL
 * @param document - DOM document to analyze
 * @returns Detected ATS type or null if unsupported
 * @throws {ATSDetectionError} If DOM access fails
 * 
 * @example
 * const atsType = detectATSPlatform(window.location.href, document)
 * if (atsType) {
 *   console.log(`Detected ${atsType} ATS`)
 * }
 */
export function detectATSPlatform(url: string, document: Document): ATSType | null {
  // Workday dynamically generates field IDs on each page load,
  // so we must match by URL pattern and specific DOM signatures
  if (url.includes('myworkdayjobs.com')) {
    return 'workday'
  }
  return null
}
```

## Function Design

**Size:** 
- Keep functions under 50 lines when possible
- Extract complex logic to separate helper functions
- If function exceeds 100 lines, refactor into smaller units

**Parameters:** 
- Maximum 4 parameters — use options object if more needed
- Use destructuring for options objects
- Make optional parameters explicit with `?` or default values

**Return Values:** 
- Always use explicit return type annotations for exported functions
- Prefer Result type pattern over throwing errors for expected failures
- Use discriminated unions for complex return types
- Return early for error conditions

**Example:**
```typescript
// ✅ Good: Options object for multiple params
type AutofillOptions = {
  atsType: ATSType
  profile: Profile
  skipLowConfidence?: boolean
  highlightFields?: boolean
}

export function autofillForm(options: AutofillOptions): Result<void> {
  const { atsType, profile, skipLowConfidence = false } = options
  // implementation
}

// ❌ Bad: Too many individual parameters
export function autofillForm(
  atsType: ATSType,
  profile: Profile,
  skipLowConfidence: boolean,
  highlightFields: boolean,
  onComplete: () => void
): void {}
```

## Module Design

**Exports:** 
- Use named exports, not default exports
- Export only public API from modules
- Keep internal helpers unexported
- Group related exports in barrel files when appropriate

**Barrel Files:** 
- Use barrel files (`index.ts`) for exporting from directories
- Keep barrel files simple — just re-exports, no logic
- Example: `src/lib/ats/index.ts` exports all ATS detection modules

**Example:**
```typescript
// src/lib/ats/index.ts (barrel file)
export { detectWorkdayForm } from './workday'
export { detectGreenhouseForm } from './greenhouse'
export { detectLeverForm } from './lever'
export type { ATSDetectionResult } from './types'
```

## React Patterns

**Component Structure:**
- Functional components only — no class components
- Keep components under 150 lines
- Extract complex logic to custom hooks
- Co-locate component-specific types in same file

**Custom Hooks:**
- Use custom hooks for shared stateful logic
- Naming: `use` prefix followed by descriptive name
- Examples: `useProfile()`, `useATSDetection()`, `useAutofill()`
- Keep hooks focused on single responsibility

**Component Organization:**
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

## Safety & Compliance Patterns

**Never implement:**
- Auto-form submission without explicit user button click
- CAPTCHA detection, solving, or bypass logic
- Data collection beyond user profile and tracked applications
- Network interception or cookie access

**Always implement:**
- User confirmation before any form submission
- Graceful degradation when AI is offline
- Encryption for all stored user data
- Lazy content script activation (only on ATS pages)
- MutationObserver scoped to form elements only, never full document

**Security Requirements:**
- All user data encrypted with Web Crypto API (AES-GCM)
- API keys stored encrypted in Chrome Storage API (local)
- Never log sensitive data (API keys, personal info, credentials)
- Validate all data from storage before use

---

*Convention analysis: 2026-02-20*
