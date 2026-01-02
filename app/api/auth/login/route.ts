import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createSession } from '@/lib/sessions';

export async function POST(request: NextRequest) {
  try {
    const { election_code, name } = await request.json();

    if (!election_code || !name) {
      return NextResponse.json(
        { error: 'Election code and name are required' },
        { status: 400 }
      );
    }

    const trimmedCode = election_code.trim();
    const trimmedName = name.trim().toLowerCase();

    // Fetch voter by election code
    const { data: voter, error } = await supabaseAdmin
      .from('voters')
      .select('*')
      .eq('election_code', trimmedCode)
      .single();

    if (error || !voter) {
      return NextResponse.json(
        { error: 'Invalid election code' },
        { status: 401 }
      );
    }

    // Check if already voted
    if (voter.has_voted) {
      return NextResponse.json(
        { error: 'You have already voted' },
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

    // Verify name matches (check first_name OR last_name)
    const firstNameMatch = voter.first_name.toLowerCase() === trimmedName;
    const lastNameMatch = voter.last_name?.toLowerCase() === trimmedName;

    if (!firstNameMatch && !lastNameMatch) {
      return NextResponse.json(
        { error: 'Name does not match election code' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createSession(voter.id, voter.election_code);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes

    // Login successful
    return NextResponse.json({
      voter_id: voter.id,
      election_code: voter.election_code,
      first_name: voter.first_name,
      last_name: voter.last_name,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

