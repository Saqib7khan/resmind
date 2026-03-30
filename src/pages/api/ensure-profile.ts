import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerSupabaseClient } from '@/lib/supabase/pages-server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/ensure-profile
 * Ensures the authenticated user has a profile row.
 * Uses the admin client (service role) to bypass RLS and avoid
 * infinite recursion in the profiles RLS policies.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate the user with the normal client
    const supabase = createPagesServerSupabaseClient(req, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Use admin client to bypass RLS for profile upsert
    const adminClient = createAdminClient();

    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || 'User',
          credits: 5,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      return res.status(500).json({ error: profileError.message });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Ensure profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
