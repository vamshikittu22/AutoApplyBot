/**
 * ATS Detection Engine
 *
 * Detects which ATS platform (Workday, Greenhouse, Lever) is active on the
 * current page using URL patterns and DOM signals.
 *
 * Covers: REQ-ATS-01 — detection accuracy ≥95% on 10+ test URLs per platform.
 *
 * Design rules (from AGENTS.md):
 * - Content scripts must be lazy — only activate when a form is detected.
 * - Never scan all pages; scope detection to known patterns first.
 * - Graceful degradation: returns null (Helper Mode) when uncertain.
 */

import type { ATSDetectionResult, ATSPlatform } from '@/types/ats';

// ─── URL Pattern Matchers ────────────────────────────────────────────────────

/**
 * Workday URL patterns.
 * Workday career sites follow one of two structures:
 * - Embedded: <company>.wd<N>.myworkdayjobs.com
 * - Hosted:   <company>.workday.com/...
 */
const WORKDAY_URL_PATTERNS: RegExp[] = [
  /\.wd\d+\.myworkdayjobs\.com/i,
  /\.workday\.com\/[^/]+\/(d\/[^/]+\/job|jobs)/i,
  /myworkdayjobs\.com/i,
];

/**
 * Greenhouse URL patterns.
 * Greenhouse job boards use boards.greenhouse.io or app.greenhouse.io,
 * or embedded iframes on company career pages with greenhouse.io origins.
 */
const GREENHOUSE_URL_PATTERNS: RegExp[] = [
  /boards\.greenhouse\.io/i,
  /app\.greenhouse\.io/i,
  /greenhouse\.io\/[^/]+\/jobs/i,
];

/**
 * Lever URL patterns.
 * Lever career pages are under jobs.lever.co/<company>.
 */
const LEVER_URL_PATTERNS: RegExp[] = [/jobs\.lever\.co/i, /lever\.co\/[^/]+\/jobs/i];

// ─── DOM Signal Detectors ────────────────────────────────────────────────────

/**
 * Workday DOM signals.
 * Workday uses Shadow DOM extensively. Key identifiers include:
 * - data-automation-id attributes on form elements
 * - gwt history tokens or workday-specific root elements
 */
function detectWorkdayDOMSignals(doc: Document): string[] {
  const signals: string[] = [];

  // Workday apps inject a root element with a specific id or data attribute
  if (doc.querySelector('[data-automation-id]')) {
    signals.push('data-automation-id attribute found');
  }

  // Workday uses a specific HTML element as app root
  if (doc.querySelector('div[data-uxi-widget-type]')) {
    signals.push('data-uxi-widget-type (Workday widget) found');
  }

  // Workday script bundles contain recognizable tokens in script src
  const scripts = Array.from(doc.querySelectorAll('script[src]'));
  if (scripts.some((s) => /workday|wd1|wd2|wd3|wd5|myworkdayjobs/i.test(s.getAttribute('src') ?? ''))) {
    signals.push('Workday script bundle detected');
  }

  // Workday pages include a meta application name
  const appMeta = doc.querySelector('meta[name="app-name"], meta[property="og:site_name"]');
  if (appMeta?.getAttribute('content')?.toLowerCase().includes('workday')) {
    signals.push('Workday meta tag found');
  }

  return signals;
}

/**
 * Greenhouse DOM signals.
 * Greenhouse forms have predictable field IDs (first_name, last_name, email, etc.)
 * and script tags loading from greenhouse.io CDN.
 */
function detectGreenhouseDOMSignals(doc: Document): string[] {
  const signals: string[] = [];

  // Greenhouse application forms have a recognized action URL pattern
  const form = doc.querySelector('form[action*="greenhouse"], form#application_form');
  if (form) {
    signals.push('Greenhouse application form element found');
  }

  // Greenhouse job boards embed an iframe from greenhouse.io
  const iframes = Array.from(doc.querySelectorAll('iframe'));
  if (iframes.some((f) => /greenhouse\.io/i.test(f.getAttribute('src') ?? ''))) {
    signals.push('Greenhouse iframe embed found');
  }

  // Greenhouse input fields use predictable IDs
  const hasFirstName = !!doc.querySelector('#first_name, input[name="job_application[first_name]"]');
  const hasLastName = !!doc.querySelector('#last_name, input[name="job_application[last_name]"]');
  if (hasFirstName && hasLastName) {
    signals.push('Greenhouse standard name fields found');
  }

  // Greenhouse loads assets from greenhouse.io CDN
  const links = Array.from(doc.querySelectorAll('link[href], script[src]'));
  if (links.some((el) => /greenhouse\.io/i.test((el.getAttribute('href') ?? '') + (el.getAttribute('src') ?? '')))) {
    signals.push('Greenhouse CDN asset found');
  }

  return signals;
}

/**
 * Lever DOM signals.
 * Lever's application pages have a simpler, more predictable structure:
 * - A form with input names like lever-source, eeo-gender, etc.
 * - Lever branding in meta or footer
 */
function detectLeverDOMSignals(doc: Document): string[] {
  const signals: string[] = [];

  // Lever forms contain hidden lever-source input
  if (doc.querySelector('input[name="lever-source"], input[name="lever_source"]')) {
    signals.push('Lever source input field found');
  }

  // Lever pages use a specific class on the apply button
  if (doc.querySelector('.lever-apply, [class*="lever-button"]')) {
    signals.push('Lever apply button class found');
  }

  // Lever application forms load from lever.co
  const scripts = Array.from(doc.querySelectorAll('script[src]'));
  if (scripts.some((s) => /lever\.co/i.test(s.getAttribute('src') ?? ''))) {
    signals.push('Lever script detected');
  }

  // Lever uses predictable form input names
  const hasName = !!doc.querySelector('input[name="name"], input[placeholder*="Name"]');
  const hasEmail = !!doc.querySelector('input[name="email"]');
  const hasResume = !!doc.querySelector('input[name="resume"]');
  if (hasName && hasEmail && hasResume) {
    signals.push('Lever standard application fields found');
  }

  return signals;
}

// ─── Detection Score Calculation ─────────────────────────────────────────────

type CandidateScore = {
  platform: ATSPlatform;
  score: number;
  signals: string[];
};

/**
 * Score a URL against all known ATS patterns.
 * Each URL match contributes a fixed score bonus per platform.
 */
function scoreByUrl(url: string): CandidateScore[] {
  const scores: CandidateScore[] = [];

  const workdayUrlSignals = WORKDAY_URL_PATTERNS.filter((p) => p.test(url)).map((p) => `URL matches ${p.source}`);
  if (workdayUrlSignals.length > 0) {
    scores.push({ platform: 'workday', score: 60 * workdayUrlSignals.length, signals: workdayUrlSignals });
  }

  const greenhouseUrlSignals = GREENHOUSE_URL_PATTERNS.filter((p) => p.test(url)).map(
    (p) => `URL matches ${p.source}`
  );
  if (greenhouseUrlSignals.length > 0) {
    scores.push({ platform: 'greenhouse', score: 60 * greenhouseUrlSignals.length, signals: greenhouseUrlSignals });
  }

  const leverUrlSignals = LEVER_URL_PATTERNS.filter((p) => p.test(url)).map((p) => `URL matches ${p.source}`);
  if (leverUrlSignals.length > 0) {
    scores.push({ platform: 'lever', score: 60 * leverUrlSignals.length, signals: leverUrlSignals });
  }

  return scores;
}

/**
 * Score based on DOM signals from the document.
 * Each DOM signal contributes +15 to the score.
 */
function scoreByDom(doc: Document): CandidateScore[] {
  const results: CandidateScore[] = [];

  const workdaySignals = detectWorkdayDOMSignals(doc);
  if (workdaySignals.length > 0) {
    results.push({ platform: 'workday', score: 15 * workdaySignals.length, signals: workdaySignals });
  }

  const greenhouseSignals = detectGreenhouseDOMSignals(doc);
  if (greenhouseSignals.length > 0) {
    results.push({ platform: 'greenhouse', score: 15 * greenhouseSignals.length, signals: greenhouseSignals });
  }

  const leverSignals = detectLeverDOMSignals(doc);
  if (leverSignals.length > 0) {
    results.push({ platform: 'lever', score: 15 * leverSignals.length, signals: leverSignals });
  }

  return results;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Detect which ATS platform is active on the given page.
 *
 * Combines URL pattern matching (high weight) with DOM signal detection
 * (additional evidence) to produce a confidence score per platform.
 *
 * Returns the highest-confidence result above the minimum threshold (40),
 * or null if no ATS is detected (→ Helper Mode activates).
 *
 * @param url - The current page URL to test
 * @param doc - The document to scan for DOM signals (defaults to global document)
 */
export function detectATSPlatform(url: string, doc: Document = document): ATSDetectionResult {
  const MIN_CONFIDENCE = 40;

  // Accumulate scores per platform
  const platformTotals = new Map<ATSPlatform, { score: number; signals: string[] }>();

  const allScores = [...scoreByUrl(url), ...scoreByDom(doc)];

  for (const candidate of allScores) {
    const existing = platformTotals.get(candidate.platform) ?? { score: 0, signals: [] };
    platformTotals.set(candidate.platform, {
      score: existing.score + candidate.score,
      signals: [...existing.signals, ...candidate.signals],
    });
  }

  if (platformTotals.size === 0) {
    return null;
  }

  // Find the platform with the highest score
  let bestPlatform: ATSPlatform | null = null;
  let bestScore = 0;
  let bestSignals: string[] = [];

  for (const [platform, data] of platformTotals) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestPlatform = platform;
      bestSignals = data.signals;
    }
  }

  if (!bestPlatform || bestScore < MIN_CONFIDENCE) {
    return null;
  }

  // Cap confidence at 100
  const confidence = Math.min(100, bestScore);

  return {
    platform: bestPlatform,
    confidence,
    url,
    signals: bestSignals,
  };
}

/**
 * Quick boolean check — is this URL from a known ATS domain?
 * Used as a fast pre-filter before doing a full DOM scan.
 *
 * @param url - URL to check
 */
export function isKnownATSUrl(url: string): boolean {
  return (
    WORKDAY_URL_PATTERNS.some((p) => p.test(url)) ||
    GREENHOUSE_URL_PATTERNS.some((p) => p.test(url)) ||
    LEVER_URL_PATTERNS.some((p) => p.test(url))
  );
}

/**
 * Returns which platforms could be active based on URL alone.
 * Used for early activation decisions before DOM is fully loaded.
 *
 * @param url - URL to check
 */
export function getUrlMatchedPlatforms(url: string): ATSPlatform[] {
  const platforms: ATSPlatform[] = [];

  if (WORKDAY_URL_PATTERNS.some((p) => p.test(url))) platforms.push('workday');
  if (GREENHOUSE_URL_PATTERNS.some((p) => p.test(url))) platforms.push('greenhouse');
  if (LEVER_URL_PATTERNS.some((p) => p.test(url))) platforms.push('lever');

  return platforms;
}
