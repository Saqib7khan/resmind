import { createClient } from '@/lib/supabase/client';
import { jobDescriptionSchema } from '@/lib/schemas';
import { extractTextFromFile } from '@/lib/pdf-utils';
import { z } from 'zod';
import type { Generation, JobDescription, Resume } from '@/types/supabase-helpers';

export type GenerationWithRelations = Generation & {
  resumes: Pick<Resume, 'file_name'> | null;
  job_descriptions: Pick<JobDescription, 'title' | 'company'> | null;
};

export const createJobDescriptionAction = async (
  data: z.infer<typeof jobDescriptionSchema>
) => {
  const validated = jobDescriptionSchema.parse(data);
  
  const supabase = createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: jobDesc, error } = await supabase
    .from('job_descriptions')
    .insert({
      user_id: user.id,
      title: validated.title,
      company: validated.company,
      raw_text: validated.description,
    })
    .select()
    .single()
    .returns<JobDescription>();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: jobDesc };
};

export const uploadResumeAction = async (formData: FormData) => {
  const file = formData.get('file') as File;
  
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  const supabase = createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Ensure user profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!existingProfile) {
    // Create profile if it doesn't exist
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email || 'User',
        credits: 5, // Initialize with 5 credits
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return { success: false, error: `Failed to create profile: ${profileError.message}` };
    }
  }

  // Upload to storage
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const timestamp = Date.now();
  const fileName = `${user.id}/${timestamp}.${fileExtension}`;
  
  try {
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        contentType: file.type || 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // Extract text from resume
    let extractedText = '';
    try {
      extractedText = await extractTextFromFile(file);
    } catch (error) {
      console.warn('Text extraction failed:', error);
      extractedText = `Resume: ${file.name}`;
    }

    // Save to database
    const { data: resume, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        file_path: fileName,
        file_name: file.name,
        file_size: file.size,
        extracted_text: extractedText || null,
      })
      .select()
      .single()
      .returns<Resume>();

    if (dbError) {
      // Clean up uploaded file
      await supabase.storage.from('resumes').remove([fileName]);
      console.error('Database error:', dbError);
      return { success: false, error: `Failed to save: ${dbError.message}` };
    }

    return { success: true, data: resume };
  } catch (error) {
    console.error('Upload action error:', error);
    return { success: false, error: `An error occurred: ${String(error)}` };
  }
};

export const getResumesAction = async () => {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] };
  }

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<Resume[]>();

  if (error) {
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data };
};

export const getJobDescriptionsAction = async () => {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] };
  }

  const { data, error } = await supabase
    .from('job_descriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<JobDescription[]>();

  if (error) {
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data };
};

export const getGenerationsAction = async () => {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] };
  }

  const { data, error } = await supabase
    .from('generations')
    .select(`
      *,
      resumes:resume_id (file_name),
      job_descriptions:job_id (title, company)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<GenerationWithRelations[]>();

  if (error) {
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data };
};

export const deleteResumeAction = async (id: string) => {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get resume to delete file from storage
  const { data: resume } = await supabase
    .from('resumes')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (resume) {
    await supabase.storage.from('resumes').remove([resume.file_path]);
  }

  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};
