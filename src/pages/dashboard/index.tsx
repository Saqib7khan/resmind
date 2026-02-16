"use client";

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { ResumeUploader } from '@/components/features/resume-uploader';
import { JobDescriptionForm } from '@/components/features/job-description-form';
import { getResumesAction, getJobDescriptionsAction, getGenerationsAction } from '@/actions/dashboard-actions';
import { FileText, Briefcase, Sparkles, TrendingUp } from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import type { Generation } from '@/types/supabase-helpers';

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Array<{ id: string }>>([]);
  const [jobs, setJobs] = useState<Array<{ id: string }>>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [resumesResult, jobsResult, generationsResult] = await Promise.all([
        getResumesAction(),
        getJobDescriptionsAction(),
        getGenerationsAction(),
      ]);

      setResumes(resumesResult.data || []);
      setJobs(jobsResult.data || []);
      setGenerations(generationsResult.data || []);
      setLoading(false);
    };

    loadData();
  }, []);

  const completedGenerations = generations.filter((g) => g.status === 'completed');
  const avgScore =
    completedGenerations.length > 0
      ? Math.round(
          completedGenerations.reduce((sum, g) => sum + (g.score || 0), 0) /
            completedGenerations.length
        )
      : 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back! Let&apos;s build your perfect resume.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Resumes</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : resumes.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Job Matches</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : jobs.length}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Generated</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : generations.length}
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-pink-400" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Score</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : `${avgScore}%`}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Main Bento Grid */}
        <BentoGrid>
          <BentoCard colSpan="half">
            <ResumeUploader />
          </BentoCard>

          <BentoCard colSpan="half">
            <JobDescriptionForm />
          </BentoCard>
        </BentoGrid>

        {/* Quick Start CTA if no data */}
        {resumes.length === 0 && jobs.length === 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Ready to Get Started?
            </h3>
            <p className="text-gray-300 mb-6">
              Upload your resume and add a job description to begin the AI-powered
              optimization process.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
