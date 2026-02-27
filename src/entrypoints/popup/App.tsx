import React, { useState } from 'react';
import { TrackerList } from './components/TrackerList';
import { VolumeWarning } from './components/VolumeWarning';
import { SiteDisableToggle } from './components/SiteDisableToggle';
import './style.css';

type Tab = 'tracker' | 'profile' | 'settings';

function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('tracker');

  return (
    <div className="w-96 h-[600px] bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 text-white">
        <h1 className="text-lg font-bold">AutoApply Copilot</h1>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'tracker'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Tracker
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Safety controls - shown at top of tracker tab */}
      {activeTab === 'tracker' && (
        <div className="p-3 border-b border-gray-200">
          <SiteDisableToggle />
          <div className="mt-2">
            <VolumeWarning />
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'tracker' && <TrackerList />}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

// Profile tab placeholder
function ProfileTab(): React.ReactElement {
  const handleOpenProfile = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="p-4 text-center">
      <p className="text-gray-600 text-sm mb-4">Manage your profile in the full settings page</p>
      <button
        onClick={handleOpenProfile}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Open Profile Editor
      </button>
    </div>
  );
}

// Settings tab placeholder
function SettingsTab(): React.ReactElement {
  const handleOpenSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="p-4 text-center">
      <p className="text-gray-600 text-sm mb-4">Configure AI settings and preferences</p>
      <button
        onClick={handleOpenSettings}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Open Settings Page
      </button>
    </div>
  );
}

export default App;
