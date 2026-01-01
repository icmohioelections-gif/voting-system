import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface VoterRow {
  election_code: string;
  first_name: string;
  last_name: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { voters } = await request.json();

    if (!voters || !Array.isArray(voters)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected array of voters.' },
        { status: 400 }
      );
    }

    if (voters.length === 0) {
      return NextResponse.json(
        { error: 'No voters provided' },
        { status: 400 }
      );
    }

    // Validate and format voters
    const validVoters: VoterRow[] = [];
    const errors: string[] = [];

    voters.forEach((voter: any, index: number) => {
      const electionCode = voter.election_code?.trim() || voter['election_code']?.trim() || '';
      const firstName = voter.first_name?.trim() || voter['first_name']?.trim() || '';
      const lastName = voter.last_name?.trim() || voter['last_name']?.trim() || null;

      if (!electionCode) {
        errors.push(`Row ${index + 1}: Missing election_code`);
        return;
      }

      if (!firstName) {
        errors.push(`Row ${index + 1}: Missing first_name`);
        return;
      }

      validVoters.push({
        election_code: electionCode,
        first_name: firstName,
        last_name: lastName || null,
      });
    });

    if (errors.length > 0 && validVoters.length === 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Upsert voters into Supabase
    let successCount = 0;
    let errorCount = 0;
    const upsertErrors: string[] = [];

    for (const voter of validVoters) {
      const { error } = await supabaseAdmin
        .from('voters')
        .upsert(
          {
            election_code: voter.election_code,
            first_name: voter.first_name,
            last_name: voter.last_name,
            has_voted: false,
            voted_at: null,
          },
          {
            onConflict: 'election_code',
          }
        );

      if (error) {
        errorCount++;
        upsertErrors.push(`Failed to upsert ${voter.election_code}: ${error.message}`);
      } else {
        successCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${successCount} voter(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      uploaded: successCount,
      failed: errorCount,
      errors: upsertErrors.length > 0 ? upsertErrors : undefined,
      validationErrors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Upload voters error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

