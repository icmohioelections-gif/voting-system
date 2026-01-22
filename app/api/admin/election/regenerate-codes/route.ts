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
      // Check if error is because table doesn't exist or record doesn't exist
      if (updateError.code === 'PGRST116' || updateError.message?.includes('relation') || updateError.message?.includes('does not exist')) {
        // Try to insert
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
            { error: 'Failed to create election settings.', details: insertError.message },
            { status: 500 }
          );
        }
      } else {
        // Other update error
        console.error('Error updating election settings:', updateError);
        return NextResponse.json(
          { error: 'Failed to update election settings.', details: updateError.message },
          { status: 500 }
        );
      }
    }

    // Get all voters to regenerate codes
    const { data: allVoters, error: fetchError } = await supabaseAdmin
      .from('voters')
      .select('id, first_name, last_name');

    if (fetchError) {
      console.error('Error fetching voters:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch voters' },
        { status: 500 }
      );
    }

    if (!allVoters || allVoters.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No voters found to regenerate codes.',
        validity_days: days,
        start_date: newStartDate,
        voters_updated: 0,
      });
    }

    // Generate new unique election codes for each voter
    const usedCodes = new Set<string>();
    const updates = allVoters.map((voter, index) => {
      const fullName = `${voter.first_name} ${voter.last_name || ''}`.trim();
      
      // Generate a new unique code
      let newCode: string;
      let attempts = 0;
      do {
        // Generate code based on name + timestamp + random
        const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const namePart = fullName.replace(/\s+/g, '').substring(0, 4).toUpperCase();
        newCode = `${namePart}${timestamp}${random}`.substring(0, 10);
        attempts++;
        
        // Fallback if we can't generate unique
        if (attempts > 10) {
          newCode = `VOTE${Date.now().toString().slice(-6)}${index}`.substring(0, 10);
        }
      } while (usedCodes.has(newCode) && attempts < 20);
      
      usedCodes.add(newCode);
      
      return {
        id: voter.id,
        election_code: newCode,
        voting_start_date: newStartDate,
        updated_at: new Date().toISOString(),
      };
    });

    // Update all voters with new codes
    let updatedCount = 0;
    for (const update of updates) {
      const { error: updateError } = await supabaseAdmin
        .from('voters')
        .update({
          election_code: update.election_code,
          voting_start_date: update.voting_start_date,
          updated_at: update.updated_at,
        })
        .eq('id', update.id);

      if (!updateError) {
        updatedCount++;
      } else {
        console.error(`Error updating voter ${update.id}:`, updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully regenerated election codes. ${updatedCount} voter(s) now have new codes and a ${days}-day voting period starting from now.`,
      validity_days: days,
      start_date: newStartDate,
      voters_updated: updatedCount,
    });
  } catch (error) {
    console.error('Regenerate codes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
