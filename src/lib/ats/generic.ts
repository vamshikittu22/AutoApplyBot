import type { DetectionResult, ATSDetector } from '@/types/ats';
import { CONFIDENCE_THRESHOLDS } from '@/constants/ats-patterns';

/**
 * Generic job application detector
 * Falls back when no specific ATS is detected
 * Looks for common job application patterns
 */
export const genericDetector: ATSDetector = {
  platform: 'generic',

  async detect(url: string, document: Document): Promise<DetectionResult> {
    let confidence = 0;
    const signals: DetectionResult['signals'] = [];

    // URL pattern matching
    if (checkGenericURL(url)) {
      confidence += 20; // Lower weight for generic detection
      signals.push('url');
    }

    // DOM signatures
    if (checkGenericDOM(document)) {
      confidence += 30;
      signals.push('dom');
    }

    const level = getConfidenceLevel(confidence);

    return {
      platform: confidence >= 30 ? 'generic' : null,
      confidence,
      signals,
      level,
      timestamp: Date.now(),
    };
  },

  findFormContainers(document: Document): HTMLElement[] {
    const containers: HTMLElement[] = [];

    // Look for common form patterns
    const selectors = [
      'form[action*="apply"]',
      'form[action*="application"]',
      'form[action*="job"]',
      'form[id*="apply"]',
      'form[id*="application"]',
      'form[class*="apply"]',
      'form[class*="application"]',
      '[role="form"]',
      'form',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      containers.push(...(Array.from(elements) as HTMLElement[]));
      if (containers.length > 0) break; // Stop at first match
    }

    return containers;
  },
};

function checkGenericURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    const search = urlObj.search.toLowerCase();

    // Common job application URL patterns
    const patterns = [
      '/apply',
      '/application',
      '/careers',
      '/jobs',
      '/job',
      '/positions',
      '/opportunities',
      'apply=',
      'application=',
      'job_id=',
    ];

    return patterns.some((pattern) => pathname.includes(pattern) || search.includes(pattern));
  } catch {
    return false;
  }
}

function checkGenericDOM(document: Document): boolean {
  // Check for forms with job application indicators
  const hasJobForm =
    document.querySelector('form[action*="apply"]') !== null ||
    document.querySelector('form[action*="application"]') !== null ||
    document.querySelector('form[id*="apply"]') !== null ||
    document.querySelector('form[class*="application"]') !== null;

  if (!hasJobForm) return false;

  // Check for common job application fields
  const commonFields = [
    'input[name*="name"]',
    'input[name*="email"]',
    'input[name*="phone"]',
    'input[name*="resume"]',
    'input[type="file"]',
    'textarea',
  ];

  const fieldCount = commonFields.reduce((count, selector) => {
    return count + document.querySelectorAll(selector).length;
  }, 0);

  // If we have a job-related form with at least 3 common fields, likely an application
  return fieldCount >= 3;
}

function getConfidenceLevel(confidence: number): DetectionResult['level'] {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return 'medium';
  return 'low';
}
