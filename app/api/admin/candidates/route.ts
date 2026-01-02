import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { name, position, photo_url, description } = await request.json();

    if (!name || !position) {
      return NextResponse.json(
        { error: 'Name and position are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('candidates')
      .insert({
        name: name.trim(),
        position: position.trim(),
        photo_url: photo_url?.trim() || null,
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Candidate insert error:', error);
      return NextResponse.json(
        { error: 'Failed to add candidate', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      candidate: data,
      message: 'Candidate added successfully',
    });
  } catch (error) {
    console.error('Add candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

