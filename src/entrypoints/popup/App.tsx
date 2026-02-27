import React, { useState } from 'react';
import { TrackerList } from './components/TrackerList';
import { VolumeWarning } from './components/VolumeWarning';
import { SiteDisableToggle } from './components/SiteDisableToggle';
import './style.css';

type Tab = 'tracker' | 'profile' | 'settings';

function IconBriefcase({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-brand' : 'text-brand-subtle'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6.75a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25v4.154M15.75 7.5V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V7.5" />
    </svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-brand' : 'text-brand-subtle'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconCog({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-brand' : 'text-brand-subtle'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TabButton({
  label, active, onClick, icon,
}: {
  id?: Tab; label: string; active: boolean; onClick: () => void; icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-selected={active}
      role="tab"
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer relative ${active ? 'text-brand' : 'text-brand-subtle hover:text-brand-muted'}`}
    >
      {icon}
      {label}
      {active && <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-brand" />}
    </button>
  );
}

function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('tracker');

  return (
    <div className="flex flex-col overflow-hidden bg-brand-bg" style={{ width: 400, height: 580, minWidth: 400, minHeight: 580 }}>

      {/* Header */}
      <div className="bg-brand px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white text-sm leading-tight" style={{ fontWeight: 700 }}>AutoApply Copilot</h1>
            <p className="text-xs leading-tight" style={{ color: 'rgba(186,230,253,1)' }}>Smart job application assistant</p>
          </div>
        </div>
      </div>

      {/* Safety controls */}
      {activeTab === 'tracker' && (
        <div className="px-3 pt-2.5 pb-0 flex-shrink-0 animate-fade-in">
          <SiteDisableToggle />
          <VolumeWarning />
        </div>
      )}

      {/* Tab nav */}
      <div className="flex border-b border-brand-border bg-white flex-shrink-0" role="tablist">
        <TabButton id="tracker" label="Tracker" active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')} icon={<IconBriefcase active={activeTab === 'tracker'} />} />
        <TabButton id="profile" label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<IconUser active={activeTab === 'profile'} />} />
        <TabButton id="settings" label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<IconCog active={activeTab === 'settings'} />} />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'tracker' && <div className="h-full animate-slide-up"><TrackerList /></div>}
        {activeTab === 'profile' && <div className="h-full animate-slide-up"><ProfileTab /></div>}
        {activeTab === 'settings' && <div className="h-full animate-slide-up"><SettingsTab /></div>}
      </div>
    </div>
  );
}

function ProfileTab(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-5">
      {/* Icon block */}
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#DBEAFE' }}>
        <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <div>
        <p className="text-brand-text font-semibold text-sm mb-1">Manage your profile</p>
        <p className="text-brand-muted text-xs leading-relaxed">Edit your resume, work history, skills, and role preferences in the full profile editor.</p>
      </div>
      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
      >
        Open Profile Editor
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
}

function SettingsTab(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-5">
      {/* Icon block */}
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#DBEAFE' }}>
        <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <p className="text-brand-text font-semibold text-sm mb-1">AI & preferences</p>
        <p className="text-brand-muted text-xs leading-relaxed">Configure your AI API key, autofill preferences, and disabled sites from the settings page.</p>
      </div>
      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
      >
        Open Settings
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
}

export default App;
