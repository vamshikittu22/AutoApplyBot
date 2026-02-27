/**
 * Utility functions for job application tracker
 *
 * Provides:
 * - Timezone-aware date calculations for calendar day reset
 * - URL normalization for duplicate detection
 * - Duplicate checking logic
 *
 * Pattern follows 04-RESEARCH.md Pattern 4 (calendar day calculations)
 */

import type { TrackedApplication } from '@/types/tracker';

/**
 * Get today's date string in YYYY-MM-DD format (user's local timezone)
 * Used for calendar day calculations (midnight-to-midnight reset)
 *
 * @returns Date string in YYYY-MM-DD format (e.g., "2026-02-26")
 */
export function getTodayDateString(): string {
  const now = new Date();
  // en-CA locale produces YYYY-MM-DD format in local timezone
  return now.toLocaleDateString('en-CA');
}

/**
 * Check if an ISO date string matches today's date (user's timezone)
 *
 * @param isoDateString - ISO 8601 date string to check
 * @returns true if date is today in user's local timezone
 */
export function isToday(isoDateString: string): boolean {
  const today = getTodayDateString();
  const dateToCheck = new Date(isoDateString).toLocaleDateString('en-CA');
  return dateToCheck === today;
}

/**
 * Normalize a URL for duplicate detection
 * Removes query parameters, hash fragments, and trailing slashes
 * Converts to lowercase for case-insensitive comparison
 *
 * @param url - URL to normalize
 * @returns Normalized URL string
 *
 * @example
 * normalizeUrl('https://Example.com/jobs/123?source=linkedin#apply')
 * // Returns: 'https://example.com/jobs/123'
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // Build normalized URL: protocol + hostname + pathname (no query/hash)
    let normalized = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;

    // Remove trailing slash
    if (normalized.endsWith('/') && normalized.length > 1) {
      normalized = normalized.slice(0, -1);
    }

    // Convert to lowercase for case-insensitive comparison
    return normalized.toLowerCase();
  } catch {
    // If URL parsing fails, return original lowercased
    return url.toLowerCase();
  }
}

/**
 * Check if a new application is a duplicate of existing applications
 * Uses normalized URL comparison and optionally checks date recency
 *
 * @param newApp - Application to check
 * @param existingApps - Array of existing applications
 * @param dayThreshold - Optional: consider duplicate only if applied within last N days (default: 7)
 * @returns true if duplicate found
 */
export function isDuplicate(
  newApp: TrackedApplication,
  existingApps: TrackedApplication[],
  dayThreshold = 7
): boolean {
  const newUrlNormalized = normalizeUrl(newApp.url);
  const newAppDate = new Date(newApp.appliedDate).getTime();

  return existingApps.some((existing) => {
    // Check if URLs match (normalized)
    const existingUrlNormalized = normalizeUrl(existing.url);
    if (existingUrlNormalized !== newUrlNormalized) {
      return false;
    }

    // URLs match - check if applied within threshold
    const existingDate = new Date(existing.appliedDate).getTime();
    const daysDifference = Math.abs(newAppDate - existingDate) / (1000 * 60 * 60 * 24);

    return daysDifference <= dayThreshold;
  });
}
