import { describe, it, expect, vi } from 'vitest';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';

describe('Provider Error Handling', () => {
  describe('OpenAIProvider', () => {
    it('should handle rate limit errors', async () => {
      const provider = new OpenAIProvider('test-key');

      // Mock client to throw rate limit error
      vi.spyOn(provider['client'].chat.completions, 'create').mockRejectedValue({
        status: 429,
        message: 'Rate limit exceeded',
      });

      await expect(
        provider.generateAnswer({
          question: 'Test',
          userProfile: {} as any,
          tone: 'professional',
          essayMode: false,
          role: 'tech',
        })
      ).rejects.toThrow('Rate limit reached');
    });

    it('should handle invalid API key errors', async () => {
      const provider = new OpenAIProvider('invalid-key');

      vi.spyOn(provider['client'].chat.completions, 'create').mockRejectedValue({
        status: 401,
        message: 'Invalid API key',
      });

      await expect(
        provider.generateAnswer({
          question: 'Test',
          userProfile: {} as any,
          tone: 'professional',
          essayMode: false,
          role: 'tech',
        })
      ).rejects.toThrow('Invalid API key');
    });
  });

  describe('AnthropicProvider', () => {
    it('should handle rate limit errors', async () => {
      const provider = new AnthropicProvider('test-key');

      vi.spyOn(provider['client'].messages, 'create').mockRejectedValue({
        status: 429,
        message: 'Rate limit exceeded',
      });

      await expect(
        provider.generateAnswer({
          question: 'Test',
          userProfile: {} as any,
          tone: 'professional',
          essayMode: false,
          role: 'tech',
        })
      ).rejects.toThrow('Rate limit reached');
    });

    it('should handle invalid API key errors', async () => {
      const provider = new AnthropicProvider('invalid-key');

      vi.spyOn(provider['client'].messages, 'create').mockRejectedValue({
        status: 401,
        message: 'Invalid API key',
      });

      await expect(
        provider.generateAnswer({
          question: 'Test',
          userProfile: {} as any,
          tone: 'professional',
          essayMode: false,
          role: 'tech',
        })
      ).rejects.toThrow('Invalid API key');
    });
  });
});
