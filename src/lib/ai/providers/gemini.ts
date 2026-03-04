import { BaseAIProvider } from './base';
import { PromptBuilder } from '../prompt-builder';
import type { GenerateParams, GenerateResult, AIProvider } from '@/types/ai';

export class GeminiProvider extends BaseAIProvider {
  readonly name: AIProvider = 'gemini';
  readonly supportsStreaming = false; // Simplified

  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
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
          const content = await this.callGeminiAPI(systemPrompt, userPrompt, params.essayMode);

          // Ensure placeholder requirement
          if (!this.validateDraft(content)) {
            console.warn('Gemini generated draft without placeholders. Appending reminder.');
            return content + '\n\n[Remember to customize with specific details]';
          }

          return content;
        })
      );

      return {
        drafts: drafts as [string, string, string],
        provider: 'gemini',
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
      // Lightweight validation: standard models list call
      const response = await fetch(`${this.baseUrl}?key=${apiKey}`);
      return response.ok;
    } catch (error) {
      console.error('Gemini API key validation failed:', error);
      return false;
    }
  }

  private async callGeminiAPI(systemPrompt: string, userPrompt: string, essayMode: boolean): Promise<string> {
    const url = `${this.baseUrl}/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
    
    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: essayMode ? 400 : 200,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw { status: response.status, body: await response.text() };
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private handleError(error: any): Error {
    if (error.status === 429) {
      return new Error('Rate limit reached. Please wait a moment and try again.');
    }

    if (error.status === 400) {
      return new Error('Invalid request or API key. Please check your Gemini API key inside settings.');
    }

    if (error.status === 500 || error.status === 503) {
      return new Error('Gemini service temporarily unavailable. Please try again later.');
    }

    return new Error(`Gemini API error.`);
  }
}
