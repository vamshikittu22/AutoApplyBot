import { detectATS } from '@/lib/ats/detector';
import { findFormContainers } from '@/lib/ats/detector';
import { isJobDisabled } from '@/lib/safety/site-disable';
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
    // LinkedIn
    '*://*.linkedin.com/jobs/*',
    // Indeed
    '*://*.indeed.com/viewjob*',
    '*://*.indeed.com/rc/clk*',
    '*://*/apply/indeed/*',
    // Glassdoor
    '*://*.glassdoor.com/job-listing/*',
    '*://*.glassdoor.com/partner/jobListing*',
    // Generic job application patterns
    '*://*/apply/*',
    '*://*/careers/*',
    '*://*/jobs/*',
    '*://*/job/*',
    '*://*/application/*',
  ],

  async main(ctx) {
    console.log('[Autofill] Content script loaded on:', window.location.href);

    let buttonContainer: HTMLElement | null = null;
    let currentDetection: DetectionResult | null = null;

    /**
     * Trigger autofill programmatically
     */
    async function triggerAutofill() {
      console.log('[Autofill] Triggered programmatically');

      if (buttonContainer) {
        // Simulate button click
        buttonContainer.click();
      } else {
        // If button not visible, run autofill directly
        const detection = currentDetection || (await detectATS(window.location.href, document));
        await performAutofill(detection);
      }
    }

    /**
     * Perform the actual autofill logic
     */
    async function performAutofill(detection: DetectionResult) {
      console.log('[Autofill] Performing autofill for:', detection);

      // Check if job is disabled
      const disabled = await isJobDisabled(window.location.href);
      if (disabled) {
        console.log('[Autofill] Job is disabled');
        return;
      }

      // Get profile
      const { profile } = await chrome.storage.local.get('profile');
      if (!profile) {
        console.log('[Autofill] No profile found');
        alert('Please set up your profile first in the extension settings.');
        return;
      }

      // Find form container with multiple fallback strategies
      let formContainer: HTMLElement | null = null;

      // Strategy 1: Use platform-specific detector
      if (detection.platform) {
        const containers = findFormContainers(detection.platform, document);
        formContainer = containers[0] || null;
        if (formContainer) {
          console.log('[Autofill] Found form using platform detector:', detection.platform);
        }
      }

      // Strategy 2: Look for standard form elements
      if (!formContainer) {
        formContainer = document.querySelector('form') as HTMLElement;
        if (formContainer) {
          console.log('[Autofill] Found standard <form> element');
        }
      }

      // Strategy 3: Look for forms with role="form"
      if (!formContainer) {
        formContainer = document.querySelector('[role="form"]') as HTMLElement;
        if (formContainer) {
          console.log('[Autofill] Found element with role="form"');
        }
      }

      // Strategy 4: Look for common job application containers
      if (!formContainer) {
        const selectors = [
          '[data-automation-id="jobApplicationContainer"]',
          '[data-automation-id="applicationContainer"]',
          '[data-automation-id="jobRequisition"]',
          '.application-form',
          '.job-application',
          '#application',
          '#job-apply',
          'main',
        ];

        for (const selector of selectors) {
          const el = document.querySelector(selector) as HTMLElement;
          if (el && el.querySelector('input, textarea, select')) {
            formContainer = el;
            console.log('[Autofill] Found form container using selector:', selector);
            break;
          }
        }
      }

      // Strategy 5: Use document.body as last resort if there are input fields
      if (!formContainer) {
        const hasInputs = document.querySelectorAll('input, textarea, select').length > 0;
        if (hasInputs) {
          formContainer = document.body;
          console.log('[Autofill] Using document.body as container (found input fields)');
        }
      }

      if (!formContainer) {
        console.log('[Autofill] No form container found after all strategies');
        alert('No form found on this page. Please make sure you are on a job application page.');
        return;
      }

      try {
        // Import and run autofill dynamically
        const { AutofillEngine } = await import('@/lib/autofill/engine');
        const { decorateField, clearAllDecorations } = await import('@/lib/ui/field-decorator');

        const engine = new AutofillEngine();
        engine.setProfile(profile);
        if (detection.platform) {
          engine.setATSType(detection.platform);
        }

        clearAllDecorations();

        const result = await engine.autofill({
          container: formContainer as HTMLElement,
          onFieldFilled: (mapping) => {
            decorateField(mapping, () => {
              engine.undoField(mapping.field.element);
            });
          },
        });

        console.log('[Autofill] Success - filled', result.filledCount, 'fields');

        // Show success notification
        const notification = document.createElement('div');
        Object.assign(notification.style, {
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: '999999',
          background: '#10b981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '14px',
          fontWeight: '600',
        });
        notification.innerHTML = `✓ Filled ${result.filledCount} fields`;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);

        return result;
      } catch (error) {
        console.error('[Autofill] Error:', error);
        alert('Autofill failed. Please check the console for details.');
        throw error;
      }
    }

    /**
     * Create and inject autofill button
     */
    async function injectButton(detection: DetectionResult) {
      console.log('[Autofill] Injecting button for:', detection);

      // Check if job is disabled
      const disabled = await isJobDisabled(window.location.href);
      if (disabled) {
        console.log('[Autofill] Job is disabled');
        return;
      }

      // Get profile
      const { profile } = await chrome.storage.local.get('profile');
      if (!profile) {
        console.log('[Autofill] No profile found');
        return;
      }

      // Check if page has any form-like elements (for button visibility)
      // We use a lenient check here - actual form finding happens in performAutofill
      const hasFormElements =
        document.querySelector('form') !== null ||
        document.querySelector('[role="form"]') !== null ||
        document.querySelector('input[type="text"], input[type="email"], textarea') !== null ||
        document.querySelector('[data-automation-id*="form"]') !== null;

      if (!hasFormElements) {
        console.log('[Autofill] No form elements found on page');
        return;
      }

      // Remove existing button
      if (buttonContainer) {
        buttonContainer.remove();
      }

      // Create button container
      buttonContainer = document.createElement('div');
      buttonContainer.id = 'autoapply-autofill-btn';

      // Styling for the button
      Object.assign(buttonContainer.style, {
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: '999999',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      });

      buttonContainer.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L12 8H18L13 12L15 18L10 14L5 18L7 12L2 8H8L10 2Z" fill="white"/>
        </svg>
        <span>Autofill Application</span>
      `;

      // Hover effect
      buttonContainer.addEventListener('mouseenter', () => {
        buttonContainer!.style.transform = 'translateY(-2px)';
        buttonContainer!.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4)';
      });

      buttonContainer.addEventListener('mouseleave', () => {
        buttonContainer!.style.transform = 'translateY(0)';
        buttonContainer!.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
      });

      // Click handler - trigger autofill event
      buttonContainer.addEventListener('click', async () => {
        console.log('[Autofill] Button clicked');

        buttonContainer!.innerHTML = `
          <svg class="spinner" width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" stroke="white" stroke-width="2" fill="none" opacity="0.3"/>
            <path d="M10 2 A8 8 0 0 1 18 10" stroke="white" stroke-width="2" fill="none"/>
          </svg>
          <span>Filling...</span>
        `;

        // Add spinner animation
        const spinner = buttonContainer!.querySelector('.spinner');
        if (spinner) {
          (spinner as HTMLElement).style.animation = 'spin 0.6s linear infinite';
        }

        try {
          const result = await performAutofill(detection);

          // Success
          buttonContainer!.style.background = '#10b981';
          buttonContainer!.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="white" stroke-width="2"/>
            </svg>
            <span>✓ Filled ${result?.filledCount || 0} fields</span>
          `;

          setTimeout(() => {
            if (buttonContainer) {
              buttonContainer.style.background =
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
              buttonContainer.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L12 8H18L13 12L15 18L10 14L5 18L7 12L2 8H8L10 2Z" fill="white"/>
                </svg>
                <span>Autofill Application</span>
              `;
            }
          }, 3000);
        } catch (error) {
          console.error('[Autofill] Error:', error);
          buttonContainer!.style.background = '#ef4444';
          buttonContainer!.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="white" stroke-width="2"/>
            </svg>
            <span>✗ Error</span>
          `;

          setTimeout(() => {
            if (buttonContainer) {
              buttonContainer.style.background =
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
              buttonContainer.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L12 8H18L13 12L15 18L10 14L5 18L7 12L2 8H8L10 2Z" fill="white"/>
                </svg>
                <span>Autofill Application</span>
              `;
            }
          }, 3000);
        }
      });

      // Add spinner keyframes
      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(buttonContainer);
      console.log('[Autofill] Button injected successfully');
    }

    /**
     * Initialize
     */
    async function initialize() {
      console.log('[Autofill] Initializing...');

      // Run detection
      const detection = await detectATS(window.location.href, document);
      currentDetection = detection;
      console.log('[Autofill] Detection result:', detection);

      // Check if we should show the button
      const hasForms =
        document.querySelector('form') !== null ||
        document.querySelector('[role="form"]') !== null ||
        document.querySelector('input[type="text"]') !== null;

      if (detection.confidence >= 30 || hasForms) {
        await injectButton(detection);
      } else {
        console.log('[Autofill] No job application detected');
      }
    }

    /**
     * Cleanup
     */
    function cleanup() {
      if (buttonContainer) {
        buttonContainer.remove();
        buttonContainer = null;
      }
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initialize, 500);
      });
    } else {
      setTimeout(initialize, 500);
    }

    // Handle SPA navigation
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        cleanup();
        setTimeout(initialize, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('[Autofill] Received message:', message);

      if (message.type === 'TRIGGER_AUTOFILL') {
        triggerAutofill()
          .then(() => {
            sendResponse({ success: true });
          })
          .catch((error) => {
            console.error('[Autofill] Failed to trigger autofill:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true; // Keep channel open for async response
      }
    });

    // Cleanup on invalidation
    return ctx.onInvalidated(() => {
      cleanup();
      observer.disconnect();
    });
  },
});
