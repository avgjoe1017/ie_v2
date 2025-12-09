'use client';

import { useCallDialogStore, useNotificationStore } from '@/lib/store';
import { formatDisplay, createTelLink } from '@/domain/phone';
import { callLogsApi } from '@/lib/api';
import { useCallback, useEffect } from 'react';

export function CallDialog() {
  const {
    isOpen,
    stationId,
    stationName,
    callLetters,
    phoneId,
    phoneLabel,
    phoneNumber,
    closeDialog,
  } = useCallDialogStore();
  const showNotification = useNotificationStore((s) => s.show);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDialog();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeDialog]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCall = useCallback(async () => {
    if (!stationId || !phoneId || !phoneNumber) return;

    try {
      // Log the call
      await callLogsApi.create({
        stationId,
        phoneId,
        phoneNumber,
      });
      showNotification(`Call logged: ${callLetters}`, 'success');
    } catch (error) {
      console.error('Failed to log call:', error);
      showNotification('Call logged locally', 'info');
      // Continue with call even if logging fails
    }

    // Open phone dialer
    window.location.href = createTelLink(phoneNumber);
    
    // Close dialog after a short delay
    setTimeout(closeDialog, 300);
  }, [stationId, phoneId, phoneNumber, callLetters, closeDialog, showNotification]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={closeDialog}
      />

      {/* Action Sheet - slides up from bottom */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="call-dialog-title"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out max-w-lg mx-auto"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-5 pb-6">
          {/* Title */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2
                id="call-dialog-title"
                className="text-lg font-semibold text-gray-900 dark:text-white mb-0.5"
              >
                Call {callLetters}?
              </h2>
              <p className="text-xs text-red-600 dark:text-red-500 font-medium">
                Tap to Start a Call Now
              </p>
            </div>
            <button
              onClick={closeDialog}
              className="ml-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4" />

          {/* Station Info */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {stationName}
          </p>
          <p className="text-base text-gray-900 dark:text-white mb-6">
            <span className="text-gray-500 dark:text-gray-400">{phoneLabel}:</span>{' '}
            <span className="font-semibold">{formatDisplay(phoneNumber || '')}</span>
          </p>

          {/* Call Button */}
          <button
            onClick={handleCall}
            className="w-full py-3.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm uppercase tracking-wide shadow-lg flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Now {formatDisplay(phoneNumber || '')}
          </button>
        </div>
      </div>
    </>
  );
}
