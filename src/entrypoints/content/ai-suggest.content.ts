import { defineContentScript } from 'wxt/sandbox';
import { detectQuestionFields, watchForQuestionFields } from '@/lib/ai/question-detector';
import { mountAISuggestButton } from './ai-suggest.content/index';
import type { QuestionField } from '@/lib/ai/question-detector';
import type { ATSType } from '@/types/ats';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  async main() {
    // Wait for ATS detection
    const atsType = await getDetectedATS();
    if (!atsType) {
      console.log('[AI Suggest] No ATS detected, skipping question detection');
      return;
    }

    console.log('[AI Suggest] Initializing question detection for', atsType);

    // Initial detection
    const initialFields = detectQuestionFields(atsType);
    injectSuggestButtons(initialFields, atsType);

    // Watch for dynamically added fields
    watchForQuestionFields((fields) => {
      injectSuggestButtons(fields, atsType);
    }, atsType);
  },
});

/**
 * Get detected ATS from storage (set by ats-detector content script)
 */
async function getDetectedATS(): Promise<ATSType | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['detected_ats'], (result) => {
      resolve((result.detected_ats as ATSType | null) || null);
    });
  });
}

/**
 * Inject suggest buttons for detected question fields
 */
function injectSuggestButtons(fields: QuestionField[], _atsType: ATSType) {
  for (const field of fields) {
    // Skip if button already injected
    if (field.element.dataset.aiSuggestInjected === 'true') {
      continue;
    }

    // Mark as injected
    field.element.dataset.aiSuggestInjected = 'true';

    const container = createButtonContainer(field);
    insertButton(field.element, container);

    // Mount React app
    const buttonRoot = container.querySelector('[id^="ai-suggest-button-"]') as HTMLElement;
    if (buttonRoot) {
      mountAISuggestButton(buttonRoot, field.element, field.label, field.isEssay);
    }
  }
}

/**
 * Create button container element
 */
function createButtonContainer(_field: QuestionField): HTMLElement {
  const container = document.createElement('div');
  container.className = 'ai-suggest-button-container';
  container.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  `;

  const buttonRoot = document.createElement('div');
  buttonRoot.id = `ai-suggest-button-${generateId()}`;
  container.appendChild(buttonRoot);

  return container;
}

/**
 * Insert button in appropriate location based on ATS
 */
function insertButton(field: HTMLTextAreaElement | HTMLInputElement, container: HTMLElement) {
  // Strategy 1: After the field
  if (field.parentElement) {
    field.parentElement.insertBefore(container, field.nextSibling);
    return;
  }

  // Fallback: Append to parent
  field.parentNode?.appendChild(container);
}

/**
 * Generate unique ID for button
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
