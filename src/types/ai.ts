/**
 * AI Answer Generation Type System
 *
 * Type definitions for AI provider abstraction layer supporting:
 * - REQ-AI-01: Mock AI response system
 * - REQ-AI-02: User-provided API key support
 * - REQ-AI-03: Role-specific AI tuning
 * - REQ-AI-04: Placeholder markers
 * - REQ-AI-05: Essay question handling
 */

import type { Profile } from './profile';

/**
 * Supported AI providers
 * - mock: Hardcoded responses for development/testing
 * - openai: OpenAI GPT models (user provides API key)
 * - anthropic: Anthropic Claude models (user provides API key)
 */
export type AIProvider = 'mock' | 'openai' | 'anthropic';

/**
 * Tone variants for answer generation
 * - professional: Neutral, polished, diplomatic (default)
 * - concise: Minimal but complete language
 * - story-driven: Narrative style with compelling examples
 */
export type ToneVariant = 'professional' | 'concise' | 'story-driven';

/**
 * Role types for domain-specific AI tuning
 * Must align with Profile.rolePreference
 */
export type RoleType = 'tech' | 'healthcare' | 'finance' | 'marketing' | 'operations' | 'other';

/**
 * Parameters for answer generation request
 */
export type GenerateParams = {
  /** Question text to generate answer for */
  question: string;
  /** Optional context from label, placeholder, surrounding content */
  questionContext?: string;
  /** User profile for personalization */
  userProfile: Profile;
  /** Tone variant to use for this answer */
  tone: ToneVariant;
  /** True when character limit ≥500 (triggers STAR outline) */
  essayMode: boolean;
  /** User's role for domain-specific tuning */
  role: RoleType;
};

/**
 * Result from answer generation
 * Always returns exactly 3 drafts in different tones
 */
export type GenerateResult = {
  /** Exactly 3 answer drafts */
  drafts: [string, string, string];
  /** Provider that generated the answers */
  provider: AIProvider;
  /** Tone used for each draft (corresponds to drafts array) */
  tones: [ToneVariant, ToneVariant, ToneVariant];
  /** Generation metadata */
  metadata: {
    /** Whether essay mode was used */
    essayMode: boolean;
    /** Unix timestamp when generated */
    generatedAt: number;
    /** Original question text */
    question: string;
  };
};

/**
 * AI provider configuration stored in Chrome Storage
 */
export type AIConfig = {
  /** Currently active provider */
  provider: AIProvider;
  /** OpenAI API key (encrypted in storage) */
  openaiKey?: string;
  /** Anthropic API key (encrypted in storage) */
  anthropicKey?: string;
  /** Unix timestamp when OpenAI key was last validated */
  openaiValidatedAt?: number;
  /** Unix timestamp when Anthropic key was last validated */
  anthropicValidatedAt?: number;
  /** Last successfully used provider */
  lastUsedProvider?: AIProvider;
};

/**
 * AI Provider interface that all providers must implement
 */
export interface IAIProvider {
  /** Provider identifier */
  readonly name: AIProvider;

  /** Generate answer drafts for a question */
  generateAnswer(params: GenerateParams): Promise<GenerateResult>;

  /** Validate API key by making test call (optional, not needed for mock) */
  validateKey?(apiKey: string): Promise<boolean>;

  /** Whether this provider supports streaming responses */
  supportsStreaming: boolean;
}

/**
 * Result from API key validation
 */
export type ValidationResult = {
  /** Whether the key is valid */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Provider that was validated */
  provider: AIProvider;
};
