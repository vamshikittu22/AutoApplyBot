import { describe, it, expect } from 'vitest';
import { PromptBuilder } from './prompt-builder';

describe('PromptBuilder', () => {
  describe('buildSystemPrompt', () => {
    it('should include role context for tech role', () => {
      const prompt = PromptBuilder.buildSystemPrompt({
        role: 'tech',
        tone: 'professional',
        essayMode: false,
      });

      expect(prompt).toContain('software engineer');
      expect(prompt).toContain('technical vocabulary');
    });

    it('should include professional tone instructions', () => {
      const prompt = PromptBuilder.buildSystemPrompt({
        role: 'tech',
        tone: 'professional',
        essayMode: false,
      });

      expect(prompt).toContain('Polished'); // Capitalized in "Neutral + Polished"
      expect(prompt).toContain('diplomatic');
    });

    it('should include STAR instructions for essay mode', () => {
      const prompt = PromptBuilder.buildSystemPrompt({
        role: 'tech',
        tone: 'professional',
        essayMode: true,
      });

      expect(prompt).toContain('STAR');
      expect(prompt).toContain('Situation');
      expect(prompt).toContain('Task');
      expect(prompt).toContain('Action');
      expect(prompt).toContain('Result');
    });

    it('should include short answer instructions for non-essay mode', () => {
      const prompt = PromptBuilder.buildSystemPrompt({
        role: 'tech',
        tone: 'concise',
        essayMode: false,
      });

      expect(prompt).toContain('2-4 sentences');
      expect(prompt).not.toContain('STAR');
    });
  });

  describe('buildUserPrompt', () => {
    it('should include question text', () => {
      const prompt = PromptBuilder.buildUserPrompt({
        question: 'Why do you want to work here?',
      });

      expect(prompt).toContain('Why do you want to work here?');
    });

    it('should include context when provided', () => {
      const prompt = PromptBuilder.buildUserPrompt({
        question: 'Describe your experience',
        questionContext: 'Previous field label: Years of Experience',
      });

      expect(prompt).toContain('Years of Experience');
    });
  });

  describe('buildPromptVariants', () => {
    it('should return 3 variants', () => {
      const variants = PromptBuilder.buildPromptVariants({
        question: 'Why this role?',
        tone: 'professional',
      });

      expect(variants).toHaveLength(3);
    });

    it('should have different emphases in each variant', () => {
      const variants = PromptBuilder.buildPromptVariants({
        question: 'Why this role?',
        tone: 'professional',
      });

      expect(variants[0]).not.toBe(variants[1]);
      expect(variants[1]).not.toBe(variants[2]);
    });
  });
});
