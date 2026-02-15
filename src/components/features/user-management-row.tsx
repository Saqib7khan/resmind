'use client';

import { useState } from 'react';
import { updateUserCreditsAction, updateUserRoleAction, deleteUserAction } from '@/actions/admin-actions';
import { Edit2, Save, X, Trash2, Shield, User } from 'lucide-react';

interface UserManagementRowProps {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    role: 'user' | 'admin';
    credits: number;
    created_at: string;
  };
}

export function UserManagementRow({ user }: UserManagementRowProps) {
  const [isEditingCredits, setIsEditingCredits] = useState(false);
  const [credits, setCredits] = useState(user.credits);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateCredits = async () => {
    setIsUpdating(true);
    setError(null);

    const result = await updateUserCreditsAction(user.id, credits);

    if (!result.success) {
      setError(result.error || 'Failed to update credits');
      setCredits(user.credits);
    } else {
      setIsEditingCredits(false);
    }

    setIsUpdating(false);
  };

  const handleToggleRole = async () => {
    setIsUpdating(true);
    setError(null);

    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const result = await updateUserRoleAction(user.id, newRole);

    if (!result.success) {
      setError(result.error || 'Failed to update role');
    }

    setIsUpdating(false);
  };

  const handleDeleteUser = async () => {
    if (!confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    const result = await deleteUserAction(user.id);

    if (!result.success) {
      setError(result.error || 'Failed to delete user');
    }

    setIsUpdating(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-white">
            {user.full_name || 'No name'}
          </p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={handleToggleRole}
          disabled={isUpdating}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            user.role === 'admin'
              ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
              : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {user.role === 'admin' ? (
            <>
              <Shield className="w-3 h-3" />
              Admin
            </>
          ) : (
            <>
              <User className="w-3 h-3" />
              User
            </>
          )}
        </button>
      </td>
      <td className="px-6 py-4">
        {isEditingCredits ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="0"
            />
            <button
              onClick={handleUpdateCredits}
              disabled={isUpdating}
              className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsEditingCredits(false);
                setCredits(user.credits);
              }}
              disabled={isUpdating}
              className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">{user.credits}</span>
            <button
              onClick={() => setIsEditingCredits(true)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-400">{formatDate(user.created_at)}</p>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={handleDeleteUser}
          disabled={isUpdating}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete user"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
      {error && (
        <td colSpan={5} className="px-6 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </td>
      )}
    </tr>
  );
}
