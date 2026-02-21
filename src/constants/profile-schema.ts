/**
 * Profile Validation Schema and Constants
 *
 * Defines validation rules, role-specific field mappings, and default structures
 * for profile data management covering REQ-PRO-01 through REQ-PRO-04.
 */

import type { RolePreference, Profile } from '@/types/profile';

/**
 * Validation rules for profile fields
 *
 * Used by profile editor and parser to enforce data integrity.
 * All regex patterns are validation rules, not parsing rules.
 */
export const PROFILE_SCHEMA = {
  personal: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      description: 'Full name as appears on resume',
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      description: 'Valid email address',
    },
    phone: {
      required: false,
      pattern: /^[\d\s\-\+\(\)]+$/,
      minLength: 10,
      description: 'Phone number with optional country code and formatting',
    },
    location: {
      required: false,
      maxLength: 200,
      description: 'City, State or City, Country format',
    },
    workAuthorization: {
      required: false,
      maxLength: 100,
      description: 'Work authorization status',
    },
  },
  workExperience: {
    position: {
      required: true,
      minLength: 2,
      maxLength: 150,
      description: 'Job title or position held',
    },
    company: {
      required: true,
      minLength: 2,
      maxLength: 150,
      description: 'Company or organization name',
    },
    startDate: {
      required: true,
      pattern: /^\d{4}-\d{2}(-\d{2})?$/,
      description: 'ISO date format: YYYY-MM or YYYY-MM-DD',
    },
    endDate: {
      required: true,
      description: 'ISO date format or literal "Present"',
    },
    achievements: {
      required: false,
      maxItems: 10,
      description: 'Achievement bullet points (action-oriented)',
    },
  },
  education: {
    degree: {
      required: true,
      minLength: 2,
      maxLength: 150,
      description: 'Degree type and major',
    },
    institution: {
      required: true,
      minLength: 2,
      maxLength: 200,
      description: 'University or college name',
    },
    startDate: {
      required: true,
      pattern: /^\d{4}-\d{2}(-\d{2})?$/,
      description: 'ISO date format',
    },
    endDate: {
      required: true,
      description: 'ISO date format or literal "Present"',
    },
    gpa: {
      required: false,
      pattern: /^\d\.\d{1,2}$/,
      description: 'GPA in format "3.85"',
    },
  },
  skills: {
    maxCount: 50,
    name: {
      required: true,
      minLength: 1,
      maxLength: 50,
      description: 'Skill name',
    },
  },
} as const;

/**
 * Role-specific fields visibility (REQ-PRO-04)
 *
 * Defines which domainExtras fields are shown based on user's rolePreference.
 * UI should conditionally render fields based on this mapping.
 */
export const ROLE_SPECIFIC_FIELDS: Record<RolePreference, string[]> = {
  Tech: [
    'techStack', // Primary technologies/frameworks
    'githubUsername', // GitHub profile integration
    'portfolioUrl', // Tech-focused portfolio
  ],
  Healthcare: [
    'npiNumber', // National Provider Identifier
    'clinicalSpecialty', // Medical specialty area
    'certifications', // Professional certifications
    'licenseNumbers', // State medical licenses
  ],
  Finance: [
    'finraLicenses', // FINRA license numbers
    'cfaLevel', // CFA program level
    'cpaLicense', // CPA license state
    'quantAchievements', // Quantifiable achievements
  ],
  Marketing: [], // No specific fields in v1
  Operations: [], // No specific fields in v1
  Other: [], // No specific fields in v1
};

/**
 * Default empty profile structure
 *
 * Used when creating a new profile or resetting to defaults.
 * Provides type-safe empty state with proper structure.
 */
export const createEmptyProfile = (): Profile => ({
  personal: {
    name: '',
    email: '',
    phone: '',
    location: '',
  },
  workHistory: [],
  education: [],
  skills: [],
  links: {},
  domainExtras: {},
  rolePreference: 'Other',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Key fields required for ≥75% parse accuracy (REQ-PRO-01)
 *
 * Parser must successfully extract these fields to meet acceptance criteria.
 * Used by ParseStats calculation to determine if parsing was successful.
 */
export const KEY_PARSE_FIELDS = [
  'personal.name', // Required: Full name
  'personal.email', // Required: Email address
  'personal.phone', // Required: Phone number
  'workHistory', // Required: At least one work entry
  'education', // Required: At least one education entry
  'skills', // Required: At least 3 skills
] as const;

/**
 * Minimum counts for array fields to be considered "successfully parsed"
 */
export const MIN_ARRAY_COUNTS = {
  workHistory: 1, // At least one work experience entry
  education: 1, // At least one education entry
  skills: 3, // At least three skills
} as const;

/**
 * Field labels for UI display
 *
 * Maps profile field paths to human-readable labels for forms.
 */
export const FIELD_LABELS: Record<string, string> = {
  'personal.name': 'Full Name',
  'personal.email': 'Email Address',
  'personal.phone': 'Phone Number',
  'personal.location': 'Location',
  'personal.workAuthorization': 'Work Authorization',
  workHistory: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  'links.linkedin': 'LinkedIn URL',
  'links.github': 'GitHub URL',
  'links.portfolio': 'Portfolio URL',
  'links.personalSite': 'Personal Website',
  'domainExtras.techStack': 'Tech Stack',
  'domainExtras.githubUsername': 'GitHub Username',
  'domainExtras.portfolioUrl': 'Portfolio URL',
  'domainExtras.npiNumber': 'NPI Number',
  'domainExtras.clinicalSpecialty': 'Clinical Specialty',
  'domainExtras.certifications': 'Certifications',
  'domainExtras.licenseNumbers': 'License Numbers',
  'domainExtras.finraLicenses': 'FINRA Licenses',
  'domainExtras.cfaLevel': 'CFA Level',
  'domainExtras.cpaLicense': 'CPA License',
  'domainExtras.quantAchievements': 'Quantitative Achievements',
};
