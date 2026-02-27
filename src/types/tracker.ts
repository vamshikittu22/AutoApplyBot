/**
 * Tracker Type System for AutoApply Copilot
 *
 * Defines job application tracking data structures covering requirements:
 * - REQ-TRK-01: Application logging and persistence
 * - REQ-TRK-02: Status tracking (Applied/Interview/Offer/Rejected/Withdrawn)
 * - REQ-TRK-03: Multi-platform support (Workday/Greenhouse/Lever/Unknown)
 * - REQ-SAF-01: Volume tracking for 24h safety limits
 */

/**
 * Supported ATS platforms for tracking
 */
export type ATSPlatform = 'workday' | 'greenhouse' | 'lever' | 'unknown';

/**
 * Application status lifecycle
 * Follows standard job application workflow
 */
export enum ApplicationStatus {
  Applied = 'applied',
  Interview = 'interview',
  Offer = 'offer',
  Rejected = 'rejected',
  Withdrawn = 'withdrawn',
}

/**
 * Tracked job application record
 * Stored in Chrome Storage as array of applications
 */
export interface TrackedApplication {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Job title/position applied for */
  jobTitle: string;
  /** Company/organization name */
  company: string;
  /** Detected ATS platform type */
  atsType: ATSPlatform;
  /** Full job posting URL (stored with query params for uniqueness) */
  url: string;
  /** ISO 8601 timestamp when application was submitted */
  appliedDate: string;
  /** Current application status */
  status: ApplicationStatus;
  /** Optional user notes for follow-up or context */
  notes?: string;
}

/**
 * Volume tracking data for 24h safety limits
 * Uses calendar day (midnight-to-midnight in user timezone)
 */
export interface VolumeData {
  /** Date in YYYY-MM-DD format (user's local timezone) */
  date: string;
  /** Number of applications submitted on this date */
  count: number;
}
