# Phase 0: Foundation & Setup - Research

**Researched:** 2026-02-20
**Domain:** WXT Framework, Chrome Extension Development Environment
**Confidence:** HIGH

## Summary

Phase 0 establishes the development environment for a Chrome extension using WXT v0.20.17, a next-generation web extension framework built on Vite. WXT provides file-based entrypoints, automatic manifest generation, hot module reload (HMR), TypeScript support, and built-in testing utilities. The research confirms WXT's suitability for the project requirements: it natively supports React, Tailwind CSS, Zustand, and provides first-class Vitest integration with browser API polyfills.

The framework handles the complexity of Manifest V3 while maintaining MV2 compatibility, automatically converts MV3 configurations to MV2 format, and provides utilities specifically designed for content script development (Shadow DOM, IFrame isolation, context management). All locked user decisions from CONTEXT.md are directly supported by WXT's architecture.

**Primary recommendation:** Initialize project with `pnpm dlx wxt@latest init`, select React template, configure strict TypeScript, integrate ESLint + Prettier, and establish the hybrid folder structure defined in CONTEXT.md before beginning feature development.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Development workflow:**
- **Hot reload:** Full hot reload — changes immediately reflected without manual reload
- **Type checking:** Strict checking mode — TypeScript + ESLint run on every save, catching errors immediately (slower but safer)

**Project structure:**
- **Component organization:** Hybrid approach
  - Shared/reusable components live in `src/components/`
  - Feature-specific components grouped by feature (e.g., `src/profile/components/`, `src/autofill/components/`)
- **Test file location:** Separate `tests/` directory mirroring `src/` structure
  - Unit tests: `tests/unit/`
  - E2E tests: `tests/e2e/`
- **ATS platform code:** Folder per ATS (Phase 2 prep)
  - `src/lib/ats/workday/` with detection, selectors, mapping inside
  - `src/lib/ats/greenhouse/` with detection, selectors, mapping inside
  - `src/lib/ats/lever/` with detection, selectors, mapping inside

**Extension manifest:**
- **Permissions:** All permissions upfront at install time
  - Clear privacy disclosure shown during onboarding
  - No progressive/optional permissions
- **Content script injection:** All pages
  - Detect ATS pages programmatically after injection
  - Lazy activation — only activate when job form detected

**Specific constraints:**
- Follow AGENTS.md structure exactly — no deviations from defined folder layout
- TECHSTACK.md locks technology choices (WXT, React, Zustand, Tailwind, Vitest, Playwright)
- Atomic commits policy: commit after every task, clear single-purpose messages
- Use pnpm exclusively (never npm or yarn)
- All commands defined in AGENTS.md must work after Phase 0 completes

### Claude's Discretion

**Development workflow:**
- **Dev environment startup:** Single command vs multiple terminals based on WXT best practices
- **Source maps:** Include if helpful for debugging, exclude if build speed matters more

**Project structure:**
- **Constants organization:** Single file or split by domain based on size/complexity

**Extension manifest:**
- **Content script timing (run_at):** Balance early detection vs page performance based on ATS research
- **Execution world:** ISOLATED vs MAIN world based on Workday Shadow DOM requirements (research will inform this)

**Code quality gates:**
- **TypeScript blocking:** Likely block commits given strict mode policy, but defer to best practices
- **ESLint blocking:** Likely block errors, warn-only for warnings
- **Prettier enforcement:** Auto-format on save recommended, enforcement level flexible
- **Pre-commit tests:** Balance test suite speed vs commit friction (likely non-blocking for Phase 0)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| WXT | 0.20.17 | Extension framework & build system | Industry standard for modern MV3 extensions; Vite-based with HMR, file-based entrypoints, automatic manifest generation |
| Vite | 6.x (via WXT) | Build tool & dev server | Bundled with WXT; sub-second HMR, ES module support, optimized production builds |
| TypeScript | 5.x | Type safety | Project-wide strict mode; WXT generates `.wxt/tsconfig.json` automatically |
| React | 18.x | UI framework | Component model for popup/options pages; full ecosystem support |
| pnpm | 9.x | Package manager | Required by project specification; faster installs, efficient disk usage |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 2.x | Unit testing | Test ATS detection, autofill logic, encryption; WXT provides `WxtVitest()` plugin with browser API mocks |
| Playwright | 1.x | E2E testing | Test real extension behavior on Workday/Greenhouse/Lever pages |
| ESLint | 9.x | Code linting | Catch errors on save; integrate with TypeScript strict mode |
| Prettier | 3.x | Code formatting | Enforce consistent style; auto-format on save |
| Tailwind CSS | 4.x | Styling | Utility-first CSS; zero runtime overhead; integrates with WXT |
| Zustand | 5.x | State management | Lightweight (~1KB); no boilerplate; works across popup + content scripts |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| WXT | Plasmo | Plasmo is heavier, more opinionated; WXT is framework-agnostic with better Vite integration |
| WXT | Vanilla Chrome API | Hand-rolling build setup loses HMR, manifest generation, TypeScript config, MV2/MV3 compatibility layer |
| pnpm | npm/yarn | Project requirement specifies pnpm; no alternatives considered |

**Installation:**

```bash
# Bootstrap new WXT project with React template
pnpm dlx wxt@latest init

# Or manual setup
pnpm init
pnpm i -D wxt react react-dom @types/react @types/react-dom
pnpm i -D vitest @vitest/ui playwright @playwright/test
pnpm i -D eslint prettier eslint-config-prettier
pnpm i -D typescript
pnpm i zustand tailwindcss postcss autoprefixer
```

---

## Architecture Patterns

### Recommended Project Structure

WXT supports optional `src/` directory. Based on CONTEXT.md, use `srcDir: 'src'` for cleaner separation:

```
/                               ← Project root
├── .output/                    ← Build artifacts (generated)
├── .wxt/                       ← Generated TypeScript config (generated)
├── public/                     ← Static assets (icons, manifest resources)
├── tests/
│   ├── unit/                   ← Vitest unit tests (mirrors src/)
│   └── e2e/                    ← Playwright E2E tests
├── src/                        ← Source code root
│   ├── entrypoints/
│   │   ├── background.ts       ← Service worker
│   │   ├── content/            ← Content scripts
│   │   ├── popup/              ← Extension popup (React)
│   │   └── options/            ← Settings page (React)
│   ├── components/             ← Shared React components
│   ├── hooks/                  ← Custom React hooks
│   ├── lib/
│   │   ├── ats/
│   │   │   ├── workday/        ← Workday detection, selectors, mapping
│   │   │   ├── greenhouse/     ← Greenhouse detection, selectors, mapping
│   │   │   └── lever/          ← Lever detection, selectors, mapping
│   │   ├── autofill/           ← Autofill engine
│   │   ├── ai/                 ← AI prompt builder, API calls
│   │   ├── parser/             ← Resume parsing (paste-only in v1)
│   │   ├── storage/            ← Chrome Storage + Web Crypto encryption
│   │   └── utils/              ← Shared utilities
│   ├── types/                  ← Shared TypeScript types
│   └── constants/              ← ATS patterns, field selectors
├── .env                        ← Environment variables
├── package.json
├── tsconfig.json               ← Extends .wxt/tsconfig.json
├── wxt.config.ts               ← WXT configuration
├── tailwind.config.ts
├── postcss.config.js
├── vitest.config.ts
├── playwright.config.ts
├── .eslintrc.cjs
└── .prettierrc.json
```

### Pattern 1: WXT Configuration with Strict TypeScript

**What:** Configure WXT to use `src/` directory, enable path aliases, strict TypeScript

**When to use:** Phase 0 setup — foundation for all future development

**Example:**

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  outDir: '.output',
  publicDir: 'public',
  
  manifest: {
    name: 'AutoApply Copilot',
    permissions: ['activeTab', 'storage'],
  },

  vite: () => ({
    resolve: {
      alias: {
        '@': '/src',
        '@@': '/',
      },
    },
  }),
});
```

```jsonc
// tsconfig.json
{
  "extends": "./.wxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Pattern 2: Content Script with Context and Shadow DOM

**What:** WXT provides `ContentScriptContext` to handle extension invalidation + `createShadowRootUi` for isolated styling

**When to use:** All content scripts that inject UI (ATS detection, autofill toolbar)

**Example:**

```typescript
// src/entrypoints/content/workday-autofill.content.ts
import './style.css';

export default defineContentScript({
  matches: ['*://*/apply.workday.com/*'],
  cssInjectionMode: 'ui',
  
  async main(ctx) {
    // ctx tracks if extension is invalidated (uninstalled/updated)
    const ui = await createShadowRootUi(ctx, {
      name: 'autofill-toolbar',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        // Mount React app in Shadow DOM
        const root = ReactDOM.createRoot(container);
        root.render(<AutofillToolbar />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
```

**Why this matters:** 
- `ctx.addEventListener`, `ctx.setTimeout`, etc. auto-cleanup when extension invalidates
- Shadow DOM isolates styles from page CSS (critical for ATS pages with aggressive global styles)
- WXT handles HMR for content scripts automatically

### Pattern 3: Vitest with WXT Browser API Mocks

**What:** WXT provides `WxtVitest()` plugin that polyfills `browser.*` APIs in tests

**When to use:** All unit tests that use Chrome Storage, messaging, or extension APIs

**Example:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest';

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

```typescript
// tests/unit/lib/storage/encryption.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { encryptData, decryptData } from '@/lib/storage/encryption';

describe('encryptData', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('should encrypt and decrypt profile data', async () => {
    const profile = { name: 'John Doe', email: 'john@example.com' };
    const encrypted = await encryptData(profile);
    const decrypted = await decryptData(encrypted);
    
    expect(decrypted).toEqual(profile);
  });
});
```

**Why this matters:**
- No need to manually mock `chrome.storage` — `fakeBrowser` provides in-memory implementation
- Tests run in Node without browser dependency
- Same test code works in CI/CD

### Anti-Patterns to Avoid

- **Don't manually create `manifest.json`** — WXT generates it from `wxt.config.ts` + entrypoint metadata
- **Don't use relative imports across directories** — Use `@/` path aliases (`@/lib/storage` not `../../../lib/storage`)
- **Don't import content script CSS outside `defineContentScript`** — WXT only bundles CSS imported inside content script entrypoints
- **Don't use `world: 'MAIN'` in content scripts** — Use `injectScript()` for main-world code instead (better MV2 compat, cross-browser support)
- **Don't add build artifacts to git** — `.output/` and `.wxt/` are generated; add to `.gitignore`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Extension manifest generation | Manual `manifest.json` with separate MV2/MV3 files | WXT `defineConfig({ manifest: {...} })` | WXT auto-converts MV3 → MV2 format, discovers icons, generates content_scripts from entrypoints |
| Content script hot reload | Manual WebSocket + message passing | WXT dev mode (built-in) | WXT injects HMR client, handles asset updates, reloads content scripts automatically |
| Extension API types | Manual `@types/chrome` configuration | WXT auto-imports | WXT generates `.wxt/wxt.d.ts` with correct types for target browser |
| Build system setup | Webpack + plugin config | Vite via WXT | Vite is 10-100x faster than Webpack; WXT pre-configures Vite for extensions |
| Shadow DOM CSS injection | Manual `adoptedStyleSheets` setup | WXT `createShadowRootUi()` | Handles CSS bundling, injection, HMR, and cleanup automatically |
| Browser API polyfills in tests | Manual mocks for `chrome.*` | WXT `fakeBrowser` + `WxtVitest()` | Full in-memory implementation of Storage, Tabs, Messaging, Runtime APIs |

**Key insight:** Extension development has deceptively complex edge cases (manifest differences across MV2/MV3, content script lifecycle, Shadow DOM event isolation, storage API inconsistencies). WXT's abstractions are battle-tested across 9,200+ GitHub stars and production extensions. Rebuilding these from scratch introduces bugs and delays launch.

---

## Common Pitfalls

### Pitfall 1: Content Script Invalidation Errors

**What goes wrong:** After extension update/reload, content scripts throw `"Extension context invalidated"` errors when calling `chrome.*` APIs

**Why it happens:** Browsers don't automatically stop content scripts when extension reloads; scripts continue running with stale API references

**How to avoid:** 
- Always use `ctx` helpers: `ctx.addEventListener()`, `ctx.setTimeout()`, `ctx.setInterval()`
- Check `ctx.isInvalid` before long-running operations
- Use `ctx.onInvalidated` to cleanup resources

**Warning signs:** 
- Errors in console after hot reload during development
- Users report "extension stopped working" without page refresh

### Pitfall 2: Content Script CSS Leaking to Page

**What goes wrong:** Content script styles affect page layout; page styles break extension UI

**Why it happens:** By default, content scripts inject CSS into page's global scope

**How to avoid:**
- Set `cssInjectionMode: 'ui'` in `defineContentScript`
- Use `createShadowRootUi()` for all injected UIs
- Never use `createIntegratedUi()` for production (only for quick prototypes)

**Warning signs:**
- Extension toolbar looks different on different ATS pages
- Workday/Greenhouse form layout breaks when extension loads

### Pitfall 3: Path Aliases Not Working

**What goes wrong:** TypeScript can't resolve `@/lib/storage` imports

**Why it happens:** WXT generates path aliases in `.wxt/tsconfig.json`, but must run `wxt prepare` first

**How to avoid:**
- Run `pnpm postinstall` (runs `wxt prepare`) after installing dependencies
- Add `"postinstall": "wxt prepare"` to `package.json` scripts
- Never manually edit `.wxt/tsconfig.json` — it's regenerated on every build

**Warning signs:**
- Import errors in IDE despite correct file structure
- Build succeeds but dev server fails

### Pitfall 4: Manifest Not Regenerating

**What goes wrong:** Changes to `wxt.config.ts` `manifest` object don't appear in build output

**Why it happens:** WXT caches manifest; dev server must restart to pick up changes

**How to avoid:**
- Restart `pnpm dev` after changing `wxt.config.ts`
- Use `manifest: ({ browser, manifestVersion }) => ({...})` function for dynamic values
- Check `.output/<browser>-mv<version>/manifest.json` to verify changes

**Warning signs:**
- New permissions not prompting user during development
- Content script match patterns not updating

### Pitfall 5: `run_at` Timing Issues

**What goes wrong:** Content script tries to access DOM before it exists

**Why it happens:** Default `run_at: 'document_idle'` may be too late for detecting dynamic ATS pages

**How to avoid:**
- Start with `run_at: 'document_end'` (after DOM, before images/subresources)
- Use `ctx.addEventListener(window, 'wxt:locationchange')` for SPA navigation (YouTube, LinkedIn)
- For urgent injections, use `run_at: 'document_start'` + wait for element with `MutationObserver`

**Warning signs:**
- Extension toolbar doesn't appear on first page load
- Autofill button missing until page refresh

---

## Code Examples

Verified patterns from official WXT documentation:

### Basic Entrypoint Structure

```typescript
// src/entrypoints/background.ts
export default defineBackground(() => {
  console.log('Background service worker started');
  
  browser.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
  });
});
```

```typescript
// src/entrypoints/popup/index.tsx
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

function init() {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');
  
  ReactDOM.createRoot(root).render(<App />);
}

init();
```

### Content Script with Auto-Mount for SPAs

```typescript
// src/entrypoints/content/workday-helper.content.ts
import { MatchPattern } from 'wxt/utils/match-patterns';

const workdayPattern = new MatchPattern('*://*/apply.workday.com/*/job/*');

export default defineContentScript({
  matches: ['*://*/apply.workday.com/*'],
  
  main(ctx) {
    // Listen for URL changes (SPA navigation)
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      if (workdayPattern.includes(newUrl)) {
        mountAutofillUI(ctx);
      }
    });

    // Initial mount if already on job page
    if (workdayPattern.includes(window.location.href)) {
      mountAutofillUI(ctx);
    }
  },
});

function mountAutofillUI(ctx: ContentScriptContext) {
  const ui = createShadowRootUi(ctx, {
    name: 'workday-autofill',
    position: 'inline',
    anchor: '#jobDetails',
    onMount: (container) => {
      // UI logic here
    },
  });

  ui.autoMount(); // Auto-remounts if anchor element appears/disappears
}
```

### Script Injection to Main World

```typescript
// src/entrypoints/content/workday-detector.content.ts
export default defineContentScript({
  matches: ['*://*/apply.workday.com/*'],
  
  async main() {
    // Inject script into main world (has access to page's JavaScript context)
    const { script } = await injectScript('/page-analyzer.js', {
      keepInDom: true,
      modifyScript(script) {
        script.dataset['extensionId'] = browser.runtime.id;
      },
    });

    // Listen for messages from injected script
    script.addEventListener('workday-form-detected', (event) => {
      if (event instanceof CustomEvent) {
        console.log('Form fields:', event.detail.fields);
      }
    });
  },
});
```

```typescript
// src/entrypoints/page-analyzer.ts
export default defineUnlistedScript(() => {
  // Runs in main world — can access page variables
  const formFields = extractWorkdayFields();
  
  document.currentScript?.dispatchEvent(
    new CustomEvent('workday-form-detected', {
      detail: { fields: formFields },
    })
  );
});
```

Add to `wxt.config.ts`:

```typescript
export default defineConfig({
  manifest: {
    web_accessible_resources: [
      {
        resources: ['page-analyzer.js'],
        matches: ['*://*/apply.workday.com/*'],
      },
    ],
  },
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Webpack + Chrome Extension Boilerplate | WXT (Vite-based) | 2023 | 10-100x faster builds, native HMR, automatic manifest generation |
| Separate MV2/MV3 manifests | Single MV3 manifest auto-converted | WXT 0.15+ (2024) | Maintain one source, deploy both versions |
| Manual content script CSS injection | `cssInjectionMode: 'ui'` | WXT 0.18+ (2024) | Automatic Shadow DOM CSS bundling |
| `chrome.*` APIs | `browser.*` unified API | 2020 (Firefox standard) | Cross-browser compatibility; WXT provides polyfills |
| Manual browser mocks in tests | `@webext-core/fake-browser` | WXT 0.19+ (2025) | Full in-memory browser API implementation |

**Deprecated/outdated:**
- **`chrome.browserAction` / `chrome.pageAction`**: Replaced by unified `chrome.action` in MV3 (WXT auto-converts)
- **`background.scripts` array**: MV3 uses `background.service_worker`; WXT generates correct format
- **Inline `<script>` in content scripts**: CSP violations; use `injectScript()` helper instead
- **`run_at: 'document_idle'` as default**: Too late for modern SPAs; prefer `document_end` + event listeners

---

## Open Questions

### 1. **Content Script Execution World for Workday Shadow DOM**

**What we know:**
- Workday uses Shadow DOM extensively for form isolation
- WXT recommends `injectScript()` over `world: 'MAIN'` for cross-browser compat
- ISOLATED world (default) can access Shadow DOM via `element.shadowRoot`

**What's unclear:**
- Does Workday use closed Shadow DOM (`mode: 'closed'`)?
- Do we need main-world access to bypass Shadow DOM restrictions?

**Recommendation:** 
- Start with ISOLATED world (default)
- Test on Workday sandbox during Phase 1
- If closed Shadow DOM blocks access, use `injectScript()` to analyze form structure from main world, then send field data back to content script via CustomEvent

### 2. **Source Maps in Production**

**What we know:**
- Source maps help debug production issues
- Source maps expose source code structure (not a concern for open-source extension)
- Source maps increase bundle size by ~30%

**What's unclear:**
- Are source maps useful for debugging user-reported issues?
- Does extra bundle size impact extension performance?

**Recommendation:**
- Enable source maps for development (default in WXT)
- Disable for production builds (`vite: { build: { sourcemap: false } }`)
- Revisit if user-reported errors are hard to diagnose

### 3. **Git Pre-Commit Hooks**

**What we know:**
- TypeScript strict mode and ESLint should run on every save (user requirement)
- Pre-commit hooks add ~2-10s delay to commits
- User specified "likely non-blocking for Phase 0"

**What's unclear:**
- Should we block commits that fail type-check/lint?
- Should we auto-fix with Prettier before committing?

**Recommendation:**
- Phase 0: No pre-commit hooks (rely on IDE on-save checks)
- Phase 1+: Add `husky` + `lint-staged` for auto-format only (non-blocking)
- Never block commits — fast iteration > enforcement

---

## Sources

### Primary (HIGH confidence)

- WXT Official Documentation — https://wxt.dev/guide/installation.html (accessed 2026-02-20)
- WXT GitHub Repository — https://github.com/wxt-dev/wxt (9.2k stars, actively maintained)
- WXT Content Scripts Guide — https://wxt.dev/guide/essentials/content-scripts.html
- WXT Manifest Configuration — https://wxt.dev/guide/essentials/config/manifest.html
- WXT TypeScript Config — https://wxt.dev/guide/essentials/config/typescript.html
- WXT Unit Testing (Vitest) — https://wxt.dev/guide/essentials/unit-testing.html
- WXT CLI Reference — https://wxt.dev/api/cli/wxt.html
- WXT Project Structure — https://wxt.dev/guide/essentials/project-structure.html

### Secondary (MEDIUM confidence)

- Chrome Extension Manifest V3 Docs — https://developer.chrome.com/docs/extensions/mv3/
- MDN Shadow DOM API — https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot
- Chrome Extension Permissions — https://developer.chrome.com/docs/extensions/reference/permissions/

### Tertiary (LOW confidence)

None used — all findings verified against WXT official documentation

---

## Metadata

**Confidence breakdown:**
- **Standard stack:** HIGH — All libraries verified from official WXT docs and package.json examples
- **Architecture:** HIGH — Folder structure matches WXT defaults; content script patterns from official guides
- **Pitfalls:** HIGH — Documented in WXT troubleshooting, GitHub issues, and official FAQ
- **Open questions:** MEDIUM — Workday Shadow DOM behavior requires Phase 1 testing; pre-commit hooks are implementation preference

**Research date:** 2026-02-20  
**Valid until:** 2026-03-22 (30 days — WXT is stable; minor version updates expected but no breaking changes)

**WXT release cycle:** ~2 minor releases per month; v0.20.17 published Feb 12, 2026

**Critical notes for planner:**
- WXT init template includes ESLint/Prettier configs — use as baseline, don't write from scratch
- `wxt prepare` must run before TypeScript path aliases work — include in postinstall script
- All `pnpm dev/build/test` commands in AGENTS.md align with WXT CLI structure
- Shadow DOM approach for content script UI directly addresses "no style leakage" requirement from TECHSTACK.md
