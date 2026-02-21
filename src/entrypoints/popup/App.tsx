import React from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import './style.css';

function App(): React.ReactElement {
  const { profile, setProfile } = useProfileStore();

  const handleDemoProfile = () => {
    const now = new Date().toISOString();
    setProfile({
      personal: {
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '555-0100',
        location: 'San Francisco, CA',
      },
      workHistory: [],
      education: [],
      skills: [],
      links: {},
      domainExtras: {},
      rolePreference: 'Other',
      createdAt: now,
      updatedAt: now,
    });
  };

  return (
    <div className="w-80 min-h-96 bg-white">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
        <h1 className="text-xl font-bold">AutoApply Copilot</h1>
        <p className="text-sm opacity-90 mt-1">Your job application assistant</p>
      </div>

      <div className="p-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-800 text-sm font-medium">✓ Phase 0: Foundation Complete</p>
        </div>

        {profile ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-blue-900 text-sm font-medium">Profile Loaded</p>
            <p className="text-blue-700 text-xs mt-1">{profile.personal.name}</p>
          </div>
        ) : (
          <p className="text-gray-600 text-sm mb-4">No profile loaded</p>
        )}

        <button
          onClick={handleDemoProfile}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Load Demo Profile
        </button>

        <p className="text-gray-500 text-xs mt-4 text-center">Ready for Phase 1 development</p>
      </div>
    </div>
  );
}

export default App;
