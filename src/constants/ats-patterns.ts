import type { ATSType } from '@/types/ats';

/**
 * URL patterns for ATS detection
 * Each pattern includes host, path, and query indicators
 */
export const ATS_URL_PATTERNS: Record<
  ATSType,
  {
    hosts: string[];
    paths: string[];
    queryParams?: string[];
  }
> = {
  workday: {
    hosts: ['myworkday.com', 'myworkdayjobs.com'],
    paths: ['/d/inst/', '/jobs/', '/apply/'],
    queryParams: ['source'],
  },
  greenhouse: {
    hosts: ['greenhouse.io', 'boards.greenhouse.io'],
    paths: ['/application', '/embed/job_app'],
  },
  lever: {
    hosts: ['lever.co', 'jobs.lever.co'],
    paths: ['/apply/', '/application/'],
  },
};

/**
 * DOM signatures for ATS detection
 * CSS selectors that uniquely identify each platform
 */
export const ATS_DOM_SIGNATURES: Record<
  ATSType,
  {
    containers: string[];
    markers: string[];
    negativeMarkers?: string[];
  }
> = {
  workday: {
    containers: [
      '[data-automation-id="applicationContainer"]',
      '[data-automation-id="jobRequisition"]',
      'wd-app-root',
    ],
    markers: [
      '[data-automation-id^="formField"]',
      '[data-automation-id="applyButton"]',
      'wd-text-input',
    ],
    negativeMarkers: ['[data-automation-id="searchResults"]'], // Not an application form
  },
  greenhouse: {
    containers: ['#application_form', '.application-form', '[data-qa="application-form"]'],
    markers: ['[data-qa="job-application"]', '.greenhouse-form', '#submit_app'],
  },
  lever: {
    containers: ['.application-form', '[data-qa="application-form"]', '.lever-application'],
    markers: ['[data-qa="job-apply"]', '.lever-jobs-apply', 'form.application'],
  },
};

/**
 * Data attribute patterns for detection
 */
export const ATS_DATA_ATTRIBUTES: Record<
  ATSType,
  {
    attributes: string[];
    values?: Record<string, string | RegExp>;
  }
> = {
  workday: {
    attributes: ['data-automation-id', 'data-wd-app'],
    values: {
      'data-automation-id': /^(formField|apply|application)/,
    },
  },
  greenhouse: {
    attributes: ['data-qa', 'data-source'],
    values: {
      'data-qa': /^(job|application)/,
    },
  },
  lever: {
    attributes: ['data-qa', 'data-lever'],
    values: {
      'data-qa': /^(job|apply)/,
    },
  },
};

/**
 * Shadow DOM detection patterns (Workday-specific)
 */
export const SHADOW_DOM_MARKERS = {
  workday: ['wd-app-root', 'wd-text-input', 'wd-select', 'wd-date-picker'],
};

/**
 * Confidence score weights for each signal type
 */
export const DETECTION_WEIGHTS = {
  url: 30,
  dom: 40,
  attributes: 20,
  shadow: 10,
};

/**
 * Confidence thresholds for categorization
 */
export const CONFIDENCE_THRESHOLDS = {
  high: 80, // ≥80% = high confidence, show full UI
  medium: 50, // 50-79% = medium confidence, show "maybe" indicator
  low: 0, // <50% = low confidence, no detection shown
};
