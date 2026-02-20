import React from 'react';
import './style.css';

function App(): React.ReactElement {
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
        <p className="text-gray-600 text-sm">
          Ready to build Phase 1 features
        </p>
      </div>
    </div>
  );
}

export default App;
