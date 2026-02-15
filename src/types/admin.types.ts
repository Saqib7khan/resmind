/**
 * Admin Type Definitions
 */

export interface AdminProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  full_name: string | null;
  avatar_url: string | null;
  credits: number;
  created_at: string;
}

export interface AdminGeneration {
  id: string;
  user_id: string;
  resume_id: string | null;
  job_id: string | null;
  score: number | null;
  feedback_json: any;
  structured_resume_data: any;
  pdf_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalResumes: number;
  totalJobs: number;
  totalGenerations: number;
  recentUsers: number;
  generationStats: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
}
