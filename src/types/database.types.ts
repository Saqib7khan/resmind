/**
 * Database Types - Generated from Supabase Schema
 * Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'user' | 'admin';
          full_name: string | null;
          avatar_url: string | null;
          credits: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'user' | 'admin';
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'user' | 'admin';
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          created_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          file_path: string;
          extracted_text: string | null;
          file_name: string | null;
          file_size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_path: string;
          extracted_text?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_path?: string;
          extracted_text?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
      };
      job_descriptions: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          company: string | null;
          raw_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          company?: string | null;
          raw_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          company?: string | null;
          raw_text?: string;
          created_at?: string;
        };
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string | null;
          job_id: string | null;
          score: number | null;
          feedback_json: Json | null;
          structured_resume_data: Json | null;
          pdf_url: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_id?: string | null;
          job_id?: string | null;
          score?: number | null;
          feedback_json?: Json | null;
          structured_resume_data?: Json | null;
          pdf_url?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_id?: string | null;
          job_id?: string | null;
          score?: number | null;
          feedback_json?: Json | null;
          structured_resume_data?: Json | null;
          pdf_url?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'user' | 'admin';
      generation_status: 'pending' | 'processing' | 'completed' | 'failed';
    };
  };
};
