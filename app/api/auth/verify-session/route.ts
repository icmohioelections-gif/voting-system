import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySession } from '@/lib/sessions';

export async function POST(request: NextRequest) {
  try {
    const { voter_id, election_code, session_token } = await request.json();

    // If session_token is provided, verify using session token (more secure)
    if (session_token) {
      const sessionCheck = await verifySession(session_token);
      
      if (!sessionCheck.valid || !sessionCheck.voterId) {
        return NextResponse.json(
          { error: 'Invalid or expired session. Please log in again.' },
          { status: 401 }
        );
      }

      // Verify voter exists and hasn't voted
      const { data: voter, error } = await supabaseAdmin
        .from('voters')
        .select('*')
        .eq('id', sessionCheck.voterId)
        .single();

      if (error || !voter) {
        return NextResponse.json(
          { error: 'Invalid session. Please log in again.' },
          { status: 401 }
        );
      }

      // Check if already voted
      if (voter.has_voted) {
        return NextResponse.json(
          { error: 'You have already voted', has_voted: true },
          { status: 403 }
        );
      }

      // Check 5-day voting window
      const votingStartDate = voter.voting_start_date ? new Date(voter.voting_start_date) : new Date(voter.created_at);
      const now = new Date();
      const daysSinceStart = (now.getTime() - votingStartDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceStart > 5) {
        return NextResponse.json(
          { error: 'Voting period has expired. You had 5 days to cast your vote.' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        valid: true,
        voter_id: voter.id,
        election_code: voter.election_code,
      });
    }

    // Fallback: Verify using voter_id and election_code (for backward compatibility)
    if (!voter_id || !election_code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify voter exists and credentials match
    const { data: voter, error } = await supabaseAdmin
      .from('voters')
      .select('*')
      .eq('id', voter_id)
      .eq('election_code', election_code.trim())
      .single();

    if (error || !voter) {
      return NextResponse.json(
        { error: 'Invalid session. Please log in again.' },
        { status: 401 }
      );
    }

    // Check if already voted
    if (voter.has_voted) {
      return NextResponse.json(
        { error: 'You have already voted', has_voted: true },
        { status: 403 }
      );
    }

    // Check 5-day voting window
    const votingStartDate = voter.voting_start_date ? new Date(voter.voting_start_date) : new Date(voter.created_at);
    const now = new Date();
    const daysSinceStart = (now.getTime() - votingStartDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceStart > 5) {
      return NextResponse.json(
        { error: 'Voting period has expired. You had 5 days to cast your vote.' },
        { status: 403 }
      );
    }

    // Session is valid
    return NextResponse.json({
      valid: true,
      voter_id: voter.id,
      election_code: voter.election_code,
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

