import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { validity_days } = await request.json();

    // Validate validity_days
    const days = validity_days ? parseInt(validity_days, 10) : 5;
    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Validity days must be between 1 and 365' },
        { status: 400 }
      );
    }

    // Get current election settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('election_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      // PGRST116 is "not found", which is okay for first time
      console.error('Error fetching election settings:', settingsError);
    }

    // Update or create election settings
    const newStartDate = new Date().toISOString();
    
    // First try to update existing record
    const { error: updateError } = await supabaseAdmin
      .from('election_settings')
      .update({
        voting_period_days: days,
        election_status: 'active',
        election_start_date: newStartDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', '00000000-0000-0000-0000-000000000000');

    // If update failed (record doesn't exist), insert it
    if (updateError) {
      const { error: insertError } = await supabaseAdmin
        .from('election_settings')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          voting_period_days: days,
          election_status: 'active',
          election_start_date: newStartDate,
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating election settings:', insertError);
        return NextResponse.json(
          { error: 'Failed to create election settings. Please ensure the election_settings table exists.', details: insertError.message },
          { status: 500 }
        );
      }
    }

    // Regenerate codes by updating voting_start_date for all voters
    // This effectively resets the voting period for all voters
    const { error: votersError } = await supabaseAdmin
      .from('voters')
      .update({
        voting_start_date: newStartDate,
        updated_at: new Date().toISOString(),
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all voters

    if (votersError) {
      console.error('Error updating voters:', votersError);
      return NextResponse.json(
        { error: 'Failed to regenerate codes for voters' },
        { status: 500 }
      );
    }

    // Get count of updated voters
    const { count } = await supabaseAdmin
      .from('voters')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: `Successfully regenerated election codes. ${count || 0} voter(s) now have a new ${days}-day voting period starting from now.`,
      validity_days: days,
      start_date: newStartDate,
      voters_updated: count || 0,
    });
  } catch (error) {
    console.error('Regenerate codes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
