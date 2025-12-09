'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/lib/store';

export function Notification() {
  const { message, type, hide } = useNotificationStore();
  const isVisible = !!message;

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        hide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hide]);

  if (!isVisible || !message) return null;

  const bgColor = {
    success: 'bg-green-600 dark:bg-green-700',
    error: 'bg-red-600 dark:bg-red-700',
    info: 'bg-blue-600 dark:bg-blue-700',
  }[type];

  const icon = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }[type];

  return (
    <div
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 ${bgColor} text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[90vw] transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
      role="alert"
    >
      {icon}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={hide}
        className="text-white/80 hover:text-white transition-colors"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

