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
import { encryptData } from '@/lib/storage/encryption';

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
      const encryptedKey = await encryptData('test-key');
      const storedConfig = {
        provider: 'openai' as const,
        openaiKey: encryptedKey,
        openaiValidatedAt: Date.now(),
        lastUsedProvider: 'openai' as const,
      };
      mockStorage.ai_config = storedConfig;

      const config = await getAIConfig();

      expect(config.provider).toBe('openai');
      expect(config.openaiKey).toBe(encryptedKey);
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
    it('should store API key in encrypted format', async () => {
      const validatedAt = Date.now();
      const plainKey = 'sk-test-key-plain';

      await saveAPIKey('openai', plainKey, validatedAt);

      const config = mockStorage.ai_config;

      // Stored key should NOT be plain text
      expect(config.openaiKey).not.toBe(plainKey);

      // Stored key should match encryption format (base64:base64)
      expect(config.openaiKey).toMatch(/^[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*$/);

      // Should contain colon separator
      expect(config.openaiKey).toContain(':');

      // Validation timestamp should be saved
      expect(config.openaiValidatedAt).toBe(validatedAt);
    });

    it('should save OpenAI key with validation timestamp', async () => {
      const validatedAt = Date.now();

      await saveAPIKey('openai', 'sk-test-key', validatedAt);

      const config = mockStorage.ai_config;
      expect(config.openaiKey).toBeDefined();
      expect(config.openaiKey).toMatch(/^[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*$/);
      expect(config.openaiValidatedAt).toBe(validatedAt);
    });

    it('should save Anthropic key with validation timestamp', async () => {
      const validatedAt = Date.now();

      await saveAPIKey('anthropic', 'sk-ant-test-key', validatedAt);

      const config = mockStorage.ai_config;
      expect(config.anthropicKey).toBeDefined();
      expect(config.anthropicKey).toMatch(/^[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*$/);
      expect(config.anthropicValidatedAt).toBe(validatedAt);
    });

    it('should preserve other provider keys when saving', async () => {
      const validatedAt = Date.now();
      const existingEncrypted = await encryptData('existing-anthropic-key');

      mockStorage.ai_config = {
        provider: 'mock',
        anthropicKey: existingEncrypted,
        anthropicValidatedAt: 12345,
      };

      await saveAPIKey('openai', 'sk-test-key', validatedAt);

      const config = mockStorage.ai_config;
      expect(config.openaiKey).toBeDefined();
      expect(config.openaiKey).toMatch(/^[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*$/);
      expect(config.anthropicKey).toBe(existingEncrypted);
    });
  });

  describe('getAPIKey', () => {
    it('should return decrypted OpenAI key when exists', async () => {
      const plainKey = 'sk-test-key-plain';
      const encryptedKey = await encryptData(plainKey);

      mockStorage.ai_config = {
        provider: 'openai',
        openaiKey: encryptedKey,
      };

      const key = await getAPIKey('openai');

      expect(key).toBe(plainKey);
    });

    it('should return null when OpenAI key does not exist', async () => {
      mockStorage.ai_config = {
        provider: 'mock',
      };

      const key = await getAPIKey('openai');

      expect(key).toBeNull();
    });

    it('should return decrypted Anthropic key when exists', async () => {
      const plainKey = 'sk-ant-test-key-plain';
      const encryptedKey = await encryptData(plainKey);

      mockStorage.ai_config = {
        provider: 'anthropic',
        anthropicKey: encryptedKey,
      };

      const key = await getAPIKey('anthropic');

      expect(key).toBe(plainKey);
    });

    it('should return null for corrupted encrypted data', async () => {
      mockStorage.ai_config = {
        provider: 'openai',
        openaiKey: 'corrupted-not-valid-format',
      };

      const key = await getAPIKey('openai');

      expect(key).toBeNull();
    });

    it('should handle decryption failure gracefully', async () => {
      mockStorage.ai_config = {
        provider: 'anthropic',
        anthropicKey: 'invalid:base64:format',
      };

      const key = await getAPIKey('anthropic');

      expect(key).toBeNull();
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

  describe('Round-trip encryption', () => {
    it('should encrypt on save and decrypt on get for OpenAI', async () => {
      const originalKey = 'sk-proj-abc123def456ghi789';
      const validatedAt = Date.now();

      await saveAPIKey('openai', originalKey, validatedAt);
      const retrievedKey = await getAPIKey('openai');

      expect(retrievedKey).toBe(originalKey);
    });

    it('should encrypt on save and decrypt on get for Anthropic', async () => {
      const originalKey = 'sk-ant-api03-xyz789abc123';
      const validatedAt = Date.now();

      await saveAPIKey('anthropic', originalKey, validatedAt);
      const retrievedKey = await getAPIKey('anthropic');

      expect(retrievedKey).toBe(originalKey);
    });
  });

  describe('Migration scenario', () => {
    it('should return null for old plain-text keys (migration)', async () => {
      // Simulate old storage format (plain text, no encryption)
      mockStorage.ai_config = {
        provider: 'openai',
        openaiKey: 'sk-old-plain-text-key',
        openaiValidatedAt: Date.now(),
      };

      // getAPIKey should fail to decrypt plain text and return null
      const key = await getAPIKey('openai');

      expect(key).toBeNull();
    });

    it('should accept new encrypted key after migration', async () => {
      // User had old plain-text key (returns null)
      mockStorage.ai_config = {
        provider: 'openai',
        openaiKey: 'sk-old-plain-text-key',
        openaiValidatedAt: Date.now(),
      };

      const oldKey = await getAPIKey('openai');
      expect(oldKey).toBeNull();

      // User re-enters key (saves as encrypted)
      const newKey = 'sk-new-encrypted-key';
      await saveAPIKey('openai', newKey, Date.now());

      // Should now work correctly
      const retrievedKey = await getAPIKey('openai');
      expect(retrievedKey).toBe(newKey);
    });
  });
});
