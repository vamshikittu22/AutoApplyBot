/**
 * TrackerList component
 * Main tracker list view updated with design system
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

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const applications = filteredApplications();
  const hasActiveFilters = filterStatus !== null || filterPlatform !== null;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto', width: '2rem', height: '2rem', borderWidth: '2px' }} />
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TrackerFilters />

      <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <p style={{ margin: 0, fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {applications.length} {applications.length === 1 ? 'APPLICATION' : 'APPLICATIONS'}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {applications.length === 0 && !hasActiveFilters && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }} className="animate-fade-in">
            <div style={{ width: '48px', height: '48px', background: 'var(--primary-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem text-primary' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>No applications yet</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Apply to a job to see it here automatically!</p>
          </div>
        )}

        {applications.length === 0 && hasActiveFilters && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }} className="animate-fade-in">
            <div style={{ width: '48px', height: '48px', background: 'var(--border-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem text-primary' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>No matches found</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Try adjusting your filter criteria</p>
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
