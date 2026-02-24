import type { DetectionResult, ATSDetector } from '@/types/ats';
import {
  ATS_URL_PATTERNS,
  ATS_DOM_SIGNATURES,
  ATS_DATA_ATTRIBUTES,
  DETECTION_WEIGHTS,
  CONFIDENCE_THRESHOLDS,
} from '@/constants/ats-patterns';

export const leverDetector: ATSDetector = {
  platform: 'lever',

  async detect(url: string, document: Document): Promise<DetectionResult> {
    let confidence = 0;
    const signals: DetectionResult['signals'] = [];

    if (checkLeverURL(url)) {
      confidence += DETECTION_WEIGHTS.url;
      signals.push('url');
    }

    if (checkLeverDOM(document)) {
      confidence += DETECTION_WEIGHTS.dom;
      signals.push('dom');
    }

    if (checkLeverAttributes(document)) {
      confidence += DETECTION_WEIGHTS.attributes;
      signals.push('attributes');
    }

    const level = getConfidenceLevel(confidence);

    return {
      platform: confidence >= CONFIDENCE_THRESHOLDS.medium ? 'lever' : null,
      confidence,
      signals,
      level,
      timestamp: Date.now(),
    };
  },

  findFormContainers(document: Document): HTMLElement[] {
    const containers: HTMLElement[] = [];
    const signatures = ATS_DOM_SIGNATURES.lever.containers;

    for (const selector of signatures) {
      const elements = document.querySelectorAll(selector);
      containers.push(...(Array.from(elements) as HTMLElement[]));
    }

    return containers;
  },
};

// Helper functions (similar pattern)
function checkLeverURL(url: string): boolean {
  const patterns = ATS_URL_PATTERNS.lever;
  const urlObj = new URL(url);
  const hostMatch = patterns.hosts.some((host) => urlObj.hostname.includes(host));
  const pathMatch = patterns.paths.some((path) => urlObj.pathname.includes(path));
  return hostMatch && pathMatch;
}

function checkLeverDOM(document: Document): boolean {
  const signatures = ATS_DOM_SIGNATURES.lever;
  const hasContainers = signatures.containers.some((s) => document.querySelector(s) !== null);
  const hasMarkers = signatures.markers.some((s) => document.querySelector(s) !== null);
  return hasContainers || hasMarkers;
}

function checkLeverAttributes(document: Document): boolean {
  const patterns = ATS_DATA_ATTRIBUTES.lever;
  for (const attr of patterns.attributes) {
    const elements = document.querySelectorAll(`[${attr}]`);
    for (const element of elements) {
      const value = element.getAttribute(attr);
      if (value && patterns.values) {
        const expectedValue = patterns.values[attr];
        if (expectedValue instanceof RegExp && expectedValue.test(value)) {
          return true;
        }
      }
    }
  }
  return false;
}

function getConfidenceLevel(confidence: number): DetectionResult['level'] {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return 'medium';
  return 'low';
}
