/**
 * Submission Logger Content Script
 *
 * Implements hybrid submission detection (form events + URL change monitoring)
 * to automatically log job applications after successful submission.
 *
 * Safety features:
 * - CAPTCHA blocking: No logging when CAPTCHA is present
 * - Duplicate detection: Warns if applying to same job within 7 days
 * - Volume tracking: Increments daily application count
 *
 * Pattern follows 04-RESEARCH.md Pattern 2 (hybrid approach)
 */

import type { TrackedApplication, ATSPlatform } from '@/types/tracker';
import { ApplicationStatus } from '@/types/tracker';
import { saveApplication } from '@/lib/tracker/storage';
import { incrementVolume } from '@/lib/safety/volume-limiter';
import { isDuplicate } from '@/lib/tracker/utils';
import { getApplications } from '@/lib/tracker/storage';

/** Pending submission stored in session storage while waiting for URL confirmation */
interface PendingSubmission {
  metadata: TrackedApplication;
  timestamp: number;
}

const PENDING_TIMEOUT_MS = 10000; // 10 seconds - discard stale submissions
const URL_CHANGE_DEBOUNCE_MS = 300; // Debounce URL change detection

/**
 * Detect ATS platform type from page URL and DOM
 * Uses existing detection patterns from Phase 2
 */
function detectATSType(): ATSPlatform {
  const url = window.location.href.toLowerCase();

  // Workday detection
  if (url.includes('myworkdayjobs') || url.includes('myworkday.com')) {
    return 'workday';
  }

  // Greenhouse detection
  if (url.includes('greenhouse.io') || url.includes('/embed/job_app')) {
    return 'greenhouse';
  }

  // Lever detection
  if (url.includes('lever.co') || url.includes('/apply/')) {
    return 'lever';
  }

  return 'unknown';
}

/**
 * Extract job title from page DOM based on ATS platform
 */
function extractJobTitle(atsType: ATSPlatform): string {
  let jobTitle = '';

  switch (atsType) {
    case 'workday':
      // Workday patterns: h1, h2 with job title
      jobTitle =
        document.querySelector('h1[data-automation-id*="title"]')?.textContent ||
        document.querySelector('h2.css-job-title')?.textContent ||
        document.querySelector('h1')?.textContent ||
        '';
      break;

    case 'greenhouse':
      // Greenhouse patterns: .app-title, h1.app-title
      jobTitle =
        document.querySelector('.app-title')?.textContent ||
        document.querySelector('h1.app-title')?.textContent ||
        document.querySelector('h1')?.textContent ||
        '';
      break;

    case 'lever':
      // Lever patterns: .posting-headline h2
      jobTitle =
        document.querySelector('.posting-headline h2')?.textContent ||
        document.querySelector('h2.posting-title')?.textContent ||
        document.querySelector('h1')?.textContent ||
        '';
      break;

    default:
      // Fallback: try common h1 selector
      jobTitle = document.querySelector('h1')?.textContent || '';
  }

  return jobTitle.trim() || 'Unknown Position';
}

/**
 * Extract company name from page DOM based on ATS platform
 */
function extractCompanyName(atsType: ATSPlatform): string {
  let companyName = '';

  switch (atsType) {
    case 'workday':
      // Workday patterns: data-automation-id attributes
      companyName =
        document.querySelector('[data-automation-id*="company"]')?.textContent ||
        document.querySelector('.company-name')?.textContent ||
        '';
      break;

    case 'greenhouse':
      // Greenhouse patterns: .company-name
      companyName =
        document.querySelector('.company-name')?.textContent ||
        document.querySelector('#header .company-name')?.textContent ||
        '';
      break;

    case 'lever':
      // Lever patterns: .main-footer .company-name
      companyName =
        document.querySelector('.main-footer .company-name')?.textContent ||
        document.querySelector('.postings-company')?.textContent ||
        '';
      break;

    default:
      // Fallback: try extracting from domain
      const hostname = window.location.hostname;
      companyName = hostname.split('.')[0] || '';
  }

  return companyName.trim() || 'Unknown Company';
}

/**
 * Extract job metadata from current page
 * Returns TrackedApplication object ready for storage
 */
function extractJobMetadata(): TrackedApplication {
  const atsType = detectATSType();
  const jobTitle = extractJobTitle(atsType);
  const companyName = extractCompanyName(atsType);

  return {
    id: crypto.randomUUID(),
    jobTitle,
    company: companyName,
    atsType,
    url: window.location.href,
    appliedDate: new Date().toISOString(),
    status: ApplicationStatus.Applied,
    notes: '',
  };
}

/**
 * Check if CAPTCHA is currently blocking the page
 * Uses exposed function from captcha.content.ts
 */
function isCaptchaBlocking(): boolean {
  // Check if captcha content script has exposed the function
  if (typeof (window as any).isCaptchaBlocking === 'function') {
    return (window as any).isCaptchaBlocking();
  }

  // Failsafe: assume CAPTCHA present if function not available
  // (better safe than sorry - avoid logging during potential CAPTCHA)
  return true;
}

/**
 * Store pending submission in session storage
 * Will be confirmed when URL changes to success pattern
 */
async function storePendingSubmission(metadata: TrackedApplication): Promise<void> {
  const pending: PendingSubmission = {
    metadata,
    timestamp: Date.now(),
  };

  try {
    await chrome.storage.session.set({ pendingSubmission: pending });
    console.log('[Submission Logger] Pending submission stored:', metadata.jobTitle);
  } catch (error) {
    console.warn('[Submission Logger] Failed to store pending submission:', error);
  }
}

/**
 * Retrieve pending submission from session storage
 * Returns null if expired (>10s old) or not found
 */
async function getPendingSubmission(): Promise<PendingSubmission | null> {
  try {
    const { pendingSubmission } = (await chrome.storage.session.get('pendingSubmission')) as {
      pendingSubmission?: PendingSubmission;
    };

    if (!pendingSubmission) {
      return null;
    }

    // Check if timestamp is stale (>10 seconds)
    const age = Date.now() - pendingSubmission.timestamp;
    if (age > PENDING_TIMEOUT_MS) {
      console.log('[Submission Logger] Pending submission expired (>10s old)');
      await chrome.storage.session.remove('pendingSubmission');
      return null;
    }

    return pendingSubmission;
  } catch (error) {
    console.warn('[Submission Logger] Failed to retrieve pending submission:', error);
    return null;
  }
}

/**
 * Clear pending submission from session storage
 */
async function clearPendingSubmission(): Promise<void> {
  try {
    await chrome.storage.session.remove('pendingSubmission');
  } catch (error) {
    console.warn('[Submission Logger] Failed to clear pending submission:', error);
  }
}

/**
 * Handle form submit event
 * Extracts metadata and stores as pending submission
 */
async function handleFormSubmit(event: Event): Promise<void> {
  const form = event.target as HTMLFormElement;

  // Only process actual form submissions
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  console.log('[Submission Logger] Form submit detected');

  // Check if CAPTCHA is blocking
  if (isCaptchaBlocking()) {
    console.log('[Submission Logger] CAPTCHA present - aborting logging');
    return;
  }

  // Extract job metadata
  const metadata = extractJobMetadata();

  // Check for duplicates (warn but don't block - per CONTEXT.md)
  const existingApps = await getApplications();
  if (isDuplicate(metadata, existingApps)) {
    console.warn(
      '[Submission Logger] Duplicate application detected:',
      metadata.jobTitle,
      'at',
      metadata.company
    );
    // Continue anyway - user may be reapplying intentionally
  }

  // Store as pending submission - will confirm on URL change
  await storePendingSubmission(metadata);
}

/**
 * Check if current URL matches success patterns
 * Common success URLs: /submitted, /thank-you, /confirmation, /success, /application-received
 */
function isSuccessURL(url: string): boolean {
  const successPatterns = [
    /\/(submitted|thank-you|confirmation|success|application-received)/i,
    /\/apply\/success/i,
    /\/complete/i,
    /status=success/i,
  ];

  return successPatterns.some((pattern) => pattern.test(url));
}

/**
 * Handle URL change (navigation)
 * Checks for success patterns and confirms pending submission
 */
async function handleURLChange(): Promise<void> {
  const currentURL = window.location.href;

  console.log('[Submission Logger] URL change detected:', currentURL);

  // Check if this is a success URL
  if (!isSuccessURL(currentURL)) {
    console.log('[Submission Logger] Not a success URL - ignoring');
    return;
  }

  console.log('[Submission Logger] Success URL detected - checking pending submission');

  // Retrieve pending submission
  const pending = await getPendingSubmission();

  if (!pending) {
    console.log('[Submission Logger] No pending submission found');
    return;
  }

  // Confirm submission: save to storage and increment volume
  try {
    await saveApplication(pending.metadata);
    await incrementVolume();
    await clearPendingSubmission();

    console.log(
      '[Submission Logger] ✅ Application logged:',
      pending.metadata.jobTitle,
      'at',
      pending.metadata.company
    );
  } catch (error) {
    console.error('[Submission Logger] Failed to log application:', error);
    // Clear pending submission even on error to avoid retry loops
    await clearPendingSubmission();
  }
}

/**
 * Initialize submission logger
 * Sets up form submit listener and URL change monitoring
 *
 * @returns Cleanup function to remove listeners
 */
export function initSubmissionLogger(): () => void {
  console.log('[Submission Logger] Initializing hybrid submission detection');

  // Debounce timer for URL change monitoring
  let urlChangeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastURL = window.location.href;

  // Form submit event listener (event delegation on document)
  const handleSubmit = (event: Event) => {
    handleFormSubmit(event).catch((error) => {
      console.error('[Submission Logger] Error in form submit handler:', error);
    });
  };

  document.addEventListener('submit', handleSubmit, true); // Use capture phase for early detection

  // URL change monitoring via MutationObserver on <title> element
  // (title changes when SPA navigates, works for most ATS platforms)
  const observer = new MutationObserver(() => {
    // Debounce to avoid multiple triggers during navigation
    if (urlChangeDebounceTimer) {
      clearTimeout(urlChangeDebounceTimer);
    }

    urlChangeDebounceTimer = setTimeout(() => {
      const currentURL = window.location.href;

      // Only process if URL actually changed
      if (currentURL !== lastURL) {
        lastURL = currentURL;
        handleURLChange().catch((error) => {
          console.error('[Submission Logger] Error in URL change handler:', error);
        });
      }

      urlChangeDebounceTimer = null;
    }, URL_CHANGE_DEBOUNCE_MS);
  });

  // Observe <title> changes (SPA navigation indicator)
  const titleElement = document.querySelector('title');
  if (titleElement) {
    observer.observe(titleElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  console.log('[Submission Logger] Listeners attached - monitoring for submissions');

  // Return cleanup function
  return () => {
    document.removeEventListener('submit', handleSubmit, true);
    observer.disconnect();
    if (urlChangeDebounceTimer) {
      clearTimeout(urlChangeDebounceTimer);
    }
    console.log('[Submission Logger] Cleanup complete');
  };
}
