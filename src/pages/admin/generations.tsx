"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { checkAdminStatus, getAllGenerationsAction } from '@/actions/admin-actions';
import { Sparkles, Shield, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { AdminGeneration } from '@/types/admin.types';

export default function AdminGenerationsPage() {
  const router = useRouter();
  const [generations, setGenerations] = useState<AdminGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGenerations = async () => {
      setLoading(true);
      const { isAdmin } = await checkAdminStatus();

      if (!isAdmin) {
        router.push('/dashboard');
        return;
      }

      const result = await getAllGenerationsAction();
      setGenerations((result.data || []) as AdminGeneration[]);
      setLoading(false);
    };

    loadGenerations();
  }, [router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Admin Dashboard</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">All Generations</h1>
              <p className="text-gray-400">Monitor resume generations across the platform</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Generations Table */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    PDF
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin" />
                      <p>Loading generations...</p>
                    </td>
                  </tr>
                ) : generations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No generations found</p>
                    </td>
                  </tr>
                ) : (
                  generations.map((gen) => (
                    <tr key={gen.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {gen.profiles?.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-400">{gen.profiles?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            gen.status
                          )}`}
                        >
                          {getStatusIcon(gen.status)}
                          {gen.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {gen.score !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                style={{ width: `${gen.score}%` }}
                              />
                            </div>
                            <span className="text-sm text-white">{gen.score}%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {gen.pdf_url ? (
                          <a
                            href={gen.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-400 hover:text-purple-300 underline"
                          >
                            View PDF
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">Not generated</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-400">{formatDate(gen.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/generation/${gen.id}`}
                          className="text-sm text-cyan-400 hover:text-cyan-300 underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-gray-400">Completed</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {generations.filter((g) => g.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-gray-400">Processing</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {generations.filter((g) => g.status === 'processing').length}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-gray-400">Pending</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {generations.filter((g) => g.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-gray-400">Failed</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {generations.filter((g) => g.status === 'failed').length}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
