import { useState } from 'react';
import { ProfileSnippet } from '@/components/ProfileSnippet';
import type { Profile } from '@/types/profile';
import type { DetectionResult } from '@/types/ats';

export interface HelperSidebarProps {
  profile: Profile;
  detection: DetectionResult | null;
  onSwitchToAutofill?: () => void;
}

type SidebarState = 'collapsed' | 'expanded';

/**
 * Helper Mode sidebar
 * Displays copyable profile sections for manual filling
 */
export function HelperSidebar({ profile, detection, onSwitchToAutofill }: HelperSidebarProps) {
  const [state, setState] = useState<SidebarState>('expanded');

  const toggleState = () => {
    setState(state === 'collapsed' ? 'expanded' : 'collapsed');
  };

  const canSwitchToAutofill = detection && detection.platform && detection.confidence >= 50;

  return (
    <div
      className={`
        fixed top-0 right-0 h-full bg-white shadow-2xl z-[10000]
        transition-transform duration-300 ease-in-out
        ${state === 'collapsed' ? 'translate-x-full' : 'translate-x-0'}
      `}
      style={{ width: '360px' }}
    >
      {/* Toggle button */}
      <button
        onClick={toggleState}
        className="absolute -left-10 top-4 w-10 h-10 bg-indigo-600 text-white rounded-l-lg shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
        title={state === 'collapsed' ? 'Open Helper' : 'Close Helper'}
      >
        {state === 'collapsed' ? '◀' : '▶'}
      </button>

      {/* Sidebar content */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4">
          <h2 className="text-lg font-bold">AutoApply Helper</h2>
          <p className="text-sm text-indigo-100 mt-1">Copy sections to fill the form manually</p>

          {/* Detection info */}
          {detection && (
            <div className="mt-3 p-2 bg-indigo-700 rounded text-xs">
              <div className="flex items-center justify-between">
                <span>Detection:</span>
                <span className="font-semibold">{detection.platform || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Confidence:</span>
                <span className="font-semibold">{detection.confidence}%</span>
              </div>
            </div>
          )}

          {/* Switch to autofill button */}
          {canSwitchToAutofill && onSwitchToAutofill && (
            <button
              onClick={onSwitchToAutofill}
              className="w-full mt-3 px-3 py-2 bg-white text-indigo-600 rounded font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              Switch to Autofill Mode
            </button>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Contact Info */}
          <ProfileSnippet
            title="Contact Info"
            icon="📧"
            data={{
              Name: profile.personal.name,
              Email: profile.personal.email,
              Phone: profile.personal.phone,
              Location: profile.personal.location,
            }}
            defaultExpanded
          />

          {/* Work Authorization */}
          {profile.personal.workAuthorization && (
            <ProfileSnippet
              title="Work Authorization"
              icon="📄"
              data={{
                Status: profile.personal.workAuthorization,
              }}
            />
          )}

          {/* Links */}
          {(profile.links.linkedin || profile.links.github || profile.links.portfolio) && (
            <ProfileSnippet
              title="Professional Links"
              icon="🔗"
              data={{
                LinkedIn: profile.links.linkedin,
                GitHub: profile.links.github,
                Portfolio: profile.links.portfolio,
              }}
            />
          )}

          {/* Current Position (most recent work) */}
          {profile.workHistory && profile.workHistory.length > 0 && (
            <ProfileSnippet
              title="Current Position"
              icon="💼"
              data={{
                Company: profile.workHistory[0]?.company,
                Title: profile.workHistory[0]?.position,
                Duration: `${profile.workHistory[0]?.startDate} - ${profile.workHistory[0]?.endDate || 'Present'}`,
              }}
            />
          )}

          {/* Work History */}
          {profile.workHistory && profile.workHistory.length > 0 && (
            <ProfileSnippet title="Work History" icon="📋" data={profile.workHistory} />
          )}

          {/* Education */}
          {profile.education && profile.education.length > 0 && (
            <ProfileSnippet title="Education" icon="🎓" data={profile.education} />
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <ProfileSnippet title="Skills" icon="⚡" data={profile.skills.map((s) => s.name)} />
          )}

          {/* Domain Extras - Tech */}
          {profile.rolePreference === 'Tech' &&
            profile.domainExtras.techStack &&
            profile.domainExtras.techStack.length > 0 && (
              <ProfileSnippet title="Tech Stack" icon="💻" data={profile.domainExtras.techStack} />
            )}

          {/* Domain Extras - Healthcare */}
          {profile.rolePreference === 'Healthcare' && (
            <>
              {profile.domainExtras.npiNumber && (
                <ProfileSnippet
                  title="NPI Number"
                  icon="🏥"
                  data={{ NPI: profile.domainExtras.npiNumber }}
                />
              )}
              {profile.domainExtras.clinicalSpecialty && (
                <ProfileSnippet
                  title="Clinical Specialty"
                  icon="🩺"
                  data={{ Specialty: profile.domainExtras.clinicalSpecialty }}
                />
              )}
            </>
          )}

          {/* Domain Extras - Finance */}
          {profile.rolePreference === 'Finance' && (
            <>
              {profile.domainExtras.finraLicenses &&
                profile.domainExtras.finraLicenses.length > 0 && (
                  <ProfileSnippet
                    title="FINRA Licenses"
                    icon="📊"
                    data={profile.domainExtras.finraLicenses}
                  />
                )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            Click any section to expand/collapse
            <br />
            Click "Copy" to copy to clipboard
          </p>
        </div>
      </div>
    </div>
  );
}
