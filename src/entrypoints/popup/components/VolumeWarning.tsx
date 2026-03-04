/**
 * Volume Warning Banner Component
 * Updated to use design system token CSS
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
    const shouldShow = await shouldShowVolumeWarning();
    if (!shouldShow) {
      setIsVisible(false);
      return;
    }

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
    const today = getTodayDateString();
    const dismissKey = `volumeWarningDismissed-${today}`;
    localStorage.setItem(dismissKey, 'true');

    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="warning-card animate-fade-in" style={{ marginTop: '0.5rem' }}>
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ flexShrink: 0, color: '#D97706', marginTop: '2px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>Quality over quantity</p>
        <p style={{ margin: '2px 0 0', fontSize: '0.6875rem', color: '#B45309', lineHeight: 1.3 }}>
          15+ applications today — focused applications get better results!
        </p>
      </div>

      <button
        onClick={handleDismiss}
        style={{ 
          background: 'none', border: 'none', padding: '4px', cursor: 'pointer', 
          borderRadius: 'var(--radius-sm)', color: '#D97706', flexShrink: 0 
        }}
        className="hover:bg-amber-100 hover:text-amber-800 transition-colors"
        aria-label="Dismiss warning"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
