/**
 * TrackerFilters — redesigned with design system
 * Compact, clean filter row using #0369A1 palette
 */

import React from 'react';
import { useTrackerStore } from '@/lib/store/tracker-store';

export function TrackerFilters(): React.ReactElement {
  const { filterStatus, filterPlatform, sortBy, sortOrder, setFilter, setSorting, clearFilters } =
    useTrackerStore();

  const hasActiveFilters = filterStatus !== null || filterPlatform !== null;

  const selectClass =
    'w-full text-xs font-medium text-[#0C4A6E] bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-colors duration-150';

  return (
    <div className="bg-white border-b border-[#BAE6FD] px-3 py-2.5">
      <div className="flex items-center gap-2">

        {/* Status filter */}
        <select
          id="status-filter"
          value={filterStatus ?? ''}
          onChange={(e) => setFilter('status', e.target.value || null)}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="">All status</option>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>

        {/* Platform filter */}
        <select
          id="platform-filter"
          value={filterPlatform ?? ''}
          onChange={(e) => setFilter('platform', e.target.value || null)}
          className={selectClass}
          aria-label="Filter by platform"
        >
          <option value="">All platforms</option>
          <option value="workday">Workday</option>
          <option value="greenhouse">Greenhouse</option>
          <option value="lever">Lever</option>
          <option value="unknown">Unknown</option>
        </select>

        {/* Sort + order */}
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => setSorting(e.target.value as 'date' | 'company' | 'status', sortOrder)}
          className={selectClass}
          aria-label="Sort by"
        >
          <option value="date">Date</option>
          <option value="company">Company</option>
          <option value="status">Status</option>
        </select>

        {/* Sort direction */}
        <button
          onClick={() => setSorting(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex-shrink-0 p-1.5 text-[#475569] hover:text-[#0369A1] hover:bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg transition-colors duration-150 cursor-pointer"
          title={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
          aria-label="Toggle sort order"
        >
          {sortOrder === 'asc' ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21l3.75-3.75" />
            </svg>
          )}
        </button>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex-shrink-0 p-1.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150 cursor-pointer"
            title="Clear filters"
            aria-label="Clear all filters"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
