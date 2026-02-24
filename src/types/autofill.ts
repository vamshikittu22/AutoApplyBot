import type { Profile } from './profile';

/**
 * Form field types
 */
export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'unknown';

/**
 * Profile field categories
 */
export type ProfileFieldCategory =
  | 'contact'
  | 'personal'
  | 'work_history'
  | 'education'
  | 'skills'
  | 'links'
  | 'other';

/**
 * Detected form field with metadata
 */
export interface DetectedField {
  /** The input element */
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  /** Detected field type */
  type: FieldType;
  /** Field label text */
  label: string | null;
  /** Placeholder text */
  placeholder: string | null;
  /** Name attribute */
  name: string | null;
  /** ID attribute */
  id: string | null;
  /** ARIA label */
  ariaLabel: string | null;
  /** Is required field */
  required: boolean;
  /** Current value */
  currentValue: string;
}

/**
 * Field mapping result
 */
export interface FieldMapping {
  /** Detected form field */
  field: DetectedField;
  /** Mapped profile field key */
  profileKey: keyof Profile | null;
  /** Value to fill */
  value: string | null;
  /** Confidence score (0-100) */
  confidence: number;
  /** Should this field be filled automatically? */
  shouldFill: boolean;
  /** Reason for low confidence (if any) */
  reason?: string;
}

/**
 * Field mapping result for entire form
 */
export interface FormMappingResult {
  /** All detected fields */
  fields: DetectedField[];
  /** Field mappings */
  mappings: FieldMapping[];
  /** Overall confidence (average) */
  overallConfidence: number;
  /** Number of fields that can be filled */
  fillableCount: number;
  /** Number of fields requiring manual review */
  manualReviewCount: number;
}

/**
 * Field matching strategy
 */
export type MatchStrategy = 'label' | 'placeholder' | 'name' | 'id' | 'ariaLabel';

/**
 * Match result from a strategy
 */
export interface MatchResult {
  /** Strategy used */
  strategy: MatchStrategy;
  /** Matched profile key */
  profileKey: keyof Profile;
  /** Match score (0-1) */
  score: number;
  /** Matched text */
  matchedText: string;
}
