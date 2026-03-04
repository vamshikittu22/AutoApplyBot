import type { Profile } from '@/types/profile';
import type { DetectedField, FieldMapping, FormMappingResult } from '@/types/autofill';
import { detectFormFields } from './field-detector';
import {
  findBestMatch,
  calculateOverallConfidence,
  type ProfileFieldPath,
} from './confidence-scorer';
import { CONFIDENCE_THRESHOLDS } from '@/constants/field-selectors';

/**
 * Map form fields to profile data
 * Returns field mappings with confidence scores
 *
 * @param profile - User profile data
 * @param container - Form container (defaults to document)
 * @returns Form mapping result with all field mappings
 */
export function mapFieldsToProfile(
  profile: Profile,
  container: HTMLElement | Document = document
): FormMappingResult {
  // Detect all form fields
  const fields = detectFormFields(container);

  // Map each field to profile data
  const mappings: FieldMapping[] = fields.map((field) => {
    return mapSingleField(field, profile);
  });

  // Calculate overall confidence
  const overallConfidence = calculateOverallConfidence(mappings);

  // Count fillable vs manual review fields
  const fillableCount = mappings.filter((m) => m.shouldFill).length;
  const manualReviewCount = mappings.filter(
    (m) => !m.shouldFill && m.confidence >= CONFIDENCE_THRESHOLDS.LOW
  ).length;

  return {
    fields,
    mappings,
    overallConfidence,
    fillableCount,
    manualReviewCount,
  };
}

/**
 * Map a single field to profile data
 */
function mapSingleField(field: DetectedField, profile: Profile): FieldMapping {
  // Find best matching profile field
  const match = findBestMatch(field);

  if (!match) {
    return {
      field,
      profileKey: null,
      value: null,
      confidence: 0,
      shouldFill: false,
      reason: 'No matching profile field found',
    };
  }

  const { profilePath, confidence } = match;

  // Get value from profile
  const value = getProfileValue(profile, profilePath);

  // Determine if field should be auto-filled
  const shouldFill =
    confidence >= CONFIDENCE_THRESHOLDS.MEDIUM &&
    value !== null &&
    value !== undefined &&
    value !== '';

  // Reason for low confidence
  let reason: string | undefined;
  if (confidence < CONFIDENCE_THRESHOLDS.MEDIUM) {
    reason = `Low confidence (${confidence}%) - requires manual review`;
  } else if (!value) {
    reason = 'No value in profile for this field';
  }

  return {
    field,
    profileKey: profilePath as any, // ProfileFieldPath is string, not keyof Profile
    value: value?.toString() ?? null,
    confidence,
    shouldFill,
    reason,
  };
}

/**
 * Get value from profile by field path
 * Handles nested objects and arrays
 * Examples: 'personal.email', 'workHistory.position', 'skills'
 */
function getProfileValue(profile: Profile, path: ProfileFieldPath): string | null {
  // Special handling for virtual fields derived from other profile fields
  
  // Workday ATS specific constraints
  if (path === 'personal.addressLine1') {
    const loc = profile.personal?.location;
    if (!loc) return null;
    const parts = loc.split(',').map((s) => s.trim());
    if (parts.length >= 4) return parts.slice(0, parts.length - 3).join(', ');
    return 'Not Provided';
  }
  if (path === 'personal.phoneDeviceType') return 'Mobile';
  if (path === 'application.source') return 'LinkedIn';
  if (path === 'application.employedBefore') return 'No';

  // Format phone number to strip +1 and non-digits
  if (path === 'personal.phone') {
    let phone = profile.personal?.phone;
    if (!phone) return null;
    
    // basic cleanup of formatting 
    phone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Workday and ATS specific: remove leading +1 for US numbers if it's 12 digits,
    // as country codes are usually selected in a separate dropdown.
    if (phone.startsWith('+1') && phone.length === 12) {
      return phone.substring(2);
    }
    if (phone.startsWith('1') && phone.length === 11) {
      return phone.substring(1);
    }
    
    return phone.replace(/^\+/, '');
  }

  // Parse firstName from personal.name (first word)
  if (path === 'personal.firstName') {
    const fullName = profile.personal?.name;
    if (!fullName) return null;
    const nameParts = fullName.trim().split(/\s+/);
    return nameParts[0] || null;
  }

  // Parse lastName from personal.name (everything after first word)
  if (path === 'personal.lastName') {
    const fullName = profile.personal?.name;
    if (!fullName) return null;
    const nameParts = fullName.trim().split(/\s+/);
    return nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
  }

  // Parse city from personal.location
  if (path === 'personal.city') {
    const loc = profile.personal?.location;
    if (!loc) return null;
    const parts = loc.split(',').map((s) => s.trim());
    if (parts.length >= 3) return parts[parts.length - 3] || null;
    return parts[0] || null;
  }

  // Parse state from personal.location
  if (path === 'personal.state') {
    const loc = profile.personal?.location;
    if (!loc) return null;
    const parts = loc.split(',').map((s) => s.trim());
    if (parts.length >= 2) return parts[parts.length - 2] || null;
    return null;
  }

  // Parse country (if location has at least 3 parts, we might not have country unless 4, but Workday often groups it or defaults)
  if (path === 'personal.country') {
    const loc = profile.personal?.location;
    if (!loc) return null;
    // Most users don't type Country if they type City, State, Zip. Default to US.
    return 'United States';
  }

  // Parse zipCode
  if (path === 'personal.zipCode') {
    const loc = profile.personal?.location;
    if (!loc) return null;
    const parts = loc.split(',').map((s) => s.trim());
    const lastPart = parts[parts.length - 1];
    if (lastPart && /\d/.test(lastPart)) return lastPart;
    if (parts.length >= 3) return parts[parts.length - 1] || null;
    return null;
  }

  // Handle nested paths (e.g., 'personal.email')
  const parts = path.split('.');
  let current: any = profile;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    current = current[part];
    if (current === null || current === undefined) return null;
  }

  const value = current;

  if (value === null || value === undefined) return null;

  // Handle arrays (e.g., workHistory, education, skills)
  if (Array.isArray(value)) {
    return formatArrayValue(path, value);
  }

  // Handle objects
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Format array values for form fields
 */
function formatArrayValue(path: ProfileFieldPath, value: any[]): string | null {
  if (value.length === 0) return null;

  // Special formatting for specific fields
  if (path.includes('workHistory')) {
    // For workHistory array, return most recent entry
    const mostRecent = value[0];
    if (!mostRecent) return null;

    // If path is workHistory.position, return just position
    if (path.includes('position')) return mostRecent.position || null;
    if (path.includes('company')) return mostRecent.company || null;
    if (path.includes('startDate')) return mostRecent.startDate || null;
    if (path.includes('endDate')) return mostRecent.endDate || null;

    // Otherwise format full entry
    return `${mostRecent.company} | ${mostRecent.position} | ${mostRecent.startDate}-${mostRecent.endDate}`;
  }

  if (path.includes('education')) {
    // For education array, return most recent entry
    const mostRecent = value[0];
    if (!mostRecent) return null;

    // If path is education.degree, return just degree
    if (path.includes('degree')) return mostRecent.degree || null;
    if (path.includes('institution')) return mostRecent.institution || null;
    if (path.includes('startDate')) return mostRecent.startDate || null;
    if (path.includes('endDate')) return mostRecent.endDate || null;
    if (path.includes('gpa')) return mostRecent.gpa || null;

    // Otherwise format full entry
    return `${mostRecent.degree} - ${mostRecent.institution} (${mostRecent.endDate})`;
  }

  if (path === 'skills') {
    // Format skills as comma-separated list of skill names
    return value.map((skill) => (typeof skill === 'string' ? skill : skill.name)).join(', ');
  }

  // For other arrays (certifications, licenses, etc.), join with commas
  if (typeof value[0] === 'string') {
    return value.join(', ');
  }

  return JSON.stringify(value);
}

/**
 * Get mapping by profile path
 */
export function getMappingByProfilePath(
  mappings: FieldMapping[],
  profilePath: ProfileFieldPath
): FieldMapping | undefined {
  return mappings.find((m) => m.profileKey === profilePath);
}

/**
 * Get all high-confidence mappings (≥80%)
 */
export function getHighConfidenceMappings(mappings: FieldMapping[]): FieldMapping[] {
  return mappings.filter((m) => m.confidence >= CONFIDENCE_THRESHOLDS.HIGH);
}

/**
 * Get all mappings requiring manual review (50-69%)
 */
export function getManualReviewMappings(mappings: FieldMapping[]): FieldMapping[] {
  return mappings.filter(
    (m) => m.confidence >= CONFIDENCE_THRESHOLDS.LOW && m.confidence < CONFIDENCE_THRESHOLDS.MEDIUM
  );
}
