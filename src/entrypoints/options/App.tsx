import React from 'react';
import './style.css';

function App(): React.ReactElement {
  return (
    <div className="container mx-auto max-w-4xl p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile and preferences</p>
      </header>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuration</h2>
        <p className="text-gray-600 text-sm">
          Configuration options will appear here in Phase 1
        </p>
      </div>
    </div>
  );
}

export default App;
