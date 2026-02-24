/**
 * ATS Detection & Autofill Type System
 *
 * Covers requirements:
 * - REQ-ATS-01: ATS detection for Workday, Greenhouse, Lever (≥95% accuracy)
 * - REQ-ATS-02: Field confidence scoring (green/yellow/red)
 * - REQ-ATS-03: Field mapping to profile attributes
 * - REQ-ATS-04: Helper Mode for unsupported sites
 */

/**
 * Supported ATS platform identifiers (v1 only).
 * LinkedIn/Indeed/Ashby deferred to v2.
 */
export type ATSPlatform = 'workday' | 'greenhouse' | 'lever';

/**
 * Supported ATS platforms (alias for consistency)
 */
export type ATSType = ATSPlatform;

/**
 * Detection signal types
 */
export type DetectionSignal = 'url' | 'dom' | 'shadow' | 'attributes';

/**
 * Detection confidence levels
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none';

/**
 * Result of ATS detection on the current page.
 * Null means no ATS detected — triggers Helper Mode.
 */
export type ATSDetectionResult = {
  /** ATS platform detected */
  platform: ATSPlatform;
  /** Detection confidence 0–100 */
  confidence: number;
  /** Page URL where detection occurred */
  url: string;
  /** Signals that contributed to detection */
  signals: string[];
} | null;

/**
 * Result of ATS detection (new structure for detector)
 */
export interface DetectionResult {
  /** Detected platform (null if no detection) */
  platform: ATSType | null;
  /** Confidence score 0-100 */
  confidence: number;
  /** Which signals contributed to detection */
  signals: DetectionSignal[];
  /** Confidence level category */
  level: ConfidenceLevel;
  /** Timestamp of detection */
  timestamp: number;
}

/**
 * Platform-specific detection configuration
 */
export interface ATSDetector {
  /** Platform name */
  platform: ATSType;
  /** Detect if this platform is present on the page */
  detect: (url: string, document: Document) => Promise<DetectionResult>;
  /** Get form container element(s) for this platform */
  findFormContainers: (document: Document) => HTMLElement[];
}

/**
 * Confidence levels for field mapping (maps to visual highlight color).
 * - high (≥70): Green — auto-fill, trust the mapping
 * - medium (50–69): Yellow — fill but flag for user review
 * - low (<50): Red — skip auto-fill, show empty with warning
 */
export type FieldConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * A single detected form field with its mapping details.
 */
export interface DetectedField {
  /** Unique selector to locate the field in the DOM */
  selector: string;
  /** Human-readable label detected from the form */
  label: string;
  /** Profile attribute path this field maps to (e.g., 'personal.name') */
  profilePath: string | null;
  /** Mapping confidence score 0–100 */
  confidence: number;
  /** Confidence level derived from score */
  confidenceLevel: FieldConfidenceLevel;
  /** HTML input type detected (text, email, tel, textarea, select, etc.) */
  inputType: string;
  /** Current value in the field (empty string if unfilled) */
  currentValue: string;
  /** Whether this field was filled by the autofill engine */
  wasAutoFilled: boolean;
  /** Previous value before autofill (for undo support) */
  previousValue: string;
}

/**
 * Result of field scanning on a detected ATS form.
 */
export interface FormScanResult {
  /** ATS platform this scan was performed on */
  platform: ATSPlatform;
  /** All fields detected on the form */
  fields: DetectedField[];
  /** Number of fields with high confidence mapping */
  highConfidenceCount: number;
  /** Number of fields needing user review */
  reviewRequiredCount: number;
  /** Number of fields that could not be mapped */
  unmappedCount: number;
  /** Whether a CAPTCHA was detected on the page */
  captchaDetected: boolean;
}

/**
 * Mapping definition: form field label patterns → profile attribute path.
 * Used by the field mapping engine to match labels to profile data.
 */
export interface FieldMappingRule {
  /** Profile attribute path (dot notation: 'personal.name') */
  profilePath: string;
  /** Regex patterns to match against field labels/placeholders */
  labelPatterns: RegExp[];
  /** Optional: regex patterns for field name/id attributes */
  attributePatterns?: RegExp[];
  /** Base confidence score when this rule matches */
  baseConfidence: number;
}

/**
 * Autofill execution result for a single field.
 */
export interface FieldFillResult {
  selector: string;
  profilePath: string;
  success: boolean;
  /** Error description if fill failed */
  error?: string;
}

/**
 * Result of a full autofill operation.
 */
export interface AutofillResult {
  /** Fields successfully filled */
  filled: FieldFillResult[];
  /** Fields that failed to fill */
  failed: FieldFillResult[];
  /** Fields skipped (low confidence or CAPTCHA protection) */
  skipped: FieldFillResult[];
  /** True if any CAPTCHA was detected and autofill was paused */
  captchaPaused: boolean;
}
