/**
 * TrackerList component
 *
 * Main tracker list view with:
 * - TrackerFilters integration
 * - ApplicationCard list (filtered and sorted)
 * - Empty states (no data, no results)
 * - Loading state
 * - Application count display
 */

import React, { useEffect } from 'react';
import { useTrackerStore } from '@/lib/store/tracker-store';
import { TrackerFilters } from './TrackerFilters';
import { ApplicationCard } from './ApplicationCard';

export function TrackerList(): React.ReactElement {
  const {
    filteredApplications,
    updateApplicationStatus,
    removeApplication,
    loadApplications,
    isLoading,
    filterStatus,
    filterPlatform,
  } = useTrackerStore();

  // Load applications on mount
  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const applications = filteredApplications();
  const hasActiveFilters = filterStatus !== null || filterPlatform !== null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <TrackerFilters />

      {/* Application count */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <p className="text-xs text-gray-600">
          {applications.length} {applications.length === 1 ? 'application' : 'applications'}
        </p>
      </div>

      {/* Application list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {applications.length === 0 && !hasActiveFilters && (
          <div className="text-center py-8">
            <svg
              className="h-12 w-12 text-gray-400 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 text-sm mb-1">No applications tracked yet</p>
            <p className="text-gray-500 text-xs">Apply to a job to see it here automatically!</p>
          </div>
        )}

        {applications.length === 0 && hasActiveFilters && (
          <div className="text-center py-8">
            <svg
              className="h-12 w-12 text-gray-400 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-600 text-sm mb-1">No applications match your filters</p>
            <p className="text-gray-500 text-xs">Try adjusting your filter criteria</p>
          </div>
        )}

        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            onStatusChange={updateApplicationStatus}
            onDelete={removeApplication}
          />
        ))}
      </div>
    </div>
  );
}
