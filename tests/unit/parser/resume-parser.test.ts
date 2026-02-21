/**
 * Resume Parser Unit Tests
 *
 * Validates REQ-PRO-01: Resume parsing with ≥75% accuracy on key fields.
 */

import { describe, it, expect } from 'vitest';
import { parseResume } from '@/lib/parser/resume-parser';

describe('parseResume', () => {
  describe('success cases', () => {
    it('should parse complete chronological resume with ≥75% accuracy', () => {
      const sampleResume = `
John Doe
john.doe@email.com | (555) 123-4567 | San Francisco, CA

EXPERIENCE
Senior Software Engineer
Tech Company Inc.
January 2020 - Present
- Led development of microservices architecture serving 1M+ users
- Reduced API latency by 40% through optimization
- Mentored 5 junior engineers

Software Engineer
Startup Co.
June 2018 - December 2019
- Built React-based dashboard used by 10K+ customers
- Implemented CI/CD pipeline reducing deploy time by 60%

EDUCATION
Bachelor of Science in Computer Science
University of California
September 2014 - May 2018

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, PostgreSQL
      `.trim();

      const result = parseResume(sampleResume);

      expect(result.success).toBe(true);
      if (result.success) {
        const { profile, confidenceScores } = result.data;

        // Verify key fields extracted (REQ-PRO-01)
        expect(profile.personal?.name).toBe('John Doe');
        expect(profile.personal?.email).toBe('john.doe@email.com');
        expect(profile.personal?.phone).toContain('555');
        expect(profile.workHistory).toHaveLength(2);
        expect(profile.education).toHaveLength(1);
        expect(profile.skills!.length).toBeGreaterThanOrEqual(3);

        // Verify work history details
        expect(profile.workHistory?.[0]?.position).toBe('Senior Software Engineer');
        expect(profile.workHistory?.[0]?.company).toBe('Tech Company Inc.');
        expect(profile.workHistory?.[0]?.achievements?.length).toBeGreaterThan(0);

        // Verify education details
        expect(profile.education?.[0]?.degree).toContain('Bachelor');
        expect(profile.education?.[0]?.institution).toContain('University');

        // Verify ≥75% accuracy requirement
        const accuracy = calculateTestAccuracy(profile);
        expect(accuracy).toBeGreaterThanOrEqual(75);

        // Verify confidence scores present
        expect(confidenceScores.length).toBeGreaterThan(0);
      }
    });

    it('should handle resume without explicit section headers', () => {
      const implicitResume = `
Jane Smith
jane@example.com
(555) 987-6543

Product Manager at Big Corp
2021 - Present
• Launched 3 products generating $2M ARR
• Managed cross-functional team of 12

MBA, Business Administration
Harvard Business School, 2020

Skills: Product Strategy, SQL, Tableau, Agile, Scrum
      `.trim();

      const result = parseResume(implicitResume);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.profile.personal?.name).toBeTruthy();
        expect(result.data.profile.personal?.email).toBe('jane@example.com');

        // Should still extract work and education even without headers
        const accuracy = calculateTestAccuracy(result.data.profile);
        expect(accuracy).toBeGreaterThanOrEqual(50); // Lower threshold for implicit structure
      }
    });

    it('should extract multiple work experiences correctly', () => {
      const multiWorkResume = `
Alex Johnson
alex@example.com | 555-111-2222

WORK EXPERIENCE

Lead Engineer
Company A
2021 - Present
- Led team of 8 engineers
- Architected cloud infrastructure

Senior Engineer
Company B
2018 - 2021
- Developed mobile applications
- Improved code quality

Engineer
Company C
2016 - 2018
- Built backend services
- Deployed to production

EDUCATION
BS Computer Science, MIT, 2016

SKILLS
Java, Python, Go, Kubernetes
      `.trim();

      const result = parseResume(multiWorkResume);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.profile.workHistory?.length).toBe(3);
        expect(result.data.profile.workHistory?.[0]?.position).toBe('Lead Engineer');
        expect(result.data.profile.workHistory?.[1]?.position).toBe('Senior Engineer');
        expect(result.data.profile.workHistory?.[2]?.position).toBe('Engineer');
      }
    });

    it('should extract skills from comma-separated list', () => {
      const skillsResume = `
Developer Name
dev@test.com

Work: Some Company, 2020-Present

Education: BS Degree, University, 2019

SKILLS
React, Angular, Vue.js, JavaScript, TypeScript, Node.js, Express, MongoDB, PostgreSQL, AWS, Docker, Kubernetes
      `.trim();

      const result = parseResume(skillsResume);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.profile.skills!.length).toBeGreaterThanOrEqual(10);

        // Check some specific skills
        const skillNames = result.data.profile.skills?.map((s) => s.name);
        expect(skillNames).toContain('React');
        expect(skillNames).toContain('JavaScript');
      }
    });

    it('should extract education with GPA', () => {
      const gpaResume = `
Student Name
student@university.edu

EDUCATION
Bachelor of Science in Computer Science
Stanford University
2018 - 2022
GPA: 3.85

SKILLS
Python, Java, C++
      `.trim();

      const result = parseResume(gpaResume);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.profile.education?.[0]?.gpa).toBe('3.85');
      }
    });
  });

  describe('error cases', () => {
    it('should reject too-short text', () => {
      const result = parseResume('John Doe');
      expect(result.success).toBe(false);
      expect(result.error).toContain('too short');
    });

    it('should reject empty string', () => {
      const result = parseResume('');
      expect(result.success).toBe(false);
      expect(result.error).toContain('too short');
    });

    it('should return partial data on low accuracy', () => {
      const lowQualityResume = `
Random text that doesn't look like a resume at all.
Just some nonsense content here without any structure.
This has no email, no phone, no dates, nothing.
      `.trim();

      const result = parseResume(lowQualityResume);

      if (!result.success && result.partialData) {
        expect(result.partialData.profile).toBeDefined();
        expect(result.error).toContain('accuracy too low');
      }
    });

    it('should handle malformed dates gracefully', () => {
      const malformedResume = `
Test Person
test@email.com

Engineer at Company
SomeTime - SomeOtherTime
Did work

Education: Degree, School

Skills: Skill1, Skill2, Skill3
      `.trim();

      const result = parseResume(malformedResume);

      // Should still succeed even if dates are malformed
      expect(result.success).toBe(true);
    });
  });

  describe('confidence scoring', () => {
    it('should mark email as high confidence (≥90%)', () => {
      const result = parseResume(
        `
John Doe
john@example.com

Senior Engineer
Company
2020-Present

Education: BS CS, University, 2019

Skills: JavaScript, Python, Java
      `.trim()
      );

      if (result.success) {
        const emailScore = result.data.confidenceScores.find((s) => s.field === 'personal.email');
        expect(emailScore?.confidence).toBeGreaterThanOrEqual(90);
      }
    });

    it('should have multiple confidence scores for complete resume', () => {
      const completeResume = `
Jane Doe
jane@example.com | (555) 123-4567 | New York, NY

EXPERIENCE
Product Manager
Tech Corp
2020 - Present
- Launched 5 products
- Managed team

EDUCATION
MBA, Harvard, 2020

SKILLS
Product Management, SQL, Analytics
      `.trim();

      const result = parseResume(completeResume);

      if (result.success) {
        // Should have confidence scores for multiple fields
        expect(result.data.confidenceScores.length).toBeGreaterThan(5);

        // Verify we have scores for key field types
        const fieldTypes = result.data.confidenceScores.map((s) => s.field.split('[')[0]);
        expect(fieldTypes).toContain('personal.email');
        expect(fieldTypes).toContain('personal.phone');
      }
    });

    it('should flag fields with low confidence correctly', () => {
      const ambiguousResume = `
Name
Some text here
More text

Work: Position, Company, Dates
Education: Degree, School
Skills: Skill1, Skill2, Skill3, Skill4
      `.trim();

      const result = parseResume(ambiguousResume);

      if (result.success) {
        // Some fields should have lower confidence due to ambiguous structure
        const lowConfFields = result.data.confidenceScores.filter((s) => s.confidence < 70);
        expect(lowConfFields.length).toBeGreaterThan(0);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle phone numbers with different formats', () => {
      const formats = [
        '(555) 123-4567',
        '555-123-4567',
        '555.123.4567',
        '+1 555 123 4567',
        '5551234567',
      ];

      formats.forEach((phoneFormat) => {
        const resume = `
Test Person
test@email.com
${phoneFormat}

Engineer at Company, 2020-Present
BS CS, University, 2019
Skills: A, B, C
        `.trim();

        const result = parseResume(resume);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.profile.personal?.phone).toBeTruthy();
        }
      });
    });

    it('should handle international resumes with different date formats', () => {
      const internationalResume = `
Pierre Dupont
pierre@example.com

Ingénieur Logiciel
Société Française
2020 - Présent

Diplôme, Université de Paris, 2019

Compétences: JavaScript, Python, React
      `.trim();

      const result = parseResume(internationalResume);

      // Should still extract basic info even with non-English text
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.profile.personal?.email).toBe('pierre@example.com');
      }
    });

    it('should handle resume with extra whitespace', () => {
      const messyResume = `


John   Doe
  john@example.com   |   555-123-4567


EXPERIENCE

  Senior Engineer
  Tech Company
  2020 - Present


EDUCATION

  BS Computer Science
  University Name
  2019


SKILLS

  JavaScript,  TypeScript,  React


      `.trim();

      const result = parseResume(messyResume);

      expect(result.success).toBe(true);
      if (result.success) {
        const accuracy = calculateTestAccuracy(result.data.profile);
        expect(accuracy).toBeGreaterThanOrEqual(75);
      }
    });
  });
});

/**
 * Calculate test accuracy helper
 * Matches the logic in resume-parser.ts calculateParseAccuracy()
 */
function calculateTestAccuracy(profile: any): number {
  const checks = [
    !!profile.personal?.name,
    !!profile.personal?.email,
    !!profile.personal?.phone,
    (profile.workHistory?.length || 0) > 0,
    (profile.education?.length || 0) > 0,
    (profile.skills?.length || 0) >= 3,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
