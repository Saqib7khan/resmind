import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { getGenerationDetailsAction } from '@/actions/ai-actions';
import { GeneratePDFButton } from '@/components/features/generate-pdf-button';
import { Sparkles, ArrowLeft, FileText, Brain } from 'lucide-react';
import Link from 'next/link';
import type { FeedbackData, ResumeStructuredData, GenerationData } from '@/types/resume.types';

interface GenerationPageProps {
  params: { id: string };
}

export default async function GenerationPage({ params }: GenerationPageProps) {
  const result = await getGenerationDetailsAction(params.id);
  const generation = result.data as GenerationData | null;

  if (!generation) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-white mb-2">Generation Not Found</h1>
          <p className="text-gray-400 mb-6">This generation does not exist or has been deleted.</p>
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const feedback = generation.feedback_json as FeedbackData | null;
  const resume = generation.structured_resume_data as ResumeStructuredData | null;
  const pdfUrl = generation.pdf_url as string | null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">AI Generation Complete</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Optimized Resume</h1>
          <p className="text-gray-400">
            Review the AI analysis and download your optimized resume.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/dashboard/history"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to History
          </Link>
          <GeneratePDFButton generationId={params.id} pdfUrl={pdfUrl} />
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">AI Analysis</h2>
              <span className="ml-auto text-2xl font-bold text-purple-400">
                {feedback.score}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {feedback.strengths?.map((strength: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Areas to Improve</h3>
                <ul className="space-y-2">
                  {feedback.weaknesses?.map((weakness: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-400">⚠</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">AI Suggestions</h3>
              <ul className="space-y-2">
                {feedback.suggestions?.map((suggestion: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-purple-400">→</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">ATS Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {feedback.atsKeywords?.map((keyword: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Resume Preview */}
        {resume && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Optimized Resume Content</h2>
            </div>

            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{resume.personal?.name}</h3>
                <p className="text-sm text-gray-400">
                  {resume.personal?.email} • {resume.personal?.phone} • {resume.personal?.location}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Summary</h4>
                <p className="text-sm leading-relaxed">{resume.summary}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Experience</h4>
                <div className="space-y-4">
                  {resume.experience?.map((exp, idx: number) => (
                    <div key={idx} className="border-l-2 border-purple-500/30 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-white font-semibold">{exp.position}</h5>
                          <p className="text-gray-400 text-sm">{exp.company}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {exp.bullets?.map((bullet: string, bidx: number) => (
                          <li key={bidx} className="text-sm flex items-start gap-2">
                            <span className="text-purple-400">•</span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Skills</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Technical</p>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills?.technical?.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-cyan-500/20 rounded text-xs text-cyan-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Soft Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills?.soft?.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
