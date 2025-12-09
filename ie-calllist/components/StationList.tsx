'use client';

import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { StationCard } from './StationCard';
import { useFilterStore } from '@/lib/store';
import type { Feed } from '@/domain/contracts';

interface Phone {
  id: string;
  label: string;
  number: string;
  sortOrder: number;
}

interface Station {
  id: string;
  marketNumber: number;
  marketName: string;
  callLetters: string;
  feed: string;
  broadcastStatus: string | null;
  airTimeLocal: string;
  airTimeET: string;
  phones: Phone[];
}

interface StationListProps {
  stations: Station[];
}

export function StationList({ stations }: StationListProps) {
  const { feedFilter, searchQuery } = useFilterStore();

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(stations, {
        keys: [
          { name: 'marketNumber', weight: 2 },
          { name: 'marketName', weight: 1.5 },
          { name: 'callLetters', weight: 1.5 },
        ],
        threshold: 0.3,
        includeScore: true,
      }),
    [stations]
  );

  // Filter and search stations
  const filteredStations = useMemo(() => {
    let result = stations;

    // Apply feed filter
    if (feedFilter !== 'all') {
      result = result.filter((s) => s.feed === feedFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      const searchIds = new Set(searchResults.map((r) => r.item.id));
      result = result.filter((s) => searchIds.has(s.id));
      
      // Sort by search relevance
      const scoreMap = new Map(searchResults.map((r) => [r.item.id, r.score || 1]));
      result.sort((a, b) => (scoreMap.get(a.id) || 1) - (scoreMap.get(b.id) || 1));
    } else {
      // Sort by market number when not searching
      result = [...result].sort((a, b) => a.marketNumber - b.marketNumber);
    }

    return result;
  }, [stations, feedFilter, searchQuery, fuse]);

  if (filteredStations.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-neutral-800 mb-1">
          No stations found
        </h3>
        <p className="text-xs text-zinc-500">
          {searchQuery
            ? `No results for "${searchQuery}"`
            : 'No stations match the selected filter'}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-3">
      <div className="flex flex-col gap-1.5">
        {filteredStations.map((station) => (
          <StationCard
            key={station.id}
            id={station.id}
            callLetters={station.callLetters}
            marketName={station.marketName}
            marketNumber={station.marketNumber}
            feed={station.feed as Feed}
            broadcastStatus={station.broadcastStatus as 'live' | 'rerack' | 'might' | null}
            airTimeLocal={station.airTimeLocal}
            airTimeET={station.airTimeET}
            phones={station.phones}
          />
        ))}
      </div>
    </div>
  );
}
