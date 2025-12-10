import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { UpdatePhoneSchema } from '@/domain/contracts';
import { formatE164 } from '@/domain/phone';

export async function PUT(
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
    const body = await request.json();

    // Validate input
    const result = UpdatePhoneSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Get current phone
    const current = await prisma.phoneNumber.findUnique({
      where: { id: phoneId },
    });

    if (!current || current.stationId !== stationId) {
      return NextResponse.json({ error: 'Phone not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, string | number> = {};
    if (result.data.label) updateData.label = result.data.label;
    if (result.data.number) updateData.number = formatE164(result.data.number);
    if (result.data.sortOrder) updateData.sortOrder = result.data.sortOrder;

    // Update phone
    const phone = await prisma.phoneNumber.update({
      where: { id: phoneId },
      data: updateData,
    });

    // Log changes
    const changes: string[] = [];
    if (result.data.label && result.data.label !== current.label) {
      changes.push(`label: ${current.label} → ${result.data.label}`);
    }
    if (result.data.number && formatE164(result.data.number) !== current.number) {
      changes.push(`number: ${current.number} → ${formatE164(result.data.number)}`);
    }

    if (changes.length > 0) {
      await prisma.editLog.create({
        data: {
          stationId,
          field: 'phones',
          oldValue: `${current.label}: ${current.number}`,
          newValue: changes.join(', '),
          editedBy: session.userId,
        },
      });
    }

    return NextResponse.json({ phone });
  } catch (error) {
    console.error('Update phone error:', error);
    return NextResponse.json(
      { error: 'Failed to update phone' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Get station phone count
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      include: { phones: true },
    });

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Ensure at least 1 phone remains
    if (station.phones.length <= 1) {
      return NextResponse.json(
        { error: 'At least one phone number is required' },
        { status: 400 }
      );
    }

    // Get phone to delete
    const phone = station.phones.find((p) => p.id === phoneId);
    if (!phone) {
      return NextResponse.json({ error: 'Phone not found' }, { status: 404 });
    }

    // Delete phone
    await prisma.phoneNumber.delete({
      where: { id: phoneId },
    });

    // Log deletion
    await prisma.editLog.create({
      data: {
        stationId,
        field: 'phones',
        oldValue: `${phone.label}: ${phone.number}`,
        newValue: 'Deleted',
        editedBy: session.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete phone error:', error);
    return NextResponse.json(
      { error: 'Failed to delete phone' },
      { status: 500 }
    );
  }
}

