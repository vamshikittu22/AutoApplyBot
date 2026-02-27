/**
 * Chrome Storage abstraction for tracked job applications
 *
 * Provides CRUD operations for application tracking with:
 * - Local storage persistence (chrome.storage.local)
 * - Duplicate detection before saving
 * - Automatic sorting by date (newest first)
 * - Today's applications filtering
 *
 * Pattern follows 04-RESEARCH.md Pattern 1
 */

import type { TrackedApplication } from '@/types/tracker';
import { normalizeUrl } from './utils';

const STORAGE_KEY = 'applications';

/**
 * Save a new application to Chrome Storage
 * Checks for duplicates using normalized URL before adding
 *
 * @param app - Application to save
 * @throws Error if duplicate detected (same normalized URL)
 */
export async function saveApplication(app: TrackedApplication): Promise<void> {
  const { applications = [] } = await chrome.storage.local.get(STORAGE_KEY);

  // Check for duplicate URLs (normalized comparison)
  const isDuplicate = applications.some(
    (existing: TrackedApplication) => normalizeUrl(existing.url) === normalizeUrl(app.url)
  );

  if (isDuplicate) {
    throw new Error(`Application for URL ${app.url} already exists`);
  }

  applications.push(app);
  await chrome.storage.local.set({ [STORAGE_KEY]: applications });
}

/**
 * Retrieve all applications from Chrome Storage
 * Returns applications sorted by appliedDate DESC (newest first)
 *
 * @returns Array of tracked applications (empty array if none)
 */
export async function getApplications(): Promise<TrackedApplication[]> {
  const { applications = [] } = await chrome.storage.local.get(STORAGE_KEY);

  // Sort by appliedDate descending (newest first)
  return applications.sort((a: TrackedApplication, b: TrackedApplication) => {
    const dateA = new Date(a.appliedDate).getTime();
    const dateB = new Date(b.appliedDate).getTime();
    return dateB - dateA;
  });
}

/**
 * Update an existing application
 * Merges updates into the found application
 *
 * @param id - Application ID to update
 * @param updates - Partial application fields to update
 * @throws Error if application not found
 */
export async function updateApplication(
  id: string,
  updates: Partial<TrackedApplication>
): Promise<void> {
  const { applications = [] } = await chrome.storage.local.get(STORAGE_KEY);

  const appIndex = applications.findIndex((app: TrackedApplication) => app.id === id);

  if (appIndex === -1) {
    throw new Error(`Application with id ${id} not found`);
  }

  // Merge updates into existing application
  applications[appIndex] = { ...applications[appIndex], ...updates };

  await chrome.storage.local.set({ [STORAGE_KEY]: applications });
}

/**
 * Delete an application by ID
 *
 * @param id - Application ID to delete
 */
export async function deleteApplication(id: string): Promise<void> {
  const { applications = [] } = await chrome.storage.local.get(STORAGE_KEY);

  const filtered = applications.filter((app: TrackedApplication) => app.id !== id);

  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}

/**
 * Get applications submitted today (in user's local timezone)
 * Uses calendar day calculation from utils.ts
 *
 * @returns Array of applications submitted today
 */
export async function getApplicationsToday(): Promise<TrackedApplication[]> {
  const { getTodayDateString } = await import('./utils');
  const today = getTodayDateString();

  const allApplications = await getApplications();

  // Filter applications where appliedDate matches today's date
  return allApplications.filter((app) => {
    const appDate = new Date(app.appliedDate).toLocaleDateString('en-CA');
    return appDate === today;
  });
}
