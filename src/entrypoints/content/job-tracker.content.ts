/**
 * Main Job Application Content Script
 *
 * Combines ATS detection, CAPTCHA monitoring, and submission logging.
 * Initializes on job application pages to provide tracking functionality.
 */

import { initSubmissionLogger } from './submission-logger';

export default defineContentScript({
  matches: [
    // Workday
    '*://*/myworkdayjobs/*',
    '*://*/myworkday.com/*',
    '*://*.myworkdayjobs.com/*',
    '*://*.myworkday.com/*',
    // Greenhouse
    '*://boards.greenhouse.io/*',
    '*://*.greenhouse.io/*',
    '*://*/embed/job_app*',
    // Lever
    '*://jobs.lever.co/*',
    '*://*.lever.co/*',
    '*://*/apply/*',
    // Generic job application patterns (for other ATS platforms)
    '*://*/careers/*',
    '*://*/jobs/*',
    '*://*/applications/*',
  ],

  main() {
    console.log('[Job Tracker] Content script loaded');

    /**
     * Initialize submission logger if page has forms
     * Only run on pages with application forms to avoid unnecessary overhead
     */
    function initTracker(): void {
      // Check if page has forms
      const hasForms = document.querySelector('form') !== null;

      if (!hasForms) {
        console.log('[Job Tracker] No forms detected - skipping initialization');
        return;
      }

      try {
        // Initialize submission logger
        const cleanup = initSubmissionLogger();

        // Store cleanup function for when page unloads
        window.addEventListener('beforeunload', cleanup, { once: true });

        console.log('[Job Tracker] Submission logger initialized');
      } catch (error) {
        console.error('[Job Tracker] Failed to initialize submission logger:', error);
        // Don't crash - other content scripts (ATS detector, CAPTCHA monitor) should continue working
      }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTracker);
    } else {
      initTracker();
    }
  },
});
