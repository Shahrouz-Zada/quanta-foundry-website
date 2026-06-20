// =============================================================================
// Quanta Foundry — Type Definitions
// Structured as future Sanity.io CMS collections
// =============================================================================

// ---------------------------------------------------------------------------
// Focus Area (future CMS collection: 'focus-areas')
// ---------------------------------------------------------------------------
export interface FocusArea {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  icon: string;
  status: 'active' | 'coming-soon' | 'archived';
  engagementModel: EngagementModel;
  technicalTracks: TechnicalTrack[];
  tags: string[];
  outcomes: string[];
  requirements: string[];
  statusLabel?: string;
  statusText?: string;
  ctas: {
    target: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  }[];
  accentColor: string;
}

export interface EngagementModel {
  durationLabel: string;
  duration: string;
  commitmentLabel: string;
  commitment: string;
  deliveryLabel: string;
  delivery: string;
  teamScaleLabel: string;
  teamScale: string;
}

export interface TechnicalTrack {
  title: string;
  description: string;
  topics: string[];
  phase: string;
}

// ---------------------------------------------------------------------------
// Cohort (future CMS collection: 'cohorts')
// ---------------------------------------------------------------------------
export interface Cohort {
  id: string;
  programId?: string;
  name: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  status: 'upcoming' | 'enrolling' | 'in-progress' | 'completed';
  spotsTotal: number;
  spotsFilled: number;
}

// ---------------------------------------------------------------------------
// Event (future CMS collection: 'events')
// ---------------------------------------------------------------------------
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'reading-club' | 'workshop' | 'webinar' | 'meetup';
  topic: string;
  speaker?: string;
  location: string;
  registrationLink?: string;
  status: 'upcoming' | 'past' | 'cancelled' | 'planned';
  maxAttendees?: number;
}

// ---------------------------------------------------------------------------
// Insight / Blog Post (future CMS collection: 'insights')
// ---------------------------------------------------------------------------
export interface Insight {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  date: string;
  readTime?: string;
  category: InsightCategory;
  tags: string[];
  featured: boolean;
  imageUrl?: string;
}

export type InsightCategory =
  | 'ai-ml'
  | 'quantitative-finance'
  | 'quantum-software'
  | 'neuroscience-markets'
  | 'complex-systems'
  | 'research';

// ---------------------------------------------------------------------------
// Team Member (future CMS collection: 'team')
// ---------------------------------------------------------------------------
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  shortBio: string;
  credentials: string[];
  imageUrl?: string;
  linkedIn?: string;
  website?: string;
  isFounder: boolean;
  order: number;
}

// ---------------------------------------------------------------------------
// Testimonial (future CMS collection: 'testimonials')
// ---------------------------------------------------------------------------
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company?: string;
  focusAreaId?: string;
  imageUrl?: string;
  featured: boolean;
}

// ---------------------------------------------------------------------------
// Partner (future CMS collection: 'partners')
// ---------------------------------------------------------------------------
export interface Partner {
  id: string;
  name: string;
  type: 'corporate' | 'academic' | 'technology' | 'research';
  logoUrl?: string;
  website?: string;
  description?: string;
  authorized: boolean; // GDPR: only display if explicitly authorized
}

// ---------------------------------------------------------------------------
// FAQ (future CMS collection: 'faqs')
// ---------------------------------------------------------------------------
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'focus-areas' | 'application' | 'corporate' | 'community';
  order: number;
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface FooterSection {
  title: string;
  links: NavItem[];
}

// ---------------------------------------------------------------------------
// Form Data Types
// ---------------------------------------------------------------------------
export interface StudentApplicationData {
  name: string;
  email: string;
  linkedIn: string;
  background: string;
  motivation: string;
  domainOfInterest: string;
  gdprConsent: boolean;
}

export interface CorporateInquiryData {
  name: string;
  company: string;
  role: string;
  email: string;
  collaborationType: string;
  message: string;
  gdprConsent: boolean;
}

export interface NewsletterSignupData {
  email: string;
  name?: string;
  gdprConsent: boolean;
}

export interface ReadingClubSignupData {
  name: string;
  email: string;
  topicInterest: string;
  gdprConsent: boolean;
}

// ---------------------------------------------------------------------------
// Workspace Q Types
// ---------------------------------------------------------------------------
export interface WorkspaceQCourse {
  id: string;
  title: string;
  cohort: string;
  description: string;
  status: 'active' | 'upcoming' | 'archived';
  resources: WorkspaceQResource[];
}

export interface WorkspaceQResource {
  id: string;
  title: string;
  description: string;
  type: 'project-brief' | 'rubric' | 'slides' | 'reading' | 'template' | 'dataset' | 'faq';
  format: 'pdf' | 'link' | 'text' | 'github';
  url?: string;
  content?: string;
  order: number;
}

export interface WorkspaceQTool {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  category: 'coding' | 'data' | 'writing' | 'deployment';
}

export interface WorkspaceQRegistrationData {
  name: string;
  email: string;
  school: string;
  courseInterest: string;
  gdprConsent: boolean;
}
