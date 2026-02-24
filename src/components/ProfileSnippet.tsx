import React, { useState } from 'react';
import { copyWithFeedback, formatForCopy } from '@/lib/ui/clipboard-utils';

export interface ProfileSnippetProps {
  /** Section title */
  title: string;
  /** Section data */
  data: any;
  /** Icon (optional) */
  icon?: string;
  /** Is section expanded by default? */
  defaultExpanded?: boolean;
}

/**
 * Copyable profile section component
 * Displays profile data with copy-to-clipboard button
 */
export function ProfileSnippet({
  title,
  data,
  icon,
  defaultExpanded = false,
}: ProfileSnippetProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatForCopy(data);
    await copyWithFeedback(
      text,
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        console.error('Failed to copy');
      }
    );
  };

  const renderValue = (value: any): React.ReactNode => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-sm text-gray-700">
              {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div className="space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="text-sm">
              <span className="font-medium text-gray-600">{key}:</span>{' '}
              <span className="text-gray-700">{String(val)}</span>
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-sm text-gray-700 whitespace-pre-wrap">{String(value)}</p>;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className={`
              px-2 py-1 text-xs rounded font-medium transition-colors
              ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }
            `}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <span className="text-gray-400">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {expanded && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">{renderValue(data)}</div>
      )}
    </div>
  );
}
