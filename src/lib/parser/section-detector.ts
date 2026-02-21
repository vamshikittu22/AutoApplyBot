/**
 * Resume Section Detection Module
 *
 * Identifies resume sections using keyword matching and structural heuristics.
 * Handles both explicit headers (e.g., "EXPERIENCE") and implicit structure
 * (e.g., contact info at top, experience in middle, education at bottom).
 *
 * Part of REQ-PRO-01: Resume parsing with ≥75% accuracy
 */

import { ResumeSection } from '@/types/resume';

/**
 * Detected resume section with confidence scoring
 */
export interface DetectedSection {
  /** Section type (contact, experience, education, skills, etc.) */
  type: ResumeSection;
  /** Starting line number (0-indexed) */
  startLine: number;
  /** Ending line number (0-indexed, exclusive) */
  endLine: number;
  /** Section content (extracted text) */
  content: string;
  /** Confidence score (0-100) based on detection method */
  confidence: number;
}

/**
 * Section header patterns for keyword matching
 * Case-insensitive, matches common resume section headers
 */
const HEADER_PATTERNS: Record<string, RegExp> = {
  contact: /^(contact|personal\s+information?|profile)/i,
  summary: /^(summary|objective|profile\s+summary|professional\s+summary)/i,
  experience:
    /^(experience|work\s+experience|employment|work\s+history|professional\s+experience|career)/i,
  education: /^(education|academic|degrees|qualifications)/i,
  skills: /^(skills|technical\s+skills|competencies|technologies|core\s+skills)/i,
  projects: /^(projects|portfolio|personal\s+projects)/i,
  certifications: /^(certifications?|licenses?|credentials)/i,
  links: /^(links|online\s+profiles?|social\s+media)/i,
};

/**
 * Detects resume sections using keyword matching and structural heuristics.
 *
 * **Detection strategy:**
 * 1. Look for explicit section headers using keyword patterns
 * 2. If no headers found, fall back to heuristic structure detection
 * 3. Assign confidence scores based on detection method
 *
 * @param resumeText - Plain text resume content
 * @returns Array of detected sections with confidence scores
 */
export function detectSections(resumeText: string): DetectedSection[] {
  if (!resumeText || resumeText.trim().length === 0) {
    return [];
  }

  const lines = resumeText.split('\n');
  const sections: DetectedSection[] = [];

  // Step 1: Try to detect explicit section headers
  const headerMatches = findSectionHeaders(lines);

  if (headerMatches.length > 0) {
    // Check if there's content before the first header (likely contact info)
    const firstHeaderLine = headerMatches[0]?.lineIndex || 0;
    if (firstHeaderLine > 0) {
      const preHeaderContent = lines.slice(0, firstHeaderLine).join('\n').trim();
      if (preHeaderContent.length > 0) {
        // Content before first header is likely contact info
        sections.push({
          type: ResumeSection.CONTACT,
          startLine: 0,
          endLine: firstHeaderLine,
          content: preHeaderContent,
          confidence: 80, // High confidence for pre-header content
        });
      }
    }

    // Build sections from header matches
    for (let i = 0; i < headerMatches.length; i++) {
      const currentHeader = headerMatches[i];
      if (!currentHeader) continue;

      const nextHeader = headerMatches[i + 1];

      // Start AFTER the header line (skip the header itself)
      const startLine = currentHeader.lineIndex + 1;
      const endLine = nextHeader ? nextHeader.lineIndex : lines.length;

      const content = lines.slice(startLine, endLine).join('\n').trim();

      // Only add section if it has content
      if (content.length > 0) {
        sections.push({
          type: currentHeader.type,
          startLine,
          endLine,
          content,
          confidence: currentHeader.confidence,
        });
      }
    }
  } else {
    // Step 2: No headers found - use heuristic structure detection
    const heuristicSections = detectImplicitStructure(lines);
    sections.push(...heuristicSections);
  }

  // Step 3: Enhance confidence based on content validation
  return sections.map((section) => enhanceConfidence(section));
}

/**
 * Find section headers using keyword pattern matching
 *
 * @param lines - Resume lines
 * @returns Array of header matches with type and confidence
 */
function findSectionHeaders(
  lines: string[]
): Array<{ lineIndex: number; type: ResumeSection; confidence: number }> {
  const matches: Array<{ lineIndex: number; type: ResumeSection; confidence: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const trimmedLine = line.trim();

    // Skip empty lines
    if (trimmedLine.length === 0) continue;

    // Check if line is a potential header (short line, uppercase or title case)
    const isPotentialHeader =
      trimmedLine.length < 50 &&
      (trimmedLine === trimmedLine.toUpperCase() ||
        /^[A-Z][a-z]*(\s+[A-Z][a-z]*)*$/.test(trimmedLine));

    if (!isPotentialHeader) continue;

    // Try to match against known patterns
    for (const [sectionKey, pattern] of Object.entries(HEADER_PATTERNS)) {
      if (pattern.test(trimmedLine)) {
        matches.push({
          lineIndex: i,
          type: sectionKey as ResumeSection,
          confidence: 95, // High confidence for explicit header match
        });
        break; // Found match, move to next line
      }
    }
  }

  return matches;
}

/**
 * Fallback heuristic when no clear headers exist.
 *
 * **Assumptions:**
 * - Contact info at top (first 5-10 lines)
 * - Experience in middle (bulk of resume)
 * - Education near bottom
 * - Skills at bottom
 *
 * @param lines - Resume lines
 * @returns Array of detected sections with heuristic confidence scores
 */
function detectImplicitStructure(lines: string[]): DetectedSection[] {
  const sections: DetectedSection[] = [];
  const totalLines = lines.length;

  // Heuristic 1: Contact section (first 10 lines or until blank line)
  let contactEnd = Math.min(10, totalLines);
  for (let i = 0; i < contactEnd; i++) {
    const line = lines[i];
    if (line && line.trim().length === 0 && i > 3) {
      contactEnd = i;
      break;
    }
  }

  // Look for email pattern to confirm contact section
  const contactContent = lines.slice(0, contactEnd).join('\n');
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(contactContent)) {
    sections.push({
      type: ResumeSection.CONTACT,
      startLine: 0,
      endLine: contactEnd,
      content: contactContent.trim(),
      confidence: 70, // Medium-high confidence (heuristic + email pattern)
    });
  }

  // Heuristic 2: Experience section (middle bulk of resume)
  // Look for date patterns (YYYY-YYYY or Month YYYY) which indicate work history
  let experienceStart = contactEnd;
  let experienceEnd = Math.floor(totalLines * 0.7); // Assume experience takes ~70% of resume

  const middleSection = lines.slice(experienceStart, experienceEnd).join('\n');

  // Check for date patterns
  const datePattern = /\d{4}\s*[-–—]\s*(\d{4}|Present|Current)/i;
  if (datePattern.test(middleSection)) {
    sections.push({
      type: ResumeSection.EXPERIENCE,
      startLine: experienceStart,
      endLine: experienceEnd,
      content: middleSection.trim(),
      confidence: 65, // Medium confidence (heuristic position + date pattern)
    });
  }

  // Heuristic 3: Education section (after experience, before skills)
  let educationStart = experienceEnd;
  let educationEnd = Math.floor(totalLines * 0.9);

  const educationSection = lines.slice(educationStart, educationEnd).join('\n');

  // Look for degree keywords
  const degreePattern = /(bachelor|master|phd|b\.s\.|m\.s\.|mba|degree)/i;
  if (degreePattern.test(educationSection)) {
    sections.push({
      type: ResumeSection.EDUCATION,
      startLine: educationStart,
      endLine: educationEnd,
      content: educationSection.trim(),
      confidence: 60, // Medium confidence (heuristic position + degree keyword)
    });
  }

  // Heuristic 4: Skills section (last 10% of resume)
  let skillsStart = educationEnd;
  let skillsEnd = totalLines;

  const skillsContent = lines.slice(skillsStart, skillsEnd).join('\n');

  // Skills often comma-separated or bulleted
  if (skillsContent.includes(',') || /^[\s]*[-•*]/.test(skillsContent)) {
    sections.push({
      type: ResumeSection.SKILLS,
      startLine: skillsStart,
      endLine: skillsEnd,
      content: skillsContent.trim(),
      confidence: 55, // Lower confidence (heuristic only)
    });
  }

  return sections;
}

/**
 * Enhance confidence score based on content validation
 *
 * Checks if section content matches expected patterns for that section type.
 *
 * @param section - Detected section
 * @returns Section with updated confidence score
 */
function enhanceConfidence(section: DetectedSection): DetectedSection {
  const content = section.content.toLowerCase();

  switch (section.type) {
    case ResumeSection.CONTACT: {
      // Contact should have email or phone
      const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(content);
      const hasPhone = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(content);

      if (hasEmail && hasPhone) {
        section.confidence = Math.min(100, section.confidence + 10);
      } else if (hasEmail || hasPhone) {
        section.confidence = Math.min(100, section.confidence + 5);
      }
      break;
    }

    case ResumeSection.EXPERIENCE: {
      // Experience should have company/position words and dates
      const hasJobWords = /(engineer|manager|developer|analyst|director|coordinator)/i.test(
        content
      );
      const hasDates = /\d{4}/.test(content);

      if (hasJobWords && hasDates) {
        section.confidence = Math.min(100, section.confidence + 10);
      } else if (hasDates) {
        section.confidence = Math.min(100, section.confidence + 5);
      }
      break;
    }

    case ResumeSection.EDUCATION: {
      // Education should have degree-related words
      const hasDegree = /(bachelor|master|phd|degree|university|college)/i.test(content);
      if (hasDegree) {
        section.confidence = Math.min(100, section.confidence + 10);
      }
      break;
    }

    case ResumeSection.SKILLS: {
      // Skills often comma-separated
      const commaCount = (content.match(/,/g) || []).length;
      if (commaCount >= 3) {
        section.confidence = Math.min(100, section.confidence + 10);
      }
      break;
    }

    default:
      break;
  }

  return section;
}
