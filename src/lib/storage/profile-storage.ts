/**
 * Profile Storage Module for AutoApply Copilot
 *
 * Chrome Storage API wrapper for profile persistence.
 * Covers requirements:
 * - REQ-PRO-05 (simplified): Local storage without encryption in v1
 * - REQ-PRO-06: Data export and complete deletion
 *
 * Security note: v1 stores profile in plain JSON for simplicity.
 * Chrome Storage is sandboxed per-extension and not accessible to other
 * extensions or websites. v2+ may add encryption if needed.
 */

import type { Profile } from '@/types/profile';

const STORAGE_KEY = 'profile';
const APPLICATIONS_KEY = 'applications';
const SETTINGS_KEY = 'settings';

/**
 * Save profile to Chrome local storage.
 *
 * v1 stores in plain JSON (Chrome Storage is sandboxed per-extension).
 * v2+ may add encryption if needed.
 *
 * @param profile - User profile to save
 * @throws Error if storage fails
 */
export async function saveProfile(profile: Profile): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: profile });
  } catch (error) {
    throw new Error(
      `Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Load profile from Chrome local storage.
 *
 * @returns Profile if exists, null if not found
 * @throws Error if load fails
 */
export async function loadProfile(): Promise<Profile | null> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);

    if (!result[STORAGE_KEY]) {
      return null;
    }

    return result[STORAGE_KEY] as Profile;
  } catch (error) {
    throw new Error(
      `Failed to load profile: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete all user data from Chrome storage (REQ-PRO-06).
 * Includes profile, applications, settings.
 *
 * ⚠️ This action is irreversible.
 */
export async function deleteProfile(): Promise<void> {
  try {
    await chrome.storage.local.clear();
  } catch (error) {
    throw new Error(
      `Failed to delete profile: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Export all user data as JSON (REQ-PRO-06).
 * Includes profile, applications, settings.
 *
 * @returns JSON object with all user data
 */
export async function exportData(): Promise<{
  profile: Profile | null;
  applications: any[];
  settings: any;
  exportedAt: string;
}> {
  try {
    const profile = await loadProfile();

    // Load applications and settings
    const result = await chrome.storage.local.get([APPLICATIONS_KEY, SETTINGS_KEY]);

    return {
      profile,
      applications: (result[APPLICATIONS_KEY] as any[] | undefined) || [],
      settings: (result[SETTINGS_KEY] as any | undefined) || {},
      exportedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(
      `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if profile exists in storage.
 * Used for onboarding flow detection.
 */
export async function hasProfile(): Promise<boolean> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return !!result[STORAGE_KEY];
}

/**
 * Update specific profile fields without loading entire profile.
 * Useful for quick updates (e.g., changing role preference).
 */
export async function updateProfile(updates: Partial<Profile>): Promise<void> {
  const profile = await loadProfile();

  if (!profile) {
    throw new Error('No profile exists to update');
  }

  const updatedProfile: Profile = {
    ...profile,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveProfile(updatedProfile);
}
