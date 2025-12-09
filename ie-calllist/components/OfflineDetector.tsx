'use client';

import { useEffect, useState } from 'react';

export function OfflineDetector() {
  // Initialize to false (assume online) to prevent hydration mismatch
  // We'll check the actual status in useEffect after mount
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial online status after mount (client-side only)
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 dark:bg-yellow-600 text-white text-center py-2 px-4 text-xs font-medium">
      <div className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>You&apos;re offline. Some features may not work.</span>
      </div>
    </div>
  );
}

