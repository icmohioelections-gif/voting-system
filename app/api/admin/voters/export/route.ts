import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const { data: voters, error } = await supabaseAdmin
      .from('voters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Voters fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch voters' },
        { status: 500 }
      );
    }

    // Prepare data for Excel
    const excelData = (voters || []).map((voter) => ({
      'Election Code': voter.election_code,
      'First Name': voter.first_name,
      'Last Name': voter.last_name || '',
      'Has Voted': voter.has_voted ? 'Yes' : 'No',
      'Voted At': voter.voted_at ? new Date(voter.voted_at).toLocaleString() : '',
      'Is Logged In': voter.is_logged_in ? 'Yes' : 'No',
      'Last Login': voter.last_login ? new Date(voter.last_login).toLocaleString() : '',
      'Created At': voter.created_at ? new Date(voter.created_at).toLocaleString() : '',
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Voters');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="voters-list-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
