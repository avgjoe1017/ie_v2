'use client';

import { useCallDialogStore } from '@/lib/store';
import { formatDisplay } from '@/domain/phone';

interface Phone {
  id: string;
  label: string;
  number: string;
  sortOrder: number;
}

interface PhoneListProps {
  stationId: string;
  stationName: string;
  callLetters: string;
  phones: Phone[];
}

export function PhoneList({ stationId, stationName, callLetters, phones }: PhoneListProps) {
  const openDialog = useCallDialogStore((s) => s.openDialog);

  const sortedPhones = [...phones].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-1.5">
      {sortedPhones.map((phone, index) => (
        <button
          key={phone.id}
          onClick={() =>
            openDialog({
              stationId,
              stationName,
              callLetters,
              phoneId: phone.id,
              phoneLabel: phone.label,
              phoneNumber: phone.number,
            })
          }
          className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left group"
        >
          {/* Phone icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>

          {/* Contact info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
              {phone.label}
              {index === 0 && (
                <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-normal">
                  Primary
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {formatDisplay(phone.number)}
            </p>
          </div>

          {/* Call indicator */}
          <div className="flex-shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
      ))}

      {phones.length === 0 && (
        <p className="text-center py-6 text-xs text-gray-400 dark:text-gray-500">
          No phone numbers available
        </p>
      )}
    </div>
  );
}
