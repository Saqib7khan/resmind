"use client";

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { getGenerationsAction, type GenerationWithRelations } from '@/actions/dashboard-actions';
import { History, FileText, Briefcase, Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const icons = {
    pending: Loader2,
    processing: Loader2,
    completed: CheckCircle2,
    failed: XCircle,
  };

  const Icon = icons[status as keyof typeof icons] || Loader2;
  const isSpinning = status === 'pending' || status === 'processing';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
        styles[status as keyof typeof styles] || styles.pending
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function HistoryPage() {
  const [generations, setGenerations] = useState<GenerationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGenerations = async () => {
      setLoading(true);
      const result = await getGenerationsAction();
      setGenerations((result.data || []) as GenerationWithRelations[]);
      setLoading(false);
    };

    loadGenerations();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Generation History</h1>
          <p className="text-gray-400">
            View all your AI-generated resume optimizations.
          </p>
        </div>

        {loading ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading generations...</p>
          </div>
        ) : generations.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
            <History className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No generations yet
            </h3>
            <p className="text-gray-400">
              Start by uploading a resume and adding a job description, then generate
              an optimized resume.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusBadge status={gen.status} />
                      {gen.score !== null && gen.score !== undefined && (
                        <span className="text-sm text-gray-400">
                          Score: <span className="text-white font-semibold">{gen.score}%</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(gen.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gen.resumes && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-gray-400">Resume</p>
                        <p className="text-sm text-white truncate">
                          {gen.resumes?.file_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  )}

                  {gen.job_descriptions && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Briefcase className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-gray-400">Target Job</p>
                        <p className="text-sm text-white truncate">
                          {gen.job_descriptions?.title || 'Unknown'} at{' '}
                          {gen.job_descriptions?.company || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {gen.status === 'completed' && gen.pdf_url && (
                  <div className="mt-4">
                    <a
                      href={gen.pdf_url}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white text-sm font-semibold transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
