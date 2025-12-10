import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { CreateCallLogSchema } from '@/domain/contracts';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // Build query - show user's own calls, or all for admins
    const where = session.role === 'admin' ? {} : { calledBy: session.userId };

    const [logs, total] = await Promise.all([
      prisma.callLog.findMany({
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.callLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('Get call logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Read-only users cannot create call logs (no dialing from app)
    if (session.role === 'viewer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const result = CreateCallLogSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify station and phone exist
    const phone = await prisma.phoneNumber.findUnique({
      where: { id: result.data.phoneId },
    });

    if (!phone || phone.stationId !== result.data.stationId) {
      return NextResponse.json(
        { error: 'Invalid station or phone' },
        { status: 400 }
      );
    }

    // Create call log
    const log = await prisma.callLog.create({
      data: {
        stationId: result.data.stationId,
        phoneId: result.data.phoneId,
        phoneNumber: result.data.phoneNumber,
        calledBy: session.userId,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error('Create call log error:', error);
    return NextResponse.json(
      { error: 'Failed to log call' },
      { status: 500 }
    );
  }
}

