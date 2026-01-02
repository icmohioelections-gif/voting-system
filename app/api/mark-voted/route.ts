import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateVoterInSheets } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { election_code } = await request.json();

    if (!election_code) {
      return NextResponse.json(
        { error: 'Election code is required' },
        { status: 400 }
      );
    }

    // Check if voter exists and hasn't voted
    const { data: voter, error: fetchError } = await supabaseAdmin
      .from('voters')
      .select('*')
      .eq('election_code', election_code.trim())
      .single();

    if (fetchError || !voter) {
      return NextResponse.json(
        { error: 'Invalid election code' },
        { status: 404 }
      );
    }

    if (voter.has_voted) {
      return NextResponse.json(
        { error: 'Voter has already voted' },
        { status: 400 }
      );
    }

    // Mark as voted in Supabase
    const votedAt = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from('voters')
      .update({
        has_voted: true,
        voted_at: votedAt,
      })
      .eq('election_code', election_code.trim());

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update voter status' },
        { status: 500 }
      );
    }

    // Update Google Sheets (non-blocking, but log errors)
    try {
      await updateVoterInSheets(election_code.trim(), votedAt);
    } catch (sheetsError) {
      console.error('Google Sheets update error:', sheetsError);
      // Continue even if Sheets update fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark voted error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

