/**
 * Mock AI Provider
 * Returns template-based responses for development and testing
 */

import { BaseAIProvider } from './base';
import type { GenerateParams, GenerateResult, AIProvider } from '@/types/ai';
import { getEssayTemplates, getShortAnswerTemplates } from './templates';

export class MockProvider extends BaseAIProvider {
  readonly name: AIProvider = 'mock';
  readonly supportsStreaming = false;

  async generateAnswer(params: GenerateParams): Promise<GenerateResult> {
    // Simulate slight delay for realism
    await this.simulateDelay();

    const drafts = params.essayMode
      ? getEssayTemplates({
          question: params.question,
          role: params.role,
          tone: params.tone,
        })
      : getShortAnswerTemplates({
          question: params.question,
          role: params.role,
          tone: params.tone,
        });

    return {
      drafts,
      provider: 'mock',
      tones: [params.tone, params.tone, params.tone],
      metadata: {
        essayMode: params.essayMode,
        generatedAt: Date.now(),
        question: params.question,
      },
    };
  }

  /**
   * Mock provider doesn't need validation (always available)
   */
  async validateKey(): Promise<boolean> {
    return true;
  }

  /**
   * Simulate API delay for realism (300-600ms)
   */
  private async simulateDelay(): Promise<void> {
    const delay = 300 + Math.random() * 300;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
