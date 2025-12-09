'use client';

import { useFilterStore } from '@/lib/store';
import type { Feed } from '@/domain/contracts';

const filters: Array<{ value: Feed | 'all'; label: string }> = [
  { value: 'all', label: 'ALL' },
  { value: '3pm', label: '3:00PM' },
  { value: '5pm', label: '5:00PM' },
  { value: '6pm', label: '6:00PM' },
];

export function SearchAndFilter() {
  const { feedFilter, setFeedFilter } = useFilterStore();

  return (
    <div className="px-4 py-4">
      <div className="w-full p-1 bg-slate-50 rounded-2xl flex justify-center items-center">
        {filters.map(({ value, label }, index) => {
          const isActive = feedFilter === value;
          
          return (
            <div key={value} className="flex items-center">
              {index > 0 && (
                <div className="w-0 h-2.5 border-l border-stone-300 mx-0" />
              )}
              <button
                onClick={() => setFeedFilter(value)}
                className={`
                  flex-1 px-3 py-2 rounded-xl flex justify-center items-center gap-2.5
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-white text-neutral-800'
                      : 'text-zinc-500 hover:text-neutral-800'
                  }
                `}
              >
                <div className="text-center text-xs font-bold font-['Inter']">
                  {label}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
