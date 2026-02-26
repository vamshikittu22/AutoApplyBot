import OpenAI from 'openai';
import { BaseAIProvider } from './base';
import { PromptBuilder } from '../prompt-builder';
import type { GenerateParams, GenerateResult, AIProvider } from '@/types/ai';

export class OpenAIProvider extends BaseAIProvider {
  readonly name: AIProvider = 'openai';
  readonly supportsStreaming = true;

  private client: OpenAI;

  constructor(apiKey: string) {
    super();
    this.client = new OpenAI({
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
          const response = await this.client.chat.completions.create({
            model: 'gpt-4o-mini', // Cost-effective for short answers
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: params.essayMode ? 400 : 200,
            temperature: 0.7, // Balance creativity and consistency
          });

          const content = response.choices[0]?.message?.content || '';

          // Ensure placeholder requirement
          if (!this.validateDraft(content)) {
            console.warn('OpenAI generated draft without placeholders. Appending reminder.');
            return content + '\n\n[Remember to customize with specific details]';
          }

          return content;
        })
      );

      return {
        drafts: drafts as [string, string, string],
        provider: 'openai',
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
      const testClient = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      // Lightweight validation: list models
      await testClient.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI API key validation failed:', error);
      return false;
    }
  }

  private handleError(error: any): Error {
    if (error.status === 429) {
      return new Error('Rate limit reached. Please wait a moment and try again.');
    }

    if (error.status === 401 || error.status === 403) {
      return new Error('Invalid API key. Please check your OpenAI API key in settings.');
    }

    if (error.status === 500 || error.status === 503) {
      return new Error('OpenAI service temporarily unavailable. Please try again later.');
    }

    return new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
  }
}
