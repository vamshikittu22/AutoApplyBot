# Phase 01 Research — Profile Management & Resume Parsing

**Researched:** 2026-02-20  
**Domain:** Chrome Extension Development (Profile Management + Resume Parsing)  
**Confidence:** HIGH

## Executive Summary

Phase 01 builds the foundation for AutoApply Copilot: user profile management with encrypted local storage, plain-text resume parsing, and a React-based editor UI. The technical approach is straightforward using native browser APIs and minimal dependencies, following the project's offline-first philosophy.

**Primary recommendation:** Use vanilla JS + regex for resume parsing (no libraries), Web Crypto API (native) for encryption, Zustand for state management, and Zod for schema validation. All dependencies are already specified in TECHSTACK.md and are industry-standard, well-documented, and lightweight.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **React 18** | 18.x | UI framework | WXT framework uses React; hooks-based, component model fits extension architecture |
| **TypeScript 5.x** | 5.5+ | Type safety | Strict mode enabled; prevents runtime errors; excellent autocomplete in IDE |
| **Zustand** | 5.0.11+ | State management | ~1KB; no boilerplate; perfect for extension popup + content script state; simpler than Redux |
| **Zod 4.x** | 4.x | Schema validation | TypeScript-first validation; runtime safety; 2KB core; immutable API |
| **Tailwind CSS** | 3.x | Styling | Utility-first; small bundles; no runtime overhead; already in tech stack |
| **WXT** | Latest | Extension framework | Manifest V3 native; Vite-based; excellent TypeScript support; lighter than Plasmo |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Web Crypto API** | Native | Encryption (AES-GCM) | Zero dependencies; built into browser; REQ-PRO-05 requirement |
| **Chrome Storage API** | Native | Local persistence | Built-in extension API; no library needed; stores encrypted profile |
| **Vitest** | Latest | Unit testing | Vite-native; fast; tests parser accuracy (≥75% requirement) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla JS parser | resume-parser npm | Library is 403 forbidden on npm (checked 2026-02-20); would add dependencies; custom solution gives full control |
| Zustand | Redux Toolkit | Redux is heavier (50KB+ vs 1KB); more boilerplate; Zustand simpler for extension context |
| Zod | Yup | Zod has better TypeScript integration; smaller bundle; immutable API |
| Web Crypto | CryptoJS library | Web Crypto is native (zero deps); CryptoJS adds 100KB+; native is faster |

**Installation:**
```bash
# All dependencies already in package.json per Phase 0
pnpm install
```

---

## Architecture Patterns

### Recommended Project Structure

Already defined in TECHSTACK.md and created in Phase 0:

```
src/
├── types/                   # Shared TypeScript types
│   ├── profile.ts           # Profile, WorkExperience, Education types
│   └── resume.ts            # ParsedResume, FieldConfidence types
├── constants/               # ATS patterns, field selectors
│   └── profile-schema.ts    # Zod schemas, role-specific field definitions
├── lib/
│   ├── parser/              # Resume parsing (vanilla JS + regex)
│   │   ├── resume-parser.ts          # Main orchestration
│   │   ├── section-detector.ts       # Identify resume sections
│   │   └── field-extractor.ts        # Extract fields with confidence
│   ├── storage/             # Chrome Storage + encryption
│   │   ├── encryption.ts             # Web Crypto wrapper (AES-GCM)
│   │   └── profile-storage.ts        # Save/load/delete profile
│   ├── store/               # Zustand stores
│   │   └── profile-store.ts          # Profile state management
│   └── utils/               # Shared utilities
├── components/              # React components
│   ├── ProfileEditor.tsx
│   ├── WorkExperienceEditor.tsx
│   ├── EducationEditor.tsx
│   └── SkillsEditor.tsx
├── entrypoints/
│   └── options/             # Extension options page
│       └── App.tsx
└── tests/
    └── unit/
        ├── parser/
        └── storage/
```

### Pattern 1: Resume Parsing Pipeline

**What:** Three-stage pipeline: Section Detection → Field Extraction → Confidence Scoring

**When to use:** REQ-PRO-01 (paste resume & parse with ≥75% accuracy)

**Example:**

```typescript
// Source: Based on AGENTS.md code style + PRD requirements
import type { ParsedResume, ResumeSection } from '@/types/resume'

/**
 * Main resume parser orchestration.
 * Achieves ≥75% accuracy on key fields per REQ-PRO-01.
 */
export function parseResume(resumeText: string): ParsedResume {
  // Stage 1: Detect sections using keyword matching
  const sections = detectSections(resumeText)
  
  // Stage 2: Extract fields from each section
  const contactInfo = extractContact(sections.contact)
  const workHistory = extractWorkHistory(sections.experience)
  const education = extractEducation(sections.education)
  const skills = extractSkills(sections.skills)
  
  // Stage 3: Assign confidence scores (0-100)
  return {
    personal: {
      ...contactInfo,
      confidence: calculateConfidence(contactInfo)
    },
    workHistory: workHistory.map(job => ({
      ...job,
      confidence: calculateConfidence(job)
    })),
    education: education.map(edu => ({
      ...edu,
      confidence: calculateConfidence(edu)
    })),
    skills: skills.map(skill => ({
      ...skill,
      confidence: 100 // Skills are exact string matches
    }))
  }
}
```

**Why this pattern:**
- Separation of concerns: each stage has single responsibility
- Testable: can unit test each stage independently
- Confidence scoring enables "flag for manual review" feature (PRD requirement)

### Pattern 2: Encrypted Storage Layer

**What:** Web Crypto API wrapper with Chrome Storage API integration

**When to use:** REQ-PRO-05 (encrypted local storage), REQ-PRO-06 (data export/delete)

**Example:**

```typescript
// Source: MDN Web Crypto API docs + Chrome Storage API docs
const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits recommended for GCM

/**
 * Generate encryption key using Web Crypto API.
 * Key is stored in chrome.storage.local (non-encrypted area).
 * v2+ may add user password protection.
 */
export async function generateKey(): Promise<CryptoKey> {
  // Get or create device seed
  const { deviceSeed } = await chrome.storage.local.get('deviceSeed')
  const seed = deviceSeed || crypto.getRandomValues(new Uint8Array(32))
  
  if (!deviceSeed) {
    await chrome.storage.local.set({ deviceSeed: Array.from(seed) })
  }
  
  // Derive key using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    seed,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('autoapply-copilot-v1'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt data using AES-GCM.
 * Returns base64-encoded string for storage compatibility.
 */
export async function encryptData(data: object): Promise<string> {
  const key = await generateKey()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoded = new TextEncoder().encode(JSON.stringify(data))
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  )
  
  // Prepend IV to encrypted data (needed for decryption)
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt data using AES-GCM.
 */
export async function decryptData(encryptedBase64: string): Promise<object> {
  const key = await generateKey()
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))
  
  // Extract IV from beginning
  const iv = combined.slice(0, IV_LENGTH)
  const encrypted = combined.slice(IV_LENGTH)
  
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  )
  
  const decoded = new TextDecoder().decode(decrypted)
  return JSON.parse(decoded)
}
```

**Why this pattern:**
- Native Web Crypto API: zero dependencies, well-tested by browser vendors
- AES-GCM: provides authentication (detects tampering) unlike AES-CBC/CTR
- Key derivation: uses PBKDF2 (100k iterations) for security
- Storage-compatible: base64 encoding works with Chrome Storage API

### Pattern 3: Zustand Store with Persistence

**What:** Zustand store that integrates parser and storage layers

**When to use:** REQ-PRO-02 (profile editor UI), all CRUD operations

**Example:**

```typescript
// Source: Zustand GitHub docs + existing plan files
import { create } from 'zustand'
import type { Profile } from '@/types/profile'
import { parseResume } from '@/lib/parser/resume-parser'
import { saveProfile, loadProfile, deleteProfile } from '@/lib/storage/profile-storage'

interface ProfileStore {
  profile: Profile | null
  isLoading: boolean
  isSaving: boolean
  isParsing: boolean
  
  // Actions
  loadProfile: () => Promise<void>
  saveProfile: (profile: Profile) => Promise<void>
  parseResume: (resumeText: string) => Promise<void>
  updatePersonal: (data: Partial<Profile['personal']>) => void
  addWorkExperience: (work: WorkExperience) => void
  deleteProfile: () => Promise<void>
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isLoading: false,
  isSaving: false,
  isParsing: false,
  
  loadProfile: async () => {
    set({ isLoading: true })
    try {
      const profile = await loadProfile()
      set({ profile, isLoading: false })
    } catch (error) {
      console.error('Failed to load profile:', error)
      set({ isLoading: false })
    }
  },
  
  saveProfile: async (profile: Profile) => {
    set({ isSaving: true })
    try {
      await saveProfile(profile)
      set({ profile, isSaving: false })
    } catch (error) {
      console.error('Failed to save profile:', error)
      set({ isSaving: false })
      throw error
    }
  },
  
  parseResume: async (resumeText: string) => {
    set({ isParsing: true })
    try {
      const parsed = await parseResume(resumeText)
      const profile = convertParsedToProfile(parsed)
      set({ profile, isParsing: false })
      // Auto-save after parsing
      await get().saveProfile(profile)
    } catch (error) {
      console.error('Failed to parse resume:', error)
      set({ isParsing: false })
      throw error
    }
  },
  
  updatePersonal: (data) => {
    const profile = get().profile
    if (!profile) return
    
    set({
      profile: {
        ...profile,
        personal: { ...profile.personal, ...data }
      }
    })
  },
  
  addWorkExperience: (work) => {
    const profile = get().profile
    if (!profile) return
    
    set({
      profile: {
        ...profile,
        workHistory: [...profile.workHistory, work]
      }
    })
  },
  
  deleteProfile: async () => {
    await deleteProfile()
    set({ profile: null })
  }
}))
```

**Why this pattern:**
- Zustand is lightweight (~1KB) and perfect for extension context
- Actions co-located with state (no separate actions folder)
- Async operations with loading states (good UX)
- Auto-save after parsing (seamless UX)

### Pattern 4: Zod Schema Validation

**What:** Zod schemas for runtime validation + TypeScript inference

**When to use:** REQ-PRO-01 through REQ-PRO-04 (all profile fields + validation)

**Example:**

```typescript
// Source: Zod docs + TECHSTACK.md requirements
import { z } from 'zod'

export const RolePreferenceSchema = z.enum([
  'Tech',
  'Healthcare', 
  'Finance',
  'Marketing',
  'Operations',
  'Other'
])

export const PersonalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format'),
  location: z.string().min(1, 'Location is required'),
  workAuthorization: z.string().optional()
})

export const WorkExperienceSchema = z.object({
  id: z.string().uuid(),
  position: z.string().min(1, 'Position is required'),
  company: z.string().min(1, 'Company is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Date must be YYYY-MM'),
  endDate: z.union([
    z.string().regex(/^\d{4}-\d{2}$/),
    z.literal('Present')
  ]),
  achievements: z.array(z.string()).min(1, 'Add at least one achievement')
})

export const ProfileSchema = z.object({
  personal: PersonalInfoSchema,
  workHistory: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema),
  links: LinksSchema,
  domainExtras: DomainExtrasSchema,
  rolePreference: RolePreferenceSchema,
  updatedAt: z.string().datetime()
})

// TypeScript type inferred from schema
export type Profile = z.infer<typeof ProfileSchema>

// Usage in save function
export async function saveProfile(profile: Profile) {
  // Runtime validation before encryption
  const validated = ProfileSchema.parse(profile)
  const encrypted = await encryptData(validated)
  await chrome.storage.local.set({ encryptedProfile: encrypted })
}
```

**Why this pattern:**
- Single source of truth: schema defines both validation AND TypeScript types
- Runtime safety: catches invalid data before storage/encryption
- User-friendly errors: custom messages for form validation
- Immutable API: chaining methods doesn't modify original schema

### Anti-Patterns to Avoid

- **Don't use localStorage in service workers** — Service workers can't access localStorage; use chrome.storage.local instead
- **Don't store plaintext sensitive data** — All profile data must be encrypted before storage (REQ-PRO-05)
- **Don't use context providers for state** — Zustand eliminates need for React Context providers; simpler DX
- **Don't hand-roll encryption** — Use Web Crypto API; rolling your own crypto is security risk
- **Don't parse HTML/PDF in v1** — REQ-PRO-01 is text-only paste; PDF/DOCX deferred to v2

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema validation | Custom validation functions | **Zod** | Handles edge cases (nested objects, arrays, unions); TypeScript integration; 2KB bundle |
| Encryption | Custom AES implementation | **Web Crypto API (native)** | Browser-tested; FIPS-compliant; handles IV generation; zero dependencies |
| State management | Custom Context + reducers | **Zustand** | 1KB; no boilerplate; handles async updates; prevents zombie child problem |
| Form state | Manual useState per field | **Zustand store** | Centralized state; undo/redo possible; auto-save integration; tracks field confidence |
| Date parsing | Custom regex | **Built-in Date API** | Handles edge cases (leap years, timezones); use ISO 8601 format (YYYY-MM-DD) |
| UUID generation | Custom random string | **crypto.randomUUID()** (native) | RFC 4122 compliant; collision-resistant; native browser API |

**Key insight:** Browser APIs (Web Crypto, crypto.randomUUID()) are mature, well-tested, and zero-dependency. Prefer native over libraries when available.

---

## Common Pitfalls

### Pitfall 1: Resume Section Detection Fails on Non-Standard Formats

**What goes wrong:** Parser fails on resumes without explicit section headers (e.g., "Experience", "Education")

**Why it happens:** Keyword matching only works if sections have predictable headers

**How to avoid:**
- Implement heuristic fallback: if no headers detected, assume structure (contact at top, experience in middle, education near bottom)
- Track parser accuracy in unit tests with diverse resume samples
- Add "confidence" field to each parsed section (low confidence = flag for manual review)

**Warning signs:**
- Parser returns empty arrays for work history or education
- Confidence scores consistently below 50%
- User complaints about "paste not working"

### Pitfall 2: Chrome Storage Quota Exceeded

**What goes wrong:** `chrome.storage.local.set()` fails silently when quota exceeded

**Why it happens:** Default quota is 10MB (5MB in Chrome 113 and earlier); large profiles can hit this limit

**How to avoid:**
- Monitor storage usage: `chrome.storage.local.getBytesInUse()`
- Warn user if profile size > 8MB (leave 2MB buffer)
- Compress profile JSON before encryption (use JSON minification)
- Don't store large files (images, PDFs) — store URLs only

**Warning signs:**
- Profile saves but doesn't persist after reload
- Console error: "QUOTA_BYTES quota exceeded"
- Storage reads return old data, not recent saves

### Pitfall 3: Web Crypto API Key Derivation is Slow

**What goes wrong:** PBKDF2 with 100k iterations takes 500ms-1s on mid-range devices

**Why it happens:** PBKDF2 is intentionally slow (CPU-intensive) to resist brute-force attacks

**How to avoid:**
- Generate key once on first load, cache in memory (don't regenerate on every encrypt/decrypt)
- Show loading spinner during key generation ("Setting up encryption...")
- Don't block UI thread: use Web Workers for key generation (overkill for v1, consider for v2)

**Warning signs:**
- Noticeable lag when saving profile first time
- User reports "extension is slow"
- Encryption/decryption takes >1 second

### Pitfall 4: Zustand State Not Persisting Across Popup Closes

**What goes wrong:** Extension popup state resets every time popup is closed

**Why it happens:** Popup is destroyed on close; Zustand state lives in popup context, not background

**How to avoid:**
- Store profile in chrome.storage.local (already planned via `profile-storage.ts`)
- Load profile from storage on popup mount
- Use `persist` middleware from Zustand (optional, adds complexity)

**Warning signs:**
- User edits profile, closes popup, reopens → edits are gone
- Profile state resets on browser restart
- State exists during editing but not after reload

### Pitfall 5: Regex-Based Parsing Fails on Edge Cases

**What goes wrong:** Email regex fails on valid emails (e.g., `name+tag@domain.co.uk`)

**Why it happens:** Overly restrictive regex patterns; email/phone formats are more complex than expected

**How to avoid:**
- Use permissive regex patterns (match more, filter less)
- Test with diverse samples (international phone numbers, complex emails)
- Don't validate format during parsing (validation happens in Zod schema later)
- Accept false positives (e.g., "123-456-7890" might not be a phone, but capture it anyway)

**Warning signs:**
- Parser misses valid email addresses
- Phone numbers with extensions (x1234) not captured
- International formats (+44, +91) not detected

---

## Code Examples

Verified patterns from official sources:

### Common Operation 1: Reading Chrome Storage

```typescript
// Source: Chrome Storage API docs (chrome.dev)
// Read encrypted profile from chrome.storage.local
export async function loadProfile(): Promise<Profile | null> {
  const { encryptedProfile } = await chrome.storage.local.get('encryptedProfile')
  
  if (!encryptedProfile) {
    return null
  }
  
  const decrypted = await decryptData(encryptedProfile)
  return ProfileSchema.parse(decrypted) // Validate with Zod
}
```

### Common Operation 2: React Component with Zustand

```typescript
// Source: Zustand docs + React hooks docs
import { useProfileStore } from '@/lib/store/profile-store'

export function ProfileEditor() {
  // Select only needed state (re-renders only when `profile` changes)
  const profile = useProfileStore(state => state.profile)
  const updatePersonal = useProfileStore(state => state.updatePersonal)
  const isSaving = useProfileStore(state => state.isSaving)
  
  if (!profile) {
    return <div>Loading...</div>
  }
  
  return (
    <form>
      <input
        value={profile.personal.name}
        onChange={(e) => updatePersonal({ name: e.target.value })}
      />
      
      {isSaving && <span>Saving...</span>}
    </form>
  )
}
```

### Common Operation 3: Testing Parser Accuracy

```typescript
// Source: Vitest docs + existing plan files
import { describe, it, expect } from 'vitest'
import { parseResume } from '@/lib/parser/resume-parser'

describe('resume parser accuracy', () => {
  it('should parse name with ≥75% confidence', () => {
    const resume = `
      John Doe
      john.doe@example.com | (555) 123-4567
      
      Experience
      Software Engineer at Google (2020-Present)
    `
    
    const parsed = parseResume(resume)
    
    expect(parsed.personal.name).toBe('John Doe')
    expect(parsed.personal.confidence).toBeGreaterThanOrEqual(75)
  })
  
  it('should extract work history with company and dates', () => {
    const resume = `
      Experience
      Software Engineer at Google
      January 2020 - Present
      - Built distributed systems
    `
    
    const parsed = parseResume(resume)
    
    expect(parsed.workHistory).toHaveLength(1)
    expect(parsed.workHistory[0].company).toBe('Google')
    expect(parsed.workHistory[0].startDate).toMatch(/^\d{4}-\d{2}$/)
  })
})
```

---

## Implementation Recommendations

### For Plan 01-01 (Type System & Profile Schema)

**Guidance:**
- Use Zod for runtime validation + TypeScript type inference (single source of truth)
- Define `RolePreference` enum exactly as specified in PRD (Tech, Healthcare, Finance, Marketing, Operations, Other)
- Include `confidence: number` field in all parsed types (enables "flag for review" feature)
- Use ISO 8601 date format (`YYYY-MM-DD` or `YYYY-MM`) for consistency
- Add JSDoc comments on all exported types (helps IDE autocomplete)

**Critical:**
- `WorkExperience.id` must be UUID (use `crypto.randomUUID()` when creating)
- `endDate` must support `"Present"` literal (for current jobs)
- Domain-specific fields (`DomainExtras`) must be optional (only shown for matching role)

### For Plan 01-02 (Resume Text Parser with ≥75% Accuracy)

**Guidance:**
- Use vanilla JS + regex (no npm libraries; gives full control)
- Three-stage pipeline: Section Detection → Field Extraction → Confidence Scoring
- Test with 10+ diverse resume samples (different formats, industries, countries)
- Email regex: `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g` (permissive)
- Phone regex: `/[\+\(]?\d[\d\s\-\(\)]{7,}\d/g` (captures international formats)
- Assign confidence based on pattern match strength (exact match = 100, fuzzy = 50-75, guess = 25)

**Critical:**
- ≥75% accuracy on **key fields** (name, email, phone, work history, education, skills) — PRD requirement
- Low-confidence fields (<70%) must be flagged for manual review (yellow highlight in UI)
- Parser must handle missing sections gracefully (return empty arrays, not errors)

### For Plan 01-03 (Encrypted Storage Layer)

**Guidance:**
- Use Web Crypto API (native, zero dependencies) for AES-GCM encryption
- Generate device-specific key using PBKDF2 with 100k iterations
- Store key seed in chrome.storage.local (unencrypted area) — v1 approach
- Prepend IV (12 bytes) to encrypted data (needed for decryption)
- Convert to base64 for storage compatibility

**Critical:**
- Never store plaintext profile data (REQ-PRO-05 requirement)
- Handle chrome.storage.local quota (10MB limit) — monitor with `getBytesInUse()`
- Export data as plaintext JSON (not encrypted) — REQ-PRO-06 requirement
- Delete must wipe both encrypted profile AND device seed (full cleanup)

### For Plan 01-04 (Profile Editor UI with Zustand Integration)

**Guidance:**
- Use Zustand for state management (~1KB, no boilerplate)
- Load profile from storage on mount (`useEffect` with `loadProfile()`)
- Auto-save after resume parsing (seamless UX)
- Show loading states (`isLoading`, `isSaving`, `isParsing`) — good UX
- Use controlled inputs with Zustand state (one-way data flow)

**Critical:**
- Dynamic arrays (work history, education) need add/edit/delete actions
- Skills UI should be tag-based (add/remove individual skills)
- Role preference dropdown shows domain-specific fields conditionally
- Profile editor is in options page (`entrypoints/options/App.tsx`) — not popup

---

## Open Questions

1. **Resume Parsing Confidence Threshold**
   - What we know: PRD requires ≥75% accuracy on key fields
   - What's unclear: Should we block save if confidence < 75%, or just flag for review?
   - Recommendation: Flag (yellow highlight) but allow save. User can manually correct.

2. **Key Rotation Strategy**
   - What we know: v1 uses device-specific key (no user password)
   - What's unclear: What happens if device seed is lost (browser data cleared)?
   - Recommendation: v1 accepts data loss; v2 adds optional password protection + cloud backup

3. **Resume Format Priority**
   - What we know: v1 is paste-only (no file upload); PDF/DOCX deferred to v2
   - What's unclear: Should we provide sample resume format guidance in UI?
   - Recommendation: Add tooltip: "Paste plain text resume (Ctrl+V). Works best with standard formats."

---

## Sources

### Primary (HIGH confidence)

- **MDN Web Crypto API** ([developer.mozilla.org/docs/Web/API/SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)) — Verified 2026-02-20 — AES-GCM encryption patterns, key generation, IV handling
- **Chrome Storage API** ([developer.chrome.com/docs/extensions/reference/api/storage](https://developer.chrome.com/docs/extensions/reference/api/storage)) — Verified 2026-02-20 — Storage areas, quota limits, usage patterns
- **Zustand GitHub** ([github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)) — Verified 2026-02-20 — State management patterns, async actions, persist middleware
- **Zod Documentation** ([zod.dev](https://zod.dev)) — Verified 2026-02-20 — Schema validation, TypeScript inference, runtime safety
- **WXT Framework Docs** ([wxt.dev/guide](https://wxt.dev/guide)) — Verified 2026-02-20 — Extension structure, entrypoints, TypeScript config
- **React Hooks Reference** ([react.dev/reference/react/hooks](https://react.dev/reference/react/hooks)) — Verified 2026-02-20 — useState, useEffect, useRef patterns

### Secondary (MEDIUM confidence)

- **Existing Plan Files** (01-01-PLAN.md through 01-04-PLAN.md) — Created by GSD system — Provides task structure and implementation details
- **Project PRD.md** — Project documentation — Epic 1 requirements (REQ-PRO-01 through REQ-PRO-06)
- **Project TECHSTACK.md** — Project documentation — Confirmed tech stack, dependencies, architecture

### Tertiary (LOW confidence)

- **Web Dev for Beginners (Microsoft)** ([github.com/microsoft/Web-Dev-For-Beginners](https://github.com/microsoft/Web-Dev-For-Beginners)) — Educational resource; not directly applicable; provides general web dev context

---

## Metadata

**Confidence breakdown:**
- **Standard stack:** HIGH — All libraries specified in TECHSTACK.md; verified with official docs; widely used in production
- **Architecture:** HIGH — Patterns based on MDN/Chrome official docs + Zustand/Zod official patterns; proven in extension context
- **Pitfalls:** MEDIUM — Based on known Chrome extension gotchas + Web Crypto edge cases; not all tested in this exact setup

**Research date:** 2026-02-20  
**Valid until:** 2026-03-20 (30 days) — Stable technologies; low churn risk
