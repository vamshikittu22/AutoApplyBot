/**
 * Unit tests for volume limiter with calendar day reset
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getVolumeData,
  incrementVolume,
  shouldShowVolumeWarning,
  resetVolume,
} from './volume-limiter';
import { fakeBrowser } from 'wxt/testing';

describe('Volume Limiter', () => {
  beforeEach(() => {
    // Clear all storage before each test
    fakeBrowser.storage.local.clear();
    // Reset all mocks
    vi.restoreAllMocks();
  });

  describe('getVolumeData', () => {
    it('should initialize with count 0 on first call', async () => {
      const volumeData = await getVolumeData();

      expect(volumeData).toBeDefined();
      expect(volumeData.count).toBe(0);
      expect(volumeData.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
    });

    it('should return existing data if same day', async () => {
      // Get today's date for comparison
      const today = new Date().toLocaleDateString('en-CA');

      // Set initial volume data
      await fakeBrowser.storage.local.set({
        volumeData: { date: today, count: 5 },
      });

      const volumeData = await getVolumeData();

      expect(volumeData.count).toBe(5);
      expect(volumeData.date).toBe(today);
    });

    it('should reset count to 0 when date changes (midnight rollover)', async () => {
      // Set volume data for a date in the past (not today)
      const pastDate = '2026-01-01';
      await fakeBrowser.storage.local.set({
        volumeData: { date: pastDate, count: 10 },
      });

      const volumeData = await getVolumeData();

      // Should reset to 0 with today's date
      expect(volumeData.count).toBe(0);
      expect(volumeData.date).not.toBe(pastDate);
      expect(volumeData.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('incrementVolume', () => {
    it('should increment count by 1', async () => {
      // Initialize with count 0
      await getVolumeData();

      const updated = await incrementVolume();

      expect(updated.count).toBe(1);
    });

    it('should increment multiple times correctly', async () => {
      await getVolumeData();

      await incrementVolume();
      await incrementVolume();
      const updated = await incrementVolume();

      expect(updated.count).toBe(3);
    });

    it('should reset and increment if called on new day', async () => {
      // Set volume data for a past date (not today)
      const pastDate = '2026-01-01';
      await fakeBrowser.storage.local.set({
        volumeData: { date: pastDate, count: 15 },
      });

      // Increment on new day should reset to 1 (0 → 1)
      const updated = await incrementVolume();

      expect(updated.count).toBe(1);
      expect(updated.date).not.toBe(pastDate);
      expect(updated.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('shouldShowVolumeWarning', () => {
    it('should return false when count is below threshold (< 15)', async () => {
      await fakeBrowser.storage.local.set({
        volumeData: { date: '2026-02-27', count: 14 },
      });

      const shouldWarn = await shouldShowVolumeWarning();

      expect(shouldWarn).toBe(false);
    });

    it('should return true when count equals threshold (15)', async () => {
      // Use today's actual date to ensure data isn't reset
      const today = new Date().toLocaleDateString('en-CA');
      await fakeBrowser.storage.local.set({
        volumeData: { date: today, count: 15 },
      });

      const shouldWarn = await shouldShowVolumeWarning();

      expect(shouldWarn).toBe(true);
    });

    it('should return true when count exceeds threshold (> 15)', async () => {
      // Use today's actual date to ensure data isn't reset
      const today = new Date().toLocaleDateString('en-CA');
      await fakeBrowser.storage.local.set({
        volumeData: { date: today, count: 20 },
      });

      const shouldWarn = await shouldShowVolumeWarning();

      expect(shouldWarn).toBe(true);
    });

    it('should return false on new day (count resets to 0)', async () => {
      // Set high count for a past date (not today)
      const pastDate = '2026-01-01';
      await fakeBrowser.storage.local.set({
        volumeData: { date: pastDate, count: 20 },
      });

      // Check warning on new day
      const shouldWarn = await shouldShowVolumeWarning();

      expect(shouldWarn).toBe(false); // Count reset to 0
    });
  });

  describe('resetVolume', () => {
    it('should reset count to 0', async () => {
      await fakeBrowser.storage.local.set({
        volumeData: { date: '2026-02-27', count: 10 },
      });

      await resetVolume();

      const volumeData = await getVolumeData();
      expect(volumeData.count).toBe(0);
    });

    it('should update date to today', async () => {
      const pastDate = '2026-01-01';
      await fakeBrowser.storage.local.set({
        volumeData: { date: pastDate, count: 10 },
      });

      await resetVolume();

      const volumeData = await getVolumeData();
      expect(volumeData.date).not.toBe(pastDate);
      expect(volumeData.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Timezone handling', () => {
    it('should use user local timezone for date calculations', async () => {
      const volumeData = await getVolumeData();

      // Date should match local timezone YYYY-MM-DD format
      const expectedDate = new Date().toLocaleDateString('en-CA');
      expect(volumeData.date).toBe(expectedDate);
    });
  });

  describe('Edge cases', () => {
    it('should handle corrupted storage data gracefully', async () => {
      // Set invalid data
      await fakeBrowser.storage.local.set({
        volumeData: { invalid: 'data' },
      });

      const volumeData = await getVolumeData();

      // Should reset to valid structure
      expect(volumeData.count).toBe(0);
      expect(volumeData.date).toBeDefined();
    });

    it('should handle missing storage key gracefully', async () => {
      // Explicitly clear storage
      await fakeBrowser.storage.local.clear();

      const volumeData = await getVolumeData();

      expect(volumeData.count).toBe(0);
      expect(volumeData.date).toBeDefined();
    });
  });
});
