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
 * Convert an optional month name + 4-digit year into YYYY-MM format
 * for use with <input type="month">. Falls back to the bare year string
 * when no month is supplied or the name is unrecognised.
 *
 * @example toMonthInputValue('Feb', '2025') → '2025-02'
 * @example toMonthInputValue('', '2023')    → '2023'
 */
function toMonthInputValue(monthName: string, year: string): string {
  const MONTHS: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
  };
  const mm = MONTHS[monthName.toLowerCase().trim()];
  return mm ? `${year}-${mm}` : year;
}

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

  // Location extraction — must contain a comma e.g. "Austin, TX" or "Pune, India"
  // We skip the pre-extracted name and job title lines to avoid false positives.
  const locationRegex = /\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*),\s*([A-Z]{2,}|[A-Z][a-z]+)\b/;
  for (const line of lines) {
    // Skip lines that are the name or contain email/phone/LinkedIn/GitHub
    if (
      line === contact.name ||
      emailRegex.test(line) ||
      phoneRegex.test(line) ||
      /linkedin|github|portfolio/i.test(line)
    ) continue;
    const locMatch = line.match(locationRegex);
    if (locMatch) {
      contact.location = locMatch[0];
      confidence.push({
        field: 'personal.location',
        confidence: 75,
        source: 'pattern-match',
        rawValue: locMatch[0],
      });
      break;
    }
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

    // ── Position & Company ─────────────────────────────────────────────────
    // Common resume format: "Company | Title   Month YYYY – Month YYYY | City, State"
    // Strategy: always try pipe-split first on the first line; if that gives
    // exactly 2 parts take them as company+title. Strip trailing date/location noise.
    const firstLine = lines[0] ?? '';
    const pipeParts = firstLine.split(/\s*\|\s*/);

    if (pipeParts.length >= 2) {
      // First segment = company, second = title (strip any trailing date/location)
      work.company  = (pipeParts[0] ?? '').trim();
      // Title segment may have trailing whitespace + date; strip after the last word
      // that doesn't look like a month or year.
      const rawTitle = (pipeParts[1] ?? '').trim();
      // Remove trailing date-like suffix: "Software Engineer   Feb 2025 – Present"
      work.position = rawTitle.replace(/\s{2,}.*$/, '').trim() || rawTitle;
      confidence.push(
        { field: `workHistory[${index}].company`,  confidence: 85, source: 'pattern-match', rawValue: work.company },
        { field: `workHistory[${index}].position`, confidence: 85, source: 'pattern-match', rawValue: work.position },
      );
    } else {
      // Fall back: first line = position, second line = company (if not a date)
      work.position = firstLine;
      confidence.push({ field: `workHistory[${index}].position`, confidence: 75, source: 'heuristic', rawValue: firstLine });
      if (lines.length > 1 && lines[1] && !/\d{4}/.test(lines[1])) {
        work.company = lines[1];
        confidence.push({ field: `workHistory[${index}].company`, confidence: 75, source: 'heuristic', rawValue: lines[1] });
      }
    }

    // ── Dates ──────────────────────────────────────────────────────────────
    // Matches: "Feb 2025 – Present", "Aug 2024 – Dec 2024", "2021 – 2023"
    const dateRegex = /([A-Za-z]+\s+)?\b((?:19|20)\d{2})\b\s*[-–—]\s*([A-Za-z]+\s+)?\b((?:19|20)\d{2}|Present|Current)\b/i;
    const dateMatch = entry.match(dateRegex);
    if (dateMatch) {
      const startMonth = dateMatch[1] ? dateMatch[1].trim() : '';
      const startYear  = dateMatch[2] ?? '';
      const endMonth   = dateMatch[3] ? dateMatch[3].trim() : '';
      const endRaw     = dateMatch[4] ?? '';
      work.startDate = toMonthInputValue(startMonth, startYear);
      work.endDate   = /present|current/i.test(endRaw) ? 'Present' : toMonthInputValue(endMonth, endRaw);
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
 * Handles all common resume date formats:
 *   - "2020 – 2024" (bare years)
 *   - "Aug 2020 – May 2024" (Month YYYY)
 *   - "2024" (graduation year only)
 *   - "Present" / "Current" end dates
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

  // Attempt 1: split by blank lines
  let entries = text.split(/\n\s*\n/).filter((e) => e.trim().length > 0);

  // Attempt 2: if only one blob found, try splitting on degree keywords
  // (handles resumes where entries have no blank line between them)
  if (entries.length === 1) {
    const degreeKeyword =
      /(^|\n)(Bachelor|Master|Ph\.?D\.?|M\.?B\.?A\.?|B\.?S\.?|M\.?S\.?|Associate|Doctor|Diploma|Certificate)/gi;
    const splitPoints: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = degreeKeyword.exec(text)) !== null) {
      // avoid splitting at position 0 (first entry is fine)
      if (match.index !== undefined && match.index > 0) {
        splitPoints.push(match.index + (match[1]?.length ?? 0)); // skip the leading \n
      }
    }
    if (splitPoints.length > 0) {
      const parts: string[] = [];
      let prev = 0;
      for (const pos of splitPoints) {
        parts.push(text.slice(prev, pos).trim());
        prev = pos;
      }
      parts.push(text.slice(prev).trim());
      entries = parts.filter((p) => p.length > 0);
    }
  }

  // Date regex: matches "Jan 2020 – May 2024", "2020 – 2024", "Jan 2020 – Present", etc.
  const dateRangeRegex =
    /([A-Za-z]+\s+)?\b((?:19|20)\d{2})\b\s*[-–—]\s*([A-Za-z]+\s+)?\b((?:19|20)\d{2}|Present|Current)\b/i;
  const singleYearRegex = /\b((?:19|20)\d{2})\b/g;
  const gpaRegex = /GPA:?\s*(\d\.\d{1,2})/i;

  entries.forEach((entry, index) => {
    const edu: Partial<Education> = { id: crypto.randomUUID() };
    const lines = entry
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    // --- Degree (first line) ---
    edu.degree = lines[0];
    confidence.push({
      field: `education[${index}].degree`,
      confidence: 85,
      source: 'heuristic',
      rawValue: lines[0],
    });

    // --- Institution (second non-date line) ---
    // Skip lines that are purely a date range when looking for institution
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]!;
      // If the line looks like a date range or standalone year, skip it
      if (dateRangeRegex.test(line) || /^\s*((?:19|20)\d{2})\s*$/.test(line)) continue;
      edu.institution = line;
      confidence.push({
        field: `education[${index}].institution`,
        confidence: 85,
        source: 'heuristic',
        rawValue: line,
      });
      break;
    }

    // --- Dates ---
    const dateMatch = entry.match(dateRangeRegex);
    if (dateMatch) {
      // groups: [1]=start-month?, [2]=start-year, [3]=end-month?, [4]=end-year/Present
      const startMonth = dateMatch[1] ? dateMatch[1].trim() : '';
      const startYear = dateMatch[2] ?? '';
      const endMonth = dateMatch[3] ? dateMatch[3].trim() : '';
      const endRaw = dateMatch[4] ?? '';

      // Build YYYY-MM for <input type="month"> if month is present, else just YYYY
      edu.startDate = toMonthInputValue(startMonth, startYear);
      edu.endDate =
        /present|current/i.test(endRaw) ? 'Present' : toMonthInputValue(endMonth, endRaw);

      confidence.push({
        field: `education[${index}].dates`,
        confidence: 90,
        source: 'pattern-match',
        rawValue: dateMatch[0],
      });
    } else {
      // Try single year (graduation year only)
      const years = [...entry.matchAll(singleYearRegex)];
      if (years.length === 1 && years[0]) {
        edu.endDate = years[0][1] ?? years[0][0];
        confidence.push({
          field: `education[${index}].dates`,
          confidence: 70,
          source: 'heuristic',
        });
      } else if (years.length >= 2 && years[0] && years[1]) {
        edu.startDate = years[0][1] ?? years[0][0];
        edu.endDate = years[1][1] ?? years[1][0];
        confidence.push({
          field: `education[${index}].dates`,
          confidence: 75,
          source: 'heuristic',
        });
      }
    }

    // --- GPA ---
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

  /**
   * Strip category-header prefix from a token like "Languages & Frameworks: Go"
   * → "Go". Also rejects tokens that are purely category labels (no real skill).
   */
  const cleanToken = (raw: string): string => {
    // Remove leading bullets / numbers
    let s = raw.replace(/^[-•*\d.)]+\s*/, '').trim();
    // If the token contains a colon, keep only the part after it
    // e.g. "Backend & APIs: RESTful APIs" → "RESTful APIs"
    const colonIdx = s.indexOf(':');
    if (colonIdx !== -1) {
      s = s.slice(colonIdx + 1).trim();
    }
    return s;
  };

  // Method 1: Comma-separated list
  if (cleanedText.includes(',')) {
    const commaSeparated = cleanedText
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    commaSeparated.forEach((skill) => {
      const cleaned = cleanToken(skill);
      if (cleaned.length > 1 && cleaned.length < 60) {
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
