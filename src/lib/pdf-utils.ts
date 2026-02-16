/**
 * PDF Utilities - Extract text from PDF files
 */

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase();

  try {
    if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Use pdf-parse for PDF files (server-side)
      const buffer = await file.arrayBuffer();
      
      // Dynamically import pdf-parse to avoid issues
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(Buffer.from(buffer));
        return data.text || '';
      } catch (parseError) {
        console.warn('PDF parsing failed, using placeholder:', parseError);
        return `Resume PDF: ${file.name}`;
      }
    } else if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.doc') ||
      file.name.endsWith('.docx')
    ) {
      // For Word documents, try to extract text
      try {
        return await file.text();
      } catch {
        return `Resume Document: ${file.name}`;
      }
    } else {
      // Try generic text extraction
      try {
        return await file.text();
      } catch {
        return `Resume File: ${file.name}`;
      }
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    return `Resume: ${file.name}`;
  }
}
