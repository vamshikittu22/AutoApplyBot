import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProfileStore } from '@/lib/store/profile-store';
import type { Profile } from '@/types/profile';

// Mock storage and parser
vi.mock('@/lib/storage/profile-storage', () => ({
  saveProfile: vi.fn().mockResolvedValue(undefined),
  loadProfile: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/parser/resume-parser', () => ({
  parseResume: vi.fn().mockResolvedValue({
    success: true,
    data: {
      profile: {
        personal: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-0100',
          location: 'San Francisco',
        },
        workHistory: [
          {
            id: '1',
            position: 'Software Engineer',
            company: 'Tech Corp',
            startDate: '2020-01',
            endDate: 'Present',
            achievements: ['Built features', 'Led team'],
          },
        ],
        education: [
          {
            id: '1',
            degree: 'B.S. Computer Science',
            institution: 'University',
            startDate: '2016-09',
            endDate: '2020-05',
            gpa: '3.8',
          },
        ],
        skills: [
          { name: 'React', category: 'technical' },
          { name: 'TypeScript', category: 'technical' },
        ],
        links: {},
        domainExtras: {},
        rolePreference: 'Tech',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      confidenceScores: [
        { field: 'personal.name', confidence: 95, source: 'text' },
        { field: 'personal.email', confidence: 90, source: 'text' },
      ],
      parseErrors: [],
      unparsedText: [],
    },
  }),
}));

describe('Profile Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useProfileStore.setState({
      profile: null,
      confidenceScores: [],
      isLoading: false,
      isSaving: false,
      isParsing: false,
      error: null,
      lastSaved: null,
    });
  });

  describe('initialization', () => {
    it('should initialize with null profile', () => {
      const { profile } = useProfileStore.getState();
      expect(profile).toBeNull();
    });

    it('should initialize with empty confidence scores', () => {
      const { confidenceScores } = useProfileStore.getState();
      expect(confidenceScores).toEqual([]);
    });

    it('should initialize with all UI states false', () => {
      const { isLoading, isSaving, isParsing } = useProfileStore.getState();
      expect(isLoading).toBe(false);
      expect(isSaving).toBe(false);
      expect(isParsing).toBe(false);
    });
  });

  describe('work experience actions', () => {
    beforeEach(() => {
      // Set up profile with empty work history
      useProfileStore.setState({
        profile: {
          personal: { name: 'Test', email: 'test@test.com', phone: '555', location: '' },
          workHistory: [],
          education: [],
          skills: [],
          links: {},
          domainExtras: {},
          rolePreference: 'Other',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    it('should add work experience', () => {
      const store = useProfileStore.getState();

      store.addWorkExperience({
        position: 'Engineer',
        company: 'ACME',
        startDate: '2020-01',
        endDate: 'Present',
        achievements: ['Built app'],
      });

      const profile = useProfileStore.getState().profile;
      expect(profile?.workHistory).toHaveLength(1);
      expect(profile?.workHistory[0].position).toBe('Engineer');
      expect(profile?.workHistory[0].id).toBeDefined();
    });

    it('should update work experience', () => {
      const store = useProfileStore.getState();

      // Add first
      store.addWorkExperience({
        position: 'Engineer',
        company: 'ACME',
        startDate: '2020-01',
        endDate: 'Present',
        achievements: [],
      });

      const workId = useProfileStore.getState().profile?.workHistory[0].id!;

      // Update
      store.updateWorkExperience(workId, { position: 'Senior Engineer' });

      const profile = useProfileStore.getState().profile;
      expect(profile?.workHistory[0].position).toBe('Senior Engineer');
      expect(profile?.workHistory[0].company).toBe('ACME'); // Other fields unchanged
    });

    it('should delete work experience', () => {
      const store = useProfileStore.getState();

      // Add two entries
      store.addWorkExperience({
        position: 'Engineer',
        company: 'ACME',
        startDate: '2020-01',
        endDate: 'Present',
        achievements: [],
      });
      store.addWorkExperience({
        position: 'Intern',
        company: 'StartupCo',
        startDate: '2019-06',
        endDate: '2019-12',
        achievements: [],
      });

      const firstId = useProfileStore.getState().profile?.workHistory[0].id!;

      // Delete first entry
      store.deleteWorkExperience(firstId);

      const profile = useProfileStore.getState().profile;
      expect(profile?.workHistory).toHaveLength(1);
      expect(profile?.workHistory[0].company).toBe('StartupCo');
    });
  });

  describe('education actions', () => {
    beforeEach(() => {
      useProfileStore.setState({
        profile: {
          personal: { name: 'Test', email: 'test@test.com', phone: '555', location: '' },
          workHistory: [],
          education: [],
          skills: [],
          links: {},
          domainExtras: {},
          rolePreference: 'Other',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    it('should add education', () => {
      const store = useProfileStore.getState();

      store.addEducation({
        degree: 'B.S. CS',
        institution: 'University',
        startDate: '2016-09',
        endDate: '2020-05',
        gpa: '3.8',
      });

      const profile = useProfileStore.getState().profile;
      expect(profile?.education).toHaveLength(1);
      expect(profile?.education[0].degree).toBe('B.S. CS');
      expect(profile?.education[0].id).toBeDefined();
    });

    it('should update education', () => {
      const store = useProfileStore.getState();

      store.addEducation({
        degree: 'B.S. CS',
        institution: 'University',
        startDate: '2016-09',
        endDate: '2020-05',
        gpa: '3.5',
      });

      const eduId = useProfileStore.getState().profile?.education[0].id!;

      store.updateEducation(eduId, { gpa: '3.8' });

      const profile = useProfileStore.getState().profile;
      expect(profile?.education[0].gpa).toBe('3.8');
    });

    it('should delete education', () => {
      const store = useProfileStore.getState();

      store.addEducation({
        degree: 'B.S. CS',
        institution: 'University',
        startDate: '2016-09',
        endDate: '2020-05',
      });

      const eduId = useProfileStore.getState().profile?.education[0].id!;

      store.deleteEducation(eduId);

      const profile = useProfileStore.getState().profile;
      expect(profile?.education).toHaveLength(0);
    });
  });

  describe('skills actions', () => {
    beforeEach(() => {
      useProfileStore.setState({
        profile: {
          personal: { name: 'Test', email: 'test@test.com', phone: '555', location: '' },
          workHistory: [],
          education: [],
          skills: [],
          links: {},
          domainExtras: {},
          rolePreference: 'Other',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    it('should add skill', () => {
      const store = useProfileStore.getState();

      store.addSkill({ name: 'React', category: 'technical' });

      const profile = useProfileStore.getState().profile;
      expect(profile?.skills).toHaveLength(1);
      expect(profile?.skills[0].name).toBe('React');
    });

    it('should prevent duplicate skills (case-insensitive)', () => {
      const store = useProfileStore.getState();

      store.addSkill({ name: 'React', category: 'technical' });
      store.addSkill({ name: 'react', category: 'technical' }); // Duplicate
      store.addSkill({ name: 'REACT', category: 'technical' }); // Duplicate

      const profile = useProfileStore.getState().profile;
      expect(profile?.skills).toHaveLength(1);
    });

    it('should delete skill', () => {
      const store = useProfileStore.getState();

      store.addSkill({ name: 'React', category: 'technical' });
      store.addSkill({ name: 'Vue', category: 'technical' });

      store.deleteSkill('React');

      const profile = useProfileStore.getState().profile;
      expect(profile?.skills).toHaveLength(1);
      expect(profile?.skills[0].name).toBe('Vue');
    });
  });

  describe('parseResume action', () => {
    it('should parse resume and update profile', async () => {
      const store = useProfileStore.getState();

      await store.parseResume('Sample resume text...');

      const { profile, confidenceScores } = useProfileStore.getState();
      expect(profile).toBeTruthy();
      expect(profile?.personal.name).toBe('John Doe');
      expect(profile?.workHistory).toHaveLength(1);
      expect(profile?.education).toHaveLength(1);
      expect(profile?.skills).toHaveLength(2);
      expect(confidenceScores).toHaveLength(2);
    });

    it('should set isParsing state during parse', async () => {
      const store = useProfileStore.getState();

      const parsePromise = store.parseResume('Sample resume...');

      // Check immediately (should be parsing)
      expect(useProfileStore.getState().isParsing).toBe(true);

      await parsePromise;

      // After completion
      expect(useProfileStore.getState().isParsing).toBe(false);
    });
  });

  describe('personal info actions', () => {
    beforeEach(() => {
      useProfileStore.setState({
        profile: {
          personal: { name: 'Test', email: 'test@test.com', phone: '555', location: '' },
          workHistory: [],
          education: [],
          skills: [],
          links: {},
          domainExtras: {},
          rolePreference: 'Other',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    it('should update personal info', () => {
      const store = useProfileStore.getState();

      store.updatePersonal({ name: 'Jane Doe', location: 'NYC' });

      const profile = useProfileStore.getState().profile;
      expect(profile?.personal.name).toBe('Jane Doe');
      expect(profile?.personal.location).toBe('NYC');
      expect(profile?.personal.email).toBe('test@test.com'); // Unchanged
    });
  });

  describe('role preference', () => {
    beforeEach(() => {
      useProfileStore.setState({
        profile: {
          personal: { name: 'Test', email: 'test@test.com', phone: '555', location: '' },
          workHistory: [],
          education: [],
          skills: [],
          links: {},
          domainExtras: {},
          rolePreference: 'Other',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    it('should set role preference', () => {
      const store = useProfileStore.getState();

      store.setRolePreference('Tech');

      const profile = useProfileStore.getState().profile;
      expect(profile?.rolePreference).toBe('Tech');
    });
  });

  describe('resetProfile', () => {
    it('should reset profile to null', () => {
      useProfileStore.setState({
        profile: {
          personal: { name: 'Test', email: 'test@test.com', phone: '555', location: '' },
          workHistory: [],
          education: [],
          skills: [],
          links: {},
          domainExtras: {},
          rolePreference: 'Other',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        confidenceScores: [{ field: 'test', confidence: 80, source: 'text' }],
      });

      const store = useProfileStore.getState();
      store.resetProfile();

      const state = useProfileStore.getState();
      expect(state.profile).toBeNull();
      expect(state.confidenceScores).toEqual([]);
    });
  });
});
