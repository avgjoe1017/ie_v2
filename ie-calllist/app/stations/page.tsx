import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Header } from '@/components/Header';
import { StationList } from '@/components/StationList';

export default async function StationsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Calculate start of today (midnight local time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all numbers called today (with error handling for missing table)
  let recentCalls: Array<{ number: string; calledAt: Date }> = [];
  try {
    recentCalls = await prisma.recentCall.findMany({
      where: {
        calledAt: { gte: today },
      },
      select: {
        number: true,
        calledAt: true,
      },
    });
  } catch (error) {
    // If RecentCall table doesn't exist yet (e.g., production DB not migrated), continue without it
    console.warn('RecentCall table not available:', error);
  }

  // Build lookup map: number -> calledAt timestamp
  const calledNumbers = new Map<string, Date>(
    recentCalls.map((c) => [c.number, c.calledAt])
  );

  // Fetch all stations with phones
  const stations = await prisma.station.findMany({
    where: { isActive: true },
    include: {
      phones: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { marketNumber: 'asc' },
  });

  // Annotate each station with calledToday status
  const annotatedStations = stations.map((station) => {
    // Check if ANY of this station's phone numbers were called today
    const calledPhone = station.phones.find((p) => calledNumbers.has(p.number));

    return {
      ...station,
      calledToday: calledPhone ? true : false,
      calledAt: calledPhone
        ? calledNumbers.get(calledPhone.number)?.toISOString() ?? null
        : null,
    };
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-md mx-auto pb-20">
        {/* Station List */}
        <StationList stations={annotatedStations} />
      </main>
    </div>
  );
}
