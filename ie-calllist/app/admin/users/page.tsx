'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { adminApi, type User } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'viewer' | 'producer' | 'admin'>('producer');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { users } = await adminApi.listUsers();
      setUsers(users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(undefined);

    try {
      await adminApi.createUser({ name, pin, role });
      await loadUsers();
      setShowCreate(false);
      setName('');
      setPin('');
      setRole('producer');
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (userId: string) => {
    setSaving(true);
    setError(undefined);

    try {
      const updates: { name?: string; pin?: string; role?: string } = { name, role };
      if (pin) updates.pin = pin;
      
      await adminApi.updateUser(userId, updates);
      await loadUsers();
      setEditingId(null);
      setName('');
      setPin('');
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminApi.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setName(user.name);
    // Fallback: treat any unknown role as producer
    const safeRole: 'viewer' | 'producer' | 'admin' =
      user.role === 'viewer' || user.role === 'admin' ? user.role : 'producer';
    setRole(safeRole);
    setPin('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showBack title="User Management" />
      
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Admin Nav */}
        <div className="flex gap-4 mb-6">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Stations
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
          >
            Users
          </Link>
          <Link
            href="/admin/import"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Import CSV
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Create User */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Users
            </h2>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              + Add User
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreate} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PIN (6 digits)
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Permissions
                  </label>
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as 'viewer' | 'producer' | 'admin')
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="viewer">Read only</option>
                    <option value="producer">Read &amp; write</option>
                    <option value="admin">Admin (full)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving || pin.length !== 6}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* User List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <div key={user.id} className="py-4">
                {editingId === user.id ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="New PIN (leave blank to keep)"
                        maxLength={6}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                      />
                      <select
                        value={role}
                        onChange={(e) =>
                          setRole(e.target.value as 'viewer' | 'producer' | 'admin')
                        }
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="viewer">Read only</option>
                        <option value="producer">Read &amp; write</option>
                        <option value="admin">Admin (full)</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(user.id)}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.role === 'admin'
                          ? 'Admin (full)'
                          : user.role === 'viewer'
                          ? 'Read only'
                          : 'Read & write'}{' '}
                        • Created {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(user)}
                        className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {users.length === 0 && (
              <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                No users yet
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

