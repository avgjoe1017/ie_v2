'use client';

import { useFilterStore } from '@/lib/store';
import { FEED_CONFIG } from '@/domain/market';
import type { Feed } from '@/domain/contracts';

const filters: Array<{ value: Feed | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: '3pm', label: '3PM' },
  { value: '5pm', label: '5PM' },
  { value: '6pm', label: '6PM' },
];

export function FeedFilter() {
  const { feedFilter, setFeedFilter } = useFilterStore();

  return (
    <div className="card card-style">
      <div className="px-4 py-2.5">
        <div className="flex gap-1.5">
          {filters.map(({ value, label }) => {
            const isActive = feedFilter === value;
            const feedConfig = value !== 'all' ? FEED_CONFIG[value] : null;
            
            return (
              <button
                key={value}
                onClick={() => setFeedFilter(value)}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-semibold
                  transition-all duration-150
                  ${
                    isActive
                      ? value === 'all'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : `${feedConfig?.bgColor} ${feedConfig?.color}`
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
