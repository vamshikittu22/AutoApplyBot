# Technology Stack

**Analysis Date:** 2026-02-20

## Languages

**Primary:**
- TypeScript 5.x - All extension code (strict mode enabled)

**Secondary:**
- JavaScript (ES2022+) - Runtime execution in browser context

## Runtime

**Environment:**
- Chrome/Edge Browser (Manifest V3)
- Browser Web APIs (native)

**Package Manager:**
- pnpm (latest)
- Lockfile: Not yet created (project in planning phase)

## Frameworks

**Core:**
- WXT (Web Extension Tools) - Manifest V3 framework for browser extensions
- React 18 - UI framework for popup, options page, and sidebar components
- Vite - Build tool (integrated with WXT)

**Testing:**
- Vitest - Unit testing framework (Vite-native)
- Playwright - E2E testing for real browser automation

**Build/Dev:**
- WXT built-in dev server - Hot module reload during development
- TypeScript Compiler (tsc) - Type checking
- ESLint - Code linting
- Prettier - Code formatting

## Key Dependencies

**Critical:**
- zustand ~1KB - Lightweight state management for popup + content script state
- tailwindcss - Utility-first CSS framework for styling

**Infrastructure:**
- Web Crypto API (native) - AES-GCM encryption for profile data storage
- Chrome Storage API (native) - Local storage for encrypted profile, tracker, field mappings
- MutationObserver (native) - Form detection and monitoring

**AI (Optional, Online-Only):**
- Direct API calls to OpenAI GPT-4o mini (primary) or Anthropic Claude Haiku (fallback)
- No SDK - using direct fetch() calls from extension to provider

**Deferred to v2:**
- pdf.js (Mozilla) - PDF resume parsing (v1 uses paste-only)
- mammoth.js - DOCX resume parsing (v1 uses paste-only)

## Configuration

**Environment:**
- Chrome Extension Manifest V3
- No .env files required for core features (offline-first design)
- AI API keys stored encrypted in Chrome local storage (user-provided, optional)
- Configuration defined in `wxt.config.ts`

**Build:**
- `wxt.config.ts` - WXT framework configuration
- `tsconfig.json` - TypeScript strict mode configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `vitest.config.ts` - Vitest test configuration (planned)
- `playwright.config.ts` - Playwright E2E configuration (planned)

## Platform Requirements

**Development:**
- Node.js 18+ (for pnpm and build tools)
- pnpm package manager
- Chrome browser (Dev mode) for testing
- TypeScript 5.x with strict mode enabled

**Production:**
- Chrome browser (Manifest V3 compatible)
- Edge browser (Chromium-based, Manifest V3 compatible)
- No backend server required (fully local-first)
- Optional: User's own OpenAI or Anthropic API key for AI features

---

*Stack analysis: 2026-02-20*
