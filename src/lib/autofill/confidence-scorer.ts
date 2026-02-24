import Fuse from 'fuse.js';
import type { DetectedField, MatchResult, MatchStrategy } from '@/types/autofill';
import { FIELD_KEYWORDS } from '@/constants/field-selectors';

/**
 * Profile field path type (string paths into Profile object)
 * Examples: 'personal.email', 'workHistory.position', 'skills'
 */
export type ProfileFieldPath = keyof typeof FIELD_KEYWORDS;

/**
 * Calculate confidence score for a field mapping
 * Uses fuzzy matching to compare form field labels with profile field keywords
 */
export function calculateFieldConfidence(
  field: DetectedField,
  profilePath: ProfileFieldPath
): number {
  const matches: MatchResult[] = [];

  // Try each strategy
  const strategies: { text: string | null; strategy: MatchStrategy }[] = [
    { text: field.label, strategy: 'label' },
    { text: field.placeholder, strategy: 'placeholder' },
    { text: field.name, strategy: 'name' },
    { text: field.id, strategy: 'id' },
    { text: field.ariaLabel, strategy: 'ariaLabel' },
  ];

  for (const { text, strategy } of strategies) {
    if (!text) continue;

    const match = fuzzyMatch(text, profilePath);
    if (match) {
      matches.push({
        strategy,
        profileKey: profilePath as any, // ProfileFieldPath is string, not keyof Profile
        score: match.score,
        matchedText: text,
      });
    }
  }

  if (matches.length === 0) return 0;

  // Calculate weighted average (label > ariaLabel > placeholder > name > id)
  const weights: Record<MatchStrategy, number> = {
    label: 1.0,
    ariaLabel: 0.9,
    placeholder: 0.7,
    name: 0.5,
    id: 0.3,
  };

  const weightedSum = matches.reduce(
    (sum, match) => sum + match.score * weights[match.strategy],
    0
  );
  const totalWeight = matches.reduce((sum, match) => sum + weights[match.strategy], 0);

  const confidence = (weightedSum / totalWeight) * 100;
  return Math.round(confidence);
}

/**
 * Fuzzy match field text against profile field keywords
 * Returns match score (0-1) or null if no match
 */
export function fuzzyMatch(
  fieldText: string,
  profilePath: ProfileFieldPath
): { score: number; keyword: string } | null {
  const keywords = FIELD_KEYWORDS[profilePath];
  if (!keywords || keywords.length === 0) return null;

  // Create Fuse instance for fuzzy searching
  const fuse = new Fuse(keywords, {
    includeScore: true,
    threshold: 0.4, // 0 = exact match, 1 = match anything
    distance: 100,
    minMatchCharLength: 2,
  });

  const results = fuse.search(fieldText.toLowerCase());

  if (results.length === 0) return null;

  // Fuse score is 0 (perfect) to 1 (bad), invert it
  const bestMatch = results[0];
  if (!bestMatch) return null;

  const score = 1 - (bestMatch.score ?? 1);

  return {
    score,
    keyword: bestMatch.item,
  };
}

/**
 * Find best profile field match for a detected field
 * Returns profile path and confidence score
 */
export function findBestMatch(
  field: DetectedField
): { profilePath: ProfileFieldPath; confidence: number } | null {
  const profilePaths = Object.keys(FIELD_KEYWORDS) as ProfileFieldPath[];
  const matches: { profilePath: ProfileFieldPath; confidence: number }[] = [];

  for (const profilePath of profilePaths) {
    const confidence = calculateFieldConfidence(field, profilePath);
    if (confidence > 0) {
      matches.push({ profilePath, confidence });
    }
  }

  if (matches.length === 0) return null;

  // Return highest confidence match
  matches.sort((a, b) => b.confidence - a.confidence);
  return matches[0] ?? null;
}

/**
 * Calculate overall form confidence
 * Average confidence of all mapped fields
 */
export function calculateOverallConfidence(mappings: Array<{ confidence: number }>): number {
  if (mappings.length === 0) return 0;

  const sum = mappings.reduce((acc, m) => acc + m.confidence, 0);
  return Math.round(sum / mappings.length);
}
