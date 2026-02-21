/**
 * Field Extraction Module
 *
 * Specialized extractors for each resume field type with confidence scoring.
 * Handles contact info, work history, education, and skills extraction.
 *
 * Part of REQ-PRO-01: Resume parsing with ≥75% accuracy
 */

import type { PersonalInfo, WorkExperience, Education, Skill } from '@/types/profile';
import type { FieldConfidence } from '@/types/resume';

/**
 * Extract contact information from resume section.
 * Targets: name, email, phone, location
 *
 * @param text - Contact section text (typically first few lines of resume)
 * @returns Contact data with confidence scores
 */
export function extractContact(text: string): {
  contact: Partial<PersonalInfo>;
  confidence: FieldConfidence[];
} {
  const contact: Partial<PersonalInfo> = {};
  const confidence: FieldConfidence[] = [];

  if (!text || text.trim().length === 0) {
    return { contact, confidence };
  }

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Email extraction (high confidence if regex match)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    contact.email = emailMatch[0];
    confidence.push({
      field: 'personal.email',
      confidence: 95,
      source: 'exact-match',
      rawValue: emailMatch[0],
    });
  }

  // Phone extraction
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    // Normalize phone (remove formatting but keep digits)
    const normalized = phoneMatch[0].replace(/[-.\s()]/g, '');
    contact.phone = normalized;
    confidence.push({
      field: 'personal.phone',
      confidence: 90,
      source: 'pattern-match',
      rawValue: phoneMatch[0],
    });
  }

  // Name extraction (first line heuristic)
  // Name is typically first non-empty line before email
  if (lines.length > 0 && lines[0]) {
    const firstLine = lines[0];
    // Name shouldn't be an email or phone number
    if (!emailRegex.test(firstLine) && !phoneRegex.test(firstLine)) {
      contact.name = firstLine;
      confidence.push({
        field: 'personal.name',
        confidence: 80,
        source: 'heuristic',
        rawValue: firstLine,
      });
    }
  }

  // Location extraction (City, State pattern or City, Country)
  const locationRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),?\s+([A-Z]{2}|[A-Z][a-z]+)/;
  const locationMatch = text.match(locationRegex);
  if (locationMatch) {
    contact.location = locationMatch[0];
    confidence.push({
      field: 'personal.location',
      confidence: 75,
      source: 'pattern-match',
      rawValue: locationMatch[0],
    });
  }

  return { contact, confidence };
}

/**
 * Extract work experience entries from resume section.
 * Targets: position, company, dates, achievements
 *
 * @param text - Work experience section text
 * @returns Work history array with confidence scores
 */
export function extractWorkHistory(text: string): {
  workHistory: WorkExperience[];
  confidence: FieldConfidence[];
} {
  const workHistory: WorkExperience[] = [];
  const confidence: FieldConfidence[] = [];

  if (!text || text.trim().length === 0) {
    return { workHistory, confidence };
  }

  // Split by job entries (typically separated by double newlines or date patterns)
  const entries = splitByJobEntries(text);

  entries.forEach((entry, index) => {
    const work: Partial<WorkExperience> = {
      id: crypto.randomUUID(),
      achievements: [],
    };

    const lines = entry
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    // Extract position (usually first line)
    if (lines[0]) {
      work.position = lines[0];
      confidence.push({
        field: `workHistory[${index}].position`,
        confidence: 85,
        source: 'heuristic',
        rawValue: lines[0],
      });
    }

    // Extract company (usually second line, unless it's on same line as position)
    if (lines.length > 1 && lines[1]) {
      // Check if second line looks like a company name (not a date)
      const secondLine = lines[1];
      if (!/\d{4}/.test(secondLine)) {
        work.company = secondLine;
        confidence.push({
          field: `workHistory[${index}].company`,
          confidence: 80,
          source: 'heuristic',
          rawValue: secondLine,
        });
      } else if (lines.length > 0 && lines[0]) {
        // Company might be on same line as position, split by separator
        const splitPattern = /\s+[-–—|@]\s+/;
        const parts = lines[0].split(splitPattern);
        if (parts.length === 2 && parts[0] && parts[1]) {
          work.position = parts[0];
          work.company = parts[1];
          confidence.push({
            field: `workHistory[${index}].company`,
            confidence: 75,
            source: 'pattern-match',
          });
        }
      }
    }

    // Extract dates (YYYY-YYYY or Month YYYY - Month YYYY or Present)
    const dateRegex = /(\w+\s+)?\d{4}\s*[-–—]\s*((\w+\s+)?\d{4}|Present|Current)/i;
    const dateMatch = entry.match(dateRegex);
    if (dateMatch) {
      const dateParts = dateMatch[0].split(/[-–—]/);
      if (dateParts[0]) {
        work.startDate = dateParts[0].trim();
      }
      if (dateParts[1]) {
        work.endDate = dateParts[1].trim();
      }
      confidence.push({
        field: `workHistory[${index}].dates`,
        confidence: 90,
        source: 'pattern-match',
        rawValue: dateMatch[0],
      });
    }

    // Extract achievements (bullet points: lines starting with -, •, *, or numbers)
    const bulletRegex = /^[\s]*[-•*][\s]+(.+)$/;
    const numberedRegex = /^[\s]*\d+[\.)]\s+(.+)$/;

    const bullets: string[] = [];
    for (const line of lines) {
      const bulletMatch = line.match(bulletRegex);
      const numberedMatch = line.match(numberedRegex);

      if (bulletMatch && bulletMatch[1]) {
        bullets.push(bulletMatch[1].trim());
      } else if (numberedMatch && numberedMatch[1]) {
        bullets.push(numberedMatch[1].trim());
      }
    }

    if (bullets.length > 0) {
      work.achievements = bullets;
      confidence.push({
        field: `workHistory[${index}].achievements`,
        confidence: 85,
        source: 'pattern-match',
      });
    }

    // Only add if we have minimum required fields
    if (work.position && work.company) {
      workHistory.push(work as WorkExperience);
    }
  });

  return { workHistory, confidence };
}

/**
 * Split experience section into individual job entries.
 * Detects entry boundaries using blank lines and date patterns.
 *
 * @param text - Full experience section text
 * @returns Array of individual job entry texts
 */
function splitByJobEntries(text: string): string[] {
  // Split by double newlines first
  let entries = text.split(/\n\s*\n/).filter(Boolean);

  // If only one entry but text is very long, try splitting by date patterns
  if (entries.length === 1 && text.length > 500) {
    const datePattern = /(\w+\s+)?\d{4}\s*[-–—]\s*((\w+\s+)?\d{4}|Present|Current)/gi;
    const matches = [...text.matchAll(datePattern)];

    if (matches.length > 1) {
      // Split at each date match
      entries = [];
      let lastIndex = 0;

      matches.forEach((match, i) => {
        if (i > 0 && match.index !== undefined) {
          entries.push(text.substring(lastIndex, match.index));
          lastIndex = match.index;
        }
      });

      // Add final entry
      entries.push(text.substring(lastIndex));
    }
  }

  return entries.filter(Boolean);
}

/**
 * Extract education entries from resume section.
 * Targets: degree, institution, dates, GPA (optional)
 *
 * @param text - Education section text
 * @returns Education array with confidence scores
 */
export function extractEducation(text: string): {
  education: Education[];
  confidence: FieldConfidence[];
} {
  const education: Education[] = [];
  const confidence: FieldConfidence[] = [];

  if (!text || text.trim().length === 0) {
    return { education, confidence };
  }

  // Split into entries (similar to work history)
  const entries = text.split(/\n\s*\n/).filter(Boolean);

  entries.forEach((entry, index) => {
    const edu: Partial<Education> = { id: crypto.randomUUID() };
    const lines = entry
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    // Degree (usually first line)
    edu.degree = lines[0];
    confidence.push({
      field: `education[${index}].degree`,
      confidence: 85,
      source: 'heuristic',
      rawValue: lines[0],
    });

    // Institution (usually second line)
    if (lines.length > 1 && lines[1]) {
      edu.institution = lines[1];
      confidence.push({
        field: `education[${index}].institution`,
        confidence: 85,
        source: 'heuristic',
        rawValue: lines[1],
      });
    }

    // Dates (look for YYYY-YYYY or YYYY)
    const dateRegex = /(\d{4})\s*[-–—]\s*(\d{4}|Present|Current)/i;
    const singleYearRegex = /\b(19|20)\d{2}\b/g;

    const dateMatch = entry.match(dateRegex);
    if (dateMatch) {
      if (dateMatch[1]) edu.startDate = dateMatch[1];
      if (dateMatch[2]) edu.endDate = dateMatch[2];
      confidence.push({
        field: `education[${index}].dates`,
        confidence: 90,
        source: 'pattern-match',
        rawValue: dateMatch[0],
      });
    } else {
      // Try single year extraction (graduation year only)
      const years = [...entry.matchAll(singleYearRegex)];
      if (years.length === 1 && years[0]) {
        edu.endDate = years[0][0];
        confidence.push({
          field: `education[${index}].dates`,
          confidence: 70,
          source: 'heuristic',
        });
      }
    }

    // GPA (optional) - look for GPA: X.XX pattern
    const gpaRegex = /GPA:?\s*(\d\.\d{1,2})/i;
    const gpaMatch = entry.match(gpaRegex);
    if (gpaMatch && gpaMatch[1]) {
      edu.gpa = gpaMatch[1];
      confidence.push({
        field: `education[${index}].gpa`,
        confidence: 95,
        source: 'exact-match',
        rawValue: gpaMatch[0],
      });
    }

    // Only add if we have minimum required fields
    if (edu.degree && edu.institution) {
      education.push(edu as Education);
    }
  });

  return { education, confidence };
}

/**
 * Extract skills from resume section.
 * Targets: skill names (comma-separated or bulleted)
 *
 * @param text - Skills section text
 * @returns Skills array with confidence scores
 */
export function extractSkills(text: string): {
  skills: Skill[];
  confidence: FieldConfidence[];
} {
  const skills: Skill[] = [];
  const confidence: FieldConfidence[] = [];

  if (!text || text.trim().length === 0) {
    return { skills, confidence };
  }

  // Remove section header if present
  const cleanedText = text.replace(/^skills:?[\s\n]*/i, '').trim();

  // Collect all skill names
  const skillNames = new Set<string>();

  // Method 1: Comma-separated list
  if (cleanedText.includes(',')) {
    const commaSeparated = cleanedText
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    commaSeparated.forEach((skill) => {
      // Clean up bullet points and numbers
      const cleaned = skill.replace(/^[-•*\d.)]+\s*/, '').trim();
      if (cleaned.length > 1 && cleaned.length < 50) {
        skillNames.add(cleaned);
      }
    });
  }

  // Method 2: Bulleted list
  const bulletRegex = /^[\s]*[-•*]\s*(.+)$/gm;
  const bullets = [...cleanedText.matchAll(bulletRegex)];
  bullets.forEach((match) => {
    if (match[1]) {
      const skill = match[1].trim();
      if (skill.length > 1 && skill.length < 50) {
        skillNames.add(skill);
      }
    }
  });

  // Method 3: Newline-separated (if no commas or bullets)
  if (skillNames.size === 0) {
    const lines = cleanedText.split('\n').filter(Boolean);
    lines.forEach((line) => {
      const cleaned = line.replace(/^[-•*\d.)]+\s*/, '').trim();
      if (cleaned.length > 1 && cleaned.length < 50) {
        skillNames.add(cleaned);
      }
    });
  }

  // Convert set to skills array
  skillNames.forEach((name) => {
    skills.push({ name, category: undefined });
  });

  // Confidence scoring
  if (skills.length > 0) {
    const confidenceScore = skills.length >= 3 ? 85 : 65;
    confidence.push({
      field: 'skills',
      confidence: confidenceScore,
      source: 'pattern-match',
    });
  }

  return { skills, confidence };
}
