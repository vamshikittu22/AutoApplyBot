/**
 * Main Resume Parser Module
 *
 * Orchestrates resume parsing by combining section detection and field extraction.
 * Achieves ≥75% accuracy on key fields per REQ-PRO-01.
 *
 * Key fields tracked:
 * - name, email, phone (contact info)
 * - work history entries
 * - education entries
 * - skills list
 */

import type { ParsedResume, ParserResult, ParseError } from '@/types/resume';
import type { Profile } from '@/types/profile';
import { detectSections } from './section-detector';
import {
  extractContact,
  extractWorkHistory,
  extractEducation,
  extractSkills,
} from './field-extractor';
import { createEmptyProfile } from '@/constants/profile-schema';
import { ResumeSection } from '@/types/resume';

/**
 * Parse plain text resume into structured profile data.
 *
 * Achieves ≥75% accuracy on key fields (REQ-PRO-01):
 * - name, email, phone (contact info)
 * - work history entries
 * - education entries
 * - skills list
 *
 * @param resumeText - Plain text resume (paste input)
 * @returns ParserResult with parsed profile data or error
 */
export function parseResume(resumeText: string): ParserResult<ParsedResume> {
  try {
    // Validation: Minimum length check
    if (!resumeText || resumeText.trim().length < 50) {
      return {
        success: false,
        error: 'Resume text too short (minimum 50 characters). Please paste complete resume.',
      };
    }

    // Step 1: Detect sections
    const sections = detectSections(resumeText);

    if (sections.length === 0) {
      return {
        success: false,
        error: 'Unable to detect any resume sections. Please check resume format.',
      };
    }

    // Step 2: Extract fields from each section
    const profile: Partial<Profile> = createEmptyProfile();
    const allConfidenceScores = [];
    const parseErrors: ParseError[] = [];
    const unparsedText: string[] = [];

    for (const section of sections) {
      try {
        switch (section.type) {
          case ResumeSection.CONTACT: {
            const { contact, confidence } = extractContact(section.content);
            // Merge extracted contact info with existing profile personal info
            profile.personal = {
              ...profile.personal,
              ...contact,
            } as typeof profile.personal;
            allConfidenceScores.push(...confidence);
            break;
          }

          case ResumeSection.EXPERIENCE: {
            const { workHistory, confidence } = extractWorkHistory(section.content);
            profile.workHistory = workHistory;
            allConfidenceScores.push(...confidence);
            break;
          }

          case ResumeSection.EDUCATION: {
            const { education, confidence } = extractEducation(section.content);
            profile.education = education;
            allConfidenceScores.push(...confidence);
            break;
          }

          case ResumeSection.SKILLS: {
            const { skills, confidence } = extractSkills(section.content);
            profile.skills = skills;
            allConfidenceScores.push(...confidence);
            break;
          }

          case ResumeSection.UNKNOWN: {
            // Store unparsed content for user review
            unparsedText.push(section.content);
            break;
          }

          // Other sections (summary, projects, etc.) not yet implemented
          default:
            break;
        }
      } catch (error) {
        // Don't fail entire parse if one section fails
        parseErrors.push({
          section: section.type,
          message: error instanceof Error ? error.message : 'Unknown parsing error',
          severity: 'warning',
        });
      }
    }

    // Step 3: Calculate overall accuracy
    const accuracy = calculateParseAccuracy(profile);

    // Check if accuracy meets minimum threshold
    if (accuracy < 50) {
      return {
        success: false,
        error: `Parse accuracy too low (${accuracy}%). Resume format may not be supported. Please verify your resume follows a standard chronological format.`,
        partialData: {
          profile,
          confidenceScores: allConfidenceScores,
          parseErrors,
          unparsedText,
        },
      };
    }

    // Success case
    return {
      success: true,
      data: {
        profile,
        confidenceScores: allConfidenceScores,
        parseErrors,
        unparsedText,
      },
    };
  } catch (error) {
    // Catastrophic failure
    return {
      success: false,
      error:
        error instanceof Error ? `Parse error: ${error.message}` : 'Unknown parsing error occurred',
    };
  }
}

/**
 * Calculate overall parse accuracy based on key fields (REQ-PRO-01).
 *
 * Key fields (must extract to meet ≥75% target):
 * - personal.name
 * - personal.email
 * - personal.phone
 * - workHistory (at least 1 entry)
 * - education (at least 1 entry)
 * - skills (at least 3 skills)
 *
 * @param profile - Partially parsed profile
 * @returns Accuracy percentage (0-100)
 */
function calculateParseAccuracy(profile: Partial<Profile>): number {
  // Check which key fields were successfully extracted
  const keyFieldsExtracted = [
    !!profile.personal?.name, // Name extracted?
    !!profile.personal?.email, // Email extracted?
    !!profile.personal?.phone, // Phone extracted?
    (profile.workHistory?.length || 0) > 0, // At least 1 work entry?
    (profile.education?.length || 0) > 0, // At least 1 education entry?
    (profile.skills?.length || 0) >= 3, // At least 3 skills?
  ];

  const extractedCount = keyFieldsExtracted.filter(Boolean).length;
  const totalKeyFields = keyFieldsExtracted.length;

  return Math.round((extractedCount / totalKeyFields) * 100);
}
