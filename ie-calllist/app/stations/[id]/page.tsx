import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { PhoneList } from '@/components/PhoneList';
import { formatMarketNumber, getBroadcastTimeLabel } from '@/domain/market';
import type { Feed } from '@/domain/contracts';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StationDetailPage({ params }: Props) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  const station = await prisma.station.findUnique({
    where: { id },
    include: {
      phones: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!station) {
    notFound();
  }

  const getFeedLabel = (feed: string) => {
    switch (feed) {
      case '3pm': return '3PM Feed';
      case '5pm': return '5PM Feed';
      case '6pm': return '6PM Feed';
      default: return feed;
    }
  };

  const getFeedColor = (feed: string) => {
    switch (feed) {
      case '3pm': return '#D4A574';
      case '5pm': return '#7BA39B';
      case '6pm': return '#8B8BB8';
      default: return '#8B8BB8';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header showBack title={station.callLetters} />
      
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Station Header Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-1">
                {station.callLetters}
              </h1>
              <p className="text-base text-neutral-600">
                {station.marketName}
              </p>
            </div>
            
            {/* Prominent Rank Badge */}
            <div className="flex flex-col items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Rank</span>
              <span 
                className="text-xl font-black"
                style={{ color: getFeedColor(station.feed) }}
              >
                {station.marketNumber}
              </span>
            </div>
          </div>

          {/* Badges & Info */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span 
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white border border-white/20"
              style={{ backgroundColor: getFeedColor(station.feed) }}
            >
              {getFeedLabel(station.feed)}
            </span>
            <StatusBadge status={station.broadcastStatus as 'live' | 'rerack' | 'might' | null} />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{getBroadcastTimeLabel(station.airTimeLocal, station.airTimeET)}</span>
            </div>
          </div>

          {/* Edit Button */}
          {session.role === 'admin' && (
            <Link
              href={`/stations/${station.id}/edit`}
              className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all border border-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Station Details
            </Link>
          )}
        </div>

        {/* Contacts Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            Station Contacts
          </h2>
          
          <PhoneList
            stationId={station.id}
            stationName={station.marketName}
            callLetters={station.callLetters}
            phones={station.phones}
          />
        </div>
      </main>
    </div>
  );
}
