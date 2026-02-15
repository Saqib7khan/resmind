import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

// Resume upload schema
export const resumeUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
    message: 'File size must be less than 5MB',
  }).refine((file) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type), {
    message: 'File must be PDF or Word document',
  }),
});

// Job description schema
export const jobDescriptionSchema = z.object({
  title: z.string().min(2, 'Job title required'),
  company: z.string().min(2, 'Company name required'),
  description: z.string().min(50, 'Job description must be at least 50 characters'),
});

// Resume structure for AI output
export const resumeStructureSchema = z.object({
  personal: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().url().optional(),
    website: z.string().url().optional(),
  }),
  summary: z.string(),
  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    location: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    bullets: z.array(z.string()),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string().optional(),
    graduationDate: z.string().optional(),
    gpa: z.string().optional(),
  })),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    languages: z.array(z.string()).optional(),
  }),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string().optional(),
  })).optional(),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    link: z.string().url().optional(),
  })).optional(),
});

// AI feedback schema
export const feedbackSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  atsKeywords: z.array(z.string()),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type JobDescriptionInput = z.infer<typeof jobDescriptionSchema>;
export type ResumeStructure = z.infer<typeof resumeStructureSchema>;
export type Feedback = z.infer<typeof feedbackSchema>;
