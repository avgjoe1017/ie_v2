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
    try {
      await prisma.recentCall.deleteMany({});
    } catch (error: any) {
      // If RecentCall table doesn't exist yet, return success anyway
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('no such table') || errorMessage.includes('RecentCall')) {
        // Table doesn't exist - that's fine, nothing to reset
        return NextResponse.json({ success: true, message: 'No call indicators to reset' });
      }
      // Re-throw unexpected errors
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset calls error:', error);
    return NextResponse.json(
      { error: 'Failed to reset call indicators' },
      { status: 500 }
    );
  }
}

