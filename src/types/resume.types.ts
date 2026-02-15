/**
 * Resume and Feedback Types
 */

export interface FeedbackData {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  atsKeywords: string[];
}

export interface ResumePersonalInfo {
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

export interface ResumeExperience {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

export interface ResumeSkills {
  technical?: string[];
  soft?: string[];
  languages?: string[];
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ResumeStructuredData {
  personal: ResumePersonalInfo;
  summary?: string;
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  skills?: ResumeSkills;
  certifications?: ResumeCertification[];
  projects?: ResumeProject[];
}

export interface GenerationData {
  id: string;
  user_id: string;
  resume_id: string | null;
  job_id: string | null;
  score: number | null;
  feedback_json: FeedbackData | null;
  structured_resume_data: ResumeStructuredData | null;
  pdf_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}
