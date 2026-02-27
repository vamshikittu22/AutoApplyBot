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
      <div className="flex items-center gap-2 px-3 py-2 bg-[#F0F9FF] rounded-xl border border-[#BAE6FD] text-xs text-[#94A3B8]">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#0EA5E9]"></div>
        <span>Detecting current page...</span>
      </div>
    );
  }

  if (!currentUrl) {
    return (
      <div className="px-3 py-2 bg-[#F0F9FF] rounded-xl border border-[#BAE6FD] text-xs text-[#94A3B8]">
        Open a job posting to enable / disable the extension
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 bg-[#F0F9FF] rounded-xl border border-[#BAE6FD]">
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <div className={`w-1.5 h-1.5 rounded-full ${isDisabled ? 'bg-red-400' : 'bg-[#22C55E]'}`} />
          <span className="text-xs font-medium text-[#0C4A6E]">
            Extension {isDisabled ? 'paused' : 'active'} on this page
          </span>
        </div>

        {/* Toggle */}
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-1 ${
            isDisabled ? 'bg-red-300' : 'bg-[#22C55E]'
          }`}
          role="switch"
          aria-checked={!isDisabled}
          aria-label={isDisabled ? 'Enable extension for this job' : 'Disable extension for this job'}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
              isDisabled ? 'translate-x-1' : 'translate-x-[18px]'
            }`}
          />
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 bg-[#0C4A6E] text-white px-3 py-1.5 rounded-xl shadow-lg text-xs font-medium animate-fade-in whitespace-nowrap">
          {toastMessage}
        </div>
      )}
    </>
  );
}
