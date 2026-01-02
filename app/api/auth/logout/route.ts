import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/sessions';

export async function POST(request: NextRequest) {
  try {
    const { voter_id, election_code } = await request.json();

    if (!voter_id) {
      return NextResponse.json(
        { error: 'Voter ID is required' },
        { status: 400 }
      );
    }

    // Delete session
    await deleteSession(voter_id);

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

