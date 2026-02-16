/**
 * API Route: Generate PDF from resume data
 * POST /api/generate-pdf
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { renderToBuffer } from '@react-pdf/renderer';
import { createPagesServerSupabaseClient } from '@/lib/supabase/pages-server';
import { ResumePDFDocument } from '@/lib/pdf-generator';
import React from 'react';
import type { GenerationData } from '@/types/resume.types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { generationId } = req.body;

    if (!generationId) {
      return res.status(400).json({ error: 'Generation ID is required' });
    }

    // Create Supabase client
    const supabase = createPagesServerSupabaseClient(req, res);

    // Get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch generation data
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single();

    if (genError || !generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    const genData = generation as unknown as GenerationData;

    // Check if PDF already exists
    if (genData.pdf_url) {
      return res.status(200).json({
        success: true,
        pdfUrl: genData.pdf_url,
        message: 'PDF already exists',
      });
    }

    const resumeData = genData.structured_resume_data;

    if (!resumeData) {
      return res.status(400).json({ error: 'No resume data available' });
    }

    // Generate PDF
    const pdfElement = React.createElement(ResumePDFDocument, { data: resumeData });
    // @ts-expect-error - renderToBuffer type needs ReactElement from @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(pdfElement);

    // Upload to Supabase Storage
    const fileName = `${user.id}/${generationId}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload PDF' });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('resumes').getPublicUrl(fileName);

    // Update generation with PDF URL
    const { error: updateError } = await supabase
      .from('generations')
      .update({ pdf_url: publicUrl })
      .eq('id', generationId);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ error: 'Failed to update generation' });
    }

    return res.status(200).json({
      success: true,
      pdfUrl: publicUrl,
      message: 'PDF generated successfully',
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    
    if (error instanceof Error && error.message.includes('renderToBuffer')) {
      return res.status(500).json({
        error: 'PDF rendering failed',
        details: 'There was an error rendering the PDF. Please try again.',
      });
    }
    
    if (error instanceof Error && error.message.includes('storage')) {
      return res.status(500).json({
        error: 'Storage service unavailable',
        details: 'Failed to save the PDF. Please try again later.',
      });
    }
    
    return res.status(500).json({
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
