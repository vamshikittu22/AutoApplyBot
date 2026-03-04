/**
 * EducationEditor Component
 * Redesigned to use Taylor-inspired design system classes
 */

import { useState } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import type { Education } from '@/types/profile';
import { normalizeToMonthInput } from '@/lib/utils/date-utils';

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

  const DateRow = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div className="form-row form-row-2">
        <div>
          <label className="form-label">Start Date</label>
          <input
            type="month"
            value={formData.startDate || ''}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">End Date</label>
          <input
            type="month"
            value={isPresent ? '' : (formData.endDate || '')}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            disabled={isPresent}
            className="form-input"
            style={{ opacity: isPresent ? 0.6 : 1 }}
          />
        </div>
      </div>
      <label className="checkbox-toggle" style={{ marginTop: '0.25rem' }}>
        <input
          type="checkbox"
          checked={isPresent}
          onChange={(e) => {
            setIsPresent(e.target.checked);
            if (e.target.checked) setFormData({ ...formData, endDate: '' });
          }}
        />
        Currently enrolled / ongoing
      </label>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Existing Education Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {profile?.education.map((edu) => (
          <div key={edu.id} className="sortable-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', padding: '1.25rem' }}>
            {editingId === edu.id ? (
              /* Edit Form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-row form-row-2">
                  <div>
                    <label className="form-label">Degree & Major</label>
                    <input
                      type="text"
                      value={formData.degree || ''}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      placeholder="e.g., B.S. Computer Science"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Institution</label>
                    <input
                      type="text"
                      value={formData.institution || ''}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      placeholder="e.g., University of AutoApply"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <DateRow />
                
                <div>
                  <label className="form-label">GPA (Optional)</label>
                  <input
                    type="text"
                    value={formData.gpa || ''}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    placeholder="e.g., 3.85 / 4.0"
                    className="form-input"
                    style={{ maxWidth: '200px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => handleUpdate(edu.id)} className="btn-primary" style={{ width: 'auto' }}>
                    Save Changes
                  </button>
                  <button onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{edu.degree}</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--primary-dark)', fontWeight: 600 }}>{edu.institution}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(edu)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.89l12.683-12.683z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.862 4.487" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(edu.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {edu.startDate} — {edu.endDate}
                  </p>
                  {edu.gpa && (
                    <span className="badge badge-free">GPA: {edu.gpa}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Form */}
      {isAdding ? (
        <div className="content-card animate-in" style={{ padding: '1.25rem', border: '1.5px solid var(--primary-200)', background: 'var(--primary-50)' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-dark)' }}>Add Education</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-row form-row-2">
              <div>
                <label className="form-label">Degree & Major</label>
                <input
                  type="text"
                  value={formData.degree || ''}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g., M.S. Data Science"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Institution</label>
                <input
                  type="text"
                  value={formData.institution || ''}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="e.g., Stanford University"
                  className="form-input"
                />
              </div>
            </div>
            
            <DateRow />
            
            <div>
              <label className="form-label">GPA (Optional)</label>
              <input
                type="text"
                value={formData.gpa || ''}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                placeholder="e.g., 3.85 / 4.0"
                className="form-input"
                style={{ maxWidth: '200px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={handleAdd} className="btn-primary" style={{ width: 'auto' }}>
                Save Education
              </button>
              <button onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="upload-area"
          style={{ width: '100%', borderStyle: 'dashed' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Education
        </button>
      )}
    </div>
  );
}
