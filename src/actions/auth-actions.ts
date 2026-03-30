import { createClient } from '@/lib/supabase/client';
import { loginSchema, signupSchema } from '@/lib/schemas';
import { z } from 'zod';

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
    // Redirect to dashboard — middleware will handle admin role redirect
    return { success: true, redirectTo: '/dashboard' };
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
