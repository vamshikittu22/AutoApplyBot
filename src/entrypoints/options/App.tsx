import { useState, useEffect } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import { ProfileEditor } from '@/components/ProfileEditor';
import { AISettings } from '@/components/AISettings';
import './style.css';

type Tab = 'profile' | 'ai' | 'data';

/* ── SVG Icons ───────────────────────────────────────────────── */
function IconCheck() {
  return (
    <svg className="pill-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconCog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconSave() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function IconLightbulb() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}

function App() {
  const { loadProfile, isLoading, isSaving, saveProfile, profile } = useProfileStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    await saveProfile();
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Page Container ──────────────────────────────────── */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* ── Gradient Header Banner ────────────────────────── */}
        <div className="header-banner">
          <h1>AutoApply Copilot</h1>
          <p>Build your professional profile and configure AI-powered autofill</p>

          {/* Pill Tabs */}
          <div className="pill-tabs">
            <button
              className={`pill-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <IconUser />
              Profile Editor
              <IconCheck />
            </button>
            <button
              className={`pill-tab ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              <IconCog />
              AI Configuration
              <IconCheck />
            </button>
            <button
              className={`pill-tab ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              <IconShield />
              Data & Privacy
              <IconCheck />
            </button>
          </div>
        </div>

        {/* ── Two-Column Layout ─────────────────────────────── */}
        <div className="layout-grid" style={{ marginTop: '2rem' }}>
          {/* Main Content Column */}
          <div className="animate-in">
            {activeTab === 'profile' && <ProfileEditor />}
            {activeTab === 'ai' && <AISettings />}
            {activeTab === 'data' && <DataSettings />}
          </div>

          {/* Sidebar Column */}
          <div className="sidebar">
            {/* Quick Tips Card */}
            <div className="sidebar-card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IconLightbulb /> Quick Tips
              </h3>
              <div className="sidebar-tip">
                <strong>Keep it concise.</strong> Recruiters scan in 6-7 seconds. Be precise, not wordy.
              </div>
              <div className="sidebar-tip">
                <strong>Keywords matter.</strong> Use terms from the job description to pass ATS filters.
              </div>
              <div className="sidebar-tip">
                <strong>Quantify achievements.</strong> Numbers don't lie — show off those wins with real figures!
              </div>
              <div className="sidebar-tip">
                <strong>Proofread carefully.</strong> Typos are red flags. Clean copy shows professionalism.
              </div>
            </div>

            {/* Save Profile CTA */}
            <div className="sidebar-card">
              <h3>Save Profile</h3>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={!profile || isSaving}
              >
                <IconSave />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
              {activeTab === 'profile' && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                  Your profile is stored locally in your browser.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataSettings() {
  return (
    <div className="content-card animate-in">
      <div className="section-header">
        <h3>Data & Privacy</h3>
      </div>

      <div className="tip-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        Your data stays on your device. Nothing is sent to external servers.
      </div>

      <div className="info-box info-box-blue" style={{ marginTop: '1rem' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <div>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Coming Soon</p>
          <p>Data management features (export/import/delete) will be available in the next update. Stay tuned!</p>
        </div>
      </div>
    </div>
  );
}

export default App;
