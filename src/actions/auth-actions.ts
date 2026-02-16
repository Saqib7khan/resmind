import { createClient } from '@/lib/supabase/client';
import { loginSchema, signupSchema } from '@/lib/schemas';
import { z } from 'zod';
import type { Profile } from '@/types/supabase-helpers';

export const loginAction = async (data: z.infer<typeof loginSchema>) => {
  const validated = loginSchema.parse(data);

  const supabase = createClient();
  
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
      .single()
      .returns<Pick<Profile, 'role'>>();

    const redirectTo = profile?.role === 'admin' ? '/admin' : '/dashboard';
    return { success: true, redirectTo };
  }

  return { success: true, redirectTo: '/dashboard' };
};

export const signupAction = async (data: z.infer<typeof signupSchema>) => {
  const validated = signupSchema.parse(data);

  const supabase = createClient();
  
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
  const supabase = createClient();
  await supabase.auth.signOut();
  return { success: true };
};
