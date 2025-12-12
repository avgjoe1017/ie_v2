'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { authApi } from '@/lib/api';

function getRoleLabel(role: string): string {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'producer':
      return 'Producer';
    case 'viewer':
      return 'Viewer';
    default:
      return role;
  }
}

export default function SettingsPage() {
  const router = useRouter();

  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApi.me();
      return response.user;
    },
  });

  const handleLogout = async () => {
    await authApi.logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white">
      <Header showBack title="Settings" />
      
      <main className="max-w-md mx-auto px-4 py-4 space-y-3">
        {/* User Info */}
        {userData && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2">
              Account
            </h2>
            <div className="px-4 pb-4 space-y-2">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{userData.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{getRoleLabel(userData.role)}</p>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2">
            History
          </h2>
          
          <div className="divide-y divide-gray-100">
            <Link
              href="/logs/calls"
              className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">📞</span>
                <span className="text-sm text-gray-700">Call History</span>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link
              href="/logs/edits"
              className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">✏️</span>
                <span className="text-sm text-gray-700">Edit History</span>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2">
            Support
          </h2>
          
          <a
            href="mailto:joe.balewski@cbs.com?subject=IE CALL LIST ISSUE"
            className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">📧</span>
              <span className="text-sm text-gray-700">Report an Issue</span>
            </div>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>

        {/* Version */}
        <p className="text-center text-[10px] text-gray-400 pt-2">
          IE Call List v2.0.0
        </p>
      </main>
    </div>
  );
}
