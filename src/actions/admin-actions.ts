/**
 * Admin Actions - Server actions for admin functionality
 */
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Check if user is admin
export const checkAdminStatus = async () => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { isAdmin: false, error: 'Not authenticated' };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return { isAdmin: false, error: 'Profile not found' };
  }

  return { isAdmin: (profile as {role: string}).role === 'admin' };
};

// Get all users
export const getAllUsersAction = async () => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated', data: null };
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || (profile as {role: string}).role !== 'admin') {
    return { success: false, error: 'Unauthorized - Admin access required', data: null };
  }

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: users };
};

// Get admin statistics
export const getAdminStatsAction = async () => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated', data: null };
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || (profile as {role: string}).role !== 'admin') {
    return { success: false, error: 'Unauthorized', data: null };
  }

  // Get counts
  const [usersResult, resumesResult, jobsResult, generationsResult] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('resumes').select('*', { count: 'exact', head: true }),
    supabase.from('job_descriptions').select('*', { count: 'exact', head: true }),
    supabase.from('generations').select('*', { count: 'exact', head: true }),
  ]);

  // Get generation status breakdown
  const { data: generationStats } = await supabase
    .from('generations')
    .select('status');

  const statusBreakdown = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  generationStats?.forEach((gen: {status: string}) => {
    if (gen.status && gen.status in statusBreakdown) {
      statusBreakdown[gen.status as keyof typeof statusBreakdown]++;
    }
  });

  // Get recent users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: recentUsersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString());

  const stats = {
    totalUsers: usersResult.count || 0,
    totalResumes: resumesResult.count || 0,
    totalJobs: jobsResult.count || 0,
    totalGenerations: generationsResult.count || 0,
    recentUsers: recentUsersCount || 0,
    generationStats: statusBreakdown,
  };

  return { success: true, data: stats };
};

// Update user credits
export const updateUserCreditsAction = async (userId: string, credits: number) => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || (profile as {role: string}).role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ credits } as never)
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
};

// Update user role
export const updateUserRoleAction = async (userId: string, role: 'user' | 'admin') => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || (profile as {role: string}).role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  // Prevent admin from demoting themselves
  if (userId === user.id) {
    return { success: false, error: 'Cannot change your own role' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role } as never)
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
};

// Get all generations (admin view)
export const getAllGenerationsAction = async () => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated', data: null };
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || (profile as {role: string}).role !== 'admin') {
    return { success: false, error: 'Unauthorized', data: null };
  }

  const { data: generations, error } = await supabase
    .from('generations')
    .select(`
      *,
      profiles:user_id (email, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: generations };
};

// Delete user (admin only)
export const deleteUserAction = async (userId: string) => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || (profile as {role: string}).role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  // Prevent admin from deleting themselves
  if (userId === user.id) {
    return { success: false, error: 'Cannot delete your own account' };
  }

  // Delete user profile (cascade will handle related data)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
};
