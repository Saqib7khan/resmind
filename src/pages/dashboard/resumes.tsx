"use client";

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { ResumeUploader } from '@/components/features/resume-uploader';
import { getResumesAction, deleteResumeAction } from '@/actions/dashboard-actions';
import { FileText, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Resume } from '@/types/supabase-helpers';

const DeleteButton = ({ id, onDeleted }: { id: string; onDeleted: () => void }) => {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this resume?')) {
      await deleteResumeAction(id);
      onDeleted();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const loadResumes = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }
    const result = await getResumesAction();
    setResumes((result.data || []) as Resume[]);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const initialLoad = async () => {
      const result = await getResumesAction();
      if (!isMounted) {
        return;
      }
      setResumes((result.data || []) as Resume[]);
      setLoading(false);
    };

    void initialLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Resumes</h1>
          <p className="text-gray-400">
            Manage your uploaded resumes and track their status.
          </p>
        </div>

        <div className="mb-8">
          <ResumeUploader />
        </div>

        {loading ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No resumes yet
            </h3>
            <p className="text-gray-400">
              Upload your first resume to get started with AI optimization.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white truncate max-w-[180px]">
                        {resume.file_name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {resume.file_size
                          ? `${(resume.file_size / 1024).toFixed(1)} KB`
                          : 'Unknown size'}
                      </p>
                    </div>
                  </div>
                  <DeleteButton id={resume.id} onDeleted={() => loadResumes(true)} />
                </div>

                <p className="text-xs text-gray-500">
                  Uploaded{' '}
                  {formatDistanceToNow(new Date(resume.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
