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

  sendResponse({ success: true });
  return true;
});
