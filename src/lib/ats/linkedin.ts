import type { DetectionResult, ATSDetector } from '@/types/ats';
import { DETECTION_WEIGHTS, CONFIDENCE_THRESHOLDS } from '@/constants/ats-patterns';

/**
 * LinkedIn ATS detector
 */
export const linkedinDetector: ATSDetector = {
  platform: 'linkedin',

  async detect(url: string, document: Document): Promise<DetectionResult> {
    let confidence = 0;
    const signals: DetectionResult['signals'] = [];

    // URL pattern matching
    if (checkLinkedInURL(url)) {
      confidence += DETECTION_WEIGHTS.url;
      signals.push('url');
    }

    // DOM signatures
    if (checkLinkedInDOM(document)) {
      confidence += DETECTION_WEIGHTS.dom;
      signals.push('dom');
    }

    // Data attributes
    if (checkLinkedInAttributes(document)) {
      confidence += DETECTION_WEIGHTS.attributes;
      signals.push('attributes');
    }

    const level = getConfidenceLevel(confidence);

    return {
      platform: confidence >= CONFIDENCE_THRESHOLDS.medium ? 'linkedin' : null,
      confidence,
      signals,
      level,
      timestamp: Date.now(),
    };
  },

  findFormContainers(document: Document): HTMLElement[] {
    const containers: HTMLElement[] = [];

    // LinkedIn Easy Apply modal
    const selectors = [
      '.jobs-easy-apply-content',
      '.jobs-apply-form',
      'form[data-job-id]',
      '[data-easy-apply-form-container]',
      '.scaffold-layout__list-detail-inner',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      containers.push(...(Array.from(elements) as HTMLElement[]));
    }

    return containers;
  },
};

function checkLinkedInURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes('linkedin.com') &&
      (urlObj.pathname.includes('/jobs/') || urlObj.pathname.includes('/jobs/view/'))
    );
  } catch {
    return false;
  }
}

function checkLinkedInDOM(document: Document): boolean {
  const signatures = [
    '.jobs-easy-apply-content',
    '.jobs-apply-button',
    '[data-job-id]',
    '.jobs-search-results',
  ];

  return signatures.some((selector) => document.querySelector(selector) !== null);
}

function checkLinkedInAttributes(document: Document): boolean {
  const attributes = ['data-job-id', 'data-easy-apply'];

  return attributes.some((attr) => {
    return document.querySelector(`[${attr}]`) !== null;
  });
}

function getConfidenceLevel(confidence: number): DetectionResult['level'] {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return 'medium';
  return 'low';
}
