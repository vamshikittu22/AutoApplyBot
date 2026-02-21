import { useEffect } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import { ProfileEditor } from '@/components/ProfileEditor';
import './style.css';

function App() {
  const { loadProfile, isLoading } = useProfileStore();

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AutoApply Copilot
          </h1>
          <p className="text-gray-600 mt-2">Profile Management & Settings</p>
        </header>

        <ProfileEditor />
      </div>
    </div>
  );
}

export default App;
