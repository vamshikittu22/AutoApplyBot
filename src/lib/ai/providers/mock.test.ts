import { describe, it, expect } from 'vitest';
import { MockProvider } from './mock';
import type { GenerateParams } from '@/types/ai';
import type { Profile } from '@/types/profile';

describe('MockProvider', () => {
  const mockProfile: Profile = {
    personal: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '555-1234',
      location: 'Test City',
    },
    workHistory: [],
    education: [],
    skills: [],
    links: {},
    domainExtras: {},
    rolePreference: 'Tech',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const provider = new MockProvider();

  describe('generateAnswer', () => {
    it('should return 3 drafts for short answer', async () => {
      const params: GenerateParams = {
        question: 'Why do you want this role?',
        userProfile: mockProfile,
        tone: 'professional',
        essayMode: false,
        role: 'tech',
      };

      const result = await provider.generateAnswer(params);

      expect(result.drafts).toHaveLength(3);
      expect(result.provider).toBe('mock');
      expect(result.metadata.essayMode).toBe(false);
    });

    it('should return STAR outlines for essay mode', async () => {
      const params: GenerateParams = {
        question: 'Describe a challenging project',
        userProfile: mockProfile,
        tone: 'professional',
        essayMode: true,
        role: 'tech',
      };

      const result = await provider.generateAnswer(params);

      expect(result.drafts).toHaveLength(3);
      expect(result.drafts[0]).toContain('**Situation:**');
      expect(result.drafts[0]).toContain('**Task:**');
      expect(result.drafts[0]).toContain('**Action:**');
      expect(result.drafts[0]).toContain('**Result:**');
      expect(result.metadata.essayMode).toBe(true);
    });

    it('should include placeholders in all drafts', async () => {
      const params: GenerateParams = {
        question: 'What is your greatest strength?',
        userProfile: mockProfile,
        tone: 'professional',
        essayMode: false,
        role: 'tech',
      };

      const result = await provider.generateAnswer(params);

      // All drafts should have placeholders in brackets
      const placeholderPattern = /\[.*?\]/;
      result.drafts.forEach((draft) => {
        expect(draft).toMatch(placeholderPattern);
      });
    });

    it('should include role-specific content for tech role', async () => {
      const params: GenerateParams = {
        question: 'What technologies do you use?',
        userProfile: mockProfile,
        tone: 'professional',
        essayMode: false,
        role: 'tech',
      };

      const result = await provider.generateAnswer(params);

      // Should contain tech-specific placeholders
      const allDrafts = result.drafts.join(' ');
      expect(
        allDrafts.includes('technology') ||
          allDrafts.includes('framework') ||
          allDrafts.includes('engineering')
      ).toBe(true);
    });

    it('should simulate realistic delay', async () => {
      const params: GenerateParams = {
        question: 'Test question',
        userProfile: mockProfile,
        tone: 'professional',
        essayMode: false,
        role: 'tech',
      };

      const start = Date.now();
      await provider.generateAnswer(params);
      const duration = Date.now() - start;

      // Should take 300-600ms
      expect(duration).toBeGreaterThanOrEqual(300);
      expect(duration).toBeLessThan(700);
    });
  });

  describe('validateKey', () => {
    it('should always return true for mock provider', async () => {
      const result = await provider.validateKey();
      expect(result).toBe(true);
    });
  });
});
