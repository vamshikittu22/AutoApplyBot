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
    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 mb-4 relative">
      <div className="flex items-start gap-3">
        {/* Warning icon */}
        <svg
          className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-800">Quality over quantity</p>
          <p className="text-xs text-orange-700 mt-1">
            You've applied to 15+ jobs today. Consider focusing on tailored applications – they get
            better results!
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="text-orange-600 hover:text-orange-800 transition-colors flex-shrink-0"
          aria-label="Dismiss warning"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
