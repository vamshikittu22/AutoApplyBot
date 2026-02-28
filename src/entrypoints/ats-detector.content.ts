import { detectATS } from '@/lib/ats/detector';
import { createFormObserver } from '@/lib/ats/form-observer';
import type { DetectionResult } from '@/types/ats';

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
  ],

  main() {
    console.log('[ATS Detector] Content script loaded');

    let formObserver: ReturnType<typeof createFormObserver> | null = null;
    let lastDetectionResult: DetectionResult | null = null;

    /**
     * Run ATS detection on current page
     */
    async function runDetection(): Promise<void> {
      try {
        const result = await detectATS(window.location.href, document);
        console.log('[ATS Detector] Detection result:', result);

        lastDetectionResult = result;

        // Send to background script
        if (result.platform) {
          await chrome.runtime.sendMessage({
            type: 'ATS_DETECTED',
            payload: {
              platform: result.platform,
              confidence: result.confidence,
              level: result.level,
              signals: result.signals,
            },
          });
        }

        // Emit custom event for other content scripts
        window.dispatchEvent(
          new CustomEvent('autoapply:ats-detected', {
            detail: result,
          })
        );
      } catch (error) {
        // Handle context invalidation gracefully
        if (error instanceof Error && error.message.includes('Extension context invalidated')) {
          console.log('[ATS Detector] Extension context invalidated, stopping');
          cleanup();
        } else {
          console.error('[ATS Detector] Detection error:', error);
        }
      }
    }

    /**
     * Initialize detection and observer
     */
    function initialize(): void {
      console.log('[ATS Detector] Initializing...');

      // Run initial detection
      runDetection();

      // Set up form observer for dynamic content
      formObserver = createFormObserver((result) => {
        console.log('[ATS Detector] Form observer detected change:', result);
        lastDetectionResult = result;

        // Notify other content scripts
        window.dispatchEvent(
          new CustomEvent('autoapply:ats-detected', {
            detail: result,
          })
        );
      });
    }

    /**
     * Cleanup observers
     */
    function cleanup(): void {
      if (formObserver) {
        formObserver.stop();
        formObserver = null;
      }
    }

    /**
     * Handle SPA navigation (wxt:locationchange)
     * Re-run detection when URL changes without page reload
     */
    function handleLocationChange(): void {
      console.log('[ATS Detector] Location changed, re-running detection');
      cleanup();
      initialize();
    }

    // Initialize on load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }

    // Handle SPA navigation
    // WXT provides wxt:locationchange event for SPA navigation
    window.addEventListener('wxt:locationchange', handleLocationChange);

    // Also listen for standard navigation events
    let lastUrl = window.location.href;
    const navigationObserver = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        handleLocationChange();
      }
    });

    navigationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup on unload
    window.addEventListener('beforeunload', cleanup);

    // Expose detection result getter for other content scripts
    (window as any).__autoApplyDetection = {
      getLastResult: () => lastDetectionResult,
      rerun: runDetection,
    };

    console.log('[ATS Detector] Initialized successfully');
  },
});
