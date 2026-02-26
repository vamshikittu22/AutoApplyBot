/**
 * AI Library - Main Exports
 * Centralizes all AI-related functionality
 */

// Types
export type {
  AIProvider,
  ToneVariant,
  RoleType,
  GenerateParams,
  GenerateResult,
  AIConfig,
  IAIProvider,
  ValidationResult,
} from '@/types/ai';

// Configuration
export {
  getAIConfig,
  setAIProvider,
  saveAPIKey,
  getAPIKey,
  clearAPIKey,
  hasValidKey,
  getActiveProvider,
} from './config';

// Factory
export { getAIProvider, createProviderForValidation } from './factory';

// Base (for extending)
export { BaseAIProvider } from './providers/base';

// Providers (for testing)
export { MockProvider } from './providers/mock';
export { OpenAIProvider } from './providers/openai';
export { AnthropicProvider } from './providers/anthropic';

// Additional exports
export * from './prompt-builder';
export * from './question-detector';
