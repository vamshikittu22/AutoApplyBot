/**
 * CAPTCHA Monitoring Content Script
 *
 * Monitors ATS pages for CAPTCHA appearance/disappearance and notifies background script
 * to update extension badge. Prevents autofill when CAPTCHA is present to avoid bans.
 *
 * Runs on all ATS pages to monitor for CAPTCHA challenges.
 */

import { isCaptchaPresent } from '@/lib/safety/captcha-detector';

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
    console.log('[CAPTCHA Monitor] Content script loaded');

    // Track current CAPTCHA state to avoid redundant messages
    let captchaPresent = false;

    // Debounce timer for MutationObserver
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Check for CAPTCHA and send message to background if state changed.
     * Debounced to prevent excessive checks during rapid DOM mutations.
     */
    function checkCaptchaState(): void {
      const isPresent = isCaptchaPresent();

      // Only send message if state changed
      if (isPresent !== captchaPresent) {
        captchaPresent = isPresent;

        if (isPresent) {
          // CAPTCHA detected
          chrome.runtime
            .sendMessage({
              type: 'CAPTCHA_DETECTED',
              url: window.location.href,
            })
            .catch(() => {
              // Ignore errors if extension context invalidated
              console.log(
                '[CAPTCHA Monitor] Failed to send message (extension context invalidated)'
              );
            });
        } else {
          // CAPTCHA cleared/solved
          chrome.runtime
            .sendMessage({
              type: 'CAPTCHA_CLEARED',
              url: window.location.href,
            })
            .catch(() => {
              // Ignore errors if extension context invalidated
              console.log(
                '[CAPTCHA Monitor] Failed to send message (extension context invalidated)'
              );
            });
        }
      }
    }

    /**
     * Debounced CAPTCHA check (500ms delay to prevent excessive CPU usage).
     */
    function debouncedCaptchaCheck(): void {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        checkCaptchaState();
        debounceTimer = null;
      }, 500);
    }

    /**
     * Initialize CAPTCHA monitoring.
     */
    function init(): void {
      // Initial check on page load
      checkCaptchaState();

      // Set up MutationObserver to detect CAPTCHA appearance/disappearance
      const observer = new MutationObserver(() => {
        debouncedCaptchaCheck();
      });

      // Observe entire document for changes
      // CAPTCHA iframes can appear anywhere in the DOM
      observer.observe(document.body, {
        childList: true, // Watch for added/removed nodes
        subtree: true, // Watch entire subtree
        attributes: true, // Watch for attribute changes (style, class)
        attributeFilter: ['style', 'class'], // Only watch visibility-related attributes
      });

      console.log('[CAPTCHA Monitor] Observer initialized');
    }

    /**
     * Export function for other content scripts to check CAPTCHA state.
     *
     * This allows autofill scripts to check if they should pause operations.
     *
     * @returns true if CAPTCHA is present and autofill should be blocked
     */
    (window as any).isCaptchaBlocking = (): boolean => {
      return captchaPresent;
    };

    // Start monitoring when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  },
});
