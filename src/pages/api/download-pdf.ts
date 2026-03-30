import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPagesServerSupabaseClient } from '@/lib/supabase/pages-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { generationId } = req.query;

  if (!generationId || typeof generationId !== 'string') {
    return res.status(400).json({ error: 'Generation ID is required' });
  }

  // Create Supabase client
  const supabase = createPagesServerSupabaseClient(req, res);

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validate ownership using admin client
  const adminClient = createAdminClient();
  const { data: generation, error: genError } = await adminClient
    .from('generations')
    .select('id')
    .eq('id', generationId)
    .eq('user_id', user.id)
    .single();

  if (genError || !generation) {
    return res.status(404).json({ error: 'Generation not found' });
  }

  // File is saved under the user.id/generationId.pdf
  const fileName = `${user.id}/${generationId}.pdf`;

  // Create a 60-second signed URL just for this immediate download request
  const { data, error } = await adminClient.storage
    .from('resumes')
    .createSignedUrl(fileName, 60, {
      download: true,
    });

  if (error || !data?.signedUrl) {
    console.error('Failed to create signed URL:', error);
    return res.status(500).json({ error: 'Failed to access PDF file' });
  }

  // Redirect the browser straight to the secure signed URL
  return res.redirect(302, data.signedUrl);
}
