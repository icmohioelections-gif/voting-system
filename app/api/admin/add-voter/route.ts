import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, election_code } = await request.json();

    if (!first_name || !election_code) {
      return NextResponse.json(
        { error: 'First name and election code are required' },
        { status: 400 }
      );
    }

    // Validate election code format (10-digit alphanumeric)
    const codePattern = /^[A-Za-z0-9]{10}$/;
    if (!codePattern.test(election_code.trim())) {
      return NextResponse.json(
        { error: 'Election code must be exactly 10 alphanumeric characters' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('voters')
      .insert({
        election_code: election_code.trim(),
        first_name: first_name.trim(),
        last_name: last_name?.trim() || null,
        has_voted: false,
        voted_at: null,
        voting_start_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Election code already exists' },
          { status: 400 }
        );
      }
      console.error('Voter insert error:', error);
      return NextResponse.json(
        { error: 'Failed to add voter', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      voter: data,
      message: 'Voter added successfully',
    });
  } catch (error) {
    console.error('Add voter error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


