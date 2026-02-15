/**
 * PDF Generation Actions - Client and Server actions for PDF handling
 */
'use server';

import { revalidatePath } from 'next/cache';

export const generatePdfAction = async (generationId: string) => {
  try {
    // Call the API endpoint to generate PDF
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/generate-pdf`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ generationId }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to generate PDF' };
    }

    revalidatePath(`/dashboard/generation/${generationId}`);
    revalidatePath('/dashboard/history');

    return { success: true, pdfUrl: data.pdfUrl };
  } catch (error) {
    console.error('PDF generation action error:', error);
    return { success: false, error: 'Failed to generate PDF' };
  }
};
