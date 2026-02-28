import type { DetectionResult, ATSDetector } from '@/types/ats';
import { DETECTION_WEIGHTS, CONFIDENCE_THRESHOLDS } from '@/constants/ats-patterns';

/**
 * Glassdoor ATS detector
 */
export const glassdoorDetector: ATSDetector = {
  platform: 'glassdoor',

  async detect(url: string, document: Document): Promise<DetectionResult> {
    let confidence = 0;
    const signals: DetectionResult['signals'] = [];

    // URL pattern matching
    if (checkGlassdoorURL(url)) {
      confidence += DETECTION_WEIGHTS.url;
      signals.push('url');
    }

    // DOM signatures
    if (checkGlassdoorDOM(document)) {
      confidence += DETECTION_WEIGHTS.dom;
      signals.push('dom');
    }

    // Data attributes
    if (checkGlassdoorAttributes(document)) {
      confidence += DETECTION_WEIGHTS.attributes;
      signals.push('attributes');
    }

    const level = getConfidenceLevel(confidence);

    return {
      platform: confidence >= CONFIDENCE_THRESHOLDS.medium ? 'glassdoor' : null,
      confidence,
      signals,
      level,
      timestamp: Date.now(),
    };
  },

  findFormContainers(document: Document): HTMLElement[] {
    const containers: HTMLElement[] = [];

    const selectors = [
      '.application',
      '[data-test="application-form"]',
      '.jobApplicationContent',
      'form[action*="apply"]',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      containers.push(...(Array.from(elements) as HTMLElement[]));
    }

    return containers;
  },
};

function checkGlassdoorURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes('glassdoor.com') &&
      (urlObj.pathname.includes('/job-listing') || urlObj.pathname.includes('/partner/jobListing'))
    );
  } catch {
    return false;
  }
}

function checkGlassdoorDOM(document: Document): boolean {
  const signatures = [
    '.application',
    '[data-test="application"]',
    '.jobApplicationContent',
    '[data-test="job-apply"]',
  ];

  return signatures.some((selector) => document.querySelector(selector) !== null);
}

function checkGlassdoorAttributes(document: Document): boolean {
  const attributes = ['data-test'];

  return attributes.some((attr) => {
    const element = document.querySelector(`[${attr}]`);
    if (element) {
      const value = element.getAttribute(attr);
      return value?.includes('application') || value?.includes('apply') || false;
    }
    return false;
  });
}

function getConfidenceLevel(confidence: number): DetectionResult['level'] {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return 'medium';
  return 'low';
}
