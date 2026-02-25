/**
 * Base AI Provider Abstract Class
 *
 * Defines abstract provider class that all AI providers must extend
 * Provides shared helper methods for role context, tone instructions, and draft validation
 */

import type { IAIProvider, GenerateParams, GenerateResult, AIProvider } from '@/types/ai';

export abstract class BaseAIProvider implements IAIProvider {
  abstract readonly name: AIProvider;
  abstract readonly supportsStreaming: boolean;

  abstract generateAnswer(params: GenerateParams): Promise<GenerateResult>;

  // Optional for mock provider (doesn't need API key validation)
  async validateKey?(apiKey: string): Promise<boolean>;

  /**
   * Helper: Build role-specific context for system prompt
   * Used by subclasses to customize AI responses based on user's role
   */
  protected getRoleContext(role: string): string {
    const contexts: Record<string, string> = {
      tech: 'You are assisting a software engineer. Use technical vocabulary naturally.',
      healthcare:
        'You are assisting a healthcare professional. Use medical terminology appropriately.',
      finance: 'You are assisting a finance professional. Use financial terminology naturally.',
      marketing:
        'You are assisting a marketing professional. Use marketing and campaign terminology.',
      operations:
        'You are assisting an operations professional. Use logistics and process terminology.',
      other: 'You are assisting a professional job seeker.',
    };

    const result = contexts[role] || contexts['other'];
    return result as string;
  }

  /**
   * Helper: Build tone-specific instructions
   * Generates instructions for the AI to match the requested tone
   */
  protected getToneInstructions(tone: string): string {
    const instructions: Record<string, string> = {
      professional:
        'Use neutral, polished language. Be diplomatic and error-free without being overly formal.',
      concise:
        'Use minimal but complete language. Provide the shortest possible answer that fully addresses the question.',
      'story-driven':
        'Use narrative style with compelling storytelling elements. Create engaging flow with specific examples.',
    };

    const result = instructions[tone] || instructions['professional'];
    return result as string;
  }

  /**
   * Helper: Validate draft has required placeholders
   * Ensures generated drafts include placeholder markers for user review
   */
  protected validateDraft(draft: string): boolean {
    // Ensure draft has at least one placeholder
    const placeholderPattern = /\[.*?\]/;
    return placeholderPattern.test(draft);
  }
}
