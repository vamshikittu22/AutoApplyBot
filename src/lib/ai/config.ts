/**
 * AI Configuration Management
 * Handles AI provider selection, API key storage, and validation
 */

import type { AIConfig, AIProvider, IAIProvider } from '@/types/ai';

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
 */
export async function saveAPIKey(
  provider: 'openai' | 'anthropic',
  apiKey: string,
  validatedAt: number
): Promise<void> {
  const config = await getAIConfig();

  if (provider === 'openai') {
    config.openaiKey = apiKey;
    config.openaiValidatedAt = validatedAt;
  } else {
    config.anthropicKey = apiKey;
    config.anthropicValidatedAt = validatedAt;
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: config });
}

/**
 * Clear API key for a provider
 * If the provider was active, switches to mock
 */
export async function clearAPIKey(provider: 'openai' | 'anthropic'): Promise<void> {
  const config = await getAIConfig();

  if (provider === 'openai') {
    delete config.openaiKey;
    delete config.openaiValidatedAt;
  } else {
    delete config.anthropicKey;
    delete config.anthropicValidatedAt;
  }

  // If this was the active provider, switch to mock
  if (config.provider === provider) {
    config.provider = 'mock';
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: config });
}

/**
 * Get stored API key for a provider
 * Returns null if no key exists
 */
export async function getAPIKey(provider: 'openai' | 'anthropic'): Promise<string | null> {
  const config = await getAIConfig();
  return provider === 'openai' ? config.openaiKey || null : config.anthropicKey || null;
}

/**
 * Check if a provider has a valid API key
 */
export async function hasValidKey(provider: 'openai' | 'anthropic'): Promise<boolean> {
  const config = await getAIConfig();

  if (provider === 'openai') {
    return !!(config.openaiKey && config.openaiValidatedAt);
  } else {
    return !!(config.anthropicKey && config.anthropicValidatedAt);
  }
}

/**
 * Get currently active provider
 */
export async function getActiveProvider(): Promise<AIProvider> {
  const config = await getAIConfig();
  return config.provider;
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
  } else {
    const { MockAIProvider } = await import('./providers/mock');
    return new MockAIProvider();
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
  };
}
