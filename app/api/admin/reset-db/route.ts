import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // Delete all votes first (due to foreign key constraints)
    const { error: votesError } = await supabaseAdmin
      .from('votes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using a condition that's always true)

    if (votesError) {
      console.error('Error deleting votes:', votesError);
      return NextResponse.json(
        { error: 'Failed to delete votes', details: votesError.message },
        { status: 500 }
      );
    }

    // Reset all voters' vote status (but keep the voters)
    const { error: votersError } = await supabaseAdmin
      .from('voters')
      .update({
        has_voted: false,
        voted_at: null,
        voting_start_date: null,
        updated_at: new Date().toISOString(),
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (votersError) {
      console.error('Error resetting voters:', votersError);
      return NextResponse.json(
        { error: 'Failed to reset voters', details: votersError.message },
        { status: 500 }
      );
    }

    // Delete all candidates
    const { error: candidatesError } = await supabaseAdmin
      .from('candidates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (candidatesError) {
      console.error('Error deleting candidates:', candidatesError);
      return NextResponse.json(
        { error: 'Failed to delete candidates', details: candidatesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database reset successfully. All votes and candidates have been deleted. Voters have been preserved but their vote status has been reset.',
    });
  } catch (error) {
    console.error('Reset DB error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


