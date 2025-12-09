import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { UpdateStationSchema } from '@/domain/contracts';
import { z } from 'zod';

const BulkUpdateSchema = z.object({
  stationIds: z.array(z.string().uuid()),
  updates: UpdateStationSchema,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const result = BulkUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { stationIds, updates } = result.data;

    if (stationIds.length === 0) {
      return NextResponse.json(
        { error: 'No stations selected' },
        { status: 400 }
      );
    }

    // Get current values for logging
    const currentStations = await prisma.station.findMany({
      where: { id: { in: stationIds } },
    });

    // Update all selected stations
    await prisma.station.updateMany({
      where: { id: { in: stationIds } },
      data: updates,
    });

    // Log changes for each station
    const updateFields = Object.entries(updates).filter(
      ([, value]) => value !== undefined
    );

    if (updateFields.length > 0) {
      const editLogs = currentStations.flatMap((station) =>
        updateFields
          .filter(([key]) => {
            const currentValue = station[key as keyof typeof station];
            const newValue = updates[key as keyof typeof updates];
            return currentValue !== newValue;
          })
          .map(([field, newValue]) => ({
            stationId: station.id,
            field,
            oldValue: String(station[field as keyof typeof station] ?? ''),
            newValue: String(newValue ?? ''),
            editedBy: session.userId,
          }))
      );

      if (editLogs.length > 0) {
        await prisma.editLog.createMany({
          data: editLogs,
        });
      }
    }

    return NextResponse.json({
      success: true,
      updated: stationIds.length,
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update' },
      { status: 500 }
    );
  }
}

