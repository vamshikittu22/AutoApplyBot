/**
 * Profile Type System for AutoApply Copilot
 * 
 * Defines all user profile data structures covering requirements:
 * - REQ-PRO-01: Core profile fields (name, email, phone, work, education, skills)
 * - REQ-PRO-02: Editable profile structure
 * - REQ-PRO-03: Role preference selection
 * - REQ-PRO-04: Domain-specific fields (Tech/Healthcare/Finance)
 */

/**
 * User's preferred role/industry for tailored AI responses
 */
export type RolePreference = 'Tech' | 'Healthcare' | 'Finance' | 'Marketing' | 'Operations' | 'Other'

/**
 * Core personal/contact information
 * All fields required for profile completeness except workAuthorization
 */
export interface PersonalInfo {
  /** Full name as it appears on resume */
  name: string
  /** Primary email address for job applications */
  email: string
  /** Phone number with country code (format flexible) */
  phone: string
  /** City, State or City, Country format */
  location: string
  /** Work authorization status (e.g., "US Citizen", "H1B", "Sponsorship Required") */
  workAuthorization?: string
}

/**
 * Single work experience entry
 * Supports chronological resume format with achievement bullets
 */
export interface WorkExperience {
  /** Unique identifier for list management and edits */
  id: string
  /** Job title/position held */
  position: string
  /** Company/organization name */
  company: string
  /** Start date in ISO format (YYYY-MM or YYYY-MM-DD) */
  startDate: string
  /** End date in ISO format or literal 'Present' for current role */
  endDate: string | 'Present'
  /** Achievement bullet points (action-oriented statements) */
  achievements: string[]
}

/**
 * Single education entry
 * Supports degree programs with optional GPA
 */
export interface Education {
  /** Unique identifier for list management */
  id: string
  /** Degree type and major (e.g., "B.S. Computer Science") */
  degree: string
  /** University/college name */
  institution: string
  /** Start date in ISO format */
  startDate: string
  /** End date in ISO format or 'Present' for ongoing */
  endDate: string | 'Present'
  /** GPA in format "3.85" (optional) */
  gpa?: string
}

/**
 * Single skill with optional categorization
 * Used for both hard skills (technical) and soft skills
 */
export interface Skill {
  /** Skill name (e.g., "Python", "Project Management") */
  name: string
  /** Optional category for grouping (e.g., "Programming", "Clinical", "Financial") */
  category?: string
}

/**
 * External profile links and portfolios
 * Supports common professional platforms
 */
export interface Links {
  /** LinkedIn profile URL */
  linkedin?: string
  /** GitHub profile URL (primarily for Tech roles) */
  github?: string
  /** Portfolio website URL */
  portfolio?: string
  /** Personal website/blog URL */
  personalSite?: string
  /** Additional links not covered above (e.g., Behance, Medium) */
  other?: Record<string, string>
}

/**
 * Domain-specific fields for role customization (REQ-PRO-04)
 * Only relevant fields displayed based on user's rolePreference
 */
export interface DomainExtras {
  // Tech-specific fields
  /** Primary technologies/frameworks (e.g., ["React", "Node.js", "AWS"]) */
  techStack?: string[]
  /** GitHub username for profile integration */
  githubUsername?: string
  /** Portfolio website URL (tech-focused) */
  portfolioUrl?: string
  
  // Healthcare-specific fields
  /** National Provider Identifier for healthcare professionals */
  npiNumber?: string
  /** Clinical specialty (e.g., "Cardiology", "Oncology") */
  clinicalSpecialty?: string
  /** Professional certifications (e.g., ["ACLS", "BLS", "PALS"]) */
  certifications?: string[]
  /** State medical/nursing license numbers */
  licenseNumbers?: string[]
  
  // Finance-specific fields
  /** FINRA license numbers (e.g., ["Series 7", "Series 63"]) */
  finraLicenses?: string[]
  /** CFA program level (e.g., "Level II Candidate", "CFA Charterholder") */
  cfaLevel?: string
  /** CPA license state(s) */
  cpaLicense?: string
  /** Quantifiable finance achievements (e.g., "Managed $50M portfolio") */
  quantAchievements?: string[]
}

/**
 * Complete user profile structure
 * This is the primary data model for the entire application
 */
export interface Profile {
  /** Core contact information (required) */
  personal: PersonalInfo
  /** Work experience entries (chronological order, most recent first) */
  workHistory: WorkExperience[]
  /** Education entries (chronological order, most recent first) */
  education: Education[]
  /** Skills list (can be categorized) */
  skills: Skill[]
  /** External profile links */
  links: Links
  /** Role-specific additional fields */
  domainExtras: DomainExtras
  /** User's preferred role for AI customization */
  rolePreference: RolePreference
  /** ISO timestamp when profile was first created */
  createdAt: string
  /** ISO timestamp of last profile update */
  updatedAt: string
}

/**
 * Helper type: All possible profile section keys
 */
export type ProfileSection = keyof Profile

/**
 * Helper type: Fields that must always be present
 */
export type RequiredProfileFields = 'personal' | 'rolePreference'

/**
 * Helper type: Fields that are optional or can be empty arrays
 */
export type OptionalProfileFields = Exclude<ProfileSection, RequiredProfileFields>

/**
 * Partial update structure for profile modifications
 * updatedAt is always required to track modification time
 */
export type ProfileUpdate = Partial<Profile> & {
  /** Must be updated on every profile change */
  updatedAt: string
}
