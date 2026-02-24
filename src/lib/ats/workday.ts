import type { DetectionResult, ATSDetector } from '@/types/ats';
import {
  ATS_URL_PATTERNS,
  ATS_DOM_SIGNATURES,
  ATS_DATA_ATTRIBUTES,
  SHADOW_DOM_MARKERS,
  DETECTION_WEIGHTS,
  CONFIDENCE_THRESHOLDS,
} from '@/constants/ats-patterns';

/**
 * Workday ATS detector
 * Workday uses Shadow DOM extensively, so we need special handling
 */
export const workdayDetector: ATSDetector = {
  platform: 'workday',

  async detect(url: string, document: Document): Promise<DetectionResult> {
    let confidence = 0;
    const signals: DetectionResult['signals'] = [];

    // Signal 1: URL pattern matching (30% weight)
    if (checkWorkdayURL(url)) {
      confidence += DETECTION_WEIGHTS.url;
      signals.push('url');
    }

    // Signal 2: DOM signatures (40% weight)
    if (checkWorkdayDOM(document)) {
      confidence += DETECTION_WEIGHTS.dom;
      signals.push('dom');
    }

    // Signal 3: Data attributes (20% weight)
    if (checkWorkdayAttributes(document)) {
      confidence += DETECTION_WEIGHTS.attributes;
      signals.push('attributes');
    }

    // Signal 4: Shadow DOM markers (10% weight) - Workday specific
    if (await checkWorkdayShadowDOM(document)) {
      confidence += DETECTION_WEIGHTS.shadow;
      signals.push('shadow');
    }

    // Determine confidence level
    const level = getConfidenceLevel(confidence);

    return {
      platform: confidence >= CONFIDENCE_THRESHOLDS.medium ? 'workday' : null,
      confidence,
      signals,
      level,
      timestamp: Date.now(),
    };
  },

  findFormContainers(document: Document): HTMLElement[] {
    const containers: HTMLElement[] = [];
    const signatures = ATS_DOM_SIGNATURES.workday.containers;

    for (const selector of signatures) {
      const elements = document.querySelectorAll(selector);
      containers.push(...(Array.from(elements) as HTMLElement[]));
    }

    // Check Shadow DOM for form containers
    const shadowContainers = findWorkdayFormsInShadowDOM(document);
    containers.push(...shadowContainers);

    return containers;
  },
};

function checkWorkdayURL(url: string): boolean {
  const patterns = ATS_URL_PATTERNS.workday;
  const urlObj = new URL(url);

  // Check host
  const hostMatch = patterns.hosts.some((host) => urlObj.hostname.includes(host));

  // Check path
  const pathMatch = patterns.paths.some((path) => urlObj.pathname.includes(path));

  return hostMatch && pathMatch;
}

function checkWorkdayDOM(document: Document): boolean {
  const signatures = ATS_DOM_SIGNATURES.workday;

  // Check for positive markers
  const hasContainers = signatures.containers.some(
    (selector) => document.querySelector(selector) !== null
  );

  const hasMarkers = signatures.markers.some(
    (selector) => document.querySelector(selector) !== null
  );

  // Check for negative markers (exclude false positives)
  const hasNegativeMarkers =
    signatures.negativeMarkers?.some((selector) => document.querySelector(selector) !== null) ??
    false;

  return (hasContainers || hasMarkers) && !hasNegativeMarkers;
}

function checkWorkdayAttributes(document: Document): boolean {
  const patterns = ATS_DATA_ATTRIBUTES.workday;

  for (const attr of patterns.attributes) {
    const elements = document.querySelectorAll(`[${attr}]`);

    for (const element of elements) {
      const value = element.getAttribute(attr);
      if (value && patterns.values) {
        const expectedValue = patterns.values[attr];
        if (expectedValue instanceof RegExp && expectedValue.test(value)) {
          return true;
        }
        if (typeof expectedValue === 'string' && value.includes(expectedValue)) {
          return true;
        }
      }
    }
  }

  return false;
}

async function checkWorkdayShadowDOM(document: Document): Promise<boolean> {
  const markers = SHADOW_DOM_MARKERS.workday;

  // Check if any shadow DOM hosts with Workday markers exist
  for (const marker of markers) {
    const element = document.querySelector(marker);
    if (element?.shadowRoot) {
      return true;
    }
  }

  return false;
}

function findWorkdayFormsInShadowDOM(document: Document): HTMLElement[] {
  const forms: HTMLElement[] = [];
  const markers = SHADOW_DOM_MARKERS.workday;

  for (const marker of markers) {
    const hosts = document.querySelectorAll(marker);
    hosts.forEach((host) => {
      if (host.shadowRoot) {
        const shadowForms = host.shadowRoot.querySelectorAll('form, [role="form"]');
        forms.push(...(Array.from(shadowForms) as HTMLElement[]));
      }
    });
  }

  return forms;
}

function getConfidenceLevel(confidence: number): DetectionResult['level'] {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return 'medium';
  return 'low';
}
