/**
 * ApplicationCard component — redesigned with Plus Jakarta Sans design system
 * Primary: #0369A1 | Minimalism & Swiss Style
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
  // Inline badge colors — guaranteed to work in extension context
  const statusStyle: Record<ApplicationStatus, React.CSSProperties> = {
    applied:   { background: '#DBEAFE', color: '#1E40AF' },
    interview: { background: '#FEF9C3', color: '#854D0E' },
    offer:     { background: '#DCFCE7', color: '#166534' },
    rejected:  { background: '#FEE2E2', color: '#991B1B' },
    withdrawn: { background: '#F1F5F9', color: '#475569' },
  };

  const platformStyle: Record<string, React.CSSProperties> = {
    workday:    { background: '#EDE9FE', color: '#5B21B6' },
    greenhouse: { background: '#DCFCE7', color: '#166534' },
    lever:      { background: '#DBEAFE', color: '#1E40AF' },
    unknown:    { background: '#F1F5F9', color: '#64748B' },
  };

  const sBadge = statusStyle[application.status];
  const pBadge = platformStyle[application.atsType] ?? platformStyle.unknown;

  return (
    <div className="bg-white border border-brand-border rounded-xl p-3 hover:shadow-sm transition-all duration-150 animate-slide-up"
         style={{ borderColor: '#BAE6FD' }}>

      {/* Title + delete */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-brand-text text-sm leading-snug truncate flex-1">
          {application.jobTitle}
        </h3>
        <button
          onClick={() => window.confirm('Remove this application?') && onDelete(application.id)}
          className="text-brand-subtle hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors duration-150 cursor-pointer flex-shrink-0"
          aria-label="Remove application"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Company + platform */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-brand-muted text-xs font-medium truncate">{application.company}</span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize flex-shrink-0" style={pBadge}>
          {application.atsType}
        </span>
      </div>

      {/* Date + status */}
      <div className="flex items-center gap-2">
        <span className="text-brand-subtle text-[11px]">{formatDate(application.appliedDate)}</span>
        <select
          value={application.status}
          onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
          className="ml-auto text-[11px] font-semibold px-2 py-1 rounded-lg border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light"
          style={sBadge}
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
