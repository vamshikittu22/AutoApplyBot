import type { DetectionResult, ATSDetector } from '@/types/ats';
import { DETECTION_WEIGHTS, CONFIDENCE_THRESHOLDS } from '@/constants/ats-patterns';

/**
 * Indeed ATS detector
 */
export const indeedDetector: ATSDetector = {
  platform: 'indeed',

  async detect(url: string, document: Document): Promise<DetectionResult> {
    let confidence = 0;
    const signals: DetectionResult['signals'] = [];

    // URL pattern matching
    if (checkIndeedURL(url)) {
      confidence += DETECTION_WEIGHTS.url;
      signals.push('url');
    }

    // DOM signatures
    if (checkIndeedDOM(document)) {
      confidence += DETECTION_WEIGHTS.dom;
      signals.push('dom');
    }

    // Data attributes
    if (checkIndeedAttributes(document)) {
      confidence += DETECTION_WEIGHTS.attributes;
      signals.push('attributes');
    }

    const level = getConfidenceLevel(confidence);

    return {
      platform: confidence >= CONFIDENCE_THRESHOLDS.medium ? 'indeed' : null,
      confidence,
      signals,
      level,
      timestamp: Date.now(),
    };
  },

  findFormContainers(document: Document): HTMLElement[] {
    const containers: HTMLElement[] = [];

    const selectors = [
      '#indeedApplyContainer',
      '.ia-container',
      '.jobsearch-IndeedApplyButton-contentContainer',
      'form[data-indeed-apply]',
      '.ia-BasePage-content',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      containers.push(...(Array.from(elements) as HTMLElement[]));
    }

    return containers;
  },
};

function checkIndeedURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes('indeed.com') &&
      (urlObj.pathname.includes('/viewjob') ||
        urlObj.pathname.includes('/rc/clk') ||
        urlObj.pathname.includes('/apply'))
    );
  } catch {
    return false;
  }
}

function checkIndeedDOM(document: Document): boolean {
  const signatures = [
    '#indeedApplyContainer',
    '.ia-container',
    '.jobsearch-IndeedApplyButton',
    '[data-indeed-apply]',
  ];

  return signatures.some((selector) => document.querySelector(selector) !== null);
}

function checkIndeedAttributes(document: Document): boolean {
  const attributes = ['data-indeed-apply', 'data-jk'];

  return attributes.some((attr) => {
    return document.querySelector(`[${attr}]`) !== null;
  });
}

function getConfidenceLevel(confidence: number): DetectionResult['level'] {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return 'medium';
  return 'low';
}
