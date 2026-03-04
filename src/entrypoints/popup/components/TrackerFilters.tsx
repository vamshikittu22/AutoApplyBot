/**
 * TrackerFilters
 * Filter row using design system classes
 */

import React from 'react';
import { useTrackerStore } from '@/lib/store/tracker-store';

export function TrackerFilters(): React.ReactElement {
  const { filterStatus, filterPlatform, sortBy, sortOrder, setFilter, setSorting, clearFilters } =
    useTrackerStore();

  const hasActiveFilters = filterStatus !== null || filterPlatform !== null;

  return (
    <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0.625rem 0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        
        {/* Status filter */}
        <select
          value={filterStatus ?? ''}
          onChange={(e) => setFilter('status', e.target.value || null)}
          className="filter-select"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>

        {/* Platform filter */}
        <select
          value={filterPlatform ?? ''}
          onChange={(e) => setFilter('platform', e.target.value || null)}
          className="filter-select"
          aria-label="Filter by platform"
        >
          <option value="">All platforms</option>
          <option value="workday">Workday</option>
          <option value="greenhouse">Greenhouse</option>
          <option value="lever">Lever</option>
          <option value="unknown">Unknown</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSorting(e.target.value as 'date' | 'company' | 'status', sortOrder)}
          className="filter-select"
          aria-label="Sort by"
        >
          <option value="date">Date</option>
          <option value="company">Company</option>
          <option value="status">Status</option>
        </select>

        {/* Sort direction */}
        <button
          onClick={() => setSorting(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
          style={{ 
            flexShrink: 0, padding: '0.25rem', background: 'var(--bg)', 
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)', cursor: 'pointer'
          }}
          className="hover:border-primary-light hover:text-primary transition-colors"
          title={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
        >
          {sortOrder === 'asc' ? (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21l3.75-3.75" />
            </svg>
          )}
        </button>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{ 
              flexShrink: 0, padding: '0.25rem', background: 'transparent', 
              border: 'none', borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)', cursor: 'pointer'
            }}
            className="hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Clear filters"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
