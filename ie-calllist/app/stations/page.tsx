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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-md mx-auto pb-20">
        {/* Station List */}
        <StationList stations={stations} />
      </main>
    </div>
  );
}
