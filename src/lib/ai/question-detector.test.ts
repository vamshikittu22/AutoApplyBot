/**
 * Question Detector Tests
 * Tests multi-signal question field detection
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { detectQuestionFields } from './question-detector';

describe('Question Detector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('detectQuestionFields', () => {
    it('should detect textarea with question label', () => {
      document.body.innerHTML = `
        <label for="q1">Why do you want this role?</label>
        <textarea id="q1"></textarea>
      `;

      const fields = detectQuestionFields(null);

      expect(fields).toHaveLength(1);
      expect(fields[0]?.label).toContain('Why');
      expect(fields[0]?.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should detect essay mode for long char limits', () => {
      document.body.innerHTML = `
        <label for="q1">Describe a challenge</label>
        <textarea id="q1" maxlength="1000"></textarea>
      `;

      const fields = detectQuestionFields(null);

      expect(fields).toHaveLength(1);
      expect(fields[0]?.isEssay).toBe(true);
    });

    it('should not detect non-question fields', () => {
      document.body.innerHTML = `
        <label for="name">Full Name</label>
        <input type="text" id="name" />
      `;

      const fields = detectQuestionFields(null);

      expect(fields).toHaveLength(0);
    });

    it('should detect question mark in label', () => {
      document.body.innerHTML = `
        <label for="q1">What motivates you?</label>
        <textarea id="q1"></textarea>
      `;

      const fields = detectQuestionFields(null);

      expect(fields).toHaveLength(1);
      expect(fields[0]?.detectionSignals).toContain('question-mark');
      expect(fields[0]?.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should detect essay keywords in label', () => {
      document.body.innerHTML = `
        <label for="q1">Tell us about a time when you overcame a challenge?</label>
        <textarea id="q1"></textarea>
      `;

      const fields = detectQuestionFields(null);

      // "tell us about" is an essay keyword, "challenge" is a question keyword, + question mark
      // 0.3 (textarea) + 0.2 (keyword) + 0.2 (question mark) = 0.7
      expect(fields.length).toBeGreaterThanOrEqual(1);
      if (fields[0]) {
        expect(fields[0].isEssay).toBe(true);
      }
    });

    it('should detect fields with aria-label', () => {
      document.body.innerHTML = `
        <textarea aria-label="Why are you interested in this position?"></textarea>
      `;

      const fields = detectQuestionFields(null);

      expect(fields).toHaveLength(1);
      expect(fields[0]?.label).toContain('interested');
    });

    it('should use placeholder as fallback label', () => {
      document.body.innerHTML = `
        <textarea placeholder="Describe your experience with leadership" rows="5"></textarea>
      `;

      const fields = detectQuestionFields(null);

      // 0.3 (textarea) + 0.1 (placeholder keyword "describe") + 0.1 (multi-row) + 0.2 (label keyword) = 0.7
      // Placeholder becomes label when no explicit label exists
      expect(fields.length).toBeGreaterThanOrEqual(1);
      if (fields[0]) {
        expect(fields[0].label).toContain('Describe');
      }
    });

    it('should filter out low confidence fields', () => {
      document.body.innerHTML = `
        <label for="comment">Comments</label>
        <textarea id="comment"></textarea>
      `;

      const fields = detectQuestionFields(null);

      // "Comments" doesn't have strong question signals
      expect(fields).toHaveLength(0);
    });

    it('should detect multi-row textarea as higher confidence', () => {
      document.body.innerHTML = `
        <label for="q1">What are your thoughts?</label>
        <textarea id="q1" rows="10"></textarea>
      `;

      const fields = detectQuestionFields(null);

      // 0.3 (textarea) + 0.2 (keyword "what") + 0.2 (question mark) + 0.1 (multi-row) = 0.8
      expect(fields.length).toBeGreaterThanOrEqual(1);
      if (fields[0]) {
        expect(fields[0].detectionSignals).toContain('multi-row');
      }
    });

    it('should handle Workday-style previous sibling labels', () => {
      document.body.innerHTML = `
        <div>
          <label>Describe your qualifications?</label>
          <textarea rows="5"></textarea>
        </div>
      `;

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      const label = document.querySelector('label') as HTMLLabelElement;

      // Make label the previousElementSibling of textarea
      const parent = textarea.parentElement;
      if (parent && label) {
        parent.removeChild(textarea);
        parent.appendChild(textarea);
      }

      const fields = detectQuestionFields('workday');

      // 0.3 (textarea) + 0.2 (keyword "describe") + 0.2 (question mark) + 0.1 (multi-row) = 0.8
      expect(fields.length).toBeGreaterThanOrEqual(1);
      if (fields[0]) {
        expect(fields[0].label).toContain('qualifications');
      }
    });

    it('should detect multiple question fields on page', () => {
      document.body.innerHTML = `
        <label for="q1">Why do you want this role?</label>
        <textarea id="q1"></textarea>
        <label for="q2">What are your strengths?</label>
        <textarea id="q2"></textarea>
      `;

      const fields = detectQuestionFields(null);

      expect(fields).toHaveLength(2);
      expect(fields[0]?.label).toContain('Why');
      expect(fields[1]?.label).toContain('strengths');
    });
  });
});
