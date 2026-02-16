import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from '@/types/database.types';

/**
 * Supabase server client for Pages Router API routes.
 */
export const createPagesServerSupabaseClient = (
  req: NextApiRequest,
  res: NextApiResponse
): SupabaseClient<Database> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return Object.entries(req.cookies || {}).map(([name, value]) => ({
          name,
          value: value ?? '',
        }));
      },
      setAll(cookiesToSet) {
        const serialized = cookiesToSet.map(({ name, value, options }) => {
          const parts = [`${name}=${value}`, 'Path=/', 'SameSite=Lax'];
          if (options?.maxAge) {
            parts.push(`Max-Age=${options.maxAge}`);
          }
          if (options?.httpOnly) {
            parts.push('HttpOnly');
          }
          if (options?.secure) {
            parts.push('Secure');
          }
          return parts.join('; ');
        });

        if (serialized.length > 0) {
          res.setHeader('Set-Cookie', serialized);
        }
      },
    },
  });
};
