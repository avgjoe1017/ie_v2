'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFilterStore } from '@/lib/store';
import type { Feed } from '@/domain/contracts';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

const filters: Array<{ value: Feed | 'all'; label: string; displayLabel: string }> = [
  { value: 'all', label: 'ALL', displayLabel: 'All Feeds' },
  { value: '3pm', label: '3:00PM', displayLabel: '3:00 PM' },
  { value: '5pm', label: '5:00PM', displayLabel: '5:00 PM' },
  { value: '6pm', label: '6:00PM', displayLabel: '6:00 PM' },
];

export function Header({ showBack = false, title }: HeaderProps) {
  const router = useRouter();
  const { searchQuery, setSearchQuery, feedFilter, setFeedFilter, sortByTime, toggleSortByTime } =
    useFilterStore();

  if (showBack) {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-neutral-800 hover:text-blue-600 transition-colors"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          {title && (
            <h1 className="text-sm font-semibold text-neutral-800">
              {title}
            </h1>
          )}

          <div className="flex items-center gap-2">
            {/* HOME button */}
            <Link
              href="/stations"
              className="p-2 rounded-lg text-zinc-800 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              aria-label="Home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l9-7 9 7M5 10v10a1 1 0 001 1h4m4 0h4a1 1 0 001-1V10"
                />
              </svg>
            </Link>
            <Link
              href="/logs/calls"
              className="p-2 rounded-lg text-zinc-800 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              aria-label="Call history"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </Link>
            <Link
              href="/settings"
              className="p-2 rounded-lg text-zinc-800 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex flex-col gap-3 px-4 py-3 max-w-md mx-auto">
        {/* ROW 1: Title & Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900">
              Inside Edition
            </h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
              Call List
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/logs/calls"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Call history"
            >
              <svg className="w-6 h-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </Link>
            <Link
              href="/settings"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Settings"
            >
              <svg className="w-6 h-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ROW 2: Search Bar (Full Width) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-100 text-neutral-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
            placeholder="Search market, call letters..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* ROW 3: Horizontal Filter Scroll (The "Pills") */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map(({ value, displayLabel }) => {
            const isActive = feedFilter === value;
            
            return (
              <button
                key={value}
                onClick={() => setFeedFilter(value)}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
                  ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 border border-transparent hover:border-gray-300'
                  }
                `}
              >
                {displayLabel}
              </button>
            );
          })}

          {/* Sort by Time toggle (icon only) */}
          <button
            onClick={toggleSortByTime}
            className={`p-2 rounded-full transition-all flex items-center justify-center ${
              sortByTime
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 border border-transparent hover:border-gray-300'
            }`}
            aria-pressed={sortByTime}
            aria-label="Sort by ET time"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 12h5M8 17h2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
