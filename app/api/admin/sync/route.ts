import { NextResponse } from 'next/server';
import { syncVotersFromSheets } from '@/lib/google-sheets';

export async function POST() {
  try {
    const result = await syncVotersFromSheets();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Sync failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${result.synced} voters`,
      synced: result.synced,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

