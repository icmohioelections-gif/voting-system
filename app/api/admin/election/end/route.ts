import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const endDate = new Date().toISOString();

    // Update election settings to mark as ended
    // First try to update existing record
    const { error: updateError } = await supabaseAdmin
      .from('election_settings')
      .update({
        election_status: 'ended',
        election_end_date: endDate,
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
            voting_period_days: 5,
            election_status: 'ended',
            election_end_date: endDate,
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
            { error: 'Failed to end election.', details: insertError.message },
            { status: 500 }
          );
        }
      } else {
        // Other update error
        console.error('Error updating election settings:', updateError);
        return NextResponse.json(
          { error: 'Failed to end election.', details: updateError.message },
          { status: 500 }
        );
      }
    }

    // Get statistics
    const { count: totalVoters } = await supabaseAdmin
      .from('voters')
      .select('*', { count: 'exact', head: true });

    const { count: votedCount } = await supabaseAdmin
      .from('voters')
      .select('*', { count: 'exact', head: true })
      .eq('has_voted', true);

    return NextResponse.json({
      success: true,
      message: `Election ended successfully. ${votedCount || 0} out of ${totalVoters || 0} voters cast their votes.`,
      end_date: endDate,
      total_voters: totalVoters || 0,
      votes_cast: votedCount || 0,
    });
  } catch (error) {
    console.error('End election error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
