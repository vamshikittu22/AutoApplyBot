/**
 * Unit tests for tracker utility functions
 * Tests timezone-aware date calculations and URL normalization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTodayDateString, isToday, normalizeUrl, isDuplicate } from './utils';
import type { TrackedApplication } from '@/types/tracker';
import { ApplicationStatus } from '@/types/tracker';

describe('getTodayDateString', () => {
  it('should return date in YYYY-MM-DD format', () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return date in user local timezone', () => {
    const result = getTodayDateString();
    const expected = new Date().toLocaleDateString('en-CA');
    expect(result).toBe(expected);
  });
});

describe('isToday', () => {
  beforeEach(() => {
    // Mock date to 2026-02-26 12:00:00 UTC
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-26T12:00:00Z'));
  });

  it('should return true for today ISO timestamp', () => {
    const todayIso = new Date().toISOString();
    expect(isToday(todayIso)).toBe(true);
  });

  it('should return false for yesterday ISO timestamp', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday.toISOString())).toBe(false);
  });

  it('should return false for tomorrow ISO timestamp', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isToday(tomorrow.toISOString())).toBe(false);
  });
});

describe('normalizeUrl', () => {
  it('should remove query parameters', () => {
    const url = 'https://example.com/jobs/123?source=linkedin&utm_campaign=test';
    expect(normalizeUrl(url)).toBe('https://example.com/jobs/123');
  });

  it('should remove hash fragments', () => {
    const url = 'https://example.com/jobs/123#apply';
    expect(normalizeUrl(url)).toBe('https://example.com/jobs/123');
  });

  it('should remove both query params and hash', () => {
    const url = 'https://example.com/jobs/123?ref=twitter#section';
    expect(normalizeUrl(url)).toBe('https://example.com/jobs/123');
  });

  it('should convert to lowercase', () => {
    const url = 'https://Example.COM/Jobs/123';
    expect(normalizeUrl(url)).toBe('https://example.com/jobs/123');
  });

  it('should remove trailing slash', () => {
    const url = 'https://example.com/jobs/123/';
    expect(normalizeUrl(url)).toBe('https://example.com/jobs/123');
  });

  it('should handle URL without path', () => {
    const url = 'https://example.com';
    expect(normalizeUrl(url)).toBe('https://example.com');
  });

  it('should handle URL with subdomain', () => {
    const url = 'https://careers.example.com/jobs/123';
    expect(normalizeUrl(url)).toBe('https://careers.example.com/jobs/123');
  });

  it('should handle invalid URLs gracefully', () => {
    const url = 'not-a-valid-url';
    expect(normalizeUrl(url)).toBe('not-a-valid-url');
  });
});

describe('isDuplicate', () => {
  const createMockApp = (url: string, daysAgo = 0): TrackedApplication => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return {
      id: crypto.randomUUID(),
      jobTitle: 'Software Engineer',
      company: 'Test Corp',
      atsType: 'workday',
      url,
      appliedDate: date.toISOString(),
      status: ApplicationStatus.Applied,
    };
  };

  it('should return true for exact URL match within threshold', () => {
    const newApp = createMockApp('https://example.com/jobs/123');
    const existingApps = [createMockApp('https://example.com/jobs/123', 3)];

    expect(isDuplicate(newApp, existingApps)).toBe(true);
  });

  it('should return true for normalized URL match (different query params)', () => {
    const newApp = createMockApp('https://example.com/jobs/123?source=linkedin');
    const existingApps = [createMockApp('https://example.com/jobs/123?ref=twitter', 3)];

    expect(isDuplicate(newApp, existingApps)).toBe(true);
  });

  it('should return false for different URLs', () => {
    const newApp = createMockApp('https://example.com/jobs/123');
    const existingApps = [createMockApp('https://example.com/jobs/456', 3)];

    expect(isDuplicate(newApp, existingApps)).toBe(false);
  });

  it('should return false for same URL applied beyond day threshold', () => {
    const newApp = createMockApp('https://example.com/jobs/123');
    const existingApps = [createMockApp('https://example.com/jobs/123', 10)]; // 10 days ago

    expect(isDuplicate(newApp, existingApps, 7)).toBe(false);
  });

  it('should return true for same URL applied within custom threshold', () => {
    const newApp = createMockApp('https://example.com/jobs/123');
    const existingApps = [createMockApp('https://example.com/jobs/123', 25)]; // 25 days ago

    expect(isDuplicate(newApp, existingApps, 30)).toBe(true);
  });

  it('should return false for empty existing applications', () => {
    const newApp = createMockApp('https://example.com/jobs/123');
    const existingApps: TrackedApplication[] = [];

    expect(isDuplicate(newApp, existingApps)).toBe(false);
  });

  it('should handle case-insensitive URL comparison', () => {
    const newApp = createMockApp('https://Example.COM/Jobs/123');
    const existingApps = [createMockApp('https://example.com/jobs/123', 2)];

    expect(isDuplicate(newApp, existingApps)).toBe(true);
  });
});
