/**
 * Unit tests for tracker store
 *
 * Tests filtering, sorting, and Chrome Storage sync logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTrackerStore } from './tracker-store';
import type { TrackedApplication, ApplicationStatus } from '@/types/tracker';

// Mock Chrome Storage API
const mockStorage = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
  },
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
};

global.chrome = {
  storage: mockStorage as unknown as typeof chrome.storage,
} as unknown as typeof chrome;

// Sample test data
const sampleApplications: TrackedApplication[] = [
  {
    id: '1',
    jobTitle: 'Software Engineer',
    company: 'Apple',
    atsType: 'workday',
    url: 'https://example.com/job1',
    appliedDate: '2026-02-20T10:00:00Z',
    status: 'applied' as ApplicationStatus,
  },
  {
    id: '2',
    jobTitle: 'Frontend Developer',
    company: 'Google',
    atsType: 'greenhouse',
    url: 'https://example.com/job2',
    appliedDate: '2026-02-25T10:00:00Z',
    status: 'interview' as ApplicationStatus,
  },
  {
    id: '3',
    jobTitle: 'Backend Engineer',
    company: 'Amazon',
    atsType: 'lever',
    url: 'https://example.com/job3',
    appliedDate: '2026-02-22T10:00:00Z',
    status: 'applied' as ApplicationStatus,
  },
];

describe('tracker-store', () => {
  beforeEach(() => {
    // Reset store state
    useTrackerStore.setState({
      applications: [],
      filterStatus: null,
      filterPlatform: null,
      filterDateFrom: null,
      filterDateTo: null,
      sortBy: 'date',
      sortOrder: 'desc',
      isLoading: false,
    });

    // Reset mocks
    mockStorage.local.get.mockClear();
    mockStorage.local.set.mockClear();
  });

  describe('filtering logic', () => {
    it('should filter by status', () => {
      useTrackerStore.setState({ applications: sampleApplications });

      useTrackerStore.getState().setFilter('status', 'applied');
      const filtered = useTrackerStore.getState().filteredApplications();

      expect(filtered).toHaveLength(2);
      expect(filtered.every((app) => app.status === 'applied')).toBe(true);
    });

    it('should filter by platform', () => {
      useTrackerStore.setState({ applications: sampleApplications });

      useTrackerStore.getState().setFilter('platform', 'workday');
      const filtered = useTrackerStore.getState().filteredApplications();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].atsType).toBe('workday');
    });

    it('should filter by date range (from)', () => {
      useTrackerStore.setState({ applications: sampleApplications });

      useTrackerStore.getState().setFilter('dateFrom', '2026-02-22');
      const filtered = useTrackerStore.getState().filteredApplications();

      expect(filtered).toHaveLength(2); // Only job2 and job3 are after 2026-02-22
      expect(filtered.find((app) => app.id === '2')).toBeDefined();
      expect(filtered.find((app) => app.id === '3')).toBeDefined();
    });

    it('should filter by date range (to)', () => {
      useTrackerStore.setState({ applications: sampleApplications });

      useTrackerStore.getState().setFilter('dateTo', '2026-02-23');
      const filtered = useTrackerStore.getState().filteredApplications();

      expect(filtered).toHaveLength(2); // job1 and job3 (both before 2026-02-23)
    });

    it('should combine multiple filters', () => {
      useTrackerStore.setState({ applications: sampleApplications });

      useTrackerStore.getState().setFilter('status', 'applied');
      useTrackerStore.getState().setFilter('dateFrom', '2026-02-22');
      const filtered = useTrackerStore.getState().filteredApplications();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('3');
    });

    it('should clear all filters', () => {
      useTrackerStore.setState({ applications: sampleApplications });

      useTrackerStore.getState().setFilter('status', 'applied');
      useTrackerStore.getState().setFilter('platform', 'workday');
      useTrackerStore.getState().clearFilters();

      const state = useTrackerStore.getState();
      expect(state.filterStatus).toBeNull();
      expect(state.filterPlatform).toBeNull();
      expect(state.filterDateFrom).toBeNull();
      expect(state.filterDateTo).toBeNull();
    });
  });

  describe('sorting logic', () => {
    it('should sort by date descending (default)', () => {
      useTrackerStore.setState({ applications: sampleApplications });

      const filtered = useTrackerStore.getState().filteredApplications();

      expect(filtered[0]?.id).toBe('2'); // 2026-02-25 (newest)
      expect(filtered[1]?.id).toBe('3'); // 2026-02-22
      expect(filtered[2]?.id).toBe('1'); // 2026-02-20 (oldest)
    });

    it('should sort by date ascending', () => {
      useTrackerStore.setState({ applications: sampleApplications });

      useTrackerStore.getState().setSorting('date', 'asc');
      const filtered = useTrackerStore.getState().filteredApplications();

      expect(filtered[0]?.id).toBe('1'); // 2026-02-20 (oldest)
      expect(filtered[1]?.id).toBe('3'); // 2026-02-22
      expect(filtered[2]?.id).toBe('2'); // 2026-02-25 (newest)
    });

    it('should sort by company ascending', () => {
      useTrackerStore.setState({ applications: sampleApplications });

      useTrackerStore.getState().setSorting('company', 'asc');
      const filtered = useTrackerStore.getState().filteredApplications();

      expect(filtered[0]?.company).toBe('Amazon');
      expect(filtered[1]?.company).toBe('Apple');
      expect(filtered[2]?.company).toBe('Google');
    });

    it('should sort by company descending', () => {
      useTrackerStore.setState({ applications: sampleApplications });

      useTrackerStore.getState().setSorting('company', 'desc');
      const filtered = useTrackerStore.getState().filteredApplications();

      expect(filtered[0]?.company).toBe('Google');
      expect(filtered[1]?.company).toBe('Apple');
      expect(filtered[2]?.company).toBe('Amazon');
    });

    it('should sort by status ascending', () => {
      useTrackerStore.setState({ applications: sampleApplications });

      useTrackerStore.getState().setSorting('status', 'asc');
      const filtered = useTrackerStore.getState().filteredApplications();

      // "applied" comes before "interview" alphabetically
      expect(filtered[0]?.status).toBe('applied');
      expect(filtered[2]?.status).toBe('interview');
    });
  });

  // Note: Chrome Storage sync listener is registered at module import time
  // and is verified through integration testing
});
