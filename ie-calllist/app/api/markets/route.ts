import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check auth
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feed = searchParams.get('feed');

    // Calculate start of today (midnight local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all numbers called today
    const recentCalls = await prisma.recentCall.findMany({
      where: {
        calledAt: { gte: today },
      },
      select: {
        number: true,
        calledAt: true,
      },
    });

    // Build lookup map: number -> calledAt timestamp
    const calledNumbers = new Map<string, Date>(
      recentCalls.map((c) => [c.number, c.calledAt])
    );

    // Build query
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (feed && feed !== 'all') {
      where.feed = feed;
    }

    // Fetch stations with phones
    const stations = await prisma.station.findMany({
      where,
      include: {
        phones: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { marketNumber: 'asc' },
    });

    // Annotate each station with calledToday status
    const annotated = stations.map((station) => {
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

    return NextResponse.json({ stations: annotated });
  } catch (error) {
    console.error('Get markets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}

