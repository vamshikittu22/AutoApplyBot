/**
 * Profile Zustand Store
 *
 * Manages profile state throughout the extension. Integrates with:
 * - Resume parser (parseResume from Plan 02) for resume text → profile data
 * - Profile storage (saveProfile/loadProfile from Plan 03) for persistence
 *
 * State includes profile data, confidence scores, and UI states (loading/saving/parsing).
 * All CRUD operations for work experience, education, and skills are handled here.
 */

import { create } from 'zustand';
import type { Profile, WorkExperience, Education, Skill, RolePreference } from '@/types/profile';
import type { FieldConfidence } from '@/types/resume';
import { parseResume as parseResumeUtil } from '@/lib/parser/resume-parser';
import {
  saveProfile as saveProfileUtil,
  loadProfile as loadProfileUtil,
} from '@/lib/storage/profile-storage';
import { createEmptyProfile } from '@/constants/profile-schema';

interface ProfileState {
  // Data
  profile: Profile | null;
  confidenceScores: FieldConfidence[];

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  isParsing: boolean;
  error: string | null;
  lastSaved: string | null;

  // Actions
  loadProfile: () => Promise<void>;
  saveProfile: () => Promise<void>;
  parseResume: (resumeText: string) => Promise<void>;

  // Personal info
  updatePersonal: (updates: Partial<Profile['personal']>) => void;

  // Work experience
  addWorkExperience: (experience: Omit<WorkExperience, 'id'>) => void;
  updateWorkExperience: (id: string, updates: Partial<WorkExperience>) => void;
  deleteWorkExperience: (id: string) => void;

  // Education
  addEducation: (education: Omit<Education, 'id'>) => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  deleteEducation: (id: string) => void;

  // Skills
  addSkill: (skill: Skill) => void;
  deleteSkill: (skillName: string) => void;

  // Role preference
  setRolePreference: (role: RolePreference) => void;

  // Domain extras
  updateDomainExtras: (updates: Partial<Profile['domainExtras']>) => void;

  // Reset
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  profile: null,
  confidenceScores: [],
  isLoading: false,
  isSaving: false,
  isParsing: false,
  error: null,
  lastSaved: null,

  /**
   * Load profile from Chrome Storage
   *
   * Fetches profile from encrypted storage using profile-storage.ts.
   * Sets isLoading state during fetch.
   */
  loadProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await loadProfileUtil();
      set({ profile, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load profile',
        isLoading: false,
      });
    }
  },

  /**
   * Save profile to Chrome Storage
   *
   * Persists current profile state to encrypted storage.
   * Updates updatedAt timestamp and lastSaved timestamp.
   */
  saveProfile: async () => {
    const { profile } = get();
    if (!profile) {
      set({ error: 'No profile to save' });
      return;
    }

    set({ isSaving: true, error: null });
    try {
      const updatedProfile: Profile = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      await saveProfileUtil(updatedProfile);
      set({
        profile: updatedProfile,
        isSaving: false,
        lastSaved: new Date().toISOString(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save profile',
        isSaving: false,
      });
    }
  },

  /**
   * Parse resume text into profile data
   *
   * Uses resume-parser.ts to extract structured data from pasted resume.
   * Merges parsed data with empty profile structure.
   * Auto-saves after successful parse.
   * Stores confidence scores for UI highlighting.
   */
  parseResume: async (resumeText: string) => {
    set({ isParsing: true, error: null });
    try {
      const result = await parseResumeUtil(resumeText);

      if (!result.success) {
        set({
          error: result.error || 'Failed to parse resume',
          isParsing: false,
        });
        return;
      }

      const { profile: parsedProfile, confidenceScores } = result.data;

      // Merge parsed data with empty profile structure
      const profile: Profile = {
        ...createEmptyProfile(),
        ...parsedProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set({
        profile,
        confidenceScores,
        isParsing: false,
      });

      // Auto-save after successful parse
      await get().saveProfile();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to parse resume',
        isParsing: false,
      });
    }
  },

  /**
   * Update personal information fields
   *
   * Partial update - only changes provided fields.
   */
  updatePersonal: (updates) => {
    const { profile } = get();
    if (!profile) return;

    set({
      profile: {
        ...profile,
        personal: { ...profile.personal, ...updates },
      },
    });
  },

  /**
   * Add new work experience entry
   *
   * Generates unique ID using crypto.randomUUID().
   */
  addWorkExperience: (experience) => {
    const { profile } = get();
    if (!profile) return;

    const newExperience: WorkExperience = {
      ...experience,
      id: crypto.randomUUID(),
    };

    set({
      profile: {
        ...profile,
        workHistory: [...profile.workHistory, newExperience],
      },
    });
  },

  /**
   * Update existing work experience entry
   *
   * Partial update - only changes provided fields.
   */
  updateWorkExperience: (id, updates) => {
    const { profile } = get();
    if (!profile) return;

    set({
      profile: {
        ...profile,
        workHistory: profile.workHistory.map((exp) =>
          exp.id === id ? { ...exp, ...updates } : exp
        ),
      },
    });
  },

  /**
   * Delete work experience entry by ID
   */
  deleteWorkExperience: (id) => {
    const { profile } = get();
    if (!profile) return;

    set({
      profile: {
        ...profile,
        workHistory: profile.workHistory.filter((exp) => exp.id !== id),
      },
    });
  },

  /**
   * Add new education entry
   *
   * Generates unique ID using crypto.randomUUID().
   */
  addEducation: (education) => {
    const { profile } = get();
    if (!profile) return;

    const newEducation: Education = {
      ...education,
      id: crypto.randomUUID(),
    };

    set({
      profile: {
        ...profile,
        education: [...profile.education, newEducation],
      },
    });
  },

  /**
   * Update existing education entry
   *
   * Partial update - only changes provided fields.
   */
  updateEducation: (id, updates) => {
    const { profile } = get();
    if (!profile) return;

    set({
      profile: {
        ...profile,
        education: profile.education.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu)),
      },
    });
  },

  /**
   * Delete education entry by ID
   */
  deleteEducation: (id) => {
    const { profile } = get();
    if (!profile) return;

    set({
      profile: {
        ...profile,
        education: profile.education.filter((edu) => edu.id !== id),
      },
    });
  },

  /**
   * Add new skill
   *
   * Prevents duplicate skills (case-insensitive comparison).
   */
  addSkill: (skill) => {
    const { profile } = get();
    if (!profile) return;

    // Prevent duplicates
    const exists = profile.skills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase());
    if (exists) return;

    set({
      profile: {
        ...profile,
        skills: [...profile.skills, skill],
      },
    });
  },

  /**
   * Delete skill by name
   */
  deleteSkill: (skillName) => {
    const { profile } = get();
    if (!profile) return;

    set({
      profile: {
        ...profile,
        skills: profile.skills.filter((s) => s.name !== skillName),
      },
    });
  },

  /**
   * Set role preference (Tech/Healthcare/Finance/etc)
   *
   * Affects which domain-specific fields are shown in UI (REQ-PRO-04).
   */
  setRolePreference: (role) => {
    const { profile } = get();
    if (!profile) return;

    set({
      profile: {
        ...profile,
        rolePreference: role,
      },
    });
  },

  /**
   * Update domain-specific extras
   *
   * Partial update - only changes provided fields.
   */
  updateDomainExtras: (updates) => {
    const { profile } = get();
    if (!profile) return;

    set({
      profile: {
        ...profile,
        domainExtras: { ...profile.domainExtras, ...updates },
      },
    });
  },

  /**
   * Reset profile to null
   *
   * Clears all profile data and confidence scores.
   */
  resetProfile: () => {
    set({
      profile: null,
      confidenceScores: [],
      error: null,
      lastSaved: null,
    });
  },
}));
