import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerSupabaseClient } from '@/lib/supabase/pages-server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Generation, JobDescription, Resume } from '@/types/supabase-helpers';

type GenerationWithRelations = Generation & {
  resumes: Resume | null;
  job_descriptions: JobDescription | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Generation ID is required' });
  }

  const supabase = createPagesServerSupabaseClient(req, res);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const adminClient = createAdminClient();

  // Use admin client to bypass RLS
  const { data, error } = await adminClient
    .from('generations')
    .select(`
      *,
      resumes:resume_id (*),
      job_descriptions:job_id (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
    .returns<GenerationWithRelations>();

  if (error || !data) {
    return res.status(404).json({ error: 'Generation not found', details: error?.message });
  }

  return res.status(200).json({ success: true, data });
}
