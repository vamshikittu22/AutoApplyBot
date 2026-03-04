/**
 * WorkExperienceEditor Component
 * Redesigned to use Taylor-inspired design system classes
 */

import { useState } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import type { WorkExperience } from '@/types/profile';
import { normalizeToMonthInput } from '@/lib/utils/date-utils';

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
        I currently work here
      </label>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Existing Experiences */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {profile?.workHistory.map((exp) => (
          <div key={exp.id} className="sortable-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', padding: '1.25rem' }}>
            {editingId === exp.id ? (
              /* Edit Form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-row form-row-2">
                  <div>
                    <label className="form-label">Position / Job Title</label>
                    <input
                      type="text"
                      value={formData.position || ''}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g., Senior Software Engineer"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      value={formData.company || ''}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g., Acme Corp"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <DateRow />

                <div>
                  <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                    Achievements & Responsibilities
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '4px' }}>(One per line)</span>
                  </label>
                  <textarea
                    value={(formData.achievements || []).join('\n')}
                    onChange={(e) => handleAchievementsChange(e.target.value)}
                    placeholder="• Developed new features using React...&#10;• Increased performance by 20%..."
                    className="form-input form-textarea"
                    style={{ minHeight: '120px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => handleUpdate(exp.id)} className="btn-primary" style={{ width: 'auto' }}>
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
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{exp.position}</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--primary-dark)', fontWeight: 600 }}>{exp.company}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(exp)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.89l12.683-12.683z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.862 4.487" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {exp.startDate} — {exp.endDate}
                </p>

                {exp.achievements && exp.achievements.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {exp.achievements.map((achievement, idx) => (
                      <li key={idx} style={{ lineHeight: 1.5 }}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Form */}
      {isAdding ? (
        <div className="content-card animate-in" style={{ padding: '1.25rem', border: '1.5px solid var(--primary-200)', background: 'var(--primary-50)' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-dark)' }}>Add New Experience</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-row form-row-2">
              <div>
                <label className="form-label">Position / Job Title</label>
                <input
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., Software Engineer"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Initech"
                  className="form-input"
                />
              </div>
            </div>
            
            <DateRow />

            <div>
              <label className="form-label" style={{ marginBottom: '0.25rem' }}>Achievements & Responsibilities</label>
              <textarea
                value={(formData.achievements || []).join('\n')}
                onChange={(e) => handleAchievementsChange(e.target.value)}
                placeholder="• Developed new features using React...&#10;• Increased performance by 20%..."
                className="form-input form-textarea"
                style={{ minHeight: '120px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={handleAdd} className="btn-primary" style={{ width: 'auto' }}>
                Save Experience
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
          Add Position
        </button>
      )}
    </div>
  );
}
