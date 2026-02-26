import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider } from './base';
import { PromptBuilder } from '../prompt-builder';
import type { GenerateParams, GenerateResult, AIProvider } from '@/types/ai';

export class AnthropicProvider extends BaseAIProvider {
  readonly name: AIProvider = 'anthropic';
  readonly supportsStreaming = true;

  private client: Anthropic;

  constructor(apiKey: string) {
    super();
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // Required for Chrome extension context
    });
  }

  async generateAnswer(params: GenerateParams): Promise<GenerateResult> {
    const systemPrompt = PromptBuilder.buildSystemPrompt({
      role: params.role,
      tone: params.tone,
      essayMode: params.essayMode,
    });

    const promptVariants = PromptBuilder.buildPromptVariants({
      question: params.question,
      questionContext: params.questionContext,
      tone: params.tone,
    });

    try {
      // Generate 3 variants in parallel
      const drafts = await Promise.all(
        promptVariants.map(async (userPrompt) => {
          const message = await this.client.messages.create({
            model: 'claude-3-5-sonnet-20241022', // Latest Sonnet
            max_tokens: params.essayMode ? 400 : 200,
            system: systemPrompt, // Anthropic uses separate system parameter
            messages: [{ role: 'user', content: userPrompt }],
          });

          const content = message.content[0]?.type === 'text' ? message.content[0].text : '';

          // Ensure placeholder requirement
          if (!this.validateDraft(content)) {
            console.warn('Anthropic generated draft without placeholders. Appending reminder.');
            return content + '\n\n[Remember to customize with specific details]';
          }

          return content;
        })
      );

      return {
        drafts: drafts as [string, string, string],
        provider: 'anthropic',
        tones: [params.tone, params.tone, params.tone],
        metadata: {
          essayMode: params.essayMode,
          generatedAt: Date.now(),
          question: params.question,
        },
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      // Lightweight validation: minimal message request
      await testClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });

      return true;
    } catch (error) {
      console.error('Anthropic API key validation failed:', error);
      return false;
    }
  }

  private handleError(error: any): Error {
    if (error.status === 429) {
      return new Error('Rate limit reached. Please wait a moment and try again.');
    }

    if (error.status === 401 || error.status === 403) {
      return new Error('Invalid API key. Please check your Anthropic API key in settings.');
    }

    if (error.status === 500 || error.status === 503) {
      return new Error('Anthropic service temporarily unavailable. Please try again later.');
    }

    return new Error(`Anthropic API error: ${error.message || 'Unknown error'}`);
  }
}
