'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Briefcase,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { logoutAction } from '@/actions/auth-actions';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Generate', href: '/dashboard/generate', icon: Sparkles },
  { name: 'Resumes', href: '/dashboard/resumes', icon: FileText },
  { name: 'Job Matches', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, user } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white/5 backdrop-blur-md border-r border-white/10 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg" />
              <span className="text-xl font-bold text-white">ResMind</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="px-4 mb-6">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {profile?.credits || 0} credits left
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all
                    ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Admin Link */}
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all
                  ${
                    pathname?.startsWith('/admin')
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <Shield className="w-5 h-5" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Logout */}
          <div className="p-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg" />
            <span className="text-xl font-bold text-white">ResMind</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 space-y-1 bg-slate-950/95"
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg
                  ${
                    pathname === item.href
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-gray-300'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
            
            {/* Admin Link */}
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg
                  ${
                    pathname?.startsWith('/admin')
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300'
                      : 'text-gray-300'
                  }
                `}
              >
                <Shield className="w-5 h-5" />
                Admin Panel
              </Link>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pt-16 md:pt-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/5 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-2">
          {navigation.slice(0, 4).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all
                  ${isActive ? 'text-purple-400' : 'text-gray-400'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Add padding for mobile bottom nav */}
      <div className="md:hidden h-20" />
    </div>
  );
};
