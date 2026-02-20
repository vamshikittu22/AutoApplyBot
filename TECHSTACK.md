# TECHSTACK.md — AutoApply Copilot

> **All technology decisions for this project are defined here.**
> Agents must check this file before importing any library, creating any file,
> or making any architecture decision.
>
> 🔗 Related files: [PROJECT_PLAN.md](./PROJECT_PLAN.md) | [PRD.md](./PRD.md) | [MVC.md](./MVC.md) | [AGENTS.md](./AGENTS.md)

---

## Core Philosophy

This extension is **offline-first by design**.

- The core product — profile storage, ATS autofill, form detection, job tracker — works
  100% without an internet connection.
- AI (answer generation) is an **optional, online-only enhancement**. If the user has no
  internet or no API key configured, every other feature continues working normally.
- There is **no mandatory backend, no database server, no cloud service** required
  to install and use this extension. Everything lives in the user's browser.
- Keep the bundle small, keep the runtime lean. Every dependency added must justify
  its weight. Prefer native browser APIs over libraries wherever possible.

---

## Tech Stack — Extension (Core, Offline)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Extension Framework | **WXT (Web Extension Tools)** | Manifest V3 native, framework-agnostic, excellent TypeScript support, lighter than Plasmo, works with Vite for fast builds |
| UI Framework | **React 18 + TypeScript** | Component model for popup and sidebar UIs; full type safety |
| Styling | **Tailwind CSS** | Utility-first; produces tiny CSS bundles; no runtime overhead |
| State Management | **Zustand** | ~1KB; no boilerplate; perfect for extension popup + content script state |
| Local Storage | **Chrome Storage API (local)** | Built-in, no extra library needed; stores profile, tracker, field mappings |
| Data Encryption | **Web Crypto API (native)** | Built into every browser; AES-GCM encryption for profile data; zero dependencies |
| Resume Parsing (PDF) | **pdf.js (Mozilla)** | Runs entirely in the browser; no server upload needed; well-maintained |
| Resume Parsing (DOCX) | **mammoth.js** | Client-side DOCX → plain text extraction; lightweight |
| Form Detection | **Vanilla JS + MutationObserver** | No library needed; scoped to form elements only; native and fast |
| Build Tool | **Vite** | Fast HMR, small output bundles; built into WXT |
| Package Manager | **pnpm** | Faster installs, better disk usage than npm/yarn |
| TypeScript | **TypeScript 5.x** | Strict mode enabled; shared types across all modules |

---

## Tech Stack — AI Answer Feature (Online-Only, Optional)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| AI Provider | **OpenAI GPT-4o mini (primary)** | Cost-efficient, fast, high quality for short answer generation |
| AI Fallback | **Anthropic Claude Haiku** | Optional fallback if user prefers or GPT is unavailable |
| API Key Storage | **Chrome Storage API (local, encrypted)** | User provides their own API key; stored locally encrypted via Web Crypto; never sent anywhere except directly to OpenAI/Anthropic |
| API Calls | **Direct from extension → AI provider** | No backend proxy needed for v1; user's own key, user's own usage |
| AI Activation | **Online check before every AI call** | `navigator.onLine` guard; graceful fallback message if offline |

> **Why no backend proxy in v1?**
> A backend proxy adds infrastructure cost, latency, maintenance burden, and a
> new attack surface — all for a feature that is optional and secondary.
> The user holds their own API key, which is the simplest and most private approach.
> A shared backend proxy with pooled keys is a v2 concern, only if usage data justifies it.

> **AI for JD matching and resume tailoring is explicitly out of v1.**
> That feature requires more sophisticated prompt engineering, document diffing,
> and potentially vector search — it belongs in v2 once the core extension is stable and live.

---

## Tech Stack — Testing

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Unit Testing | **Vitest** | Fast, Vite-native; test ATS detection logic, field mapping, profile parsing |
| E2E Testing | **Playwright** | Automate real browser scenarios on supported ATS pages |
| Extension Testing | **WXT built-in test utilities** | Simulate content script injection and storage in test environment |

---

## Permissions Model (Manifest V3)

Only these permissions are allowed. Adding any permission not listed here requires a written justification in a pull request description and explicit approval.

```
"permissions": [
  "activeTab",      // Read current tab URL and DOM for ATS detection and autofill
  "storage"         // Store encrypted profile, tracker data, and field mappings locally
],
"optional_permissions": [
  "contextMenus"    // P1: Right-click "Save job to tracker" shortcut — only requested on user opt-in
]
```

**Explicitly NOT included (and never to be added without major discussion):**
- `tabs` — not needed; activeTab is sufficient
- `history` — user's browsing history is never accessed
- `webRequest` — no network interception
- `cookies` — no cookie access needed
- `background` persistent service worker polling — content scripts only activate on matching pages

---

## Architecture: How the Extension Works (Offline Flow)

```
User opens ATS job application page
        ↓
WXT injects content script (only on matching URL patterns)
        ↓
Content script detects ATS type using URL + DOM signature
        ↓
  ┌─── Supported ATS detected ───────────────────────────────┐
  │   Show floating toolbar: [Autofill Profile] [Suggest Answer] [Log Job]
  │   User clicks "Autofill Profile"
  │   → Chrome Storage API reads encrypted profile
  │   → Field mapping template applied (ATS-specific)
  │   → Fields highlighted: Green (filled) / Yellow (low confidence) / Red (error)
  │   User reviews → User submits form manually
  │   → Job auto-logged to Chrome Storage tracker
  └───────────────────────────────────────────────────────────┘
        ↓
  ┌─── Unsupported site ─────────────────────────────────────┐
  │   Helper Mode sidebar slides in
  │   Shows profile snippets as one-click copy buttons
  │   User manually pastes into fields
  │   Optional: user creates custom field mapping for this domain
  └───────────────────────────────────────────────────────────┘
```

## Architecture: How AI Answer Feature Works (Online-Only, Optional)

```
User sees a text question on the ATS form
        ↓
Extension detects textarea or open-ended input
        ↓
"Suggest Answer" button appears next to the field
        ↓
User clicks "Suggest Answer"
        ↓
  ┌─── Online check (navigator.onLine) ──────────────────────┐
  │   Offline → Show message: "AI answers need internet. 
  │             Fill this manually or reconnect."
  │   No API key → Show settings link to add API key.
  └───────────────────────────────────────────────────────────┘
        ↓ (online + key present)
Extension reads:
  - Relevant profile sections (role, skills, work history bullets)
  - Job title + company name from the current page
  - The question text
        ↓
Sends minimal, scoped prompt to OpenAI/Anthropic directly
(user's own API key, stored locally encrypted)
        ↓
Returns 2–3 draft options with [placeholder] markers
        ↓
User selects, edits, and manually clicks to insert
Extension never auto-types AI content into any field
```

---

## Data Model (Stored in Chrome Storage API — Local)

All data lives in the user's browser. No external database. No user account required for core features.

**profile** (encrypted with user's device key via Web Crypto)
```
{
  personal: { name, email, phone, address, workAuthorization },
  workHistory: [{ position, company, startDate, endDate, achievements[] }],
  education: [{ degree, institution, startDate, endDate }],
  skills: [{ name, category }],
  links: { linkedin, github, portfolio, personalSite },
  domainExtras: { techStack, npiNumber, licenses[], clinicalSpecialty },
  rolePreference: "Tech" | "Healthcare" | "Finance" | "Marketing" | "Operations" | "Other",
  updatedAt
}
```

**applications** (plain object array)
```
[{
  id, jobTitle, company, atsName, url,
  appliedDate, status, notes
}]
```

**fieldMappings** (custom domain autofill rules saved per domain)
```
[{
  domain, fieldSelector, profileAttribute, confidence, savedAt
}]
```

**settings**
```
{
  aiProvider: "openai" | "anthropic" | null,
  aiApiKey: "<encrypted>",
  disabledSites: ["example.com"],
  volumeGuardrailLimit: 30,
  performanceMode: false,
  cloudSyncEnabled: false
}
```

---

## What Is Intentionally Excluded from v1

| Excluded | Reason |
|----------|--------|
| Backend server (Node, Hono, Express, etc.) | Not needed; all core features are local |
| Cloud database (Supabase, Firebase, PlanetScale) | Not needed for v1; add cloud sync in v2 as opt-in |
| Auth system (login, accounts) | Not needed; extension is single-user and local by default |
| Shared AI proxy / pooled API keys | Adds cost, infrastructure, and privacy risk; defer to v2 |
| AI for JD matching / resume tailoring | Complex feature; belongs in v2 once core is stable |
| Vector search / embeddings | v2+ only |
| Firefox build | Defer until Chrome is stable and validated |
| Analytics SDK (Mixpanel, Amplitude, etc.) | Do not add tracking without explicit user opt-in and a clear privacy policy |

---

## Dependency Rules

- Every new `npm` dependency requires a one-line rationale comment at the top of the relevant file explaining why the native/existing approach was insufficient.
- Zero dependencies that require a persistent backend call for the core autofill flow.
- Zero dependencies that add >50KB to the extension bundle without a strong justification.
- Bundle size target: total extension bundle under **500KB** (excluding pdf.js which is loaded on demand only during resume import).

---

## Folder Structure (WXT)

```
/                          ← Project root (all .md files here)
├── AGENTS.md
├── PROJECT_PLAN.md
├── PRD.md
├── MVC.md
├── TECHSTACK.md
├── GSD_PROMPT.md
├── src/
│   ├── entrypoints/
│   │   ├── background.ts        ← Service worker (minimal; messaging only)
│   │   ├── content/             ← Content scripts (ATS detection, autofill, helper mode)
│   │   ├── popup/               ← Extension popup (React: tracker, quick actions)
│   │   └── options/             ← Settings page (React: profile editor, AI key, preferences)
│   ├── components/              ← Shared React components (toolbar, sidebar, field highlights)
│   ├── hooks/                   ← Custom React hooks (useProfile, useTracker, useATS)
│   ├── lib/
│   │   ├── ats/                 ← ATS detection and field mapping logic per platform
│   │   ├── autofill/            ← Autofill engine: field write, undo, confidence scoring
│   │   ├── ai/                  ← AI prompt builder, API call handler, offline guard
│   │   ├── parser/              ← Resume parsing (pdf.js + mammoth.js wrappers)
│   │   ├── storage/             ← Chrome Storage API abstraction + Web Crypto encryption
│   │   └── utils/               ← Shared utility functions
│   ├── types/                   ← All shared TypeScript types and interfaces
│   └── constants/               ← ATS URL patterns, field selectors, role categories
├── public/                      ← Extension icons and static assets
├── tests/
│   ├── unit/                    ← Vitest unit tests
│   └── e2e/                     ← Playwright E2E tests
├── wxt.config.ts                ← WXT configuration
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## v2 Tech Additions (Do Not Build in v1)

These are planned for v2 once the extension is live, stable, and has real user feedback:

- **Cloud sync:** Supabase (opt-in only; RLS from day one)
- **Shared AI proxy:** Hono on Cloudflare Workers with pooled keys (removes need for user's own API key)
- **JD matching + resume tailoring:** AI-powered analysis of job description vs. profile, with suggested edits
- **Web dashboard:** Lightweight Next.js app for advanced tracker views and analytics
- **Firefox support:** After Chrome version is validated and stable

---

*See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for phased delivery. See [AGENTS.md](./AGENTS.md) for agent rules.*
