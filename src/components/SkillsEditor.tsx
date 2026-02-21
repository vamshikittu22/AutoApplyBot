/**
 * SkillsEditor Component
 *
 * Tag-based UI for managing skills.
 * Add skills via input (press Enter), remove via X button.
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
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
        <p className="text-sm text-gray-600 mb-4">
          Type a skill and press Enter to add. Click × to remove.
        </p>
      </div>

      {/* Add Skill Input */}
      <div>
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={handleAddSkill}
          placeholder="Type skill and press Enter (e.g., React, Python, Project Management)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Skills Tags */}
      <div className="flex flex-wrap gap-2">
        {profile?.skills && profile.skills.length > 0 ? (
          profile.skills.map((skill, index) => (
            <span
              key={`${skill.name}-${index}`}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              {skill.name}
              <button
                onClick={() => handleDeleteSkill(skill.name)}
                className="hover:text-blue-900 font-bold"
                aria-label={`Remove ${skill.name}`}
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <p className="text-gray-500 text-sm">
            No skills added yet. Start typing to add your first skill.
          </p>
        )}
      </div>

      {profile?.skills && profile.skills.length > 0 && (
        <p className="text-sm text-gray-500">Total skills: {profile.skills.length}</p>
      )}
    </div>
  );
}
