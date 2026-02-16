"use client";

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { ResumeJobSelector } from '@/components/features/resume-job-selector';
import { getResumesAction, getJobDescriptionsAction } from '@/actions/dashboard-actions';
import { Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { JobDescription, Resume } from '@/types/supabase-helpers';

export default function GeneratePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [resumesResult, jobsResult] = await Promise.all([
        getResumesAction(),
        getJobDescriptionsAction(),
      ]);

      setResumes((resumesResult.data || []) as Resume[]);
      setJobs((jobsResult.data || []) as JobDescription[]);
      setLoading(false);
    };

    loadData();
  }, []);

  const hasData = resumes.length > 0 && jobs.length > 0;
  const resumeOptions = resumes.map((resume) => ({
    id: resume.id,
    file_name: resume.file_name ?? 'Untitled resume',
  }));
  const jobOptions = jobs.map((job) => ({
    id: job.id,
    title: job.title ?? 'Untitled role',
    company: job.company ?? 'Unknown company',
  }));

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Generate Optimized Resume
          </h1>
          <p className="text-gray-400">
            Select a resume and target job to start the AI optimization process.
          </p>
        </div>

        {loading ? (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 text-center">
            <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-300">Loading resumes and jobs...</p>
          </div>
        ) : !hasData && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Getting Started
            </h3>
            <p className="text-gray-300 mb-6">
              You need at least one resume and one job description to generate an
              optimized resume.
            </p>
            <div className="flex gap-4 justify-center">
              {resumes.length === 0 && (
                <Link
                  href="/dashboard/resumes"
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold text-white transition-all"
                >
                  Upload Resume
                </Link>
              )}
              {jobs.length === 0 && (
                <Link
                  href="/dashboard/jobs"
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold text-white transition-all"
                >
                  Add Job Description
                </Link>
              )}
            </div>
          </div>
        )}

        <ResumeJobSelector resumes={resumeOptions} jobs={jobOptions} />

        <div className="mt-8 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-3">
            What happens next?
          </h3>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-purple-400">1.</span>
              AI analyzes your resume against the job description
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-purple-400">2.</span>
              Identifies gaps, missing keywords, and weak points
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-purple-400">3.</span>
              Rewrites content with strong action verbs and quantified achievements
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-purple-400">4.</span>
              Generates a professional, ATS-optimized PDF
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-purple-400">5.</span>
              Provides detailed feedback and suggestions
            </li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
}
