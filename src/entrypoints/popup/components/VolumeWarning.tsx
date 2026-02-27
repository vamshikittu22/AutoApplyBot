/**
 * Volume Warning Banner Component
 *
 * Displays dismissible warning after user submits 15+ applications in one day.
 * Non-blocking: user can continue using autofill/AI features.
 *
 * Warning persists dismissal for calendar day (resets at midnight).
 *
 * Implements REQ-SAF-01: Volume warning guardrail
 */

import React, { useEffect, useState } from 'react';
import { shouldShowVolumeWarning } from '@/lib/safety/volume-limiter';
import { getTodayDateString } from '@/lib/tracker/utils';

export function VolumeWarning(): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkWarningVisibility();
  }, []);

  const checkWarningVisibility = async () => {
    // Check if warning threshold reached
    const shouldShow = await shouldShowVolumeWarning();
    if (!shouldShow) {
      setIsVisible(false);
      return;
    }

    // Check if warning was dismissed today
    const today = getTodayDateString();
    const dismissKey = `volumeWarningDismissed-${today}`;
    const wasDismissed = localStorage.getItem(dismissKey) === 'true';

    if (wasDismissed) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  };

  const handleDismiss = () => {
    // Store dismissal for today
    const today = getTodayDateString();
    const dismissKey = `volumeWarningDismissed-${today}`;
    localStorage.setItem(dismissKey, 'true');

    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-2 animate-fade-in">
      <div className="flex items-start gap-2.5">
        {/* Warning icon */}
        <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-800">Quality over quantity</p>
          <p className="text-[11px] text-amber-700 leading-snug mt-0.5">
            15+ applications today — focused applications get better results!
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="text-amber-500 hover:text-amber-700 hover:bg-amber-100 p-1 rounded-lg transition-colors duration-150 cursor-pointer flex-shrink-0"
          aria-label="Dismiss warning"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
