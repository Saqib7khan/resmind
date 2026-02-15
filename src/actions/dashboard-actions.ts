'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { jobDescriptionSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export const createJobDescriptionAction = async (
  data: z.infer<typeof jobDescriptionSchema>
) => {
  const validated = jobDescriptionSchema.parse(data);
  
  const supabase = await createServerSupabaseClient();
  
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
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true, data: jobDesc };
};

export const uploadResumeAction = async (formData: FormData) => {
  const file = formData.get('file') as File;
  
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Upload to storage
  const fileExtension = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExtension}`;
  
  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  // Extract text (simplified - in production use pdf-parse or similar)
  const extractedText = await file.text().catch(() => '');

  // Save to database
  const { data: resume, error: dbError } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      file_path: fileName,
      file_name: file.name,
      file_size: file.size,
      extracted_text: extractedText,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file
    await supabase.storage.from('resumes').remove([fileName]);
    return { success: false, error: dbError.message };
  }

  revalidatePath('/dashboard');
  return { success: true, data: resume };
};

export const getResumesAction = async () => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] };
  }

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data };
};

export const getJobDescriptionsAction = async () => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] };
  }

  const { data, error } = await supabase
    .from('job_descriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data };
};

export const getGenerationsAction = async () => {
  const supabase = await createServerSupabaseClient();
  
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
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data };
};

export const deleteResumeAction = async (id: string) => {
  const supabase = await createServerSupabaseClient();
  
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

  revalidatePath('/dashboard');
  return { success: true };
};
