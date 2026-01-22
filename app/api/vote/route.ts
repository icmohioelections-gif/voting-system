import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateVoterInSheets } from '@/lib/google-sheets';
import { deleteSession } from '@/lib/sessions';

export async function POST(request: NextRequest) {
  try {
    const { voter_id, election_code, candidate_id } = await request.json();

    if (!voter_id || !election_code || !candidate_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify voter exists and hasn't voted
    const { data: voter, error: voterError } = await supabaseAdmin
      .from('voters')
      .select('*')
      .eq('id', voter_id)
      .eq('election_code', election_code.trim())
      .single();

    if (voterError || !voter) {
      return NextResponse.json(
        { error: 'Invalid voter information' },
        { status: 404 }
      );
    }

    if (voter.has_voted) {
      return NextResponse.json(
        { error: 'You have already voted' },
        { status: 403 }
      );
    }

    // Check election status
    const { data: settings } = await supabaseAdmin
      .from('election_settings')
      .select('election_status, voting_period_days')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (settings && settings.election_status === 'ended') {
      return NextResponse.json(
        { error: 'The election has ended. Voting is no longer available.' },
        { status: 403 }
      );
    }

    // Check voting period
    const votingPeriodDays = settings?.voting_period_days || 5;
    const votingStartDate = voter.voting_start_date ? new Date(voter.voting_start_date) : new Date(voter.created_at);
    const now = new Date();
    const daysSinceStart = (now.getTime() - votingStartDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceStart > votingPeriodDays) {
      return NextResponse.json(
        { error: `Voting period has expired. You had ${votingPeriodDays} days to cast your vote.` },
        { status: 403 }
      );
    }

    // Verify candidate exists
    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('id', candidate_id)
      .single();

    if (candidateError || !candidate) {
      return NextResponse.json(
        { error: 'Invalid candidate' },
        { status: 404 }
      );
    }

    // Use transaction-like approach: insert vote first, then update voter
    // Check if vote already exists (safety check)
    const { data: existingVote } = await supabaseAdmin
      .from('votes')
      .select('id')
      .eq('voter_id', voter_id)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: 'Vote already exists' },
        { status: 400 }
      );
    }

    // Insert vote
    const votedAt = new Date().toISOString();
    const { error: voteError } = await supabaseAdmin
      .from('votes')
      .insert({
        voter_id: voter_id,
        candidate_id: candidate_id,
      });

    if (voteError) {
      console.error('Vote insert error:', voteError);
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      );
    }

    // Update voter as voted
    const { error: updateError } = await supabaseAdmin
      .from('voters')
      .update({
        has_voted: true,
        voted_at: votedAt,
      })
      .eq('id', voter_id);

    if (updateError) {
      console.error('Voter update error:', updateError);
      // Try to rollback vote if possible
      await supabaseAdmin.from('votes').delete().eq('voter_id', voter_id);
      return NextResponse.json(
        { error: 'Failed to update voter status' },
        { status: 500 }
      );
    }

    // Delete session (voter cannot login again after voting)
    try {
      await deleteSession(voter_id);
    } catch (sessionError) {
      console.error('Session deletion error:', sessionError);
      // Continue even if session deletion fails
    }

    // Update Google Sheets (non-blocking)
    try {
      await updateVoterInSheets(election_code.trim(), votedAt);
    } catch (sheetsError) {
      console.error('Google Sheets update error:', sheetsError);
      // Continue even if Sheets update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully',
    });
  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

