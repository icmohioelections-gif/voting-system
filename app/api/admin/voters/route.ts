import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: voters, error } = await supabaseAdmin
      .from('voters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Voters fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch voters' },
        { status: 500 }
      );
    }

    return NextResponse.json({ voters: voters || [] });
  } catch (error) {
    console.error('Voters API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

