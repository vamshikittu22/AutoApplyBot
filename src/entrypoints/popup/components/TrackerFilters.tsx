/**
 * TrackerFilters component
 *
 * Provides multi-criteria filtering and sorting controls:
 * - Status filter (All, Applied, Interview, Offer, Rejected, Withdrawn)
 * - Platform filter (All, Workday, Greenhouse, Lever, Unknown)
 * - Date range filter (Last 7 days, Last 30 days, All time)
 * - Sorting (Date/Company/Status, Asc/Desc)
 * - Clear filters button
 */

import React from 'react';
import { useTrackerStore } from '@/lib/store/tracker-store';

export function TrackerFilters(): React.ReactElement {
  const { filterStatus, filterPlatform, sortBy, sortOrder, setFilter, setSorting, clearFilters } =
    useTrackerStore();

  // Check if any filters are active
  const hasActiveFilters = filterStatus !== null || filterPlatform !== null;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === '' ? null : e.target.value;
    setFilter('status', value);
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === '' ? null : e.target.value;
    setFilter('platform', value);
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSorting(e.target.value as 'date' | 'company' | 'status', sortOrder);
  };

  const toggleSortOrder = () => {
    setSorting(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="bg-white border-b border-gray-200 p-3 space-y-2">
      {/* First row: Status and Platform filters */}
      <div className="grid grid-cols-2 gap-2">
        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="text-xs text-gray-600 block mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={filterStatus || ''}
            onChange={handleStatusChange}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        {/* Platform filter */}
        <div>
          <label htmlFor="platform-filter" className="text-xs text-gray-600 block mb-1">
            Platform
          </label>
          <select
            id="platform-filter"
            value={filterPlatform || ''}
            onChange={handlePlatformChange}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="workday">Workday</option>
            <option value="greenhouse">Greenhouse</option>
            <option value="lever">Lever</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>

      {/* Second row: Sort controls and Clear button */}
      <div className="flex items-end gap-2">
        {/* Sort by */}
        <div className="flex-1">
          <label htmlFor="sort-by" className="text-xs text-gray-600 block mb-1">
            Sort by
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={handleSortByChange}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Date</option>
            <option value="company">Company</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Sort order toggle */}
        <button
          onClick={toggleSortOrder}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
          title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
        >
          {sortOrder === 'asc' ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
              <span className="text-xs">Asc</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 13l-5 5m0 0l-5-5m5 5V6"
                />
              </svg>
              <span className="text-xs">Desc</span>
            </>
          )}
        </button>

        {/* Clear filters button */}
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            hasActiveFilters
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
          title="Clear all filters"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
