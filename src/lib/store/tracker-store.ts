/**
 * Zustand store for tracker UI state management
 *
 * Handles:
 * - Application list state (synchronized with Chrome Storage)
 * - Filtering state (status, platform, date range)
 * - Sorting state (by date/company/status, asc/desc)
 * - CRUD operations (update status, delete)
 * - Real-time sync via chrome.storage.onChanged listener
 *
 * Pattern follows 04-RESEARCH.md Zustand Store pattern
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrackedApplication, ApplicationStatus, ATSPlatform } from '@/types/tracker';
import {
  getApplications,
  updateApplication as updateApplicationStorage,
  deleteApplication as deleteApplicationStorage,
} from '@/lib/tracker/storage';

interface TrackerStore {
  // Application data
  applications: TrackedApplication[];

  // Filter state
  filterStatus: ApplicationStatus | null;
  filterPlatform: ATSPlatform | null;
  filterDateFrom: string | null; // ISO date string
  filterDateTo: string | null; // ISO date string

  // Sort state
  sortBy: 'date' | 'company' | 'status';
  sortOrder: 'asc' | 'desc';

  // Loading state
  isLoading: boolean;

  // Actions
  loadApplications: () => Promise<void>;
  setFilter: (field: 'status' | 'platform' | 'dateFrom' | 'dateTo', value: string | null) => void;
  clearFilters: () => void;
  setSorting: (by: 'date' | 'company' | 'status', order: 'asc' | 'desc') => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  removeApplication: (id: string) => Promise<void>;

  // Computed state
  filteredApplications: () => TrackedApplication[];
}

export const useTrackerStore = create<TrackerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      applications: [],
      filterStatus: null,
      filterPlatform: null,
      filterDateFrom: null,
      filterDateTo: null,
      sortBy: 'date',
      sortOrder: 'desc',
      isLoading: false,

      // Load applications from Chrome Storage
      loadApplications: async () => {
        set({ isLoading: true });
        try {
          const apps = await getApplications();
          set({ applications: apps, isLoading: false });
        } catch (error) {
          console.error('Failed to load applications:', error);
          set({ isLoading: false });
        }
      },

      // Set filter value
      setFilter: (field, value) => {
        if (field === 'status') {
          set({ filterStatus: value as ApplicationStatus | null });
        } else if (field === 'platform') {
          set({ filterPlatform: value as ATSPlatform | null });
        } else if (field === 'dateFrom') {
          set({ filterDateFrom: value });
        } else if (field === 'dateTo') {
          set({ filterDateTo: value });
        }
      },

      // Clear all filters
      clearFilters: () => {
        set({
          filterStatus: null,
          filterPlatform: null,
          filterDateFrom: null,
          filterDateTo: null,
        });
      },

      // Set sorting
      setSorting: (by, order) => {
        set({ sortBy: by, sortOrder: order });
      },

      // Update application status
      updateApplicationStatus: async (id, status) => {
        try {
          await updateApplicationStorage(id, { status });
          // Reload applications to get updated data
          await get().loadApplications();
        } catch (error) {
          console.error('Failed to update application status:', error);
        }
      },

      // Remove application
      removeApplication: async (id) => {
        try {
          await deleteApplicationStorage(id);
          // Reload applications to reflect deletion
          await get().loadApplications();
        } catch (error) {
          console.error('Failed to remove application:', error);
        }
      },

      // Computed: filtered and sorted applications
      filteredApplications: () => {
        const state = get();
        let result = [...state.applications];

        // Apply status filter
        if (state.filterStatus) {
          result = result.filter((app) => app.status === state.filterStatus);
        }

        // Apply platform filter
        if (state.filterPlatform) {
          result = result.filter((app) => app.atsType === state.filterPlatform);
        }

        // Apply date range filters
        if (state.filterDateFrom) {
          const fromDate = new Date(state.filterDateFrom).getTime();
          result = result.filter((app) => new Date(app.appliedDate).getTime() >= fromDate);
        }

        if (state.filterDateTo) {
          const toDate = new Date(state.filterDateTo).getTime();
          result = result.filter((app) => new Date(app.appliedDate).getTime() <= toDate);
        }

        // Apply sorting
        result.sort((a, b) => {
          let compareValue = 0;

          if (state.sortBy === 'date') {
            compareValue = new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
          } else if (state.sortBy === 'company') {
            compareValue = a.company.localeCompare(b.company);
          } else if (state.sortBy === 'status') {
            compareValue = a.status.localeCompare(b.status);
          }

          return state.sortOrder === 'asc' ? compareValue : -compareValue;
        });

        return result;
      },
    }),
    {
      name: 'tracker-ui-prefs',
      // Only persist filter and sort preferences (not applications data)
      partialize: (state) => ({
        filterStatus: state.filterStatus,
        filterPlatform: state.filterPlatform,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);

// Set up Chrome Storage sync listener
// This enables real-time updates when content script logs new application
if (typeof chrome !== 'undefined' && chrome.storage) {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName === 'local' && changes.applications) {
      // Reload applications when Chrome Storage changes
      useTrackerStore.getState().loadApplications();
    }
  };

  chrome.storage.onChanged.addListener(listener);
}

// Load applications immediately when store is created
if (typeof chrome !== 'undefined' && chrome.storage) {
  useTrackerStore.getState().loadApplications();
}
