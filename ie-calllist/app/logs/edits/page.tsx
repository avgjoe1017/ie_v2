import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Header } from '@/components/Header';

export default async function EditLogsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Fetch edit logs
  const logs = await prisma.editLog.findMany({
    include: {
      station: {
        select: {
          marketName: true,
          callLetters: true,
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
      <Header showBack title="Edit History" />
      
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {Object.entries(grouped).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✏️</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No edits yet
            </h3>
            <p className="text-gray-500">
              Station edit history will appear here
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
                  <div key={log.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900">
                          {log.station.callLetters} - {log.station.marketName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">{log.field}:</span>{' '}
                          <span className="text-red-500 line-through">{log.oldValue || '(empty)'}</span>
                          {' → '}
                          <span className="text-green-600">{log.newValue || '(empty)'}</span>
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          by {log.user.name}
                        </p>
                      </div>
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
