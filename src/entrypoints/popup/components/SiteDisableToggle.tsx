/**
 * SiteDisableToggle Component
 * Updated with Taylor-inspired design system token CSS
 */

import React, { useEffect, useState } from 'react';
import { isJobDisabled, disableJob, enableJob } from '@/lib/safety/site-disable';

export function SiteDisableToggle(): React.ReactElement {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadCurrentTabUrl();
  }, []);

  const loadCurrentTabUrl = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        setIsLoading(false);
        return;
      }

      setCurrentUrl(tab.url);

      const disabled = await isJobDisabled(tab.url);
      setIsDisabled(disabled);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading current tab URL:', error);
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!currentUrl) return;

    try {
      if (isDisabled) {
        await enableJob(currentUrl);
        setIsDisabled(false);
        showToastMessage('Extension re-enabled for this job');

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'JOB_ENABLED', url: currentUrl });
        }
      } else {
        await disableJob(currentUrl);
        setIsDisabled(true);
        showToastMessage('Extension disabled for this job');

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'JOB_DISABLED', url: currentUrl });
        }
      }
    } catch (error) {
      console.error('Error toggling job disable state:', error);
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="toggle-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ width: '0.875rem', height: '0.875rem', borderWidth: '1.5px' }}></div>
          <span>Detecting current page...</span>
        </div>
      </div>
    );
  }

  if (!currentUrl) {
    return (
      <div className="toggle-card" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Open a job posting to enable / disable the extension
      </div>
    );
  }

  return (
    <>
      <div className="toggle-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '6px', height: '6px', borderRadius: '50%',
            background: isDisabled ? '#EF4444' : '#22C55E' 
          }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>
            Extension {isDisabled ? 'paused' : 'active'} on this page
          </span>
        </div>

        <button
          onClick={handleToggle}
          style={{ 
            position: 'relative', display: 'inline-flex', height: '20px', width: '36px', 
            alignItems: 'center', borderRadius: '9999px', cursor: 'pointer', border: 'none',
            background: isDisabled ? '#FCA5A5' : '#22C55E', transition: 'background-color 200ms'
          }}
          role="switch"
          aria-checked={!isDisabled}
          className="focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-1"
        >
          <span
            style={{ 
              display: 'inline-block', height: '14px', width: '14px', borderRadius: '50%', 
              background: 'white', transition: 'transform 200ms',
              transform: `translateX(${isDisabled ? '4px' : '18px'})`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          />
        </button>
      </div>

      {showToast && (
        <div className="toast animate-fade-in">
          {toastMessage}
        </div>
      )}
    </>
  );
}
