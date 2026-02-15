'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface GeneratePDFButtonProps {
  generationId: string;
  pdfUrl: string | null;
}

export function GeneratePDFButton({ generationId, pdfUrl }: GeneratePDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState(pdfUrl);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ generationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate PDF');
      }

      setCurrentPdfUrl(data.pdfUrl);
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (currentPdfUrl) {
    return (
      <div className="flex gap-3">
        <a
          href={currentPdfUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white text-sm font-semibold transition-all inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            'Regenerate PDF'
          )}
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Generate PDF
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
