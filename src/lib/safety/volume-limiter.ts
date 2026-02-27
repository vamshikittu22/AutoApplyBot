/**
 * Volume Limiter Module
 *
 * Tracks daily application volume with calendar day reset (midnight-to-midnight in user's timezone).
 * Provides soft warning at 15 apps/day threshold per CONTEXT.md decision.
 *
 * Implements REQ-SAF-01: Volume tracking for safety limits (warning only, no hard block)
 *
 * Pattern follows 04-RESEARCH.md Pattern 4 (calendar day calculations)
 */

import type { VolumeData } from '@/types/tracker';
import { getTodayDateString } from '@/lib/tracker/utils';

const STORAGE_KEY = 'volumeData';
const WARNING_THRESHOLD = 15; // Applications per day before warning

/**
 * Get current volume data from Chrome Storage.
 * Automatically resets count if date has changed (new calendar day).
 *
 * @returns Current volume data with today's date and count
 */
export async function getVolumeData(): Promise<VolumeData> {
  const { [STORAGE_KEY]: volumeData } = (await chrome.storage.local.get(STORAGE_KEY)) as {
    [STORAGE_KEY]?: VolumeData;
  };

  const today = getTodayDateString();

  // If no data exists or date has changed, reset to today with count 0
  if (!volumeData || volumeData.date !== today) {
    const resetData: VolumeData = { date: today, count: 0 };
    await chrome.storage.local.set({ [STORAGE_KEY]: resetData });
    return resetData;
  }

  return volumeData as VolumeData;
}

/**
 * Increment volume count by 1.
 * Automatically resets if called on a new calendar day.
 *
 * @returns Updated volume data after increment
 */
export async function incrementVolume(): Promise<VolumeData> {
  const currentData = await getVolumeData(); // This handles date reset automatically

  const updatedData: VolumeData = {
    date: currentData.date,
    count: currentData.count + 1,
  };

  await chrome.storage.local.set({ [STORAGE_KEY]: updatedData });

  return updatedData;
}

/**
 * Check if volume warning threshold has been reached.
 * Warning triggers at 15 applications/day per CONTEXT.md soft warning policy.
 *
 * @returns true if count >= 15 (warning should be shown)
 */
export async function shouldShowVolumeWarning(): Promise<boolean> {
  const volumeData = await getVolumeData();
  return volumeData.count >= WARNING_THRESHOLD;
}

/**
 * Reset volume data to today with count 0.
 * Used for testing or user-triggered reset.
 */
export async function resetVolume(): Promise<void> {
  const resetData: VolumeData = {
    date: getTodayDateString(),
    count: 0,
  };

  await chrome.storage.local.set({ [STORAGE_KEY]: resetData });
}
