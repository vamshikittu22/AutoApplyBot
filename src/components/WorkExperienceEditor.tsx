/**
 * WorkExperienceEditor Component
 *
 * CRUD interface for work experience entries.
 * Allows add/edit/delete operations with inline forms.
 */

import { useState } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import type { WorkExperience } from '@/types/profile';
import { normalizeToMonthInput } from '@/lib/utils/date-utils';

/** Blank form state */
const emptyForm = (): Partial<WorkExperience> => ({
  position: '',
  company: '',
  startDate: '',
  endDate: '',
  achievements: [],
});

export function WorkExperienceEditor() {
  const { profile, addWorkExperience, updateWorkExperience, deleteWorkExperience } =
    useProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<WorkExperience>>(emptyForm());
  const [isPresent, setIsPresent] = useState(false);

  const resetForm = () => {
    setFormData(emptyForm());
    setIsPresent(false);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!formData.position || !formData.company || !formData.startDate) return;
    const endDate = isPresent ? 'Present' : formData.endDate || '';
    addWorkExperience({ ...formData, endDate } as Omit<WorkExperience, 'id'>);
    resetForm();
  };

  const handleUpdate = (id: string) => {
    const endDate = isPresent ? 'Present' : formData.endDate || '';
    updateWorkExperience(id, { ...formData, endDate });
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this work experience?')) {
      deleteWorkExperience(id);
    }
  };

  const handleEdit = (exp: WorkExperience) => {
    const present = exp.endDate === 'Present';
    setFormData({
      ...exp,
      startDate: normalizeToMonthInput(exp.startDate),
      endDate: present ? '' : normalizeToMonthInput(exp.endDate),
    });
    setIsPresent(present);
    setEditingId(exp.id);
    setIsAdding(false);
  };

  const handleAchievementsChange = (text: string) => {
    const achievements = text.split('\n').filter((line) => line.trim());
    setFormData({ ...formData, achievements });
  };

  /** Shared date row */
  const DateRow = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
          <input
            type="month"
            value={formData.startDate || ''}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
          <input
            type="month"
            value={isPresent ? '' : (formData.endDate || '')}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            disabled={isPresent}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isPresent}
          onChange={(e) => {
            setIsPresent(e.target.checked);
            if (e.target.checked) setFormData({ ...formData, endDate: '' });
          }}
          className="w-4 h-4 accent-blue-600"
        />
        I currently work here
      </label>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Experience
        </button>
      </div>

      {/* Existing Experiences */}
      <div className="space-y-3">
        {profile?.workHistory.map((exp) => (
          <div
            key={exp.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            {editingId === exp.id ? (
              /* Edit Form */
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Position"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <DateRow />
                <textarea
                  value={(formData.achievements || []).join('\n')}
                  onChange={(e) => handleAchievementsChange(e.target.value)}
                  placeholder="Achievements (one per line)"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(exp.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(exp)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {exp.startDate} — {exp.endDate}
                </p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {exp.achievements.map((achievement, idx) => (
                      <li key={idx}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Form */}
      {isAdding && (
        <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
          <h4 className="font-semibold text-gray-900 mb-3">New Work Experience</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.position || ''}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Position"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={formData.company || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Company"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <DateRow />
            <textarea
              value={(formData.achievements || []).join('\n')}
              onChange={(e) => handleAchievementsChange(e.target.value)}
              placeholder="Achievements (one per line)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Experience
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
