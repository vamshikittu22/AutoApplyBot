/**
 * Resume Parsing Type System for AutoApply Copilot
 *
 * Defines types for resume parsing flow covering REQ-PRO-01:
 * - ParsedResume: Result of parsing resume text
 * - FieldConfidence: Tracks parsing accuracy (≥75% target)
 * - ParserResult: Success/failure wrapper
 * - ResumeSection: Detected resume sections
 */

import type { Profile } from './profile';

/**
 * Confidence score for parsed field accuracy
 *
 * Thresholds (REQ-PRO-01 acceptance criteria):
 * - ≥70% = high confidence (green highlight) - auto-fill safe
 * - 50-69% = low confidence (yellow highlight) - needs manual review
 * - <50% = very low confidence (red highlight) - likely wrong, user must verify
 */
export interface FieldConfidence {
  /** Dot-notation path to profile field (e.g., "personal.email", "workHistory[0].company") */
  field: string;
  /** Confidence percentage: 0-100 */
  confidence: number;
  /** Parsing strategy that produced this value */
  source: 'exact-match' | 'pattern-match' | 'heuristic' | 'fallback';
  /** Original text before parsing/transformation */
  rawValue?: string;
}

/**
 * Parse error encountered during resume processing
 */
export interface ParseError {
  /** Resume section where error occurred */
  section: string;
  /** Human-readable error description */
  message: string;
  /** Error severity level */
  severity: 'warning' | 'error';
}

/**
 * Result of parsing a resume text
 *
 * Note: Profile may be incomplete - parser does best-effort extraction.
 * User must review and complete missing fields in profile editor.
 */
export interface ParsedResume {
  /** Extracted profile data (may have missing/incomplete fields) */
  profile: Partial<Profile>;
  /** Confidence scores for each extracted field */
  confidenceScores: FieldConfidence[];
  /** Parsing errors encountered */
  parseErrors: ParseError[];
  /** Resume text sections that couldn't be categorized */
  unparsedText: string[];
}

/**
 * Parser result wrapper with success/failure handling
 *
 * Success case: returns parsed data
 * Failure case: returns error message with optional partial data
 */
export type ParserResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; partialData?: Partial<T> };

/**
 * Resume sections detected during parsing
 *
 * Used to categorize resume text blocks into structured sections
 */
export enum ResumeSection {
  /** Contact information (name, email, phone, location) */
  CONTACT = 'contact',
  /** Professional summary or objective statement */
  SUMMARY = 'summary',
  /** Work experience / employment history */
  EXPERIENCE = 'experience',
  /** Education and degrees */
  EDUCATION = 'education',
  /** Skills and competencies */
  SKILLS = 'skills',
  /** Professional certifications and licenses */
  CERTIFICATIONS = 'certifications',
  /** Personal projects or portfolio items */
  PROJECTS = 'projects',
  /** External links (LinkedIn, GitHub, portfolio) */
  LINKS = 'links',
  /** Unrecognized section */
  UNKNOWN = 'unknown',
}

/**
 * Parsing statistics for quality tracking
 *
 * Used to verify REQ-PRO-01 acceptance criteria (≥75% accuracy)
 */
export interface ParseStats {
  /** Total key fields attempted to parse */
  totalFields: number;
  /** Fields successfully extracted with ≥70% confidence */
  successfulFields: number;
  /** Overall parsing accuracy percentage */
  accuracy: number;
  /** Did parsing meet the ≥75% accuracy target? */
  meetsAccuracyTarget: boolean;
}
