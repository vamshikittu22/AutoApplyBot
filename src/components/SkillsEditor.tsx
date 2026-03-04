/**
 * SkillsEditor Component
 * Redesigned to use Taylor-inspired design system classes
 */

import { useState } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';

export function SkillsEditor() {
  const { profile, addSkill, deleteSkill } = useProfileStore();
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill({
        name: skillInput.trim(),
        category: 'general', // Default category
      });
      setSkillInput('');
    }
  };

  const handleDeleteSkill = (skillName: string) => {
    deleteSkill(skillName);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        Add keywords relevant to your industry. This helps the AI match your profile to job requirements.
      </p>

      {/* Add Skill Input */}
      <div>
        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          Add a Skill
          {profile?.skills && profile.skills.length > 0 && (
            <span style={{ fontWeight: 500, color: 'var(--primary)' }}>
              {profile.skills.length} added
            </span>
          )}
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
            placeholder="Type skill and press Enter (e.g., React, Python)"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
          <svg 
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      </div>

      {/* Skills Tags */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.5rem',
        padding: '1rem',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        minHeight: '100px',
        alignContent: 'flex-start'
      }}>
        {profile?.skills && profile.skills.length > 0 ? (
          profile.skills.map((skill, index) => (
            <span
              key={`${skill.name}-${index}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                background: 'var(--surface)',
                border: '1px solid var(--primary-200)',
                color: 'var(--primary-dark)',
                borderRadius: '99px',
                fontSize: '0.75rem',
                fontWeight: 600,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                transition: 'all 200ms'
              }}
              className="hover:border-primary"
            >
              {skill.name}
              <button
                onClick={() => handleDeleteSkill(skill.name)}
                aria-label={`Remove ${skill.name}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  transition: 'all 200ms'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))
        ) : (
          <div style={{ width: '100%', textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            No skills added yet. Start typing above to add your first skill.
          </div>
        )}
      </div>
    </div>
  );
}
