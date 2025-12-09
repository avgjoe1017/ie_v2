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

    return NextResponse.json({ stations });
  } catch (error) {
    console.error('Get markets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}

