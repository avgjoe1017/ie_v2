import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { UpdateStationSchema } from '@/domain/contracts';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({ station });
  } catch (error) {
    console.error('Get station error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch station' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const result = UpdateStationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Get current station for logging changes
    const current = await prisma.station.findUnique({
      where: { id },
    });

    if (!current) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Update station
    const station = await prisma.station.update({
      where: { id },
      data: result.data,
      include: {
        phones: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    // Log changes
    const changes = Object.entries(result.data).filter(
      ([key, value]) => current[key as keyof typeof current] !== value
    );

    if (changes.length > 0) {
      await prisma.editLog.createMany({
        data: changes.map(([field, newValue]) => ({
          stationId: id,
          field,
          oldValue: String(current[field as keyof typeof current] ?? ''),
          newValue: String(newValue ?? ''),
          editedBy: session.userId,
        })),
      });
    }

    return NextResponse.json({ station });
  } catch (error) {
    console.error('Update station error:', error);
    return NextResponse.json(
      { error: 'Failed to update station' },
      { status: 500 }
    );
  }
}

