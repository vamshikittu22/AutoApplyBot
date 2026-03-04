/**
 * AI Configuration Management
 * Handles AI provider selection, API key storage (encrypted), and validation
 */

import type { AIConfig, AIProvider, IAIProvider } from '@/types/ai';
import { encryptData, decryptData } from '@/lib/storage/encryption';

const STORAGE_KEY = 'ai_config';

/**
 * Get current AI configuration from storage
 * Returns default config if none exists (mock provider)
 */
export async function getAIConfig(): Promise<AIConfig> {
  const result = await chrome.storage.local.get(STORAGE_KEY);

  if (!result[STORAGE_KEY]) {
    // Default config: mock provider
    const defaultConfig: AIConfig = {
      provider: 'mock',
      lastUsedProvider: 'mock',
    };
    await chrome.storage.local.set({ [STORAGE_KEY]: defaultConfig });
    return defaultConfig;
  }

  return result[STORAGE_KEY] as AIConfig;
}

/**
 * Set active AI provider
 */
export async function setAIProvider(provider: AIProvider): Promise<void> {
  const config = await getAIConfig();
  config.provider = provider;
  config.lastUsedProvider = provider;
  await chrome.storage.local.set({ [STORAGE_KEY]: config });
}

/**
 * Save API key for a provider with validation timestamp
 * Keys are encrypted before storage using AES-256-GCM
 */
export async function saveAPIKey(
  provider: Exclude<AIProvider, 'mock'>,
  apiKey: string,
  validatedAt: number
): Promise<void> {
  const config = await getAIConfig();

  // Encrypt API key before storing (REQ-AI-02)
  const encryptedKey = await encryptData(apiKey);

  if (provider === 'openai') {
    config.openaiKey = encryptedKey;
    config.openaiValidatedAt = validatedAt;
  } else if (provider === 'anthropic') {
    config.anthropicKey = encryptedKey;
    config.anthropicValidatedAt = validatedAt;
  } else if (provider === 'gemini') {
    config.geminiKey = encryptedKey;
    config.geminiValidatedAt = validatedAt;
  } else if (provider === 'groq') {
    config.groqKey = encryptedKey;
    config.groqValidatedAt = validatedAt;
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: config });
}

/**
 * Clear API key for a provider
 * If the provider was active, switches to mock
 */
export async function clearAPIKey(provider: Exclude<AIProvider, 'mock'>): Promise<void> {
  const config = await getAIConfig();

  if (provider === 'openai') {
    delete config.openaiKey;
    delete config.openaiValidatedAt;
  } else if (provider === 'anthropic') {
    delete config.anthropicKey;
    delete config.anthropicValidatedAt;
  } else if (provider === 'gemini') {
    delete config.geminiKey;
    delete config.geminiValidatedAt;
  } else if (provider === 'groq') {
    delete config.groqKey;
    delete config.groqValidatedAt;
  }

  // If this was the active provider, switch to mock
  if (config.provider === provider) {
    config.provider = 'mock';
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: config });
}

/**
 * Get stored API key for a provider
 * Automatically decrypts keys from storage
 * Returns null if no key exists or decryption fails
 *
 * Note: Plain-text keys from pre-encryption versions will fail decryption
 * and return null (user must re-enter key - acceptable migration path for v1)
 */
export async function getAPIKey(provider: Exclude<AIProvider, 'mock'>): Promise<string | null> {
  const config = await getAIConfig();
  
  let encryptedKey;
  if (provider === 'openai') encryptedKey = config.openaiKey;
  else if (provider === 'anthropic') encryptedKey = config.anthropicKey;
  else if (provider === 'gemini') encryptedKey = config.geminiKey;
  else if (provider === 'groq') encryptedKey = config.groqKey;

  if (!encryptedKey) return null;

  try {
    // Decrypt API key from storage (REQ-AI-02)
    return await decryptData(encryptedKey);
  } catch (error) {
    // If decryption fails (corrupted data, old plain-text format), treat as no key
    console.error(`Failed to decrypt ${provider} API key:`, error);
    return null;
  }
}

/**
 * Check if a provider has a valid API key
 */
export async function hasValidKey(provider: Exclude<AIProvider, 'mock'>): Promise<boolean> {
  const config = await getAIConfig();

  if (provider === 'openai') {
    return !!(config.openaiKey && config.openaiValidatedAt);
  } else if (provider === 'anthropic') {
    return !!(config.anthropicKey && config.anthropicValidatedAt);
  } else if (provider === 'gemini') {
    return !!(config.geminiKey && config.geminiValidatedAt);
  } else if (provider === 'groq') {
    return !!(config.groqKey && config.groqValidatedAt);
  }
  return false;
}

/**
 * Get currently active provider
 */
export async function getActiveProvider(): Promise<AIProvider> {
  const config = await getAIConfig();
  return config.provider;
}

/**
 * Get the appropriate AI provider instance based on current configuration
 * Falls back to mock if selected provider has no API key
 */
export async function getAIProvider(): Promise<IAIProvider> {
  const config = await getAIConfig();

  switch (config.provider) {
    case 'openai': {
      const apiKey = await getAPIKey('openai');
      if (!apiKey) {
        // Fall back to mock if no key
        console.warn('OpenAI provider selected but no API key found. Falling back to mock.');
        const { MockProvider } = await import('./providers/mock');
        return new MockProvider();
      }
      const { OpenAIProvider } = await import('./providers/openai');
      return new OpenAIProvider(apiKey);
    }

    case 'anthropic': {
      const apiKey = await getAPIKey('anthropic');
      if (!apiKey) {
        console.warn('Anthropic provider selected but no API key found. Falling back to mock.');
        const { MockProvider } = await import('./providers/mock');
        return new MockProvider();
      }
      const { AnthropicProvider } = await import('./providers/anthropic');
      return new AnthropicProvider(apiKey);
    }

    case 'gemini': {
      const apiKey = await getAPIKey('gemini');
      if (!apiKey) {
        console.warn('Gemini provider selected but no API key found. Falling back to mock.');
        const { MockProvider } = await import('./providers/mock');
        return new MockProvider();
      }
      const { GeminiProvider } = await import('./providers/gemini');
      return new GeminiProvider(apiKey);
    }

    case 'groq': {
      const apiKey = await getAPIKey('groq');
      if (!apiKey) {
        console.warn('Groq provider selected but no API key found. Falling back to mock.');
        const { MockProvider } = await import('./providers/mock');
        return new MockProvider();
      }
      const { GroqProvider } = await import('./providers/groq');
      return new GroqProvider(apiKey);
    }

    case 'mock':
    default: {
      const { MockProvider } = await import('./providers/mock');
      return new MockProvider();
    }
  }
}

/**
 * Create a provider instance for validation purposes
 * Used during key validation to test if the key works
 */
export async function createProviderForValidation(
  provider: AIProvider,
  apiKey: string
): Promise<IAIProvider> {
  // Import provider dynamically to avoid circular dependencies
  if (provider === 'openai') {
    const { OpenAIProvider } = await import('./providers/openai');
    return new OpenAIProvider(apiKey);
  } else if (provider === 'anthropic') {
    const { AnthropicProvider } = await import('./providers/anthropic');
    return new AnthropicProvider(apiKey);
  } else if (provider === 'gemini') {
    const { GeminiProvider } = await import('./providers/gemini');
    return new GeminiProvider(apiKey);
  } else if (provider === 'groq') {
    const { GroqProvider } = await import('./providers/groq');
    return new GroqProvider(apiKey);
  } else {
    const { MockProvider } = await import('./providers/mock');
    return new MockProvider();
  }
}

/**
 * Export config for data portability
 */
export async function exportAIConfig(): Promise<Partial<AIConfig>> {
  const config = await getAIConfig();

  // Export everything except API keys (security)
  return {
    provider: config.provider,
    lastUsedProvider: config.lastUsedProvider,
    openaiValidatedAt: config.openaiValidatedAt,
    anthropicValidatedAt: config.anthropicValidatedAt,
    geminiValidatedAt: config.geminiValidatedAt,
    groqValidatedAt: config.groqValidatedAt,
  };
}
