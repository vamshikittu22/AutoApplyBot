/**
 * CAPTCHA Detection Module
 * 
 * Detects presence of CAPTCHA challenges on ATS pages using DOM selectors.
 * Supports multiple CAPTCHA providers: reCAPTCHA v2/v3, hCaptcha, Cloudflare Turnstile.
 * 
 * Used by content scripts to pause autofill behavior when CAPTCHA is present,
 * preventing platform detection and potential bans.
 */

/**
 * DOM selectors for detecting CAPTCHA elements from major providers.
 * 
 * Each entry represents a unique signature of a CAPTCHA provider:
 * - reCAPTCHA: Google's CAPTCHA embedded via iframe or script tag
 * - hCaptcha: Privacy-focused alternative to reCAPTCHA
 * - Turnstile: Cloudflare's lightweight CAPTCHA solution
 */
export const CAPTCHA_SELECTORS = [
  // reCAPTCHA v2 (visible checkbox/image challenge)
  'iframe[src*="google.com/recaptcha"]',
  '.g-recaptcha',
  
  // reCAPTCHA v3 (invisible background verification)
  'script[src*="google.com/recaptcha/api.js"]',
  'script[src*="gstatic.com/recaptcha"]',
  
  // hCaptcha (privacy-focused alternative)
  'iframe[src*="hcaptcha.com"]',
  '.h-captcha',
  
  // Cloudflare Turnstile (lightweight CAPTCHA)
  'iframe[src*="challenges.cloudflare.com"]',
  '.cf-turnstile',
  '.cf-challenge',
] as const;

/**
 * CAPTCHA provider types
 */
export type CaptchaType = 'recaptcha' | 'hcaptcha' | 'turnstile' | 'unknown';

/**
 * Check if an element is visually visible to the user.
 * 
 * Prevents false positives from hidden CAPTCHA elements that are:
 * - display: none
 * - visibility: hidden
 * - opacity: 0
 * 
 * Special case: Script tags are always considered "present" if they exist in DOM,
 * as they don't have visual representation but indicate CAPTCHA loader is active.
 * 
 * @param element - DOM element to check
 * @returns true if element is visible, false otherwise
 */
function isElementVisible(element: Element): boolean {
  // Check if element exists in DOM
  if (!element || !element.ownerDocument) {
    return false;
  }

  // Script tags don't have visual representation - if they're in DOM, they're "active"
  if (element.tagName === 'SCRIPT') {
    return true;
  }

  // Get computed styles
  const style = window.getComputedStyle(element);
  
  // Check common hiding techniques
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  ) {
    return false;
  }

  return true;
}

/**
 * Detect if a CAPTCHA is currently present and visible on the page.
 * 
 * Checks for all known CAPTCHA provider selectors and verifies visibility
 * to prevent false positives from hidden elements.
 * 
 * @returns true if any visible CAPTCHA element found, false otherwise
 */
export function isCaptchaPresent(): boolean {
  for (const selector of CAPTCHA_SELECTORS) {
    // Query for all matching elements (some pages may have multiple)
    const elements = document.querySelectorAll(selector);
    
    // Check if any matching element is visible
    for (const element of Array.from(elements)) {
      if (isElementVisible(element)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Identify which CAPTCHA provider is present on the page.
 * 
 * Useful for analytics, debugging, and provider-specific handling.
 * 
 * @returns CAPTCHA provider type or null if none detected
 */
export function getCaptchaType(): CaptchaType | null {
  // Check reCAPTCHA signatures
  const recaptchaSelectors = [
    'iframe[src*="google.com/recaptcha"]',
    '.g-recaptcha',
    'script[src*="google.com/recaptcha/api.js"]',
  ];
  
  for (const selector of recaptchaSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of Array.from(elements)) {
      if (isElementVisible(element)) {
        return 'recaptcha';
      }
    }
  }
  
  // Check hCaptcha signatures
  const hcaptchaSelectors = [
    'iframe[src*="hcaptcha.com"]',
    '.h-captcha',
  ];
  
  for (const selector of hcaptchaSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of Array.from(elements)) {
      if (isElementVisible(element)) {
        return 'hcaptcha';
      }
    }
  }
  
  // Check Cloudflare Turnstile signatures
  const turnstileSelectors = [
    'iframe[src*="challenges.cloudflare.com"]',
    '.cf-turnstile',
    '.cf-challenge',
  ];
  
  for (const selector of turnstileSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of Array.from(elements)) {
      if (isElementVisible(element)) {
        return 'turnstile';
      }
    }
  }
  
  return null;
}
