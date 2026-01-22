import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // Reset all voters' vote status (but keep the voters)
    const { error: votersError } = await supabaseAdmin
      .from('voters')
      .update({
        has_voted: false,
        voted_at: null,
        updated_at: new Date().toISOString(),
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (votersError) {
      console.error('Error resetting vote status:', votersError);
      return NextResponse.json(
        { error: 'Failed to reset vote status', details: votersError.message },
        { status: 500 }
      );
    }

    // Delete all votes
    const { error: votesError } = await supabaseAdmin
      .from('votes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (votesError) {
      console.error('Error deleting votes:', votesError);
      return NextResponse.json(
        { error: 'Failed to delete votes', details: votesError.message },
        { status: 500 }
      );
    }

    // Get count of reset voters
    const { count } = await supabaseAdmin
      .from('voters')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: `Successfully reset vote status for ${count || 0} voter(s). All voters can now vote again.`,
      voters_reset: count || 0,
    });
  } catch (error) {
    console.error('Reset vote status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
