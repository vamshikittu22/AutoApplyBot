/**
 * Per-Job Disable List Module
 *
 * Allows users to disable extension features for specific job URLs.
 * Implements granular per-job control (not domain-wide, not path-level).
 *
 * Duration policy: Permanent disable until user manually re-enables (simplest UX).
 * URLs normalized for consistent matching (query params ignored).
 *
 * Implements REQ-SAF-02: Per-site disable control
 * Pattern follows 04-RESEARCH.md Pattern 5
 */

import { normalizeUrl } from '@/lib/tracker/utils';

const STORAGE_KEY = 'disabledJobs';

/**
 * Check if a job URL is in the disabled list
 *
 * @param jobUrl - Job posting URL to check
 * @returns true if job is disabled (extension features should not activate)
 */
export async function isJobDisabled(jobUrl: string): Promise<boolean> {
  const { [STORAGE_KEY]: disabledJobs = [] } = await chrome.storage.local.get(STORAGE_KEY);
  const normalized = normalizeUrl(jobUrl);

  return (disabledJobs as string[]).includes(normalized);
}

/**
 * Add a job URL to the disabled list
 * Prevents autofill, AI suggestions, and other extension features on this job
 *
 * @param jobUrl - Job posting URL to disable
 */
export async function disableJob(jobUrl: string): Promise<void> {
  const { [STORAGE_KEY]: disabledJobs = [] } = await chrome.storage.local.get(STORAGE_KEY);
  const normalized = normalizeUrl(jobUrl);

  // Only add if not already in list
  if (!(disabledJobs as string[]).includes(normalized)) {
    (disabledJobs as string[]).push(normalized);
    await chrome.storage.local.set({ [STORAGE_KEY]: disabledJobs });
  }
}

/**
 * Remove a job URL from the disabled list
 * Re-enables extension features on this job
 *
 * @param jobUrl - Job posting URL to re-enable
 */
export async function enableJob(jobUrl: string): Promise<void> {
  const { [STORAGE_KEY]: disabledJobs = [] } = await chrome.storage.local.get(STORAGE_KEY);
  const normalized = normalizeUrl(jobUrl);

  // Filter out matching URL
  const filtered = (disabledJobs as string[]).filter((url) => url !== normalized);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}

/**
 * Get full list of disabled job URLs
 * Used for settings page display
 *
 * @returns Array of normalized job URLs that are disabled
 */
export async function getDisabledJobs(): Promise<string[]> {
  const { [STORAGE_KEY]: disabledJobs = [] } = await chrome.storage.local.get(STORAGE_KEY);
  return disabledJobs as string[];
}
