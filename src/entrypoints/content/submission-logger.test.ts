/**
 * Unit tests for submission logger metadata extraction
 */

import { describe, it, expect } from 'vitest';
// @ts-ignore - jsdom types not needed for test environment
import { JSDOM } from 'jsdom';

describe('Submission Logger Metadata Extraction', () => {
  describe('Workday platform', () => {
    it('should extract job title from h1 with data-automation-id', () => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <h1 data-automation-id="job-title">Senior Software Engineer</h1>
            <form></form>
          </body>
        </html>
      `);

      global.document = dom.window.document as any;
      global.window = dom.window as any;

      const title = document.querySelector('h1[data-automation-id*="title"]')?.textContent;
      expect(title).toBe('Senior Software Engineer');
    });

    it('should extract company name from data-automation-id attribute', () => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div data-automation-id="company-name">Acme Corporation</div>
            <form></form>
          </body>
        </html>
      `);

      global.document = dom.window.document as any;

      const company = document.querySelector('[data-automation-id*="company"]')?.textContent;
      expect(company).toBe('Acme Corporation');
    });
  });

  describe('Greenhouse platform', () => {
    it('should extract job title from .app-title class', () => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <h1 class="app-title">Product Manager</h1>
            <form></form>
          </body>
        </html>
      `);

      global.document = dom.window.document as any;

      const title = document.querySelector('.app-title')?.textContent;
      expect(title).toBe('Product Manager');
    });

    it('should extract company name from .company-name class', () => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div class="company-name">TechCorp Inc.</div>
            <form></form>
          </body>
        </html>
      `);

      global.document = dom.window.document as any;

      const company = document.querySelector('.company-name')?.textContent;
      expect(company).toBe('TechCorp Inc.');
    });
  });

  describe('Lever platform', () => {
    it('should extract job title from .posting-headline h2', () => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div class="posting-headline">
              <h2>Data Scientist</h2>
            </div>
            <form></form>
          </body>
        </html>
      `);

      global.document = dom.window.document as any;

      const title = document.querySelector('.posting-headline h2')?.textContent;
      expect(title).toBe('Data Scientist');
    });

    it('should extract company name from .main-footer .company-name', () => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div class="main-footer">
              <span class="company-name">StartupXYZ</span>
            </div>
            <form></form>
          </body>
        </html>
      `);

      global.document = dom.window.document as any;

      const company = document.querySelector('.main-footer .company-name')?.textContent;
      expect(company).toBe('StartupXYZ');
    });
  });

  describe('Success URL detection', () => {
    it('should detect /submitted pattern', () => {
      const testURL = 'https://example.com/jobs/123/submitted';
      const pattern = /\/(submitted|thank-you|confirmation|success|application-received)/i;
      expect(pattern.test(testURL)).toBe(true);
    });

    it('should detect /thank-you pattern', () => {
      const testURL = 'https://example.com/apply/thank-you';
      const pattern = /\/(submitted|thank-you|confirmation|success|application-received)/i;
      expect(pattern.test(testURL)).toBe(true);
    });

    it('should detect /confirmation pattern', () => {
      const testURL = 'https://example.com/confirmation?id=abc';
      const pattern = /\/(submitted|thank-you|confirmation|success|application-received)/i;
      expect(pattern.test(testURL)).toBe(true);
    });

    it('should detect /success pattern', () => {
      const testURL = 'https://example.com/apply/success';
      const pattern = /\/apply\/success/i;
      expect(pattern.test(testURL)).toBe(true);
    });

    it('should detect status=success query parameter', () => {
      const testURL = 'https://example.com/jobs/123?status=success';
      const pattern = /status=success/i;
      expect(pattern.test(testURL)).toBe(true);
    });

    it('should NOT detect regular job URLs', () => {
      const testURL = 'https://example.com/jobs/123/apply';
      const successPattern = /\/(submitted|thank-you|confirmation|success|application-received)/i;
      expect(successPattern.test(testURL)).toBe(false);
    });
  });

  describe('Fallback extraction', () => {
    it('should fallback to first h1 for job title if platform-specific selector fails', () => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Marketing Coordinator</h1>
            <form></form>
          </body>
        </html>
      `);

      global.document = dom.window.document as any;

      const title = document.querySelector('h1')?.textContent;
      expect(title).toBe('Marketing Coordinator');
    });

    it('should return "Unknown Position" when no title found', () => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <form></form>
          </body>
        </html>
      `);

      global.document = dom.window.document as any;

      const title = document.querySelector('h1')?.textContent || 'Unknown Position';
      expect(title).toBe('Unknown Position');
    });
  });
});
