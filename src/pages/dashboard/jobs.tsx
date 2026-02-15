import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { JobDescriptionForm } from '@/components/features/job-description-form';
import { getJobDescriptionsAction } from '@/actions/dashboard-actions';
import { Briefcase, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function JobsPage() {
  const result = await getJobDescriptionsAction();
  const jobs = result.data || [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Job Descriptions</h1>
          <p className="text-gray-400">
            Track target job postings for resume optimization.
          </p>
        </div>

        <div className="mb-8">
          <JobDescriptionForm />
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No job descriptions yet
            </h3>
            <p className="text-gray-400">
              Add job descriptions to match your resume against.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    <Briefcase className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {job.title}
                        </h3>
                        {job.company && (
                          <div className="flex items-center gap-2 text-gray-400 mt-1">
                            <Building2 className="w-4 h-4" />
                            <span className="text-sm">{job.company}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(job.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-3">
                      {job.raw_text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
