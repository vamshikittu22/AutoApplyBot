/**
 * Per-Site Disable Toggle Component
 *
 * Allows user to disable extension features for specific job posting.
 * Toggle shown in popup, affects current active tab's job URL.
 *
 * Features:
 * - Detects current job URL from active tab
 * - Shows current enable/disable state
 * - Immediate effect without page reload
 * - Toast confirmation on state change
 *
 * Implements REQ-SAF-02: Per-site disable control
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
      // Get active tab URL
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        setIsLoading(false);
        return;
      }

      setCurrentUrl(tab.url);

      // Check if current job is disabled
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
        // Re-enable job
        await enableJob(currentUrl);
        setIsDisabled(false);
        showToastMessage('Extension re-enabled for this job');

        // Notify content script to re-initialize features
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'JOB_ENABLED', url: currentUrl });
        }
      } else {
        // Disable job
        await disableJob(currentUrl);
        setIsDisabled(true);
        showToastMessage('Extension disabled for this job');

        // Notify content script to disable features
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
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded text-sm text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!currentUrl) {
    return (
      <div className="px-3 py-2 bg-gray-50 rounded text-xs text-gray-500">
        Open a job posting to enable/disable extension
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          {/* Status icon */}
          <div
            className={`w-2 h-2 rounded-full ${isDisabled ? 'bg-red-500' : 'bg-green-500'}`}
          ></div>

          {/* Label */}
          <span className="text-sm font-medium text-gray-700">
            Extension {isDisabled ? 'disabled' : 'active'} on this job
          </span>
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isDisabled ? 'bg-red-400' : 'bg-green-500'
          }`}
          role="switch"
          aria-checked={!isDisabled}
          aria-label={
            isDisabled ? 'Enable extension for this job' : 'Disable extension for this job'
          }
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isDisabled ? 'translate-x-1' : 'translate-x-6'
            }`}
          />
        </button>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in">
          {toastMessage}
        </div>
      )}
    </>
  );
}
