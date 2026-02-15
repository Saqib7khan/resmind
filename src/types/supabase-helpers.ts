/**
 * Type Helpers for Supabase Queries
 * Helps with TypeScript type inference issues
 */

import type { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Resume = Database['public']['Tables']['resumes']['Row'];
export type JobDescription = Database['public']['Tables']['job_descriptions']['Row'];
export type Generation = Database['public']['Tables']['generations']['Row'];

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ResumeInsert = Database['public']['Tables']['resumes']['Insert'];
export type JobDescriptionInsert = Database['public']['Tables']['job_descriptions']['Insert'];
export type GenerationInsert = Database['public']['Tables']['generations']['Insert'];

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type ResumeUpdate = Database['public']['Tables']['resumes']['Update'];
export type JobDescriptionUpdate = Database['public']['Tables']['job_descriptions']['Update'];
export type GenerationUpdate = Database['public']['Tables']['generations']['Update'];
