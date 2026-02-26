/**
 * Type System Central Exports
 * Re-exports all type definitions from a single location
 */

// Profile types
export * from './profile';

// Resume parsing types
export * from './resume';

// ATS detection types (excluding DetectedField to avoid conflict)
export type {
  ATSPlatform,
  ATSType,
  DetectionSignal,
  ConfidenceLevel,
  ATSDetectionResult,
  DetectionResult,
  ATSDetector,
  FieldConfidenceLevel,
  FormScanResult,
  FieldMappingRule,
  FieldFillResult,
  AutofillResult,
} from './ats';

// Autofill types (includes DetectedField which is actively used)
export * from './autofill';

// AI answer generation types
export * from './ai';

// Note: DetectedField exists in both ats.ts and autofill.ts with different definitions
// We export the autofill.ts version as it's the one actively used in field-detector.ts, field-mapper.ts, etc.
