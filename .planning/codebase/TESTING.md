# Testing Patterns

**Analysis Date:** 2026-02-20

## Test Framework

**Runner:**
- Vitest (Vite-native test runner)
- Config: `vitest.config.ts` (to be created in Phase 0.2)

**Assertion Library:**
- Vitest built-in assertions (compatible with Jest)
- Extends `expect` from Vitest

**Run Commands:**
```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report (not yet configured)
pnpm test src/lib/ats/workday.test.ts  # Run single test file
pnpm test --grep "autofill"  # Run tests matching pattern
```

## Test File Organization

**Location:**
- Co-located with source files (same directory as implementation)
- Unit tests: `src/lib/**/*.test.ts`
- E2E tests: `tests/e2e/**/*.spec.ts`

**Naming:**
- Unit tests: `<filename>.test.ts`
- E2E tests: `<feature>.spec.ts`
- Example: `src/lib/ats/workday.ts` → `src/lib/ats/workday.test.ts`

**Structure:**
```
src/
├── lib/
│   ├── ats/
│   │   ├── workday.ts
│   │   ├── workday.test.ts       ← Co-located unit test
│   │   ├── greenhouse.ts
│   │   └── greenhouse.test.ts
│   ├── autofill/
│   │   ├── engine.ts
│   │   └── engine.test.ts
│   └── storage/
│       ├── encryption.ts
│       └── encryption.test.ts
tests/
└── e2e/
    ├── workday-autofill.spec.ts   ← Playwright E2E test
    └── greenhouse-autofill.spec.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { detectWorkdayForm } from './workday'

describe('detectWorkdayForm', () => {
  // Group related tests
  describe('when Workday form is present', () => {
    it('should detect Workday ATS from URL pattern', () => {
      // Arrange
      const url = 'https://example.myworkdayjobs.com/en-US/careers'
      const mockDocument = createMockDOM('<form id="wd-Application"></form>')
      
      // Act
      const result = detectWorkdayForm(url, mockDocument)
      
      // Assert
      expect(result).toBe('workday')
    })
    
    it('should detect Workday ATS from DOM signature', () => {
      // Test implementation
    })
  })
  
  describe('when Workday form is not present', () => {
    it('should return null for non-Workday URL', () => {
      // Arrange
      const url = 'https://example.com/careers'
      const mockDocument = createMockDOM('<form></form>')
      
      // Act
      const result = detectWorkdayForm(url, mockDocument)
      
      // Assert
      expect(result).toBeNull()
    })
  })
})
```

**Patterns:**
- Use `describe` blocks to group related tests
- Use nested `describe` for different scenarios
- Use `it` for individual test cases
- Test names must be descriptive sentences starting with "should"
- Follow AAA pattern: Arrange, Act, Assert (clearly separated)

## Mocking

**Framework:** Vitest built-in mocking (`vi` object)

**Patterns:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { autofillForm } from './autofill'
import * as storage from '@/lib/storage'

describe('autofillForm', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })
  
  it('should retrieve profile from storage before autofill', async () => {
    // Mock Chrome Storage API
    const mockProfile = { name: 'John Doe', email: 'john@example.com' }
    vi.spyOn(storage, 'getProfile').mockResolvedValue(mockProfile)
    
    // Act
    await autofillForm({ atsType: 'workday' })
    
    // Assert
    expect(storage.getProfile).toHaveBeenCalledOnce()
  })
})
```

**Chrome API Mocking:**
```typescript
// Mock Chrome Storage API
global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys, callback) => {
        callback({ profile: mockProfileData })
      }),
      set: vi.fn((items, callback) => {
        callback?.()
      })
    }
  }
} as any

// Mock Chrome Runtime API
global.chrome.runtime = {
  sendMessage: vi.fn(),
  onMessage: {
    addListener: vi.fn()
  }
} as any
```

**What to Mock:**
- Chrome extension APIs (`chrome.storage`, `chrome.runtime`)
- External API calls (OpenAI, Anthropic)
- File system operations (if any)
- Time-dependent functions (`Date.now()`, `setTimeout`)
- Random number generation for deterministic tests
- DOM manipulation in unit tests (use JSDOM)

**What NOT to Mock:**
- Pure utility functions (test them directly)
- Simple data transformations
- Type definitions and constants
- Functions being tested (test the real implementation)

## Fixtures and Factories

**Test Data:**
```typescript
// src/lib/test-utils/fixtures.ts
export const mockProfile: Profile = {
  personal: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0123',
    address: '123 Main St, City, ST 12345',
    workAuthorization: 'US Citizen'
  },
  workHistory: [
    {
      position: 'Senior Engineer',
      company: 'Tech Corp',
      startDate: '2020-01',
      endDate: '2024-01',
      achievements: ['Led team of 5', 'Shipped 3 major features']
    }
  ],
  education: [
    {
      degree: 'BS Computer Science',
      institution: 'State University',
      startDate: '2012-09',
      endDate: '2016-05'
    }
  ],
  skills: [
    { name: 'TypeScript', category: 'Programming' },
    { name: 'React', category: 'Frontend' }
  ],
  links: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    portfolio: 'https://johndoe.dev',
    personalSite: null
  },
  domainExtras: {},
  rolePreference: 'Tech',
  updatedAt: '2024-01-15T12:00:00Z'
}

export const mockATSDetectionResult = {
  atsType: 'workday' as ATSType,
  confidence: 0.95,
  detectedAt: Date.now(),
  url: 'https://example.myworkdayjobs.com/careers'
}

// Factory function for customizable test data
export function createMockProfile(overrides?: Partial<Profile>): Profile {
  return { ...mockProfile, ...overrides }
}
```

**Location:**
- Test utilities and fixtures: `src/lib/test-utils/`
- Shared across all test files
- Import as: `import { mockProfile, createMockProfile } from '@/lib/test-utils/fixtures'`

## Coverage

**Requirements:** 
- Minimum 80% coverage for critical paths (to be enforced in Phase 0.3)
- 100% coverage required for:
  - ATS detection logic (`src/lib/ats/**`)
  - Field mapping and autofill engine (`src/lib/autofill/**`)
  - Encryption and storage (`src/lib/storage/**`)
  - AI prompt generation (`src/lib/ai/**`)

**View Coverage:**
```bash
pnpm test:coverage  # Generate coverage report (command to be configured)
# Opens HTML report in browser showing line/branch/function coverage
```

**Coverage Tools:**
- Vitest built-in coverage with c8/istanbul
- Output formats: HTML report, terminal summary, LCOV for CI

## Test Types

**Unit Tests:**
- Scope: Individual functions and modules in isolation
- Location: Co-located with source (`*.test.ts`)
- Framework: Vitest
- Must test:
  - ATS detection logic (URL patterns, DOM signatures)
  - Field mapping algorithms (confidence scoring)
  - Data encryption/decryption functions
  - Profile parsing and validation
  - AI prompt generation logic
  - Error handling and edge cases

**Integration Tests:**
- Scope: Multiple modules working together
- Location: `tests/integration/` (to be created)
- Framework: Vitest
- Must test:
  - Content script + Storage interaction
  - Autofill engine + ATS detection flow
  - Profile management + encryption layer
  - Background script message passing

**E2E Tests:**
- Scope: Complete user workflows in real browser
- Location: `tests/e2e/`
- Framework: Playwright
- Must test:
  - Full autofill flow on live ATS demo sites
  - Profile creation and editing
  - Job tracking workflow
  - AI answer generation (with mocked API responses)
  - Extension popup and options page interactions

**E2E Commands:**
```bash
pnpm test:e2e                    # Run all E2E tests (headless)
pnpm test:e2e:headed             # Run with visible browser
pnpm test:e2e tests/e2e/workday-autofill.spec.ts  # Run single test
```

## Common Patterns

**Async Testing:**
```typescript
import { describe, it, expect } from 'vitest'

describe('async operations', () => {
  it('should wait for async function to resolve', async () => {
    // Arrange
    const mockData = { id: 1, name: 'Test' }
    
    // Act
    const result = await fetchData()
    
    // Assert
    expect(result).toEqual(mockData)
  })
  
  it('should handle async rejections', async () => {
    // Arrange
    const invalidId = -1
    
    // Assert
    await expect(fetchData(invalidId)).rejects.toThrow('Invalid ID')
  })
})
```

**Error Testing:**
```typescript
import { describe, it, expect } from 'vitest'

describe('error handling', () => {
  it('should throw custom error for invalid input', () => {
    // Arrange
    const invalidUrl = ''
    
    // Assert
    expect(() => detectATSPlatform(invalidUrl)).toThrow(ATSDetectionError)
    expect(() => detectATSPlatform(invalidUrl)).toThrow('Invalid URL provided')
  })
  
  it('should return Result with error for failed operation', () => {
    // Arrange
    const corruptedFile = new File(['invalid'], 'test.pdf')
    
    // Act
    const result = parseResume(corruptedFile)
    
    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toContain('Failed to parse')
    }
  })
})
```

**DOM Testing (Unit Tests):**
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

describe('DOM manipulation', () => {
  let document: Document
  
  beforeEach(() => {
    // Create fresh DOM for each test
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <form id="application-form">
            <input name="firstName" />
            <input name="email" />
          </form>
        </body>
      </html>
    `)
    document = dom.window.document
  })
  
  it('should find and fill form fields', () => {
    // Arrange
    const form = document.querySelector('#application-form')
    
    // Act
    const firstName = form?.querySelector('input[name="firstName"]') as HTMLInputElement
    firstName.value = 'John'
    
    // Assert
    expect(firstName.value).toBe('John')
  })
})
```

**Extension-Specific Testing:**
```typescript
import { describe, it, expect, vi } from 'vitest'

describe('Chrome extension APIs', () => {
  beforeEach(() => {
    // Mock Chrome APIs
    global.chrome = {
      storage: {
        local: {
          get: vi.fn(),
          set: vi.fn()
        }
      },
      runtime: {
        sendMessage: vi.fn()
      }
    } as any
  })
  
  it('should send message to background script', async () => {
    // Arrange
    const message = { type: 'AUTOFILL_REQUESTED', atsType: 'workday' }
    
    // Act
    await chrome.runtime.sendMessage(message)
    
    // Assert
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message)
  })
})
```

**Snapshot Testing (for components):**
```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AutofillButton } from './AutofillButton'

describe('AutofillButton', () => {
  it('should match snapshot', () => {
    const { container } = render(<AutofillButton atsType="workday" />)
    expect(container).toMatchSnapshot()
  })
})
```

## Test Organization Best Practices

**Test Naming:**
- Use descriptive test names that read as specifications
- Format: "should [expected behavior] when [condition]"
- Examples:
  - `it('should detect Workday ATS from URL pattern')`
  - `it('should skip field when confidence is below 70%')`
  - `it('should throw error when API key is missing')`

**Test Independence:**
- Each test must run independently (no shared state)
- Use `beforeEach` to reset state, not `beforeAll`
- Never rely on test execution order
- Clean up after tests (clear mocks, reset globals)

**Test Focus:**
- One assertion concept per test (may have multiple `expect` calls)
- Test one path through the code per test
- Keep tests simple and readable
- Avoid complex setup logic (extract to helper functions)

**Negative Testing:**
- Always test error cases and edge cases
- Test with invalid inputs (null, undefined, empty strings, wrong types)
- Test boundary conditions (empty arrays, max lengths)
- Test async failures (network errors, timeouts)

---

*Testing analysis: 2026-02-20*
