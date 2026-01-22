import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const checks: any = {
      election_settings: false,
      letter_templates: false,
      voters: false,
      candidates: false,
      votes: false,
      errors: [] as string[],
    };

    // Check election_settings table
    try {
      const { data, error } = await supabaseAdmin
        .from('election_settings')
        .select('*')
        .limit(1);
      
      if (!error) {
        checks.election_settings = true;
        checks.election_settings_data = data;
      } else {
        checks.errors.push(`election_settings: ${error.message}`);
      }
    } catch (e: any) {
      checks.errors.push(`election_settings: ${e.message}`);
    }

    // Check letter_templates table
    try {
      const { data, error } = await supabaseAdmin
        .from('letter_templates')
        .select('*')
        .limit(1);
      
      if (!error) {
        checks.letter_templates = true;
        checks.letter_templates_count = data?.length || 0;
      } else {
        checks.errors.push(`letter_templates: ${error.message}`);
      }
    } catch (e: any) {
      checks.errors.push(`letter_templates: ${e.message}`);
    }

    // Check voters table
    try {
      const { data, error } = await supabaseAdmin
        .from('voters')
        .select('id')
        .limit(1);
      
      if (!error) {
        checks.voters = true;
      } else {
        checks.errors.push(`voters: ${error.message}`);
      }
    } catch (e: any) {
      checks.errors.push(`voters: ${e.message}`);
    }

    // Check candidates table
    try {
      const { data, error } = await supabaseAdmin
        .from('candidates')
        .select('id')
        .limit(1);
      
      if (!error) {
        checks.candidates = true;
      } else {
        checks.errors.push(`candidates: ${error.message}`);
      }
    } catch (e: any) {
      checks.errors.push(`candidates: ${e.message}`);
    }

    // Check votes table
    try {
      const { data, error } = await supabaseAdmin
        .from('votes')
        .select('id')
        .limit(1);
      
      if (!error) {
        checks.votes = true;
      } else {
        checks.errors.push(`votes: ${error.message}`);
      }
    } catch (e: any) {
      checks.errors.push(`votes: ${e.message}`);
    }

    // Check if voting_start_date column exists in voters
    try {
      const { data, error } = await supabaseAdmin
        .from('voters')
        .select('voting_start_date')
        .limit(1);
      
      if (!error) {
        checks.voters_has_voting_start_date = true;
      } else {
        checks.errors.push(`voters.voting_start_date: ${error.message}`);
      }
    } catch (e: any) {
      checks.errors.push(`voters.voting_start_date: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      checks,
      summary: {
        all_tables_exist: checks.election_settings && checks.letter_templates && checks.voters && checks.candidates && checks.votes,
        election_settings_exists: checks.election_settings,
        letter_templates_exists: checks.letter_templates,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        details: 'Failed to check database tables'
      },
      { status: 500 }
    );
  }
}
