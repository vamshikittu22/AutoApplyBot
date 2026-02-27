import { describe, it, expect, beforeEach } from 'vitest';
import { isJobDisabled, disableJob, enableJob, getDisabledJobs } from './site-disable';

// Mock Chrome Storage API
const mockStorage: Record<string, unknown> = {};

beforeEach(() => {
  // Clear mock storage before each test
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);

  // Mock chrome.storage.local
  global.chrome = {
    storage: {
      local: {
        get: (keys: string | string[] | Record<string, unknown>) => {
          const keysArray =
            typeof keys === 'string' ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
          const result: Record<string, unknown> = {};
          keysArray.forEach((key) => {
            result[key] = mockStorage[key];
          });
          return Promise.resolve(result);
        },
        set: (items: Record<string, unknown>) => {
          Object.assign(mockStorage, items);
          return Promise.resolve();
        },
      },
    },
  } as never;
});

describe('site-disable', () => {
  describe('isJobDisabled', () => {
    it('should return false when no jobs are disabled', async () => {
      const result = await isJobDisabled('https://workday.com/job/123');
      expect(result).toBe(false);
    });

    it('should return true when job URL is in disabled list', async () => {
      await disableJob('https://workday.com/job/123');
      const result = await isJobDisabled('https://workday.com/job/123');
      expect(result).toBe(true);
    });

    it('should return false when job URL is not in disabled list', async () => {
      await disableJob('https://workday.com/job/123');
      const result = await isJobDisabled('https://workday.com/job/456');
      expect(result).toBe(false);
    });

    it('should normalize URLs before checking (ignore query params)', async () => {
      await disableJob('https://workday.com/job/123?source=linkedin');
      const result = await isJobDisabled('https://workday.com/job/123?ref=email');
      expect(result).toBe(true);
    });

    it('should normalize URLs before checking (case insensitive)', async () => {
      await disableJob('https://Workday.com/Job/123');
      const result = await isJobDisabled('https://workday.com/job/123');
      expect(result).toBe(true);
    });

    it('should normalize URLs before checking (ignore trailing slash)', async () => {
      await disableJob('https://workday.com/job/123/');
      const result = await isJobDisabled('https://workday.com/job/123');
      expect(result).toBe(true);
    });
  });

  describe('disableJob', () => {
    it('should add job URL to disabled list', async () => {
      await disableJob('https://workday.com/job/123');
      const disabledJobs = await getDisabledJobs();

      expect(disabledJobs).toContain('https://workday.com/job/123');
      expect(disabledJobs).toHaveLength(1);
    });

    it('should normalize URL before adding', async () => {
      await disableJob('https://Workday.com/Job/123?source=linkedin#apply');
      const disabledJobs = await getDisabledJobs();

      expect(disabledJobs).toContain('https://workday.com/job/123');
      expect(disabledJobs).toHaveLength(1);
    });

    it('should not add duplicate URLs', async () => {
      await disableJob('https://workday.com/job/123');
      await disableJob('https://workday.com/job/123');
      const disabledJobs = await getDisabledJobs();

      expect(disabledJobs).toHaveLength(1);
    });

    it('should not add duplicate URLs with different query params', async () => {
      await disableJob('https://workday.com/job/123?source=linkedin');
      await disableJob('https://workday.com/job/123?ref=email');
      const disabledJobs = await getDisabledJobs();

      expect(disabledJobs).toHaveLength(1);
    });

    it('should add multiple different URLs', async () => {
      await disableJob('https://workday.com/job/123');
      await disableJob('https://greenhouse.io/job/456');
      const disabledJobs = await getDisabledJobs();

      expect(disabledJobs).toHaveLength(2);
      expect(disabledJobs).toContain('https://workday.com/job/123');
      expect(disabledJobs).toContain('https://greenhouse.io/job/456');
    });
  });

  describe('enableJob', () => {
    it('should remove job URL from disabled list', async () => {
      await disableJob('https://workday.com/job/123');
      await enableJob('https://workday.com/job/123');
      const disabledJobs = await getDisabledJobs();

      expect(disabledJobs).toHaveLength(0);
      expect(disabledJobs).not.toContain('https://workday.com/job/123');
    });

    it('should normalize URL before removing', async () => {
      await disableJob('https://workday.com/job/123?source=linkedin');
      await enableJob('https://Workday.com/Job/123#apply');
      const disabledJobs = await getDisabledJobs();

      expect(disabledJobs).toHaveLength(0);
    });

    it('should only remove matching URL', async () => {
      await disableJob('https://workday.com/job/123');
      await disableJob('https://workday.com/job/456');
      await enableJob('https://workday.com/job/123');
      const disabledJobs = await getDisabledJobs();

      expect(disabledJobs).toHaveLength(1);
      expect(disabledJobs).toContain('https://workday.com/job/456');
      expect(disabledJobs).not.toContain('https://workday.com/job/123');
    });

    it('should handle enabling non-existent URL gracefully', async () => {
      await disableJob('https://workday.com/job/123');
      await enableJob('https://workday.com/job/999');
      const disabledJobs = await getDisabledJobs();

      expect(disabledJobs).toHaveLength(1);
      expect(disabledJobs).toContain('https://workday.com/job/123');
    });
  });

  describe('getDisabledJobs', () => {
    it('should return empty array when no jobs disabled', async () => {
      const disabledJobs = await getDisabledJobs();
      expect(disabledJobs).toEqual([]);
    });

    it('should return all disabled job URLs', async () => {
      await disableJob('https://workday.com/job/123');
      await disableJob('https://greenhouse.io/job/456');
      await disableJob('https://lever.co/job/789');
      const disabledJobs = await getDisabledJobs();

      expect(disabledJobs).toHaveLength(3);
      expect(disabledJobs).toContain('https://workday.com/job/123');
      expect(disabledJobs).toContain('https://greenhouse.io/job/456');
      expect(disabledJobs).toContain('https://lever.co/job/789');
    });

    it('should return normalized URLs', async () => {
      await disableJob('https://Workday.com/Job/123?source=linkedin#apply');
      const disabledJobs = await getDisabledJobs();

      expect(disabledJobs).toContain('https://workday.com/job/123');
    });
  });

  describe('persistence', () => {
    it('should persist disabled jobs across get calls', async () => {
      await disableJob('https://workday.com/job/123');

      // Simulate extension restart by checking storage directly
      const { disabledJobs } = await chrome.storage.local.get('disabledJobs');
      expect(disabledJobs).toContain('https://workday.com/job/123');

      // Verify isJobDisabled reads from storage
      const isDisabled = await isJobDisabled('https://workday.com/job/123');
      expect(isDisabled).toBe(true);
    });

    it('should persist re-enable across storage calls', async () => {
      await disableJob('https://workday.com/job/123');
      await enableJob('https://workday.com/job/123');

      // Check storage directly
      const { disabledJobs } = await chrome.storage.local.get('disabledJobs');
      expect(disabledJobs).toHaveLength(0);

      // Verify isJobDisabled reads from storage
      const isDisabled = await isJobDisabled('https://workday.com/job/123');
      expect(isDisabled).toBe(false);
    });
  });
});
