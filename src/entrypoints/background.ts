export default defineBackground({
  type: 'module',
  main() {
    console.log('[AutoApply] Background service worker started');

    // Set up declarativeContent rules on install
    chrome.runtime.onInstalled.addListener(async () => {
      await setupDeclarativeContent();
    });
  },
});

/**
 * Configure declarativeContent rules for lazy content script injection
 * Only inject content scripts on pages matching ATS URL patterns
 */
async function setupDeclarativeContent() {
  // Guard: declarativeContent requires the 'declarativeContent' manifest permission.
  if (!chrome.declarativeContent) {
    console.warn(
      '[AutoApply] chrome.declarativeContent is unavailable. ' +
        'Ensure "declarativeContent" is listed in manifest permissions.',
    );
    return;
  }

  // Remove existing rules
  await chrome.declarativeContent.onPageChanged.removeRules();

  // Define ATS URL patterns from constants
  const atsUrlPatterns = [
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
  ];

  // Create page state matcher for ATS URLs
  const atsPageStateMatcher = {
    pageUrl: {
      urlMatches: atsUrlPatterns.join('|'),
    },
  };

  // Create rules to show page action icon on ATS pages
  const rules = [
    {
      conditions: [new chrome.declarativeContent.PageStateMatcher(atsPageStateMatcher)],
      actions: [new chrome.declarativeContent.ShowAction()],
    },
  ];

  await chrome.declarativeContent.onPageChanged.addRules(rules);
  console.log('[AutoApply] declarativeContent rules registered');
}

/**
 * Handle messages from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[AutoApply] Message received:', message);

  if (message.type === 'ATS_DETECTED') {
    console.log('[AutoApply] ATS detected:', message.payload);
    // Store detection result for popup
    chrome.storage.local.set({
      lastDetection: {
        url: sender.url,
        platform: message.payload.platform,
        confidence: message.payload.confidence,
        timestamp: Date.now(),
      },
    });
  }

  if (message.type === 'TOGGLE_HELPER_MODE') {
    // Send message to active tab to toggle Helper Mode
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: message.activate ? 'ACTIVATE_HELPER_MODE' : 'DEACTIVATE_HELPER_MODE',
          detection: message.detection,
        });
      }
    });
  }

  if (message.type === 'CAPTCHA_DETECTED') {
    // Update badge to show warning when CAPTCHA is present
    const tabId = sender.tab?.id;
    if (tabId) {
      chrome.action.setBadgeText({ text: '⚠️', tabId }).catch((err) => {
        console.warn('[AutoApply] Failed to set badge text:', err);
      });
      chrome.action.setBadgeBackgroundColor({ color: '#FF9800', tabId }).catch((err) => {
        console.warn('[AutoApply] Failed to set badge color:', err);
      });
      console.log('[AutoApply] CAPTCHA detected, badge updated for tab:', tabId);
    }
  }

  if (message.type === 'CAPTCHA_CLEARED') {
    // Clear badge when CAPTCHA is no longer present
    const tabId = sender.tab?.id;
    if (tabId) {
      chrome.action.setBadgeText({ text: '', tabId }).catch((err) => {
        console.warn('[AutoApply] Failed to clear badge text:', err);
      });
      console.log('[AutoApply] CAPTCHA cleared, badge removed for tab:', tabId);
    }
  }

  sendResponse({ success: true });
  return true;
});
