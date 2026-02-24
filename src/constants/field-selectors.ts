/**
 * Keywords for profile field paths
 * Used for fuzzy matching against form field labels/names/placeholders
 * Maps field path strings to keyword arrays for matching
 */
export const FIELD_KEYWORDS: Record<string, string[]> = {
  // Personal info (nested under Profile.personal)
  'personal.name': ['full name', 'name', 'legal name', 'your name'],
  'personal.email': ['email', 'e-mail', 'email address', 'contact email', 'your email', 'mail'],
  'personal.phone': [
    'phone',
    'telephone',
    'mobile',
    'cell',
    'phone number',
    'contact number',
    'your phone',
  ],
  'personal.location': ['location', 'city', 'address', 'where are you based', 'current location'],
  'personal.workAuthorization': [
    'work authorization',
    'visa status',
    'sponsorship',
    'authorized to work',
    'work permit',
  ],

  // Links (nested under Profile.links)
  'links.linkedin': ['linkedin', 'linkedin profile', 'linkedin url'],
  'links.github': ['github', 'github profile', 'github username'],
  'links.portfolio': ['portfolio', 'portfolio website', 'portfolio url'],
  'links.personalSite': ['website', 'personal site', 'personal website', 'blog'],

  // Work history (nested under Profile.workHistory[])
  'workHistory.position': [
    'current title',
    'job title',
    'current position',
    'position',
    'role',
    'title',
    'current job title',
  ],
  'workHistory.company': [
    'current company',
    'employer',
    'current employer',
    'organization',
    'company',
  ],
  'workHistory.startDate': ['start date', 'from', 'began'],
  'workHistory.endDate': ['end date', 'to', 'ended', 'until'],

  // Education (nested under Profile.education[])
  'education.degree': ['degree', 'education level', 'highest degree', 'major'],
  'education.institution': ['university', 'college', 'school', 'institution'],
  'education.startDate': ['education start', 'enrolled'],
  'education.endDate': ['graduation', 'graduation year', 'grad year', 'year graduated'],
  'education.gpa': ['gpa', 'grade point average', 'grades'],

  // Skills (nested under Profile.skills[])
  skills: [
    'skills',
    'technical skills',
    'competencies',
    'technologies',
    'expertise',
    'your skills',
  ],

  // Domain extras (nested under Profile.domainExtras)
  'domainExtras.techStack': ['tech stack', 'technologies', 'frameworks', 'tools'],
  'domainExtras.githubUsername': ['github', 'github username'],
  'domainExtras.portfolioUrl': ['portfolio', 'portfolio link'],
  'domainExtras.npiNumber': ['npi', 'npi number', 'national provider identifier'],
  'domainExtras.clinicalSpecialty': ['specialty', 'clinical specialty', 'specialization'],
  'domainExtras.certifications': ['certifications', 'licenses', 'credentials'],
  'domainExtras.licenseNumbers': ['license number', 'license', 'state license'],
  'domainExtras.finraLicenses': ['finra', 'series', 'licenses'],
  'domainExtras.cfaLevel': ['cfa', 'cfa level', 'chartered financial analyst'],
  'domainExtras.cpaLicense': ['cpa', 'cpa license', 'certified public accountant'],

  // Role preference
  rolePreference: ['role', 'role preference', 'preferred role', 'job preference', 'industry'],

  // Timestamps (not typically mapped to form fields)
  createdAt: [],
  updatedAt: [],
};

/**
 * Regex patterns for field type detection
 */
export const FIELD_PATTERNS: Record<string, RegExp> = {
  email: /^(email|e-mail|mail)/i,
  phone: /^(phone|tel|mobile|cell)/i,
  firstName: /^(first|given|fname)/i,
  lastName: /^(last|sur|family|lname)/i,
  city: /^(city|town|locality)/i,
  state: /^(state|province|region)/i,
  zipCode: /^(zip|postal)/i,
  country: /^country/i,
  linkedin: /linkedin/i,
  github: /github/i,
  portfolio: /(portfolio|website|site)/i,
  url: /^(url|link|website)/i,
  date: /^(date|year|graduation)/i,
  experience: /(experience|years|yoe)/i,
  degree: /degree/i,
  major: /(major|field|area)/i,
  university: /(university|college|school)/i,
  company: /company|employer/i,
  title: /(title|position|role)/i,
  skills: /skills|competenc/i,
  address: /address|street/i,
};

/**
 * Confidence thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 80, // ≥80% = auto-fill with high confidence
  MEDIUM: 70, // 70-79% = auto-fill with medium confidence
  LOW: 50, // 50-69% = require user review
  SKIP: 0, // <50% = skip, too uncertain
};

/**
 * Field type detection keywords
 */
export const FIELD_TYPE_KEYWORDS = {
  text: ['name', 'title', 'company', 'position'],
  email: ['email', 'e-mail'],
  phone: ['phone', 'tel', 'mobile', 'cell'],
  url: ['url', 'link', 'website', 'linkedin', 'github', 'portfolio'],
  date: ['date', 'year', 'graduation'],
  select: ['country', 'state', 'degree', 'level'],
  textarea: ['experience', 'skills', 'education', 'summary', 'bio', 'description'],
};
