import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Get election settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('election_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      // PGRST116 is "not found"
      console.error('Error fetching election settings:', settingsError);
    }

    // Get voter statistics
    const { count: totalVoters } = await supabaseAdmin
      .from('voters')
      .select('*', { count: 'exact', head: true });

    const { count: votedCount } = await supabaseAdmin
      .from('voters')
      .select('*', { count: 'exact', head: true })
      .eq('has_voted', true);

    // Default settings if not found
    const defaultSettings = {
      voting_period_days: 5,
      election_status: 'not_started',
      election_start_date: null,
      election_end_date: null,
    };

    const currentSettings = settings || defaultSettings;

    // Calculate time remaining if election is active
    let timeRemaining = null;
    if (currentSettings.election_status === 'active' && currentSettings.election_start_date) {
      const startDate = new Date(currentSettings.election_start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (currentSettings.voting_period_days || 5));
      const now = new Date();
      
      if (endDate > now) {
        const diff = endDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
        timeRemaining = {
          days: daysRemaining,
          expires_at: endDate.toISOString(),
        };
      } else {
        // Election period has expired
        timeRemaining = {
          days: 0,
          expires_at: endDate.toISOString(),
        };
      }
    }

    return NextResponse.json({
      success: true,
      settings: {
        voting_period_days: currentSettings.voting_period_days || 5,
        election_status: currentSettings.election_status || 'not_started',
        election_start_date: currentSettings.election_start_date,
        election_end_date: currentSettings.election_end_date,
      },
      statistics: {
        total_voters: totalVoters || 0,
        votes_cast: votedCount || 0,
        turnout_percentage: totalVoters && totalVoters > 0 
          ? ((votedCount || 0) / totalVoters * 100).toFixed(2)
          : '0.00',
      },
      time_remaining: timeRemaining,
    });
  } catch (error) {
    console.error('Get election status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
