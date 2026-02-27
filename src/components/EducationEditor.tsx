/**
 * EducationEditor Component
 *
 * CRUD interface for education entries.
 * Allows add/edit/delete operations with inline forms.
 */

import { useState } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import type { Education } from '@/types/profile';
import { normalizeToMonthInput } from '@/lib/utils/date-utils';

/** Blank form state */
const emptyForm = (): Partial<Education> => ({
  degree: '',
  institution: '',
  startDate: '',
  endDate: '',
  gpa: '',
});

export function EducationEditor() {
  const { profile, addEducation, updateEducation, deleteEducation } = useProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Education>>(emptyForm());
  const [isPresent, setIsPresent] = useState(false);

  const resetForm = () => {
    setFormData(emptyForm());
    setIsPresent(false);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!formData.degree || !formData.institution || !formData.startDate) return;
    const endDate = isPresent ? 'Present' : formData.endDate || '';
    addEducation({ ...formData, endDate } as Omit<Education, 'id'>);
    resetForm();
  };

  const handleUpdate = (id: string) => {
    const endDate = isPresent ? 'Present' : formData.endDate || '';
    updateEducation(id, { ...formData, endDate });
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this education entry?')) {
      deleteEducation(id);
    }
  };

  const handleEdit = (edu: Education) => {
    const present = edu.endDate === 'Present';
    setFormData({
      ...edu,
      startDate: normalizeToMonthInput(edu.startDate),
      endDate: present ? '' : normalizeToMonthInput(edu.endDate),
    });
    setIsPresent(present);
    setEditingId(edu.id);
    setIsAdding(false);
  };

  /** Shared date row used in both Add and Edit forms */
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
        Currently enrolled / ongoing
      </label>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Education
        </button>
      </div>

      {/* Existing Education Entries */}
      <div className="space-y-3">
        {profile?.education.map((edu) => (
          <div
            key={edu.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            {editingId === edu.id ? (
              /* Edit Form */
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.degree || ''}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="Degree & Major"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.institution || ''}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="Institution"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <DateRow />
                <input
                  type="text"
                  value={formData.gpa || ''}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  placeholder="GPA (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(edu.id)}
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
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.institution}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(edu)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(edu.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {edu.startDate} — {edu.endDate}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Form */}
      {isAdding && (
        <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
          <h4 className="font-semibold text-gray-900 mb-3">New Education</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.degree || ''}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              placeholder="Degree & Major (e.g., B.S. Computer Science)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={formData.institution || ''}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="Institution"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <DateRow />
            <input
              type="text"
              value={formData.gpa || ''}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              placeholder="GPA (optional, e.g., 3.85)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Education
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
