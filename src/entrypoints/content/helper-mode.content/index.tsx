import ReactDOM from 'react-dom/client';
import React from 'react';
import { HelperSidebar } from './HelperSidebar';
import type { Profile } from '@/types/profile';
import type { DetectionResult } from '@/types/ats';
import './style.css';

export default defineContentScript({
  matches: ['<all_urls>'],

  main() {
    console.log('[Helper Mode] Content script loaded');

    let sidebarContainer: HTMLElement | null = null;
    let reactRoot: ReactDOM.Root | null = null;

    /**
     * Initialize Helper Mode sidebar
     */
    async function initHelperMode(detection: DetectionResult | null) {
      // Get user profile
      const { profile } = await chrome.storage.local.get('profile');
      if (!profile) {
        console.log('[Helper Mode] No profile found');
        return;
      }

      // Create sidebar container with Shadow DOM
      sidebarContainer = document.createElement('div');
      sidebarContainer.id = 'autoapply-helper-root';
      document.body.appendChild(sidebarContainer);

      // Attach Shadow DOM
      const shadowRoot = sidebarContainer.attachShadow({ mode: 'open' });

      // Add Tailwind styles to Shadow DOM
      const style = document.createElement('style');
      style.textContent = `@import "${chrome.runtime.getURL('content-scripts/helper-mode.css')}";`;
      shadowRoot.appendChild(style);

      // Create React root in Shadow DOM
      const reactContainer = document.createElement('div');
      shadowRoot.appendChild(reactContainer);

      // Render sidebar
      reactRoot = ReactDOM.createRoot(reactContainer);
      reactRoot.render(
        <React.StrictMode>
          <HelperSidebar
            profile={profile as Profile}
            detection={detection}
            onSwitchToAutofill={() => {
              // Emit event to switch to autofill mode
              window.dispatchEvent(
                new CustomEvent('autoapply:switch-to-autofill', {
                  detail: detection,
                })
              );
              cleanup();
            }}
          />
        </React.StrictMode>
      );

      console.log('[Helper Mode] Sidebar initialized');
    }

    /**
     * Cleanup sidebar
     */
    function cleanup() {
      if (reactRoot) {
        reactRoot.unmount();
        reactRoot = null;
      }

      if (sidebarContainer) {
        sidebarContainer.remove();
        sidebarContainer = null;
      }
    }

    /**
     * Determine if Helper Mode should activate
     */
    function shouldActivateHelperMode(detection: DetectionResult | null): boolean {
      // No detection or null platform
      if (!detection || !detection.platform) {
        return true;
      }

      // Low confidence detection (50-70%)
      if (detection.confidence < 70) {
        return true;
      }

      // High confidence - don't activate Helper Mode
      return false;
    }

    // Listen for ATS detection events
    window.addEventListener('autoapply:ats-detected', ((event: CustomEvent) => {
      const detection = event.detail as DetectionResult;
      console.log('[Helper Mode] Detection received:', detection);

      cleanup();

      // Activate Helper Mode if detection is low confidence or unsupported
      if (shouldActivateHelperMode(detection)) {
        console.log('[Helper Mode] Activating Helper Mode');
        initHelperMode(detection);
      }
    }) as EventListener);

    // Listen for manual activation (user clicks extension icon)
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'ACTIVATE_HELPER_MODE') {
        console.log('[Helper Mode] Manual activation');
        cleanup();
        initHelperMode(message.detection || null);
        sendResponse({ success: true });
      }

      if (message.type === 'DEACTIVATE_HELPER_MODE') {
        console.log('[Helper Mode] Deactivation');
        cleanup();
        sendResponse({ success: true });
      }

      return true;
    });

    // Cleanup on unload
    window.addEventListener('beforeunload', cleanup);
  },
});
