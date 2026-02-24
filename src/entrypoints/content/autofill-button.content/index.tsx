import ReactDOM from 'react-dom/client';
import { AutofillButton } from './AutofillButton';
import { ButtonPositioner } from '@/lib/ui/button-positioner';
import { findFormContainers } from '@/lib/ats/detector';
import type { Profile } from '@/types/profile';
import type { ATSType, DetectionResult } from '@/types/ats';
import './style.css';

export default defineContentScript({
  matches: [
    '*://*/myworkdayjobs/*',
    '*://*/myworkday.com/*',
    '*://*.myworkdayjobs.com/*',
    '*://*.myworkday.com/*',
    '*://boards.greenhouse.io/*',
    '*://*.greenhouse.io/*',
    '*://*/embed/job_app*',
    '*://jobs.lever.co/*',
    '*://*.lever.co/*',
    '*://*/apply/*',
  ],

  main() {
    console.log('[Autofill Button] Content script loaded');

    let buttonContainer: HTMLElement | null = null;
    let positioner: ButtonPositioner | null = null;

    /**
     * Initialize autofill button
     */
    async function initButton(detection: DetectionResult) {
      if (!detection.platform || detection.confidence < 50) {
        console.log('[Autofill Button] Detection confidence too low, not showing button');
        return;
      }

      // Get user profile
      const { profile } = await chrome.storage.local.get('profile');
      if (!profile) {
        console.log('[Autofill Button] No profile found');
        return;
      }

      // Find form container
      const containers = findFormContainers(detection.platform, document);
      if (containers.length === 0) {
        console.log('[Autofill Button] No form containers found');
        return;
      }

      const formContainer = containers[0];
      if (!formContainer) {
        console.log('[Autofill Button] Form container is undefined');
        return;
      }

      // Create button container with Shadow DOM
      buttonContainer = document.createElement('div');
      buttonContainer.id = 'autoapply-button-root';
      buttonContainer.style.cssText = `
        margin-bottom: 16px;
        z-index: 10000;
      `;

      // Insert before form
      formContainer.parentElement?.insertBefore(buttonContainer, formContainer);

      // Attach Shadow DOM
      const shadowRoot = buttonContainer.attachShadow({ mode: 'open' });

      // Add Tailwind styles to Shadow DOM
      const style = document.createElement('style');
      style.textContent = `@import "${chrome.runtime.getURL('content-scripts/autofill-button.css')}";`;
      shadowRoot.appendChild(style);

      // Create React root in Shadow DOM
      const reactRoot = document.createElement('div');
      shadowRoot.appendChild(reactRoot);

      // Render button
      const root = ReactDOM.createRoot(reactRoot);
      root.render(
        <AutofillButton
          profile={profile as Profile}
          atsType={detection.platform as ATSType}
          formContainer={formContainer}
        />
      );

      // Set up hybrid positioning
      positioner = new ButtonPositioner(buttonContainer, formContainer, (mode) => {
        console.log('[Autofill Button] Position mode:', mode);
      });

      console.log('[Autofill Button] Button initialized');
    }

    /**
     * Cleanup button
     */
    function cleanup() {
      if (buttonContainer) {
        buttonContainer.remove();
        buttonContainer = null;
      }

      if (positioner) {
        positioner.destroy();
        positioner = null;
      }
    }

    // Listen for ATS detection events
    window.addEventListener('autoapply:ats-detected', ((event: CustomEvent) => {
      const detection = event.detail as DetectionResult;
      console.log('[Autofill Button] ATS detected:', detection);

      cleanup();
      initButton(detection);
    }) as EventListener);

    // Cleanup on unload
    window.addEventListener('beforeunload', cleanup);
  },
});
