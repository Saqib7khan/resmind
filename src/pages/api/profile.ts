import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerSupabaseClient } from '@/lib/supabase/pages-server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/profile
 * Returns the authenticated user's profile using the admin client
 * to bypass RLS infinite recursion on the profiles table.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createPagesServerSupabaseClient(req, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const adminClient = createAdminClient();

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
