'use client';

import Link from 'next/link';
import { formatDisplay } from '@/domain/phone';
import type { Feed } from '@/domain/contracts';

interface Phone {
  id: string;
  label: string;
  number: string;
  sortOrder: number;
}

interface StationCardProps {
  id: string;
  callLetters: string;
  marketName: string;
  marketNumber: number;
  feed: Feed;
  // Allow raw string to be defensive against any legacy/uppercase values
  broadcastStatus: 'live' | 'rerack' | 'might' | null | string;
  airTimeLocal: string;
  airTimeET: string;
  phones: Phone[];
}

export function StationCard({
  id,
  callLetters,
  marketName,
  marketNumber,
  feed,
  broadcastStatus,
  airTimeLocal,
  airTimeET,
  phones,
}: StationCardProps) {
  const primaryPhone = phones.find((p) => p.sortOrder === 1) || phones[0];

  const getFeedLabel = (feed: Feed) => {
    switch (feed) {
      case '3pm': return '3PM Feed';
      case '5pm': return '5PM Feed';
      case '6pm': return '6PM Feed';
    }
  };

  const getFeedColor = (feed: Feed) => {
    switch (feed) {
      case '3pm': return '#D4A574';
      case '5pm': return '#7BA39B';
      case '6pm': return '#8B8BB8';
    }
  };

  // Format phone number for tel: link (remove all non-digits except +)
  const formatTelLink = (number: string) => {
    return number.replace(/[^\d+]/g, '');
  };

  // Format market name: proper title case (capitalize first letter of each word)
  const formatMarketName = (name: string) => {
    if (!name) return name;
    return name
      .split(' ')
      .map(word => {
        // Preserve state abbreviations (2-letter uppercase codes like "NY", "CA")
        if (word.length === 2 && word === word.toUpperCase()) {
          return word;
        }
        // Preserve abbreviations with periods (like "D.C.", "U.S.")
        if (word.includes('.') && word === word.toUpperCase()) {
          return word;
        }
        // Capitalize first letter, lowercase the rest
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const renderStatusBadge = () => {
    if (!broadcastStatus) return null;

    const status = String(broadcastStatus).toLowerCase();

    let label = 'MIGHT';
    if (status === 'live') label = 'LIVE';
    else if (status === 'rerack') label = 'RERACK';

    return (
      <div
        className="h-3.5 px-2 py-1.5 rounded-xl inline-flex justify-center items-center gap-1"
        style={{ backgroundColor: getFeedColor(feed) }}
      >
        <div className="text-white text-[10px] font-semibold font-['Inter']">
          {label}
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* ZONE 1: THE CALL TRIGGER (Main area) */}
      {primaryPhone ? (
        <a
          href={`tel:${formatTelLink(primaryPhone.number)}`}
          className="flex-1 flex items-center py-2.5 pl-4 pr-2 active:bg-blue-50 transition-colors cursor-pointer group"
        >
          {/* Rank Number: Typography-based design */}
          <div className="shrink-0 w-12 text-center mr-2">
            <div
              className="text-2xl font-black italic tracking-tighter group-active:text-blue-500 transition-colors"
              style={{ color: getFeedColor(feed) }}
            >
              #{marketNumber}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col gap-1">
            {/* Market Name + Call Letters */}
            <div className="h-3 flex items-center gap-2">
              <span className="text-neutral-800 text-sm font-bold font-['Inter']">
                {formatMarketName(marketName)}
              </span>
              <span className="text-neutral-800 text-xs font-normal font-['Inter']">
                {callLetters}
              </span>
            </div>

            {/* Air Time */}
            <div className="h-4 flex items-center gap-2">
              <span className="text-zinc-500 text-[10px] font-normal font-['Inter'] leading-4 tracking-tight">
                Airs
              </span>
              <span className="text-neutral-800 text-[10px] font-bold font-['Inter'] leading-4 tracking-tight">
                {airTimeLocal} local
              </span>
              <span className="text-zinc-500 text-[10px] font-normal font-['Inter'] leading-4 tracking-tight">
                | {airTimeET} EST
              </span>
            </div>

            {/* Phone Number + Contact Label */}
            <div className="h-4 flex items-center gap-2">
              <span className="text-neutral-800 text-[10px] font-bold font-['Inter'] leading-4 tracking-tight">
                {formatDisplay(primaryPhone.number)}
              </span>
              {primaryPhone.label && (
                <div className="h-3.5 px-2 py-1.5 bg-gray-200 rounded-xl inline-flex justify-center items-center gap-1">
                  <div className="text-neutral-800 text-[10px] font-semibold font-['Inter']">
                    {primaryPhone.label}
                  </div>
                </div>
              )}
            </div>

            {/* Feed Label + Status Badge */}
            <div className="h-3.5 flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-bold font-['Inter'] leading-4 tracking-tight"
                style={{ color: getFeedColor(feed) }}
              >
                {getFeedLabel(feed)}
              </span>
              {renderStatusBadge()}
            </div>
          </div>
        </a>
      ) : (
        <div className="flex-1 flex items-center py-2.5 pl-4 pr-2">
          {/* Fallback if no phone */}
          <div className="shrink-0 w-12 text-center mr-2">
            <div
              className="text-2xl font-black italic tracking-tighter"
              style={{ color: getFeedColor(feed) }}
            >
              #{marketNumber}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <div className="h-3 flex items-center gap-2">
              <span className="text-neutral-800 text-sm font-bold font-['Inter']">
                {formatMarketName(marketName)}
              </span>
              <span className="text-neutral-800 text-xs font-normal font-['Inter']">
                {callLetters}
              </span>
            </div>

            <div className="h-3.5 flex items-center gap-2 flex-wrap mt-2">
              <span
                className="text-[10px] font-bold font-['Inter'] leading-4 tracking-tight"
                style={{ color: getFeedColor(feed) }}
              >
                {getFeedLabel(feed)}
              </span>
              {renderStatusBadge()}
            </div>
          </div>
        </div>
      )}

      {/* VISUAL DIVIDER */}
      <div className="w-px bg-gray-100 my-2"></div>

      {/* ZONE 2: THE EDIT TRIGGER (Right side) */}
      <Link
        href={`/stations/${id}`}
        className="w-14 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        {/* PENCIL ICON - Clearly implies 'Edit/Manage' */}
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </Link>
    </div>
  );
}
