import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { election_code } = await request.json();

    if (!election_code) {
      return NextResponse.json(
        { error: 'Election code is required' },
        { status: 400 }
      );
    }

    // Fetch voter by election code
    const { data: voter, error } = await supabaseAdmin
      .from('voters')
      .select('*')
      .eq('election_code', election_code.trim())
      .single();

    if (error || !voter) {
      return NextResponse.json(
        { error: 'Invalid election code' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: voter.id,
      election_code: voter.election_code,
      first_name: voter.first_name,
      last_name: voter.last_name,
      has_voted: voter.has_voted,
      voted_at: voter.voted_at,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

