import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all recent calls (they're still preserved in CallLog for audit)
    await prisma.recentCall.deleteMany({});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset calls error:', error);
    return NextResponse.json(
      { error: 'Failed to reset call indicators' },
      { status: 500 }
    );
  }
}

