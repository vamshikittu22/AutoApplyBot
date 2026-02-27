/**
 * Unit tests for Chrome Storage tracker operations
 * Tests CRUD operations with mocked chrome.storage.local API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveApplication,
  getApplications,
  updateApplication,
  deleteApplication,
  getApplicationsToday,
} from './storage';
import type { TrackedApplication } from '@/types/tracker';
import { ApplicationStatus } from '@/types/tracker';

// Mock chrome.storage.local API
const mockStorage: Record<string, any> = {};

global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys) => {
        const result: Record<string, any> = {};
        if (typeof keys === 'string') {
          result[keys] = mockStorage[keys];
        } else if (Array.isArray(keys)) {
          keys.forEach((key) => {
            result[key] = mockStorage[key];
          });
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
    },
  },
} as any;

describe('saveApplication', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('should save a new application to storage', async () => {
    const app: TrackedApplication = {
      id: crypto.randomUUID(),
      jobTitle: 'Software Engineer',
      company: 'Test Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/123',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    await saveApplication(app);

    expect(mockStorage.applications).toHaveLength(1);
    expect(mockStorage.applications[0]).toEqual(app);
  });

  it('should append to existing applications', async () => {
    const app1: TrackedApplication = {
      id: crypto.randomUUID(),
      jobTitle: 'Engineer 1',
      company: 'Corp A',
      atsType: 'greenhouse',
      url: 'https://example.com/jobs/1',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    const app2: TrackedApplication = {
      id: crypto.randomUUID(),
      jobTitle: 'Engineer 2',
      company: 'Corp B',
      atsType: 'lever',
      url: 'https://example.com/jobs/2',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    await saveApplication(app1);
    await saveApplication(app2);

    expect(mockStorage.applications).toHaveLength(2);
    expect(mockStorage.applications[0]).toEqual(app1);
    expect(mockStorage.applications[1]).toEqual(app2);
  });

  it('should throw error for duplicate URL', async () => {
    const app1: TrackedApplication = {
      id: crypto.randomUUID(),
      jobTitle: 'Engineer',
      company: 'Test Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/123',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    const app2: TrackedApplication = {
      id: crypto.randomUUID(),
      jobTitle: 'Engineer',
      company: 'Test Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/123?source=linkedin', // Same URL with query param
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    await saveApplication(app1);
    await expect(saveApplication(app2)).rejects.toThrow('already exists');
  });
});

describe('getApplications', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('should return empty array when no applications exist', async () => {
    const apps = await getApplications();
    expect(apps).toEqual([]);
  });

  it('should return all applications', async () => {
    const app1: TrackedApplication = {
      id: crypto.randomUUID(),
      jobTitle: 'Engineer 1',
      company: 'Corp A',
      atsType: 'workday',
      url: 'https://example.com/jobs/1',
      appliedDate: '2026-02-25T10:00:00Z',
      status: ApplicationStatus.Applied,
    };

    const app2: TrackedApplication = {
      id: crypto.randomUUID(),
      jobTitle: 'Engineer 2',
      company: 'Corp B',
      atsType: 'greenhouse',
      url: 'https://example.com/jobs/2',
      appliedDate: '2026-02-26T12:00:00Z',
      status: ApplicationStatus.Applied,
    };

    mockStorage.applications = [app1, app2];

    const apps = await getApplications();
    expect(apps).toHaveLength(2);
  });

  it('should sort applications by appliedDate DESC (newest first)', async () => {
    const app1: TrackedApplication = {
      id: '1',
      jobTitle: 'Oldest',
      company: 'Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/1',
      appliedDate: '2026-02-24T10:00:00Z',
      status: ApplicationStatus.Applied,
    };

    const app2: TrackedApplication = {
      id: '2',
      jobTitle: 'Newest',
      company: 'Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/2',
      appliedDate: '2026-02-26T15:00:00Z',
      status: ApplicationStatus.Applied,
    };

    const app3: TrackedApplication = {
      id: '3',
      jobTitle: 'Middle',
      company: 'Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/3',
      appliedDate: '2026-02-25T12:00:00Z',
      status: ApplicationStatus.Applied,
    };

    mockStorage.applications = [app1, app2, app3];

    const apps = await getApplications();
    expect(apps[0]?.id).toBe('2'); // Newest first
    expect(apps[1]?.id).toBe('3'); // Middle
    expect(apps[2]?.id).toBe('1'); // Oldest last
  });
});

describe('updateApplication', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('should update application status', async () => {
    const app: TrackedApplication = {
      id: 'test-id',
      jobTitle: 'Engineer',
      company: 'Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/1',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    mockStorage.applications = [app];

    await updateApplication('test-id', { status: ApplicationStatus.Interview });

    expect(mockStorage.applications[0].status).toBe(ApplicationStatus.Interview);
  });

  it('should update multiple fields', async () => {
    const app: TrackedApplication = {
      id: 'test-id',
      jobTitle: 'Engineer',
      company: 'Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/1',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    mockStorage.applications = [app];

    await updateApplication('test-id', {
      status: ApplicationStatus.Offer,
      notes: 'Great opportunity!',
    });

    expect(mockStorage.applications[0].status).toBe(ApplicationStatus.Offer);
    expect(mockStorage.applications[0].notes).toBe('Great opportunity!');
  });

  it('should throw error if application not found', async () => {
    mockStorage.applications = [];

    await expect(
      updateApplication('non-existent-id', { status: ApplicationStatus.Rejected })
    ).rejects.toThrow('not found');
  });

  it('should not affect other applications', async () => {
    const app1: TrackedApplication = {
      id: 'id-1',
      jobTitle: 'Engineer 1',
      company: 'Corp A',
      atsType: 'workday',
      url: 'https://example.com/jobs/1',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    const app2: TrackedApplication = {
      id: 'id-2',
      jobTitle: 'Engineer 2',
      company: 'Corp B',
      atsType: 'greenhouse',
      url: 'https://example.com/jobs/2',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    mockStorage.applications = [app1, app2];

    await updateApplication('id-1', { status: ApplicationStatus.Rejected });

    expect(mockStorage.applications[0].status).toBe(ApplicationStatus.Rejected);
    expect(mockStorage.applications[1].status).toBe(ApplicationStatus.Applied);
  });
});

describe('deleteApplication', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('should delete application by id', async () => {
    const app: TrackedApplication = {
      id: 'test-id',
      jobTitle: 'Engineer',
      company: 'Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/1',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    mockStorage.applications = [app];

    await deleteApplication('test-id');

    expect(mockStorage.applications).toHaveLength(0);
  });

  it('should not affect other applications', async () => {
    const app1: TrackedApplication = {
      id: 'id-1',
      jobTitle: 'Engineer 1',
      company: 'Corp A',
      atsType: 'workday',
      url: 'https://example.com/jobs/1',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    const app2: TrackedApplication = {
      id: 'id-2',
      jobTitle: 'Engineer 2',
      company: 'Corp B',
      atsType: 'greenhouse',
      url: 'https://example.com/jobs/2',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    mockStorage.applications = [app1, app2];

    await deleteApplication('id-1');

    expect(mockStorage.applications).toHaveLength(1);
    expect(mockStorage.applications[0].id).toBe('id-2');
  });

  it('should handle deleting non-existent id gracefully', async () => {
    const app: TrackedApplication = {
      id: 'existing-id',
      jobTitle: 'Engineer',
      company: 'Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/1',
      appliedDate: new Date().toISOString(),
      status: ApplicationStatus.Applied,
    };

    mockStorage.applications = [app];

    await deleteApplication('non-existent-id');

    expect(mockStorage.applications).toHaveLength(1);
  });
});

describe('getApplicationsToday', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-26T12:00:00Z'));
  });

  it('should return only applications from today', async () => {
    const today = new Date('2026-02-26T12:00:00Z').toISOString();
    const yesterday = new Date('2026-02-25T12:00:00Z').toISOString();

    const app1: TrackedApplication = {
      id: '1',
      jobTitle: 'Today App',
      company: 'Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/1',
      appliedDate: today,
      status: ApplicationStatus.Applied,
    };

    const app2: TrackedApplication = {
      id: '2',
      jobTitle: 'Yesterday App',
      company: 'Corp',
      atsType: 'greenhouse',
      url: 'https://example.com/jobs/2',
      appliedDate: yesterday,
      status: ApplicationStatus.Applied,
    };

    mockStorage.applications = [app1, app2];

    const todayApps = await getApplicationsToday();
    expect(todayApps).toHaveLength(1);
    expect(todayApps[0]?.id).toBe('1');
  });

  it('should return empty array if no applications today', async () => {
    const yesterday = new Date('2026-02-25T12:00:00Z').toISOString();

    const app: TrackedApplication = {
      id: '1',
      jobTitle: 'Yesterday App',
      company: 'Corp',
      atsType: 'workday',
      url: 'https://example.com/jobs/1',
      appliedDate: yesterday,
      status: ApplicationStatus.Applied,
    };

    mockStorage.applications = [app];

    const todayApps = await getApplicationsToday();
    expect(todayApps).toHaveLength(0);
  });
});
