import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Default candidates to add
    const defaultCandidates = [
      { name: 'Candidate 1', position: 'President' },
      { name: 'Candidate 2', position: 'President' },
    ];

    const addedCandidates = [];
    const skippedCandidates = [];

    // Check if candidates already exist and add only new ones
    for (const candidate of defaultCandidates) {
      const { data: existing } = await supabaseAdmin
        .from('candidates')
        .select('id')
        .eq('name', candidate.name)
        .eq('position', candidate.position)
        .single();

      if (!existing) {
        const { data, error } = await supabaseAdmin
          .from('candidates')
          .insert({
            name: candidate.name,
            position: candidate.position,
          })
          .select()
          .single();

        if (error) {
          console.error(`Error adding ${candidate.name}:`, error);
          skippedCandidates.push(candidate.name);
        } else {
          addedCandidates.push(candidate.name);
        }
      } else {
        skippedCandidates.push(candidate.name);
      }
    }

    if (addedCandidates.length === 0 && skippedCandidates.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Default candidates already exist: ${skippedCandidates.join(', ')}`,
        added: addedCandidates,
        skipped: skippedCandidates,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${addedCandidates.length} default candidate(s)`,
      added: addedCandidates,
      skipped: skippedCandidates,
    });
  } catch (error) {
    console.error('Error adding default candidates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add default candidates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


