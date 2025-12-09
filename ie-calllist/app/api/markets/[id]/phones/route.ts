import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { CreatePhoneSchema } from '@/domain/contracts';
import { formatE164 } from '@/domain/phone';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: stationId } = await params;
    const body = await request.json();

    // Validate input
    const result = CreatePhoneSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Check station exists
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      include: { phones: true },
    });

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Check max 4 phones
    if (station.phones.length >= 4) {
      return NextResponse.json(
        { error: 'Maximum 4 phone numbers allowed' },
        { status: 400 }
      );
    }

    // Determine sort order
    const maxOrder = Math.max(...station.phones.map((p) => p.sortOrder), 0);
    const sortOrder = result.data.sortOrder ?? maxOrder + 1;

    // Create phone
    const phone = await prisma.phoneNumber.create({
      data: {
        stationId,
        label: result.data.label,
        number: formatE164(result.data.number),
        sortOrder,
      },
    });

    // Log change
    await prisma.editLog.create({
      data: {
        stationId,
        field: 'phones',
        oldValue: '',
        newValue: `Added: ${result.data.label} - ${result.data.number}`,
        editedBy: session.userId,
      },
    });

    return NextResponse.json({ phone }, { status: 201 });
  } catch (error) {
    console.error('Create phone error:', error);
    return NextResponse.json(
      { error: 'Failed to create phone' },
      { status: 500 }
    );
  }
}

