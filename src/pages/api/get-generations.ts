import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerSupabaseClient } from '@/lib/supabase/pages-server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { GenerationWithRelations } from '@/actions/dashboard-actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createPagesServerSupabaseClient(req, res);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', data: [] });
  }

  const adminClient = createAdminClient();

  // Use admin client to bypass RLS
  const { data, error } = await adminClient
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
    return res.status(500).json({ error: error.message, data: [] });
  }

  return res.status(200).json({ success: true, data });
}
