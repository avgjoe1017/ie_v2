'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PinInput } from '@/components/PinInput';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handlePinComplete = async (pin: string) => {
    setError(undefined);
    setLoading(true);

    try {
      const result = await authApi.login(pin);
      
      if (result.success) {
        router.push('/stations');
        router.refresh();
      }
    } catch (err) {
      setError('Invalid PIN. Please try again.');
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      {/* Logo/Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl mb-3 shadow-lg shadow-blue-500/25">
          📺
        </div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          IE Call List
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Station Contact Directory
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-xs bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xs font-medium text-center text-gray-500 dark:text-gray-400 mb-5 uppercase tracking-wide">
          Enter your PIN
        </h2>

        <PinInput
          onComplete={handlePinComplete}
          error={error}
          disabled={loading}
        />

        {loading && (
          <div className="flex justify-center mt-4">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-5">
          Contact your administrator if you need a PIN
        </p>
      </div>

      {/* Footer */}
      <p className="mt-8 text-[10px] text-gray-400 dark:text-gray-500">
        Inside Edition • CBS
      </p>
    </div>
  );
}
