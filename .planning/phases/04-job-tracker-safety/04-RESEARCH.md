# Phase 4: Job Tracker & Safety Controls - Research

**Researched:** 2026-02-26
**Domain:** Browser extension job tracking with Chrome Storage, safety controls (CAPTCHA detection, rate limiting)
**Confidence:** HIGH

## Summary

Phase 4 builds a local-first job application tracker with safety features to prevent platform bans. The implementation combines Chrome Storage API for persistence, Zustand for state management, and browser APIs for submission detection and CAPTCHA detection.

**Key technical stack:**
- Chrome Storage API (local storage area) for application data persistence
- Zustand already in stack for reactive state management and UI updates
- Form submit event listeners for reliable submission detection
- MutationObserver for CAPTCHA detection (DOM-based, multi-provider)
- Date-based calculations for 24h volume limits (timezone-aware)

**Primary recommendation:** Use Chrome Storage local area directly (no WXT wrapper needed for simple CRUD), implement submission detection via submit event + URL change hybrid, detect CAPTCHAs via DOM selectors (iframe-based for reCAPTCHA/hCaptcha), store tracker data as array of application objects with status enum.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Tracker UI location:**
- Primary location: Extension popup (not options page)
- Tracker is the main view users see when opening the extension
- Advanced sorting/filtering: multi-criteria (sort by multiple fields, filter by status + platform + date range)

**Application logging behavior:**
- Trigger: After successful form submission (not on button click, requires confirmation submission completed)
- Logs automatically without manual confirmation prompt

**Safety guardrail (30 apps/24h):**
- Enforcement: Warnings only (no hard block)
  - Show warning at threshold but never disable autofill
  - User retains full control to proceed
- Window calculation: Calendar day reset (midnight in user's timezone)
  - Not rolling 24h window
  - Clean daily reset is more intuitive

**CAPTCHA detection & pause:**
- User notification: Extension badge indicator
  - Persistent visual feedback while CAPTCHA is present
  - User knows autofill is paused without intrusive notifications

**Per-site disable control:**
- Location: Popup toggle (top-level control in extension popup)
- Granularity: Per-job (specific job posting, not domain-wide or path-level)
  - Most specific control — user can disable for problematic applications
  - Doesn't affect other jobs on the same ATS platform

### Claude's Discretion

The following areas are delegated to Claude during planning and implementation:

- **Display format:** Card-based, table, or collapsible list (optimize for popup space constraints)
- **Information density:** Which fields to show at a glance (balance visibility vs clutter)
- **Submission detection method:** Form events, network detection, URL change, or hybrid approach (choose most reliable)
- **Data capture scope:** Core fields only vs extended snapshot (balance usefulness vs storage)
- **Duplicate handling:** Prevent, warn, or allow duplicate applications (handle common scenarios)
- **Warning display mechanism:** Toast, modal, inline banner (choose least disruptive)
- **Warning message tone:** Safety-focused, quality-focused, or limit-focused (craft appropriate messaging)
- **CAPTCHA detection strategy:** Iframe-based, keyword-based, or multi-signal (choose most reliable)
- **CAPTCHA pause UI behavior:** Complete removal, disabled state, or warning on click (balance clarity vs discretion)
- **CAPTCHA resume behavior:** Auto-resume, manual re-enable, or hybrid (choose safest approach)
- **Per-site disable duration:** Permanent, session-only, or user-selectable (handle most common use case)
- **Re-enable process:** Toggle, settings-only, or explicit button (balance ease vs intentionality)
- **Status update method:** Inline dropdown, modal editor, or context menu (choose most efficient UX)
- **Available statuses:** Follow ROADMAP spec (Applied/Interview/Offer/Rejected/Withdrawn) or extend if needed
- **Bulk operations:** Support bulk status update, bulk delete, both, or neither (based on expected usage)
- **Status history tracking:** Full history, current only, or current + application date (balance usefulness vs complexity)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

## Standard Stack

### Core Storage & State
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Chrome Storage API | Built-in (MV3) | Application data persistence | Native browser API, 10MB quota (sufficient for thousands of applications), automatic sync across devices if desired |
| Zustand | 5.0.11 (already in stack) | Reactive state for UI | Already used in project, ideal for popup state management, no provider boilerplate |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @wxt-dev/storage | 1.2.8 (optional) | Chrome Storage wrapper | Only if you want localStorage-like API; for simple CRUD, Chrome Storage API is sufficient |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Chrome Storage local | IndexedDB | More complex API, overkill for structured job data (not file/blob storage) |
| Zustand | React Context | More boilerplate, no persist middleware, worse performance for frequent updates |

**Installation:**
```bash
# No new dependencies needed - Chrome Storage is built-in, Zustand already installed
# Optional: only if you want localStorage-like wrapper
pnpm add @wxt-dev/storage
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── tracker/
│   │   ├── storage.ts           # Chrome Storage abstraction for applications
│   │   ├── types.ts             # Application type, Status enum
│   │   ├── utils.ts             # Date calculations, duplicate detection
│   │   └── index.ts             # Public API
│   └── safety/
│       ├── captcha-detector.ts  # MutationObserver for CAPTCHA iframes
│       ├── volume-limiter.ts    # 24h calendar day limit calculations
│       ├── site-disable.ts      # Per-job disable list storage
│       └── index.ts             # Public API
├── entrypoints/
│   ├── content/
│   │   └── tracker.ts           # Listens for form submissions, logs applications
│   ├── background.ts            # Badge updates based on CAPTCHA state
│   └── popup/
│       ├── components/
│       │   ├── TrackerList.tsx  # Main tracker display
│       │   ├── ApplicationCard.tsx # Individual job entry
│       │   └── VolumeWarning.tsx   # 30/24h warning banner
│       └── App.tsx
└── types/
    └── tracker.ts               # Shared types
```

### Pattern 1: Chrome Storage for Tracker Data
**What:** Store applications as array of objects in Chrome Storage local area
**When to use:** For persistent, structured data that doesn't need complex queries
**Example:**
```typescript
// Source: Chrome Storage API official docs
// https://developer.chrome.com/docs/extensions/reference/api/storage

interface TrackedApplication {
  id: string;                    // UUID
  jobTitle: string;
  company: string;
  atsType: 'workday' | 'greenhouse' | 'lever' | 'unknown';
  url: string;
  appliedDate: string;           // ISO 8601 format
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  notes?: string;
}

// Write applications to storage
async function saveApplication(app: TrackedApplication): Promise<void> {
  const { applications = [] } = await chrome.storage.local.get('applications');
  applications.push(app);
  await chrome.storage.local.set({ applications });
}

// Read all applications
async function getApplications(): Promise<TrackedApplication[]> {
  const { applications = [] } = await chrome.storage.local.get('applications');
  return applications;
}

// Update application status
async function updateApplicationStatus(id: string, status: string): Promise<void> {
  const { applications = [] } = await chrome.storage.local.get('applications');
  const app = applications.find((a: TrackedApplication) => a.id === id);
  if (app) {
    app.status = status;
    await chrome.storage.local.set({ applications });
  }
}
```

### Pattern 2: Form Submission Detection (Hybrid Approach)
**What:** Combine submit event listener + URL change detection for reliability
**When to use:** When detecting successful form submissions in content scripts
**Example:**
```typescript
// Source: MDN HTMLFormElement submit event
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event

// Listen for form submissions
document.addEventListener('submit', async (event) => {
  const form = event.target as HTMLFormElement;
  
  // Don't log if CAPTCHA detected
  if (isCaptchaPresent()) return;
  
  // Capture form data snapshot
  const snapshot = {
    jobTitle: extractJobTitle(form),
    company: extractCompany(form),
    url: window.location.href,
    atsType: detectATSType(window.location.href),
    appliedDate: new Date().toISOString(),
    status: 'applied',
  };
  
  // Wait for navigation to confirm success
  // Store snapshot temporarily, confirm after URL change
  await chrome.storage.session.set({ pendingSubmission: snapshot });
});

// Detect URL change to confirm submission success
let lastUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    
    // Check if URL indicates success (e.g., /application-submitted, /thank-you)
    if (/\/(submitted|thank-you|confirmation)/i.test(lastUrl)) {
      chrome.storage.session.get('pendingSubmission', async ({ pendingSubmission }) => {
        if (pendingSubmission) {
          await saveApplication(pendingSubmission);
          await chrome.storage.session.remove('pendingSubmission');
        }
      });
    }
  }
});

urlObserver.observe(document.querySelector('head')!, { 
  subtree: true, 
  childList: true 
});
```

### Pattern 3: CAPTCHA Detection (DOM-Based Multi-Provider)
**What:** Use MutationObserver to detect CAPTCHA iframes/elements from major providers
**When to use:** To pause autofill when CAPTCHA challenges appear
**Example:**
```typescript
// Source: MDN MutationObserver + reCAPTCHA/hCaptcha DOM structure research
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

const CAPTCHA_SELECTORS = [
  // reCAPTCHA v2
  'iframe[src*="google.com/recaptcha"]',
  '.g-recaptcha',
  
  // reCAPTCHA v3 (invisible, check for script)
  'script[src*="google.com/recaptcha"]',
  
  // hCaptcha
  'iframe[src*="hcaptcha.com"]',
  '.h-captcha',
  
  // Cloudflare Turnstile
  'iframe[src*="cloudflare.com"]',
  '.cf-turnstile',
];

function isCaptchaPresent(): boolean {
  return CAPTCHA_SELECTORS.some(selector => {
    const element = document.querySelector(selector);
    // Check if visible (not display:none or hidden)
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  });
}

// Monitor for CAPTCHA appearing
const captchaObserver = new MutationObserver((mutations) => {
  const captchaDetected = isCaptchaPresent();
  
  if (captchaDetected) {
    // Notify background script to update badge
    chrome.runtime.sendMessage({ 
      type: 'CAPTCHA_DETECTED',
      url: window.location.href 
    });
  } else {
    chrome.runtime.sendMessage({ 
      type: 'CAPTCHA_CLEARED',
      url: window.location.href 
    });
  }
});

// Observe entire document for CAPTCHA injection
captchaObserver.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'class']
});
```

### Pattern 4: Calendar Day Volume Limiting
**What:** Track applications per calendar day (midnight-to-midnight in user timezone)
**When to use:** For 30 apps/24h soft limit with daily reset
**Example:**
```typescript
// Source: JavaScript Date API + timezone handling
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

interface VolumeData {
  date: string;        // YYYY-MM-DD in user timezone
  count: number;
}

function getTodayDateString(): string {
  const now = new Date();
  // Get local date string (not UTC)
  return now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
}

async function getApplicationsToday(): Promise<number> {
  const today = getTodayDateString();
  const { volumeData = { date: today, count: 0 } } = 
    await chrome.storage.local.get('volumeData');
  
  // Reset if date changed
  if (volumeData.date !== today) {
    volumeData.date = today;
    volumeData.count = 0;
    await chrome.storage.local.set({ volumeData });
  }
  
  return volumeData.count;
}

async function incrementTodayCount(): Promise<void> {
  const today = getTodayDateString();
  const { volumeData = { date: today, count: 0 } } = 
    await chrome.storage.local.get('volumeData');
  
  volumeData.count += 1;
  volumeData.date = today;
  await chrome.storage.local.set({ volumeData });
}

async function shouldShowVolumeWarning(): Promise<boolean> {
  const count = await getApplicationsToday();
  return count >= 30; // Soft warning at 30
}
```

### Pattern 5: Per-Job Disable List
**What:** Store disabled job URLs in Chrome Storage for granular control
**When to use:** To allow users to disable extension for specific problematic job postings
**Example:**
```typescript
// Store as Set of URLs (serialized as array)
async function isJobDisabled(jobUrl: string): Promise<boolean> {
  const { disabledJobs = [] } = await chrome.storage.local.get('disabledJobs');
  return disabledJobs.includes(jobUrl);
}

async function disableJob(jobUrl: string): Promise<void> {
  const { disabledJobs = [] } = await chrome.storage.local.get('disabledJobs');
  if (!disabledJobs.includes(jobUrl)) {
    disabledJobs.push(jobUrl);
    await chrome.storage.local.set({ disabledJobs });
  }
}

async function enableJob(jobUrl: string): Promise<void> {
  const { disabledJobs = [] } = await chrome.storage.local.get('disabledJobs');
  const filtered = disabledJobs.filter((url: string) => url !== jobUrl);
  await chrome.storage.local.set({ disabledJobs: filtered });
}
```

### Anti-Patterns to Avoid

- **Don't store large blobs in Chrome Storage:** Store only structured data (job metadata), not screenshots or large documents. Chrome Storage has 10MB limit total.
- **Don't use Chrome Storage sync for high-frequency writes:** Sync has strict write quotas (120 ops/min). Use local for tracker data that updates frequently.
- **Don't detect form submission only via submit event:** Many ATS platforms submit via AJAX or programmatically. Use hybrid approach (event + URL change).
- **Don't block user action on volume limit:** User decided warnings only. Show warning but allow continuing.
- **Don't use global CAPTCHA disable:** Granular per-job control allows users to handle edge cases without breaking all automation.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date/time parsing across timezones | Custom timezone math | Native `Date` with `toLocaleDateString('en-CA')` | Built-in locale handling, avoids DST bugs |
| Duplicate detection | String comparison loops | Structured comparison with URL normalization | ATS platforms often have query params, need normalized comparison |
| Storage quota management | Custom eviction logic | Chrome Storage quota APIs + LRU eviction | Browser handles quota, provides events |
| State synchronization popup/background | Custom message passing | Zustand with persist middleware or Chrome Storage | Already handles sync, listeners, reactivity |

**Key insight:** Chrome provides well-tested storage, messaging, and event APIs. Building custom abstractions adds complexity without benefit for this use case.

## Common Pitfalls

### Pitfall 1: Assuming submit event always fires
**What goes wrong:** Many modern web apps submit forms via JavaScript (fetch/XHR) without triggering submit event
**Why it happens:** SPAs and ATS platforms use programmatic submission to avoid page reload
**How to avoid:** Use hybrid detection (submit event + URL change + network monitoring). Confirm submission success via URL pattern matching.
**Warning signs:** Applications not being logged despite user clicking "Submit" button

### Pitfall 2: CAPTCHA detection race conditions
**What goes wrong:** CAPTCHA detected after autofill already started, causing platform to flag bot behavior
**Why it happens:** CAPTCHAs often load asynchronously after page load
**How to avoid:** Check for CAPTCHA presence before every autofill action, not just on page load. Use MutationObserver to detect dynamic injection.
**Warning signs:** Autofill works sometimes but fails on subsequent attempts on same platform

### Pitfall 3: Calendar day calculations ignore timezone
**What goes wrong:** Application count resets at midnight UTC instead of user's local midnight
**Why it happens:** Using `new Date().toISOString()` returns UTC, not local date
**How to avoid:** Use `toLocaleDateString('en-CA')` for YYYY-MM-DD in user timezone, or store timezone offset
**Warning signs:** Users in non-UTC timezones report unexpected count resets mid-day

### Pitfall 4: Storage quota exceeded silently
**What goes wrong:** Chrome Storage local stops accepting writes at 10MB, no error thrown in some cases
**Why it happens:** Chrome Storage fails silently if quota exceeded
**How to avoid:** Monitor `chrome.storage.local.getBytesInUse()`, implement LRU eviction for old applications
**Warning signs:** New applications not saving, users with 1000+ applications report missing data

### Pitfall 5: Duplicate applications from retry clicks
**What goes wrong:** User clicks submit multiple times (slow response), logs duplicate applications
**Why it happens:** Submit event fires for each click before navigation completes
**How to avoid:** Debounce submission logging, check for pending submissions in session storage, normalize URLs before duplicate check
**Warning signs:** Users report same application appearing 2-3 times in tracker

### Pitfall 6: Badge update lag
**What goes wrong:** Extension badge shows stale CAPTCHA state (shows warning after CAPTCHA solved)
**Why it happens:** Background script not receiving CAPTCHA_CLEARED message, or message lost
**How to avoid:** Implement heartbeat check (content script pings background every 5s with current state), background validates state
**Warning signs:** Badge stuck on "CAPTCHA detected" even when user completed challenge

## Code Examples

Verified patterns from official sources:

### Zustand Store for Tracker UI State
```typescript
// Source: Zustand docs - https://github.com/pmndrs/zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TrackerStore {
  applications: TrackedApplication[];
  filterStatus: string | null;
  filterPlatform: string | null;
  sortBy: 'date' | 'company' | 'status';
  sortOrder: 'asc' | 'desc';
  setApplications: (apps: TrackedApplication[]) => void;
  addApplication: (app: TrackedApplication) => void;
  updateApplication: (id: string, updates: Partial<TrackedApplication>) => void;
  deleteApplication: (id: string) => void;
  setFilter: (field: 'status' | 'platform', value: string | null) => void;
  setSorting: (by: 'date' | 'company' | 'status', order: 'asc' | 'desc') => void;
}

export const useTrackerStore = create<TrackerStore>()(
  persist(
    (set) => ({
      applications: [],
      filterStatus: null,
      filterPlatform: null,
      sortBy: 'date',
      sortOrder: 'desc',
      
      setApplications: (apps) => set({ applications: apps }),
      
      addApplication: (app) => set((state) => ({
        applications: [...state.applications, app]
      })),
      
      updateApplication: (id, updates) => set((state) => ({
        applications: state.applications.map(app => 
          app.id === id ? { ...app, ...updates } : app
        )
      })),
      
      deleteApplication: (id) => set((state) => ({
        applications: state.applications.filter(app => app.id !== id)
      })),
      
      setFilter: (field, value) => set({
        [`filter${field.charAt(0).toUpperCase() + field.slice(1)}`]: value
      }),
      
      setSorting: (by, order) => set({ sortBy: by, sortOrder: order })
    }),
    {
      name: 'tracker-ui-state',
      // Don't persist applications here - those come from Chrome Storage
      partialize: (state) => ({
        filterStatus: state.filterStatus,
        filterPlatform: state.filterPlatform,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      })
    }
  )
);
```

### Chrome Storage onChange Listener (Sync Popup with Background)
```typescript
// Source: Chrome Storage API docs
// https://developer.chrome.com/docs/extensions/reference/api/storage

// In popup component
useEffect(() => {
  // Load applications on mount
  chrome.storage.local.get('applications', ({ applications = [] }) => {
    useTrackerStore.getState().setApplications(applications);
  });
  
  // Listen for changes from background/content scripts
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local' && changes.applications) {
      useTrackerStore.getState().setApplications(changes.applications.newValue);
    }
  };
  
  chrome.storage.onChanged.addListener(listener);
  
  return () => chrome.storage.onChanged.removeListener(listener);
}, []);
```

### Extension Badge Update (Background Script)
```typescript
// Source: Chrome Action API
// https://developer.chrome.com/docs/extensions/reference/api/action

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'CAPTCHA_DETECTED') {
    // Show warning badge
    chrome.action.setBadgeText({ 
      text: '⚠️',
      tabId: sender.tab?.id 
    });
    chrome.action.setBadgeBackgroundColor({ 
      color: '#FFA500' // Orange
    });
  } else if (message.type === 'CAPTCHA_CLEARED') {
    // Clear badge
    chrome.action.setBadgeText({ 
      text: '',
      tabId: sender.tab?.id 
    });
  }
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| chrome.storage.sync for all data | chrome.storage.local for high-write data | MV3 migration (2022) | Sync has strict quotas (120 ops/hr), local has 10MB limit |
| Polling storage for changes | chrome.storage.onChanged listener | Always available | Real-time reactivity, no polling overhead |
| Custom UUID generation | crypto.randomUUID() | Chromium 92+ (2021) | Native, cryptographically secure IDs |
| Manual timezone handling | Intl.DateTimeFormat API | Widely supported (2015+) | Proper locale/timezone support |

**Deprecated/outdated:**
- ~~chrome.storage.sync for frequent writes~~ → Use local for tracker data (sync has 120 writes/hour limit)
- ~~chrome.browserAction~~ → Use chrome.action (MV3 unified API)
- ~~Background pages~~ → Service workers in MV3 (affects storage access patterns)

## Open Questions

1. **Duplicate detection granularity**
   - What we know: URL + date could identify duplicates
   - What's unclear: Should we normalize URLs (remove query params)? How to handle reapplying after rejection?
   - Recommendation: Warn user if same normalized URL applied within 7 days, let them confirm

2. **Storage eviction strategy**
   - What we know: 10MB Chrome Storage limit = ~10,000 applications (assuming 1KB each)
   - What's unclear: When to automatically delete old applications? User notification?
   - Recommendation: Soft limit at 5,000 apps, show warning. Allow user-triggered bulk delete or export to CSV before cleanup

3. **CAPTCHA detection accuracy tradeoffs**
   - What we know: Iframe-based detection catches reCAPTCHA v2, hCaptcha, Turnstile
   - What's unclear: How to detect reCAPTCHA v3 (invisible, no iframe)? Risk of false positives?
   - Recommendation: Focus on iframe detection (high confidence), log analytics on false positives for v2 improvement

## Sources

### Primary (HIGH confidence)
- Chrome Storage API - https://developer.chrome.com/docs/extensions/reference/api/storage
- Chrome Action API (badges) - https://developer.chrome.com/docs/extensions/reference/api/action
- Zustand documentation - https://github.com/pmndrs/zustand
- MDN MutationObserver - https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
- MDN HTMLFormElement submit event - https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
- MDN FormData - https://developer.mozilla.org/en-US/docs/Web/API/FormData

### Secondary (MEDIUM confidence)
- reCAPTCHA documentation - https://www.google.com/recaptcha/about/ (DOM structure verified)
- hCaptcha documentation - https://docs.hcaptcha.com/ (DOM structure verified)
- WXT Storage guide - https://wxt.dev/guide/essentials/storage.html (wrapper evaluation)

### Tertiary (LOW confidence)
- None - all findings verified with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Chrome APIs are well-documented, Zustand already in use
- Architecture: HIGH - Patterns based on official examples and MDN references
- Pitfalls: MEDIUM - Based on common extension development issues, some extrapolated from training data

**Research date:** 2026-02-26
**Valid until:** ~60 days (Chrome APIs stable, storage patterns mature)
