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
  const { feedFilter, searchQuery, sortByTime } = useFilterStore();

  // Parse ET time string (e.g., "3:00 PM", "7:00PM & 11:35PM") to sortable minutes.
  // Business rule: treat 3:00 PM ET as the baseline "earliest" time.
  // Any ET earlier than 3:00 PM (e.g., 1:37 AM next day) is pushed AFTER that window.
  function parseEtMinutes(time: string): number {
    if (!time) return Number.MAX_SAFE_INTEGER;

    const re = /(\d{1,2}):(\d{2})\s*(AM|PM)?/gi;
    let match: RegExpExecArray | null;
    let best = Number.MAX_SAFE_INTEGER;

    while ((match = re.exec(time)) !== null) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = (match[3] || '').toUpperCase();

      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;

      let total = h * 60 + m;

      // 3:00 PM baseline in minutes
      const threePm = 15 * 60;
      // If this time is earlier than 3 PM, treat it as "next day" so it sorts after
      if (total < threePm) {
        total += 24 * 60;
      }
      if (total < best) best = total;
    }

    return best;
  }

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
    let scoreMap: Map<string, number> | null = null;

    // Apply feed filter
    if (feedFilter !== 'all') {
      result = result.filter((s) => s.feed === feedFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      const searchIds = new Set(searchResults.map((r) => r.item.id));
      result = result.filter((s) => searchIds.has(s.id));

      // Capture search relevance scores for optional use
      scoreMap = new Map(searchResults.map((r) => [r.item.id, r.score || 1]));
    }

    // Apply sorting
    if (sortByTime) {
      // Sort by ET airtime ascending (earliest first), then by marketNumber
      result = [...result].sort((a, b) => {
        const diff = parseEtMinutes(a.airTimeET) - parseEtMinutes(b.airTimeET);
        return diff !== 0 ? diff : a.marketNumber - b.marketNumber;
      });
    } else if (searchQuery.trim() && scoreMap) {
      // Sort by search relevance when searching and not sorting by time
      result = [...result].sort(
        (a, b) => (scoreMap!.get(a.id) || 1) - (scoreMap!.get(b.id) || 1)
      );
    } else {
      // Default sort: market number
      result = [...result].sort((a, b) => a.marketNumber - b.marketNumber);
    }

    return result;
  }, [stations, feedFilter, searchQuery, sortByTime, fuse]);

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
