import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const addDays = body.add_days != null ? parseInt(String(body.add_days), 10) : null;
    const newTotalDays = body.new_total_days != null ? parseInt(String(body.new_total_days), 10) : null;

    if (addDays != null) {
      if (isNaN(addDays) || addDays < 1 || addDays > 365) {
        return NextResponse.json(
          { error: 'Add days must be between 1 and 365' },
          { status: 400 }
        );
      }
    } else if (newTotalDays != null) {
      if (isNaN(newTotalDays) || newTotalDays < 1 || newTotalDays > 365) {
        return NextResponse.json(
          { error: 'New total days must be between 1 and 365' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Provide either add_days or new_total_days' },
        { status: 400 }
      );
    }

    const { data: settings, error: fetchError } = await supabaseAdmin
      .from('election_settings')
      .select('voting_period_days, election_status')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (fetchError || !settings) {
      return NextResponse.json(
        { error: 'Election settings not found. Run migration: supabase/migration_election_settings.sql' },
        { status: 404 }
      );
    }

    if (settings.election_status !== 'active') {
      return NextResponse.json(
        { error: 'Can only extend validity when the election is active.' },
        { status: 400 }
      );
    }

    const currentDays = settings.voting_period_days ?? 5;
    const nextDays = addDays != null
      ? Math.min(365, currentDays + addDays)
      : newTotalDays!;

    if (nextDays <= currentDays) {
      return NextResponse.json(
        { error: `New validity must be greater than current (${currentDays} days). Use add_days to add more days.` },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('election_settings')
      .update({
        voting_period_days: nextDays,
        updated_at: new Date().toISOString(),
      })
      .eq('id', '00000000-0000-0000-0000-000000000000');

    if (updateError) {
      console.error('Extend validity update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to extend validity.', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Code validity extended. Voting period is now ${nextDays} days (was ${currentDays}). Codes that had expired can be used again.`,
      previous_days: currentDays,
      new_days: nextDays,
    });
  } catch (error) {
    console.error('Extend validity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
