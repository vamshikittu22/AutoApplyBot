import type { IAIProvider } from '@/types/ai';
import { getAIConfig, getAPIKey } from './config';
import { MockProvider } from './providers/mock';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';

/**
 * Get the appropriate AI provider based on current configuration
 */
export async function getAIProvider(): Promise<IAIProvider> {
  const config = await getAIConfig();

  switch (config.provider) {
    case 'openai': {
      const apiKey = await getAPIKey('openai');
      if (!apiKey) {
        // Fall back to mock if no key
        console.warn('OpenAI provider selected but no API key found. Falling back to mock.');
        return new MockProvider();
      }
      return new OpenAIProvider(apiKey);
    }

    case 'anthropic': {
      const apiKey = await getAPIKey('anthropic');
      if (!apiKey) {
        console.warn('Anthropic provider selected but no API key found. Falling back to mock.');
        return new MockProvider();
      }
      return new AnthropicProvider(apiKey);
    }

    case 'mock':
    default:
      return new MockProvider();
  }
}

/**
 * Create provider instance for validation (doesn't save to config)
 */
export async function createProviderForValidation(
  provider: 'openai' | 'anthropic',
  apiKey: string
): Promise<IAIProvider> {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(apiKey);

    case 'anthropic':
      return new AnthropicProvider(apiKey);

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
