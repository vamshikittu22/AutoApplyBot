import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAIConfig,
  setAIProvider,
  saveAPIKey,
  getAPIKey,
  clearAPIKey,
  hasValidKey,
  getActiveProvider,
} from './config';

// Mock Chrome Storage API
const mockStorage: Record<string, any> = {};

beforeEach(() => {
  // Clear mock storage before each test
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);

  // Mock chrome.storage.local
  global.chrome = {
    storage: {
      local: {
        get: vi.fn((keys) => {
          const result: Record<string, any> = {};
          const keyArray = Array.isArray(keys) ? keys : [keys];
          keyArray.forEach((key) => {
            if (mockStorage[key] !== undefined) {
              result[key] = mockStorage[key];
            }
          });
          return Promise.resolve(result);
        }),
        set: vi.fn((items) => {
          Object.assign(mockStorage, items);
          return Promise.resolve();
        }),
      },
    },
  } as any;
});

describe('AI Configuration', () => {
  describe('getAIConfig', () => {
    it('should return default config when no config exists', async () => {
      const config = await getAIConfig();

      expect(config.provider).toBe('mock');
      expect(config.lastUsedProvider).toBe('mock');
    });

    it('should return stored config when exists', async () => {
      const storedConfig = {
        provider: 'openai' as const,
        openaiKey: 'test-key',
        openaiValidatedAt: Date.now(),
        lastUsedProvider: 'openai' as const,
      };
      mockStorage.ai_config = storedConfig;

      const config = await getAIConfig();

      expect(config.provider).toBe('openai');
      expect(config.openaiKey).toBe('test-key');
    });

    it('should save default config on first load', async () => {
      await getAIConfig();

      expect(mockStorage.ai_config).toEqual({
        provider: 'mock',
        lastUsedProvider: 'mock',
      });
    });
  });

  describe('setAIProvider', () => {
    it('should update provider and lastUsedProvider', async () => {
      await setAIProvider('openai');

      const config = mockStorage.ai_config;
      expect(config.provider).toBe('openai');
      expect(config.lastUsedProvider).toBe('openai');
    });

    it('should preserve existing config when updating provider', async () => {
      mockStorage.ai_config = {
        provider: 'mock',
        openaiKey: 'existing-key',
        openaiValidatedAt: 12345,
      };

      await setAIProvider('anthropic');

      const config = mockStorage.ai_config;
      expect(config.provider).toBe('anthropic');
      expect(config.openaiKey).toBe('existing-key');
      expect(config.openaiValidatedAt).toBe(12345);
    });
  });

  describe('saveAPIKey', () => {
    it('should save OpenAI key with validation timestamp', async () => {
      const validatedAt = Date.now();

      await saveAPIKey('openai', 'sk-test-key', validatedAt);

      const config = mockStorage.ai_config;
      expect(config.openaiKey).toBe('sk-test-key');
      expect(config.openaiValidatedAt).toBe(validatedAt);
    });

    it('should save Anthropic key with validation timestamp', async () => {
      const validatedAt = Date.now();

      await saveAPIKey('anthropic', 'sk-ant-test-key', validatedAt);

      const config = mockStorage.ai_config;
      expect(config.anthropicKey).toBe('sk-ant-test-key');
      expect(config.anthropicValidatedAt).toBe(validatedAt);
    });

    it('should preserve other provider keys when saving', async () => {
      const validatedAt = Date.now();
      mockStorage.ai_config = {
        provider: 'mock',
        anthropicKey: 'existing-anthropic-key',
        anthropicValidatedAt: 12345,
      };

      await saveAPIKey('openai', 'sk-test-key', validatedAt);

      const config = mockStorage.ai_config;
      expect(config.openaiKey).toBe('sk-test-key');
      expect(config.anthropicKey).toBe('existing-anthropic-key');
    });
  });

  describe('getAPIKey', () => {
    it('should return OpenAI key when exists', async () => {
      mockStorage.ai_config = {
        provider: 'openai',
        openaiKey: 'sk-test-key',
      };

      const key = await getAPIKey('openai');

      expect(key).toBe('sk-test-key');
    });

    it('should return null when OpenAI key does not exist', async () => {
      mockStorage.ai_config = {
        provider: 'mock',
      };

      const key = await getAPIKey('openai');

      expect(key).toBeNull();
    });

    it('should return Anthropic key when exists', async () => {
      mockStorage.ai_config = {
        provider: 'anthropic',
        anthropicKey: 'sk-ant-test-key',
      };

      const key = await getAPIKey('anthropic');

      expect(key).toBe('sk-ant-test-key');
    });
  });

  describe('clearAPIKey', () => {
    it('should clear OpenAI key and switch to mock if active', async () => {
      mockStorage.ai_config = {
        provider: 'openai',
        openaiKey: 'test-key',
        openaiValidatedAt: Date.now(),
      };

      await clearAPIKey('openai');

      const config = mockStorage.ai_config;
      expect(config.provider).toBe('mock');
      expect(config.openaiKey).toBeUndefined();
      expect(config.openaiValidatedAt).toBeUndefined();
    });

    it('should not switch provider if OpenAI was not active', async () => {
      mockStorage.ai_config = {
        provider: 'anthropic',
        openaiKey: 'test-key',
        openaiValidatedAt: Date.now(),
        anthropicKey: 'other-key',
      };

      await clearAPIKey('openai');

      const config = mockStorage.ai_config;
      expect(config.provider).toBe('anthropic');
      expect(config.openaiKey).toBeUndefined();
    });

    it('should clear Anthropic key and switch to mock if active', async () => {
      mockStorage.ai_config = {
        provider: 'anthropic',
        anthropicKey: 'test-key',
        anthropicValidatedAt: Date.now(),
      };

      await clearAPIKey('anthropic');

      const config = mockStorage.ai_config;
      expect(config.provider).toBe('mock');
      expect(config.anthropicKey).toBeUndefined();
    });
  });

  describe('hasValidKey', () => {
    it('should return true when key and validation exist for OpenAI', async () => {
      mockStorage.ai_config = {
        openaiKey: 'test-key',
        openaiValidatedAt: Date.now(),
      };

      const result = await hasValidKey('openai');

      expect(result).toBe(true);
    });

    it('should return false when key missing for OpenAI', async () => {
      mockStorage.ai_config = {
        openaiValidatedAt: Date.now(),
      };

      const result = await hasValidKey('openai');

      expect(result).toBe(false);
    });

    it('should return false when validation timestamp missing for OpenAI', async () => {
      mockStorage.ai_config = {
        openaiKey: 'test-key',
      };

      const result = await hasValidKey('openai');

      expect(result).toBe(false);
    });

    it('should return true when key and validation exist for Anthropic', async () => {
      mockStorage.ai_config = {
        anthropicKey: 'test-key',
        anthropicValidatedAt: Date.now(),
      };

      const result = await hasValidKey('anthropic');

      expect(result).toBe(true);
    });
  });

  describe('getActiveProvider', () => {
    it('should return current provider', async () => {
      mockStorage.ai_config = {
        provider: 'openai',
      };

      const provider = await getActiveProvider();

      expect(provider).toBe('openai');
    });

    it('should return mock as default provider', async () => {
      const provider = await getActiveProvider();

      expect(provider).toBe('mock');
    });
  });
});
