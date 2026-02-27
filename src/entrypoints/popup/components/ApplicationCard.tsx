/**
 * ApplicationCard component
 *
 * Displays individual application with:
 * - Compact layout optimized for 400px popup width
 * - Inline status editing (dropdown)
 * - Delete button with confirmation
 * - Status-specific colors (Applied/Interview/Offer/Rejected/Withdrawn)
 * - ATS platform badge
 * - Relative date display
 */

import React from 'react';
import type { TrackedApplication, ApplicationStatus } from '@/types/tracker';

interface ApplicationCardProps {
  application: TrackedApplication;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
}

// Status color mapping
const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; badge: string }> = {
  applied: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
  interview: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' },
  offer: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
  withdrawn: { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100' },
};

// ATS platform badge colors
const PLATFORM_COLORS: Record<string, string> = {
  workday: 'bg-purple-100 text-purple-700',
  greenhouse: 'bg-green-100 text-green-700',
  lever: 'bg-blue-100 text-blue-700',
  unknown: 'bg-gray-100 text-gray-600',
};

/**
 * Format date as relative ("2 days ago") or absolute ("Mar 1, 2026")
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
}: ApplicationCardProps): React.ReactElement {
  const statusColors = STATUS_COLORS[application.status];
  const platformColor = PLATFORM_COLORS[application.atsType] || PLATFORM_COLORS.unknown;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(application.id, e.target.value as ApplicationStatus);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this application?')) {
      onDelete(application.id);
    }
  };

  return (
    <div
      className={`${statusColors.bg} border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow`}
    >
      {/* Job title */}
      <h3 className="font-semibold text-gray-900 truncate mb-1">{application.jobTitle}</h3>

      {/* Company + ATS platform badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-700">{application.company}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${platformColor}`}>
          {application.atsType}
        </span>
      </div>

      {/* Applied date */}
      <p className="text-xs text-gray-600 mb-3">{formatDate(application.appliedDate)}</p>

      {/* Status dropdown + Delete button */}
      <div className="flex items-center gap-2">
        <select
          value={application.status}
          onChange={handleStatusChange}
          className={`flex-1 text-sm ${statusColors.text} ${statusColors.badge} border-none rounded px-2 py-1 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>

        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
          aria-label="Delete application"
          title="Delete application"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
