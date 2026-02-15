'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { loginSchema, signupSchema } from '@/lib/schemas';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export const loginAction = async (data: z.infer<typeof loginSchema>) => {
  const validated = loginSchema.parse(data);
  
  const supabase = await createServerSupabaseClient();
  
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (authData.user) {
    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profile?.role === 'admin') {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  }

  return { success: true };
};

export const signupAction = async (data: z.infer<typeof signupSchema>) => {
  const validated = signupSchema.parse(data);
  
  const supabase = await createServerSupabaseClient();
  
  const { data: authData, error } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      data: {
        full_name: validated.fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (authData.user) {
    return { 
      success: true, 
      message: 'Account created! Check your email to verify your account.',
    };
  }

  return { success: true };
};

export const logoutAction = async () => {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
};
