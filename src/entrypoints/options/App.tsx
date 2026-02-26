import { useState, useEffect } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import { ProfileEditor } from '@/components/ProfileEditor';
import { AISettings } from '@/components/AISettings';
import './style.css';

function App() {
  const { loadProfile, isLoading } = useProfileStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'data'>('profile');

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AutoApply Copilot Settings</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Configuration
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Data & Privacy
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && <ProfileEditor />}
          {activeTab === 'ai' && <AISettings />}
          {activeTab === 'data' && <DataSettings />}
        </div>
      </div>
    </div>
  );
}

function DataSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Data & Privacy</h2>
        <p className="text-sm text-gray-600">Manage your data and privacy settings</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Data management features (export/delete) coming in Phase 1 completion.
        </p>
      </div>
    </div>
  );
}

export default App;
