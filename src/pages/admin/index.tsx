import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { checkAdminStatus, getAdminStatsAction } from '@/actions/admin-actions';
import { redirect } from 'next/navigation';
import {
  Users,
  FileText,
  Briefcase,
  Sparkles,
  TrendingUp,
  Activity,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const { isAdmin } = await checkAdminStatus();

  if (!isAdmin) {
    redirect('/dashboard');
  }

  const result = await getAdminStatsAction();
  const stats = result.data;

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load admin statistics</p>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Total Resumes',
      value: stats.totalResumes,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Job Descriptions',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Generations',
      value: stats.totalGenerations,
      icon: Sparkles,
      color: 'bg-pink-500',
      link: '/admin/generations',
    },
    {
      title: 'New Users (30d)',
      value: stats.recentUsers,
      icon: TrendingUp,
      color: 'bg-cyan-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">System Overview</h1>
          <p className="text-gray-400">Monitor and manage your ResMind platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card) => (
            <Link
              key={card.title}
              href={card.link || '#'}
              className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all ${
                card.link ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </Link>
          ))}
        </div>

        {/* Generation Status Breakdown */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Generation Status</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.generationStats.completed}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Processing</p>
              <p className="text-2xl font-bold text-blue-400">
                {stats.generationStats.processing}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">
                {stats.generationStats.pending}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">
                {stats.generationStats.failed}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/users"
              className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg hover:from-blue-500/30 hover:to-cyan-500/30 transition-all"
            >
              <Users className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="text-lg font-semibold text-white mb-1">Manage Users</h3>
              <p className="text-sm text-gray-400">
                View and manage user accounts, credits, and roles
              </p>
            </Link>
            <Link
              href="/admin/generations"
              className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
            >
              <Sparkles className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="text-lg font-semibold text-white mb-1">View Generations</h3>
              <p className="text-sm text-gray-400">
                Monitor all resume generations across the platform
              </p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
