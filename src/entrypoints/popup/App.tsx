import React, { useEffect } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import './style.css';

function App(): React.ReactElement {
  const { profile, loadProfile, saveProfile, updatePersonal, isLoading } = useProfileStore();

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleDemoProfile = async () => {
    updatePersonal({
      name: 'Demo User',
      email: 'demo@example.com',
      phone: '555-0100',
      location: 'San Francisco, CA',
    });
    await saveProfile();
  };

  if (isLoading) {
    return (
      <div className="w-80 min-h-96 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 min-h-96 bg-white">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
        <h1 className="text-xl font-bold">AutoApply Copilot</h1>
        <p className="text-sm opacity-90 mt-1">Your job application assistant</p>
      </div>

      <div className="p-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-800 text-sm font-medium">✓ Phase 3: In Progress</p>
        </div>

        {profile ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-blue-900 text-sm font-medium">Profile Loaded</p>
            <p className="text-blue-700 text-xs mt-1">{profile.personal.name || 'No name set'}</p>
          </div>
        ) : (
          <p className="text-gray-600 text-sm mb-4">No profile loaded</p>
        )}

        <button
          onClick={handleDemoProfile}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors mb-3"
        >
          Load Demo Profile
        </button>

        <SettingsLink />

        <p className="text-gray-500 text-xs mt-4 text-center">AI Answer Generation Ready</p>
      </div>
    </div>
  );
}

function SettingsLink() {
  const handleOpenSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <button
      onClick={handleOpenSettings}
      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300 rounded"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      Settings (Configure AI)
    </button>
  );
}

export default App;
