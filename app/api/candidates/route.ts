import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: candidates, error } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Candidates fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch candidates' },
        { status: 500 }
      );
    }

    return NextResponse.json({ candidates: candidates || [] });
  } catch (error) {
    console.error('Candidates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

