/**
 * ProfileEditor Component — Redesigned with Taylor-inspired layout
 *
 * Section-based layout with left accent borders, tip banners,
 * and clean form grouping. Uses design system CSS classes.
 */

import { useState } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import { WorkExperienceEditor } from './WorkExperienceEditor';
import { EducationEditor } from './EducationEditor';
import { SkillsEditor } from './SkillsEditor';
import { deleteProfile } from '@/lib/storage/profile-storage';
import type { RolePreference } from '@/types/profile';

export function ProfileEditor() {
  const {
    profile,
    confidenceScores,
    isParsing,
    error,
    parseResume,
    updatePersonal,
    setRolePreference,
    updateDomainExtras,
    resetProfile,
  } = useProfileStore();

  const [resumeText, setResumeText] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('personal');

  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    await parseResume(resumeText);
  };

  const handleClearAndReparse = async () => {
    if (!confirm('This will delete your saved profile and let you paste a fresh resume. Continue?')) return;
    setIsClearing(true);
    try {
      await deleteProfile();
      resetProfile();
      setResumeText('');
    } finally {
      setIsClearing(false);
    }
  };

  const roleOptions: RolePreference[] = [
    'Tech', 'Healthcare', 'Finance', 'Marketing', 'Operations', 'Other',
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Error */}
      {error && (
        <div className="info-box info-box-red animate-fade">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      {/* ── Parse Resume Section ─────────────────────────────── */}
      <div className="content-card animate-in">
        <div className="section-header">
          <h3>Import Resume</h3>
        </div>

        <div className="tip-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Paste your resume text below to auto-fill all profile fields.
        </div>

        {profile && (
          <div className="info-box info-box-amber" style={{ marginBottom: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span>A saved profile already exists. Parsing will <strong>overwrite</strong> all current data.</span>
          </div>
        )}

        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume here..."
          className="form-input form-textarea"
          style={{ minHeight: '160px', fontFamily: "'Plus Jakarta Sans', monospace", fontSize: '0.8125rem' }}
        />

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleParseResume}
            disabled={!resumeText.trim() || isParsing}
            className="btn-primary"
            style={{ width: 'auto', padding: '0.625rem 1.5rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            {isParsing ? 'Parsing...' : 'Parse Resume'}
          </button>

          {profile && (
            <button
              onClick={handleClearAndReparse}
              disabled={isClearing}
              className="btn-danger"
            >
              {isClearing ? 'Clearing…' : 'Clear & Re-parse'}
            </button>
          )}
        </div>

        {confidenceScores.length > 0 && (
          <div className="info-box info-box-green" style={{ marginTop: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Extracted <strong>{confidenceScores.length} fields</strong> successfully. Review them below.</span>
          </div>
        )}
      </div>

      {/* ── Contact Information ───────────────────────────────── */}
      <div className="content-card animate-in">
        <button
          onClick={() => toggleSection('personal')}
          style={{ all: 'unset', cursor: 'pointer', display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3>Contact Information</h3>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}
            style={{ transform: expandedSection === 'personal' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {expandedSection === 'personal' && (
          <div className="animate-fade" style={{ marginTop: '1.25rem' }}>
            <div className="tip-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Tip: Double-check your email and location to help recruiters find you easily.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Full Name */}
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={profile?.personal.name || ''}
                  onChange={(e) => updatePersonal({ name: e.target.value })}
                  className="form-input"
                  placeholder="e.g., John Doe"
                />
              </div>

              {/* Location Row */}
              <div>
                <label className="form-label">Location</label>
                <div className="form-row form-row-3">
                  <input
                    type="text"
                    value={profile?.personal.location?.split(',')[0]?.trim() || ''}
                    onChange={(e) => {
                      const parts = (profile?.personal.location || '').split(',');
                      parts[0] = e.target.value;
                      updatePersonal({ location: parts.join(', ').trim() });
                    }}
                    className="form-input"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={profile?.personal.location?.split(',')[1]?.trim() || ''}
                    onChange={(e) => {
                      const parts = (profile?.personal.location || '').split(',');
                      if (parts.length < 2) parts.push('');
                      parts[1] = e.target.value;
                      updatePersonal({ location: parts.join(', ').trim() });
                    }}
                    className="form-input"
                    placeholder="Region/State"
                  />
                  <input
                    type="text"
                    value={''}
                    onChange={() => {}}
                    className="form-input"
                    placeholder="Postal Code"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={profile?.personal.email || ''}
                  onChange={(e) => updatePersonal({ email: e.target.value })}
                  className="form-input"
                  placeholder="your@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={profile?.personal.phone || ''}
                  onChange={(e) => updatePersonal({ phone: e.target.value })}
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Work Authorization */}
              <div>
                <label className="form-label">Work Authorization</label>
                <input
                  type="text"
                  value={profile?.personal.workAuthorization || ''}
                  onChange={(e) => updatePersonal({ workAuthorization: e.target.value })}
                  className="form-input"
                  placeholder="e.g., US Citizen, Green Card, H1B"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Online Presence ───────────────────────────────────── */}
      {profile?.rolePreference === 'Tech' && (
        <div className="content-card animate-in">
          <button
            onClick={() => toggleSection('online')}
            style={{ all: 'unset', cursor: 'pointer', display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div className="section-header" style={{ marginBottom: 0 }}>
              <h3>Online Presence</h3>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}
              style={{ transform: expandedSection === 'online' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {expandedSection === 'online' && (
            <div className="animate-fade" style={{ marginTop: '1.25rem' }}>
              <div className="tip-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07a4.5 4.5 0 00-6.364 0L4.82 7.569a4.5 4.5 0 006.364 6.364l1.757-1.757" />
                </svg>
                Tip: Share links to your portfolio and profiles. Make it easy for recruiters to find your work.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Portfolio URL</label>
                  <input
                    type="url"
                    value={(profile?.domainExtras.portfolioUrl as string) || ''}
                    onChange={(e) => updateDomainExtras({ portfolioUrl: e.target.value })}
                    className="form-input"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                <div>
                  <label className="form-label">GitHub URL</label>
                  <input
                    type="text"
                    value={(profile?.domainExtras.githubUsername as string) || ''}
                    onChange={(e) => updateDomainExtras({ githubUsername: e.target.value })}
                    className="form-input"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    value={''}
                    onChange={() => {}}
                    className="form-input"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Work Experience ───────────────────────────────────── */}
      <div className="content-card animate-in">
        <button
          onClick={() => toggleSection('work')}
          style={{ all: 'unset', cursor: 'pointer', display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3>Professional Experience</h3>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}
            style={{ transform: expandedSection === 'work' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {expandedSection === 'work' && (
          <div className="animate-fade" style={{ marginTop: '1.25rem' }}>
            <div className="tip-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6.75a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25v4.154" />
              </svg>
              Tip: Focus on impact and results. Use action verbs and quantify achievements.
            </div>
            <WorkExperienceEditor />
          </div>
        )}
      </div>

      {/* ── Education ─────────────────────────────────────────── */}
      <div className="content-card animate-in">
        <button
          onClick={() => toggleSection('education')}
          style={{ all: 'unset', cursor: 'pointer', display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3>Education</h3>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}
            style={{ transform: expandedSection === 'education' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {expandedSection === 'education' && (
          <div className="animate-fade" style={{ marginTop: '1.25rem' }}>
            <div className="tip-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
              Tip: Include your degree, institution, graduation year, and relevant coursework.
            </div>
            <EducationEditor />
          </div>
        )}
      </div>

      {/* ── Skills ────────────────────────────────────────────── */}
      <div className="content-card animate-in">
        <button
          onClick={() => toggleSection('skills')}
          style={{ all: 'unset', cursor: 'pointer', display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3>Summary & Skills</h3>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}
            style={{ transform: expandedSection === 'skills' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {expandedSection === 'skills' && (
          <div className="animate-fade" style={{ marginTop: '1.25rem' }}>
            <div className="tip-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Tip: Skills that match the job get you past ATS filters. List your expert-level languages first!
            </div>
            <SkillsEditor />
          </div>
        )}
      </div>

      {/* ── Role Preference ───────────────────────────────────── */}
      <div className="content-card animate-in">
        <button
          onClick={() => toggleSection('role')}
          style={{ all: 'unset', cursor: 'pointer', display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3>Role Preference</h3>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}
            style={{ transform: expandedSection === 'role' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {expandedSection === 'role' && (
          <div className="animate-fade" style={{ marginTop: '1.25rem' }}>
            <div className="tip-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              Tip: Select your primary role to unlock domain-specific fields and better AI suggestions.
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Select your primary role to customize autofill fields.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
              {roleOptions.map((role) => (
                <button
                  key={role}
                  onClick={() => setRolePreference(role)}
                  className={`radio-card ${profile?.rolePreference === role ? 'selected' : ''}`}
                  style={{ justifyContent: 'center', fontWeight: 600, fontSize: '0.8125rem' }}
                >
                  {profile?.rolePreference === role && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                  {role}
                </button>
              ))}
            </div>

            {/* Domain-specific extras */}
            {profile?.rolePreference === 'Tech' && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <label className="form-label" style={{ marginBottom: '0.375rem' }}>
                  Tech Stack <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(comma-separated)</span>
                </label>
                <textarea
                  value={Array.isArray(profile.domainExtras.techStack) ? profile.domainExtras.techStack.join(', ') : ''}
                  onChange={(e) =>
                    updateDomainExtras({
                      techStack: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g., React, Node.js, PostgreSQL, AWS, Docker"
                  className="form-input form-textarea"
                  style={{ minHeight: '80px' }}
                />
              </div>
            )}

            {profile?.rolePreference === 'Healthcare' && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">NPI Number</label>
                  <input
                    type="text"
                    value={(profile.domainExtras.npiNumber as string) || ''}
                    onChange={(e) => updateDomainExtras({ npiNumber: e.target.value })}
                    placeholder="10-digit National Provider Identifier"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Clinical Specialty</label>
                  <input
                    type="text"
                    value={(profile.domainExtras.clinicalSpecialty as string) || ''}
                    onChange={(e) => updateDomainExtras({ clinicalSpecialty: e.target.value })}
                    placeholder="e.g., Internal Medicine, Cardiology"
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {profile?.rolePreference === 'Finance' && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">
                    FINRA Licenses <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(profile.domainExtras.finraLicenses) ? profile.domainExtras.finraLicenses.join(', ') : ''}
                    onChange={(e) =>
                      updateDomainExtras({
                        finraLicenses: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g., Series 7, Series 63"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">CFA Level</label>
                  <select
                    value={(profile.domainExtras.cfaLevel as string) || ''}
                    onChange={(e) => updateDomainExtras({ cfaLevel: e.target.value })}
                    className="form-input"
                  >
                    <option value="">Select CFA Level</option>
                    <option value="Level I">Level I</option>
                    <option value="Level II">Level II</option>
                    <option value="Level III">Level III</option>
                    <option value="Charterholder">Charterholder</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
