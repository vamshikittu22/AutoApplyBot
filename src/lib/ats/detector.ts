import type { DetectionResult, ATSDetector, ATSType } from '@/types/ats';
import { workdayDetector } from './workday';
import { greenhouseDetector } from './greenhouse';
import { leverDetector } from './lever';

/**
 * All registered ATS detectors
 */
const detectors: ATSDetector[] = [workdayDetector, greenhouseDetector, leverDetector];

/**
 * Detect ATS platform on current page
 * Runs all platform detectors and returns the one with highest confidence
 *
 * @param url - Current page URL
 * @param document - Current page document
 * @returns Detection result with highest confidence, or null if no detection
 */
export async function detectATS(url: string, document: Document): Promise<DetectionResult> {
  const results = await Promise.all(detectors.map((detector) => detector.detect(url, document)));

  // Find result with highest confidence
  // Start with a default "no detection" result if no detectors exist
  if (results.length === 0) {
    return {
      platform: null,
      confidence: 0,
      signals: [],
      level: 'none',
      timestamp: Date.now(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const bestResult = results.reduce((best, current) => {
    return current.confidence > best.confidence ? current : best;
  }, results[0]!);

  return bestResult;
}

/**
 * Get detector for specific platform
 */
export function getDetector(platform: ATSType): ATSDetector | undefined {
  return detectors.find((d) => d.platform === platform);
}

/**
 * Find form containers on page using detected platform
 */
export function findFormContainers(platform: ATSType, document: Document): HTMLElement[] {
  const detector = getDetector(platform);
  if (!detector) return [];
  return detector.findFormContainers(document);
}

/**
 * Export all detectors for testing
 */
export { workdayDetector, greenhouseDetector, leverDetector };
