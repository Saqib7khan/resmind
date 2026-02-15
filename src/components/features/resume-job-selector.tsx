'use client';

import { useState } from 'react';
import { generateResumeAction } from '@/actions/ai-actions';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GenerateResumeButtonProps {
  resumeId: string;
  jobId: string;
  resumeName: string;
  jobTitle: string;
}

export const GenerateResumeButton = ({
  resumeId,
  jobId,
  resumeName,
  jobTitle,
}: GenerateResumeButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await generateResumeAction(resumeId, jobId);

      if (!result.success) {
        setError(result.error || 'Generation failed');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard/generation/${result.data?.generationId}`);
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={generating || success}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 text-lg"
      >
        {generating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            AI is analyzing and rewriting...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="w-6 h-6" />
            Generated! Redirecting...
          </>
        ) : (
          <>
            <Brain className="w-6 h-6" />
            Generate Optimized Resume
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 p-4 bg-white/5 rounded-lg">
        <p className="text-sm text-gray-400 mb-2">This will match:</p>
        <div className="space-y-1">
          <p className="text-sm text-white">📄 {resumeName}</p>
          <p className="text-sm text-white">🎯 {jobTitle}</p>
        </div>
      </div>
    </div>
  );
};

interface ResumeJobSelectorProps {
  resumes: Array<{ id: string; file_name: string }>;
  jobs: Array<{ id: string; title: string; company: string }>;
}

export const ResumeJobSelector = ({ resumes, jobs }: ResumeJobSelectorProps) => {
  const [selectedResume, setSelectedResume] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');

  const resume = resumes.find((r) => r.id === selectedResume);
  const job = jobs.find((j) => j.id === selectedJob);

  const canGenerate = selectedResume && selectedJob;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Select Resume</h2>
        </div>

        {resumes.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No resumes uploaded. Please upload a resume first.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {resumes.map((resume) => (
              <button
                key={resume.id}
                onClick={() => setSelectedResume(resume.id)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${
                    selectedResume === resume.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }
                `}
              >
                <p className="text-white font-medium">{resume.file_name}</p>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Select Target Job</h2>
        </div>

        {jobs.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No job descriptions added. Please add a job description first.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job.id)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${
                    selectedJob === job.id
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }
                `}
              >
                <p className="text-white font-medium">{job.title}</p>
                <p className="text-gray-400 text-sm">{job.company}</p>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {canGenerate && resume && job && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GenerateResumeButton
            resumeId={selectedResume}
            jobId={selectedJob}
            resumeName={resume.file_name}
            jobTitle={`${job.title} at ${job.company}`}
          />
        </motion.div>
      )}
    </div>
  );
};
