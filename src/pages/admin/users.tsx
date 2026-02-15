import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { checkAdminStatus, getAllUsersAction } from '@/actions/admin-actions';
import { redirect } from 'next/navigation';
import { Users, Shield, DollarSign } from 'lucide-react';
import { UserManagementRow } from '@/components/features/user-management-row';
import Link from 'next/link';
import type { AdminProfile } from '@/types/admin.types';

export default async function AdminUsersPage() {
  const { isAdmin } = await checkAdminStatus();

  if (!isAdmin) {
    redirect('/dashboard');
  }

  const result = await getAllUsersAction();
  const users = (result.data || []) as AdminProfile[];

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
              <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
              <p className="text-gray-400">Manage user accounts, credits, and roles</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <UserManagementRow key={user.id} user={user} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-gray-400">Total Users</p>
            </div>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <p className="text-sm text-gray-400">Admins</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {users.filter((u) => u.role === 'admin').length}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <p className="text-sm text-gray-400">Total Credits</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {users.reduce((sum, u) => sum + (u.credits || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
