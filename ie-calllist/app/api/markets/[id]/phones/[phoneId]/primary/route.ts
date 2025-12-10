import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phoneId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Read-only users cannot modify phones
    if (session.role === 'viewer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: stationId, phoneId } = await params;

    // Get station and all phones
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      include: { phones: true },
    });

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Verify phone exists and belongs to station
    const targetPhone = station.phones.find((p) => p.id === phoneId);
    if (!targetPhone) {
      return NextResponse.json({ error: 'Phone not found' }, { status: 404 });
    }

    // If already primary (sortOrder === 1), no change needed
    if (targetPhone.sortOrder === 1) {
      return NextResponse.json({ success: true });
    }

    // Get current primary phone (if any)
    const currentPrimary = station.phones.find((p) => p.sortOrder === 1);

    // Update all phones: set target to 1, shift others up
    const updates = station.phones.map((phone) => {
      if (phone.id === phoneId) {
        return { id: phone.id, sortOrder: 1 };
      } else if (phone.sortOrder < targetPhone.sortOrder) {
        // Phones before target stay the same
        return { id: phone.id, sortOrder: phone.sortOrder };
      } else {
        // Phones after target shift up by 1
        return { id: phone.id, sortOrder: phone.sortOrder + 1 };
      }
    });

    // Execute updates
    await Promise.all(
      updates.map((update) =>
        prisma.phoneNumber.update({
          where: { id: update.id },
          data: { sortOrder: update.sortOrder },
        })
      )
    );

    // Log the change
    await prisma.editLog.create({
      data: {
        stationId,
        field: 'phones',
        oldValue: currentPrimary
          ? `Primary: ${currentPrimary.label} (sortOrder: ${currentPrimary.sortOrder})`
          : 'No primary phone',
        newValue: `Primary: ${targetPhone.label} (sortOrder: 1)`,
        editedBy: session.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set primary phone error:', error);
    return NextResponse.json(
      { error: 'Failed to set primary phone' },
      { status: 500 }
    );
  }
}

