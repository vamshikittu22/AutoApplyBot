/**
 * ApplicationCard component
 * Redesigned with Taylor-inspired design language (Swiss Style)
 */

import React from 'react';
import type { TrackedApplication, ApplicationStatus } from '@/types/tracker';

interface ApplicationCardProps {
  application: TrackedApplication;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
}: ApplicationCardProps): React.ReactElement {
  
  const statusClass = `status-${application.status}`;
  const platformClass = `platform-${application.atsType.toLowerCase()}`;
  
  // Fallback if platform class doesn't exist
  const finalPlatformClass = ['workday', 'greenhouse', 'lever'].includes(application.atsType.toLowerCase())
    ? platformClass
    : 'platform-unknown';

  return (
    <div className="app-card animate-slide-up">
      {/* Title + delete */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
        <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
          {application.jobTitle}
        </h3>
        <button
          onClick={() => window.confirm('Remove this application?') && onDelete(application.id)}
          style={{ 
            background: 'none', border: 'none', padding: '4px', cursor: 'pointer', 
            borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', flexShrink: 0
          }}
          className="hover:bg-red-50 hover:text-red-500 transition-colors"
          aria-label="Remove application"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Company + platform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-dark)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {application.company}
        </span>
        <span className={`badge ${finalPlatformClass}`} style={{ textTransform: 'capitalize' }}>
          {application.atsType}
        </span>
      </div>

      {/* Date + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          {formatDate(application.appliedDate)}
        </span>
        
        <select
          value={application.status}
          onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
          className={statusClass}
          style={{ 
            fontSize: '0.6875rem', fontWeight: 600, padding: '4px 8px', 
            borderRadius: '99px', border: 'none', cursor: 'pointer', outline: 'none'
          }}
          aria-label="Application status"
        >
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>
    </div>
  );
}
