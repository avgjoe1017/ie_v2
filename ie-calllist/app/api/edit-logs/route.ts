import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // Build query
    const where: Record<string, string> = {};
    if (stationId) {
      where.stationId = stationId;
    }

    const [logs, total] = await Promise.all([
      prisma.editLog.findMany({
        where,
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
        skip,
        take: limit,
      }),
      prisma.editLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('Get edit logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch edit logs' },
      { status: 500 }
    );
  }
}

