import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Header } from '@/components/Header';
import { formatDisplay } from '@/domain/phone';

export default async function CallLogsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Fetch call logs
  const where = session.role === 'admin' ? {} : { calledBy: session.userId };
  
  const logs = await prisma.callLog.findMany({
    where,
    include: {
      station: {
        select: {
          marketName: true,
          callLetters: true,
        },
      },
      phone: {
        select: {
          label: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Group by date
  const grouped = logs.reduce((acc, log) => {
    const date = new Date(log.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  const todayDate = new Date();
  const today = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(todayDate.getDate() - 1);
  const yesterday = yesterdayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white">
      <Header showBack title="Call History" />
      
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {Object.entries(grouped).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📞</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No calls yet
            </h3>
            <p className="text-gray-500">
              Your call history will appear here
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, dateLogs]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {date === today ? 'Today' : date === yesterday ? 'Yesterday' : date}
              </h2>
              
              <div className="bg-white rounded-2xl divide-y divide-gray-200 border border-gray-200 shadow-sm overflow-hidden">
                {dateLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">
                        {log.station.marketName} - {log.station.callLetters}
                      </p>
                      <p className="text-sm text-gray-500">
                        {log.phone.label} • {formatDisplay(log.phoneNumber)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      {session.role === 'admin' && (
                        <p className="text-xs text-gray-400">
                          by {log.user.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
