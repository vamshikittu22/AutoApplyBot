import React, { useState, useEffect } from 'react';
import { TrackerList } from './components/TrackerList';
import { VolumeWarning } from './components/VolumeWarning';
import { SiteDisableToggle } from './components/SiteDisableToggle';
import './style.css';

type Tab = 'tracker' | 'profile' | 'settings';

/* ── SVG Icons (consistent with options page) ──────────────── */
function IconBriefcase({ active }: { active: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={1.8}
    >
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6.75a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25v4.154M15.75 7.5V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V7.5" />
    </svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={1.8}
    >
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconCog({ active }: { active: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={1.8}
    >
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('tracker');
  const [isJobPage, setIsJobPage] = useState<boolean>(false);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || '';
      const jobPatterns = [
        '/jobs/', '/apply/', '/careers/', '/application/',
        'greenhouse.io', 'lever.co', 'workday',
        'linkedin.com/jobs', 'indeed.com', 'glassdoor.com',
      ];
      setIsJobPage(jobPatterns.some((p) => url.toLowerCase().includes(p)));
    });
  }, []);

  const handleAutofill = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_AUTOFILL' });
      window.close();
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ width: 400, height: 580, minWidth: 400, minHeight: 580, background: 'var(--bg)' }}
    >
      {/* ── Gradient Header ─────────────────────────────────── */}
      <div className="popup-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', position: 'relative' }}>
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
              AutoApply Copilot
            </h1>
            <p style={{ color: 'rgba(186,230,253,0.9)', fontSize: '0.6875rem', fontWeight: 400, lineHeight: 1.2, margin: 0 }}>
              Smart job application assistant
            </p>
          </div>
        </div>

        {/* Autofill CTA — job pages only */}
        {isJobPage && (
          <button onClick={handleAutofill} className="autofill-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            Autofill This Page
          </button>
        )}
      </div>

      {/* Safety controls (tracker tab only) */}
      {activeTab === 'tracker' && (
        <div style={{ padding: '0.625rem 0.75rem 0', flexShrink: 0 }} className="animate-fade-in">
          <SiteDisableToggle />
          <VolumeWarning />
        </div>
      )}

      {/* ── Tab Navigation ──────────────────────────────────── */}
      <div className="popup-tabs" role="tablist">
        <button
          className={`popup-tab ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
          role="tab"
          aria-selected={activeTab === 'tracker'}
        >
          <IconBriefcase active={activeTab === 'tracker'} />
          Tracker
        </button>
        <button
          className={`popup-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          role="tab"
          aria-selected={activeTab === 'profile'}
        >
          <IconUser active={activeTab === 'profile'} />
          Profile
        </button>
        <button
          className={`popup-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          role="tab"
          aria-selected={activeTab === 'settings'}
        >
          <IconCog active={activeTab === 'settings'} />
          Settings
        </button>
      </div>

      {/* ── Tab Content ─────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'tracker' && (
          <div className="h-full animate-slide-up">
            <TrackerList />
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="h-full animate-slide-up">
            <ProfileTab />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="h-full animate-slide-up">
            <SettingsTab />
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileTab(): React.ReactElement {
  return (
    <div className="stub-card">
      <div className="stub-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
          Manage your profile
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Edit your resume, work history, skills, and role preferences in the full profile editor.
        </p>
      </div>
      <button onClick={() => chrome.runtime.openOptionsPage()} className="stub-btn">
        Open Profile Editor
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
}

function SettingsTab(): React.ReactElement {
  return (
    <div className="stub-card">
      <div className="stub-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
          AI & preferences
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Configure your AI API key, autofill preferences, and disabled sites from the settings page.
        </p>
      </div>
      <button onClick={() => chrome.runtime.openOptionsPage()} className="stub-btn">
        Open Settings
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
}

export default App;
