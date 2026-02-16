"use client";

import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import { User, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const { profile, user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences.</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile?.full_name || ''}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={profile?.role || 'user'}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 disabled:opacity-50 capitalize"
                />
              </div>
            </div>
          </div>

          {/* Credits Section */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Credits</h2>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-white/20">
              <div>
                <p className="text-sm text-gray-300">Available Credits</p>
                <p className="text-3xl font-bold text-white">{profile?.credits || 0}</p>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold text-white transition-all">
                Buy More
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-400">
              Each resume generation costs 1 credit. Purchase more credits to continue
              using ResMind.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
