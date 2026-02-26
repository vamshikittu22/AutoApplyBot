import { describe, it, expect } from 'vitest';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import type { GenerateParams } from '@/types/ai';
import type { Profile } from '@/types/profile';

/**
 * Integration tests for real AI providers
 *
 * These tests are SKIPPED by default because they:
 * 1. Require valid API keys
 * 2. Cost money to run
 * 3. Depend on external services
 *
 * To run manually:
 * 1. Set OPENAI_API_KEY and ANTHROPIC_API_KEY environment variables
 * 2. Run: pnpm test src/lib/ai/providers/integration.test.ts
 * 3. Remove .skip from describe()
 */
describe.skip('Real AI Providers Integration', () => {
  const mockProfile: Profile = {
    personal: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '555-1234',
      location: 'San Francisco',
    },
    workHistory: [],
    education: [],
    skills: [
      { name: 'TypeScript', category: 'Programming' },
      { name: 'React', category: 'Programming' },
      { name: 'Node.js', category: 'Programming' },
    ],
    links: {},
    domainExtras: {},
    rolePreference: 'Tech',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const baseParams: GenerateParams = {
    question: 'Why do you want to work at our company?',
    userProfile: mockProfile,
    tone: 'professional',
    essayMode: false,
    role: 'tech',
  };

  describe('OpenAIProvider', () => {
    const apiKey = process.env.OPENAI_API_KEY;

    it('should validate correct API key', async () => {
      if (!apiKey) {
        console.warn('Skipping: OPENAI_API_KEY not set');
        return;
      }

      const provider = new OpenAIProvider(apiKey);
      const isValid = await provider.validateKey!(apiKey);

      expect(isValid).toBe(true);
    });

    it('should generate 3 distinct drafts', async () => {
      if (!apiKey) {
        console.warn('Skipping: OPENAI_API_KEY not set');
        return;
      }

      const provider = new OpenAIProvider(apiKey);
      const result = await provider.generateAnswer(baseParams);

      expect(result.drafts).toHaveLength(3);
      expect(result.provider).toBe('openai');

      // Check drafts are distinct
      expect(result.drafts[0]).not.toBe(result.drafts[1]);
      expect(result.drafts[1]).not.toBe(result.drafts[2]);
    });

    it('should include placeholders in drafts', async () => {
      if (!apiKey) {
        console.warn('Skipping: OPENAI_API_KEY not set');
        return;
      }

      const provider = new OpenAIProvider(apiKey);
      const result = await provider.generateAnswer(baseParams);

      // At least one draft should have placeholders
      const placeholderPattern = /\[.*?\]/;
      const hasPlaceholders = result.drafts.some((draft) => placeholderPattern.test(draft));

      expect(hasPlaceholders).toBe(true);
    });
  });

  describe('AnthropicProvider', () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    it('should validate correct API key', async () => {
      if (!apiKey) {
        console.warn('Skipping: ANTHROPIC_API_KEY not set');
        return;
      }

      const provider = new AnthropicProvider(apiKey);
      const isValid = await provider.validateKey!(apiKey);

      expect(isValid).toBe(true);
    });

    it('should generate 3 distinct drafts', async () => {
      if (!apiKey) {
        console.warn('Skipping: ANTHROPIC_API_KEY not set');
        return;
      }

      const provider = new AnthropicProvider(apiKey);
      const result = await provider.generateAnswer(baseParams);

      expect(result.drafts).toHaveLength(3);
      expect(result.provider).toBe('anthropic');

      // Check drafts are distinct
      expect(result.drafts[0]).not.toBe(result.drafts[1]);
      expect(result.drafts[1]).not.toBe(result.drafts[2]);
    });

    it('should include placeholders in drafts', async () => {
      if (!apiKey) {
        console.warn('Skipping: ANTHROPIC_API_KEY not set');
        return;
      }

      const provider = new AnthropicProvider(apiKey);
      const result = await provider.generateAnswer(baseParams);

      // At least one draft should have placeholders
      const placeholderPattern = /\[.*?\]/;
      const hasPlaceholders = result.drafts.some((draft) => placeholderPattern.test(draft));

      expect(hasPlaceholders).toBe(true);
    });
  });
});
