import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Voter ID is required' },
        { status: 400 }
      );
    }

    // Check if voter exists
    const { data: voter, error: voterError } = await supabaseAdmin
      .from('voters')
      .select('id, has_voted, election_code')
      .eq('id', id)
      .single();

    if (voterError || !voter) {
      return NextResponse.json(
        { error: 'Voter not found' },
        { status: 404 }
      );
    }

    // Check if voter has voted - warn but allow deletion
    if (voter.has_voted) {
      // Delete associated vote first (if exists)
      await supabaseAdmin
        .from('votes')
        .delete()
        .eq('voter_id', id);
    }

    // Delete any sessions associated with this voter
    try {
      const { deleteSession } = await import('@/lib/sessions');
      await deleteSession(id);
    } catch (sessionError) {
      console.error('Session deletion error (non-critical):', sessionError);
      // Continue even if session deletion fails
    }

    // Delete the voter
    const { error: deleteError } = await supabaseAdmin
      .from('voters')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Voter deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete voter' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Voter deleted successfully',
    });
  } catch (error) {
    console.error('Delete voter error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
