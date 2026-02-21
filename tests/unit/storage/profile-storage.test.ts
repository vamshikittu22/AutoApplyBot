/**
 * Profile Storage Unit Tests
 *
 * Tests Chrome Storage API wrapper for profile persistence.
 * Covers:
 * - REQ-PRO-05 (simplified): Local storage without encryption
 * - REQ-PRO-06: Data export and complete deletion
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveProfile,
  loadProfile,
  deleteProfile,
  exportData,
  hasProfile,
  updateProfile,
} from '@/lib/storage/profile-storage';
import type { Profile } from '@/types/profile';

// Mock chrome.storage.local
const mockStorage: Record<string, any> = {};

global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys) => {
        if (typeof keys === 'string') {
          return Promise.resolve({ [keys]: mockStorage[keys] });
        }
        const result: Record<string, any> = {};
        if (Array.isArray(keys)) {
          keys.forEach((key: string) => {
            if (mockStorage[key]) result[key] = mockStorage[key];
          });
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
        return Promise.resolve();
      }),
    },
  },
} as any;

describe('profile-storage', () => {
  const sampleProfile: Profile = {
    personal: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-1234',
      location: 'San Francisco, CA',
    },
    workHistory: [
      {
        id: '1',
        position: 'Engineer',
        company: 'Tech Co',
        startDate: '2020-01',
        endDate: 'Present',
        achievements: ['Built things'],
      },
    ],
    education: [],
    skills: [{ name: 'JavaScript' }, { name: 'TypeScript' }],
    links: { github: 'https://github.com/jane' },
    domainExtras: {},
    rolePreference: 'Tech',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  describe('saveProfile / loadProfile', () => {
    it('should save and load profile successfully', async () => {
      await saveProfile(sampleProfile);

      // Verify storage contains profile data
      const storedData = mockStorage['profile'];
      expect(storedData).toBeDefined();
      expect(storedData).toEqual(sampleProfile);

      // Load and verify
      const loadedProfile = await loadProfile();
      expect(loadedProfile).toEqual(sampleProfile);
    });

    it('should return null when no profile exists', async () => {
      const profile = await loadProfile();
      expect(profile).toBeNull();
    });
  });

  describe('deleteProfile', () => {
    it('should delete all data from storage (REQ-PRO-06)', async () => {
      await saveProfile(sampleProfile);
      expect(await hasProfile()).toBe(true);

      await deleteProfile();

      expect(await hasProfile()).toBe(false);
      expect(Object.keys(mockStorage).length).toBe(0);
    });
  });

  describe('exportData', () => {
    it('should export profile as JSON (REQ-PRO-06)', async () => {
      await saveProfile(sampleProfile);

      const exported = await exportData();

      expect(exported.profile).toEqual(sampleProfile);
      expect(exported.applications).toEqual([]);
      expect(exported.settings).toEqual({});
      expect(exported.exportedAt).toBeTruthy();
      expect(typeof exported.exportedAt).toBe('string');
    });

    it('should export empty data when no profile exists', async () => {
      const exported = await exportData();

      expect(exported.profile).toBeNull();
      expect(exported.applications).toEqual([]);
      expect(exported.settings).toEqual({});
    });
  });

  describe('hasProfile', () => {
    it('should detect profile existence', async () => {
      expect(await hasProfile()).toBe(false);

      await saveProfile(sampleProfile);

      expect(await hasProfile()).toBe(true);
    });
  });

  describe('updateProfile', () => {
    it('should update specific fields and modify updatedAt', async () => {
      await saveProfile(sampleProfile);

      const updates = { rolePreference: 'Engineering' as const };
      await updateProfile(updates);

      const updated = await loadProfile();
      expect(updated?.rolePreference).toBe('Engineering');
      expect(updated?.updatedAt).not.toBe(sampleProfile.updatedAt);
    });

    it('should throw error when no profile exists', async () => {
      await expect(updateProfile({ rolePreference: 'Tech' })).rejects.toThrow(
        'No profile exists to update'
      );
    });
  });

  describe('error handling', () => {
    it('should throw error when save fails', async () => {
      const mockError = new Error('Storage quota exceeded');
      vi.mocked(chrome.storage.local.set).mockRejectedValueOnce(mockError);

      await expect(saveProfile(sampleProfile)).rejects.toThrow(
        'Failed to save profile: Storage quota exceeded'
      );
    });

    it('should throw error when load fails', async () => {
      const mockError = new Error('Storage unavailable');
      vi.mocked(chrome.storage.local.get).mockRejectedValueOnce(mockError);

      await expect(loadProfile()).rejects.toThrow('Failed to load profile: Storage unavailable');
    });

    it('should throw error when delete fails', async () => {
      const mockError = new Error('Permission denied');
      vi.mocked(chrome.storage.local.clear).mockRejectedValueOnce(mockError);

      await expect(deleteProfile()).rejects.toThrow('Failed to delete profile: Permission denied');
    });

    it('should throw error when export fails', async () => {
      const mockError = new Error('Export failed');
      vi.mocked(chrome.storage.local.get).mockRejectedValueOnce(mockError);

      // exportData calls loadProfile internally, so error message is nested
      await expect(exportData()).rejects.toThrow(/Failed to export data:.*Export failed/);
    });
  });
});
