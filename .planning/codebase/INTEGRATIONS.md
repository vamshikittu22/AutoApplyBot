# External Integrations

**Analysis Date:** 2026-02-20

## APIs & External Services

**AI Services (Optional, User-Enabled):**
- OpenAI GPT-4o mini - AI answer generation for job application questions
  - SDK/Client: Direct fetch() calls (no SDK)
  - Auth: User's own API key stored encrypted in Chrome local storage
  - Usage: Online-only feature, graceful offline fallback
  - Note: v1 includes mock AI responses for development; real API requires user key

- Anthropic Claude Haiku - Fallback AI provider
  - SDK/Client: Direct fetch() calls (no SDK)
  - Auth: User's own API key stored encrypted in Chrome local storage
  - Usage: Optional alternative to OpenAI

**ATS Platforms (Detection Only, No API):**
- Workday - Priority 1 ATS platform detection via URL + DOM patterns
- Greenhouse - Priority 2 ATS platform detection via URL + DOM patterns
- Lever - Priority 3 ATS platform detection via URL + DOM patterns
- Note: No API integration; extension reads/writes to DOM directly

## Data Storage

**Databases:**
- None (local-first architecture)

**Local Storage:**
- Chrome Storage API (local)
  - Connection: Native browser API (no env var)
  - Client: chrome.storage.local
  - Data: Encrypted profile, applications tracker, field mappings, settings
  - Encryption: Web Crypto API (AES-GCM)

**File Storage:**
- Local filesystem only (for resume text paste input)
- Note: PDF/DOCX file upload deferred to v2

**Caching:**
- None (extension state in Chrome Storage API)

## Authentication & Identity

**Auth Provider:**
- None (single-user, local-only extension)

**User Identity:**
- No user accounts required
- No login system
- All data stored locally in user's browser

**API Key Management:**
- User provides their own OpenAI/Anthropic API keys (optional)
- Keys stored encrypted via Web Crypto API in Chrome local storage
- Keys never transmitted except directly to AI provider

## Monitoring & Observability

**Error Tracking:**
- Local-only error logging (planned for Phase 5)
- Anonymized, no external service in v1

**Logs:**
- Browser console logging (development)
- In-extension feedback widget (planned for Phase 5)
- No external analytics service in v1

## CI/CD & Deployment

**Hosting:**
- Chrome Web Store (extension distribution)
- Edge Add-ons Store (future, after Chrome validation)

**CI Pipeline:**
- Not yet configured (project in planning phase)
- Planned: Atomic git commits, GitHub repository

**Build Process:**
- Local: `pnpm dev` (development with hot reload)
- Production: `pnpm build` (creates extension bundle)
- Browser-specific: `pnpm build:chrome`, `pnpm build:edge`

## Environment Configuration

**Required env vars:**
- None (offline-first design, no backend)

**Optional user configuration:**
- AI provider selection: openai | anthropic | null
- AI API key (encrypted in Chrome local storage)
- Volume guardrail limit (default: 30 applications per 24 hours)
- Per-site disable list
- Performance mode toggle

**Secrets location:**
- User's own AI API keys: Chrome local storage (encrypted with Web Crypto API)
- Never stored in source code or .env files
- Extension never exposes or proxies API keys

## Webhooks & Callbacks

**Incoming:**
- None (no backend to receive webhooks)

**Outgoing:**
- None (no webhooks sent from extension)

**Content Script Communication:**
- Chrome extension messaging API
- Message passing between background service worker and content scripts
- No external HTTP requests except direct AI API calls (when user enabled)

## Browser Permissions

**Required:**
- `activeTab` - Read current tab URL and DOM for ATS detection and autofill
- `storage` - Store encrypted profile, tracker data, and field mappings locally

**Optional (User Opt-In):**
- `contextMenus` - Right-click "Save job to tracker" shortcut (P1 feature)

**Explicitly NOT Included:**
- `tabs` - Not needed; activeTab is sufficient
- `history` - User browsing history never accessed
- `webRequest` - No network interception
- `cookies` - No cookie access
- `<all_urls>` - Only specific ATS domain patterns

## Third-Party Integrations (Deferred to v2)

**Cloud Sync:**
- Supabase - Planned for v2 (opt-in cloud sync)
- Row-Level Security (RLS) from day one when implemented

**Shared AI Proxy:**
- Hono on Cloudflare Workers - Planned for v2
- Pooled API keys to eliminate need for user's own key

**Resume Import:**
- LinkedIn profile import - Deferred to v2 (ToS risk assessment needed)

**Additional ATS Platforms:**
- Indeed Apply - Deferred to v2
- Ashby - Deferred to v2
- LinkedIn Easy Apply - Explicitly excluded from v1 (ban risk)

## Security & Privacy

**Data Transmission:**
- Zero data leaves user's device except:
  - Direct AI API calls to OpenAI/Anthropic (when user enables AI feature)
  - No telemetry, no analytics, no tracking in v1

**Encryption:**
- All profile data encrypted with Web Crypto API (AES-GCM)
- AI API keys encrypted before storage
- Encryption keys derived from browser environment

**Compliance:**
- Chrome Web Store Developer Program Policies
- ATS platform Terms of Service (read-only DOM access)
- No CAPTCHA bypass attempts
- No form auto-submission (user must manually submit)

---

*Integration audit: 2026-02-20*
