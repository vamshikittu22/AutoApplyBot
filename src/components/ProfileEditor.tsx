/**
 * ProfileEditor Component
 *
 * Main profile editing UI with tabs for different sections.
 * Includes resume paste functionality with parser integration.
 * REQ-PRO-02: Profile editor UI with manual editing capability.
 */

import { useState } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import { WorkExperienceEditor } from './WorkExperienceEditor';
import { EducationEditor } from './EducationEditor';
import { SkillsEditor } from './SkillsEditor';
import { deleteProfile } from '@/lib/storage/profile-storage';
import type { RolePreference } from '@/types/profile';

type Tab = 'resume' | 'personal' | 'work' | 'education' | 'skills' | 'role';

export function ProfileEditor() {
  const {
    profile,
    confidenceScores,
    isParsing,
    isSaving,
    error,
    lastSaved,
    parseResume,
    saveProfile,
    updatePersonal,
    setRolePreference,
    updateDomainExtras,
    resetProfile,
  } = useProfileStore();

  const [activeTab, setActiveTab] = useState<Tab>('resume');
  const [resumeText, setResumeText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    await parseResume(resumeText);
    if (profile) setActiveTab('personal');
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

  const handleSave = async () => {
    await saveProfile();
  };

  const getConfidenceColor = (field: string): string => {
    const confidence = confidenceScores.find((c) => c.field === field);
    if (!confidence) return '';
    if (confidence.confidence >= 70) return 'text-green-600';
    if (confidence.confidence >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const roleOptions: RolePreference[] = [
    'Tech',
    'Healthcare',
    'Finance',
    'Marketing',
    'Operations',
    'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Profile Editor</h2>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!profile || isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">Error: {error}</p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {[
            { id: 'resume', label: 'Parse Resume' },
            { id: 'personal', label: 'Personal Info' },
            { id: 'work', label: 'Work Experience' },
            { id: 'education', label: 'Education' },
            { id: 'skills', label: 'Skills' },
            { id: 'role', label: 'Role & Extras' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Resume Parse Tab */}
        {activeTab === 'resume' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Paste Your Resume</h3>
                <p className="text-sm text-gray-600">
                  Copy your entire resume text below. We'll automatically extract your information.
                </p>
              </div>
              {profile && (
                <button
                  onClick={handleClearAndReparse}
                  disabled={isClearing}
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isClearing ? 'Clearing…' : '🗑 Clear & Re-parse'}
                </button>
              )}
            </div>

            {profile && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                ⚠️ A saved profile already exists. Pasting and parsing will <strong>overwrite</strong> all
                current data. Use <em>Clear &amp; Re-parse</em> to wipe storage and start fresh.
              </div>
            )}

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here..."
              className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <button
              onClick={handleParseResume}
              disabled={!resumeText.trim() || isParsing}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isParsing ? 'Parsing...' : 'Parse Resume'}
            </button>
            {confidenceScores.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Parse Results:</p>
                <p className="text-sm text-blue-700">
                  Extracted {confidenceScores.length} fields. Review them in the other tabs.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className={getConfidenceColor('personal.name')}>*</span>
              </label>
              <input
                type="text"
                value={profile?.personal.name || ''}
                onChange={(e) => updatePersonal({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className={getConfidenceColor('personal.email')}>*</span>
              </label>
              <input
                type="email"
                value={profile?.personal.email || ''}
                onChange={(e) => updatePersonal({ email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className={getConfidenceColor('personal.phone')}>*</span>
              </label>
              <input
                type="tel"
                value={profile?.personal.phone || ''}
                onChange={(e) => updatePersonal({ phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className={getConfidenceColor('personal.location')}></span>
              </label>
              <input
                type="text"
                value={profile?.personal.location || ''}
                onChange={(e) => updatePersonal({ location: e.target.value })}
                placeholder="City, State or City, Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Authorization
              </label>
              <input
                type="text"
                value={profile?.personal.workAuthorization || ''}
                onChange={(e) => updatePersonal({ workAuthorization: e.target.value })}
                placeholder="e.g., US Citizen, Green Card, H1B"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Work Experience Tab */}
        {activeTab === 'work' && <WorkExperienceEditor />}

        {/* Education Tab */}
        {activeTab === 'education' && <EducationEditor />}

        {/* Skills Tab */}
        {activeTab === 'skills' && <SkillsEditor />}

        {/* Role & Extras Tab */}
        {activeTab === 'role' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Preference</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select your primary role to customize the fields shown.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((role) => (
                  <button
                    key={role}
                    onClick={() => setRolePreference(role)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      profile?.rolePreference === role
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain-Specific Fields */}
            {profile?.rolePreference === 'Tech' && (
              <div className="space-y-4 pt-6 border-t">
                <h4 className="font-semibold text-gray-900">Tech-Specific Fields</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tech Stack
                    <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={
                      Array.isArray(profile.domainExtras.techStack)
                        ? profile.domainExtras.techStack.join(', ')
                        : ''
                    }
                    onChange={(e) =>
                      updateDomainExtras({
                        techStack: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="e.g., React, Node.js, PostgreSQL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={(profile.domainExtras.githubUsername as string) || ''}
                    onChange={(e) => updateDomainExtras({ githubUsername: e.target.value })}
                    placeholder="github.com/username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={(profile.domainExtras.portfolioUrl as string) || ''}
                    onChange={(e) => updateDomainExtras({ portfolioUrl: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {profile?.rolePreference === 'Healthcare' && (
              <div className="space-y-4 pt-6 border-t">
                <h4 className="font-semibold text-gray-900">Healthcare-Specific Fields</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NPI Number</label>
                  <input
                    type="text"
                    value={(profile.domainExtras.npiNumber as string) || ''}
                    onChange={(e) => updateDomainExtras({ npiNumber: e.target.value })}
                    placeholder="10-digit National Provider Identifier"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clinical Specialty
                  </label>
                  <input
                    type="text"
                    value={(profile.domainExtras.clinicalSpecialty as string) || ''}
                    onChange={(e) => updateDomainExtras({ clinicalSpecialty: e.target.value })}
                    placeholder="e.g., Internal Medicine, Cardiology"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {profile?.rolePreference === 'Finance' && (
              <div className="space-y-4 pt-6 border-t">
                <h4 className="font-semibold text-gray-900">Finance-Specific Fields</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FINRA Licenses
                    <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={
                      Array.isArray(profile.domainExtras.finraLicenses)
                        ? profile.domainExtras.finraLicenses.join(', ')
                        : ''
                    }
                    onChange={(e) =>
                      updateDomainExtras({
                        finraLicenses: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="e.g., Series 7, Series 63"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CFA Level</label>
                  <select
                    value={(profile.domainExtras.cfaLevel as string) || ''}
                    onChange={(e) => updateDomainExtras({ cfaLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
