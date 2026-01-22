import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { validity_days } = await request.json();

    // Validate validity_days (optional, defaults to 5)
    const days = validity_days ? parseInt(validity_days, 10) : 5;
    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Validity days must be between 1 and 365' },
        { status: 400 }
      );
    }

    const startDate = new Date().toISOString();

    // Update or create election settings
    // First try to update existing record
    const { error: updateError } = await supabaseAdmin
      .from('election_settings')
      .update({
        voting_period_days: days,
        election_status: 'active',
        election_start_date: startDate,
        election_end_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', '00000000-0000-0000-0000-000000000000');

    // If update failed (record doesn't exist), insert it
    if (updateError) {
      // Check if error is because table doesn't exist
      if (updateError.code === 'PGRST116' || updateError.message?.includes('relation') || updateError.message?.includes('does not exist')) {
        // Try to insert
        const { error: insertError } = await supabaseAdmin
          .from('election_settings')
          .insert({
            id: '00000000-0000-0000-0000-000000000000',
            voting_period_days: days,
            election_status: 'active',
            election_start_date: startDate,
            election_end_date: null,
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error creating election settings:', insertError);
          // If insert also fails, likely table doesn't exist
          if (insertError.message?.includes('relation') || insertError.message?.includes('does not exist')) {
            return NextResponse.json(
              { 
                error: 'The election_settings table does not exist. Please run the migration: supabase/migration_election_settings.sql',
                details: 'Run this SQL in Supabase SQL Editor to create the table.',
                migration_file: 'supabase/migration_election_settings.sql'
              },
              { status: 500 }
            );
          }
          return NextResponse.json(
            { error: 'Failed to start election.', details: insertError.message },
            { status: 500 }
          );
        }
      } else {
        // Other update error
        console.error('Error updating election settings:', updateError);
        return NextResponse.json(
          { error: 'Failed to start election.', details: updateError.message },
          { status: 500 }
        );
      }
    }

    // Update voting_start_date for all voters who haven't voted yet
    const { error: votersError } = await supabaseAdmin
      .from('voters')
      .update({
        voting_start_date: startDate,
        updated_at: new Date().toISOString(),
      })
      .eq('has_voted', false);

    if (votersError) {
      console.error('Error updating voters:', votersError);
      // Don't fail the request, just log the error
    }

    // Get count of active voters
    const { count } = await supabaseAdmin
      .from('voters')
      .select('*', { count: 'exact', head: true })
      .eq('has_voted', false);

    return NextResponse.json({
      success: true,
      message: `Election started successfully. Voting period is ${days} days. ${count || 0} eligible voter(s) can now vote.`,
      validity_days: days,
      start_date: startDate,
      eligible_voters: count || 0,
    });
  } catch (error) {
    console.error('Start election error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
