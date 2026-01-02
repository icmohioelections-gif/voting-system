import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateElectionCode, parseName } from '@/lib/election-codes';

// Extract spreadsheet ID and GID from Google Sheets URL
function extractSheetInfo(url: string): { spreadsheetId: string; gid: string } | null {
  try {
    // Pattern: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit...gid={GID}
    const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    
    if (!idMatch || !idMatch[1]) {
      return null;
    }

    const spreadsheetId = idMatch[1];
    const gid = gidMatch && gidMatch[1] ? gidMatch[1] : '0'; // Default to first sheet (gid=0)

    return { spreadsheetId, gid };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sheet_url } = await request.json();

    if (!sheet_url) {
      return NextResponse.json(
        { error: 'Google Sheet URL is required' },
        { status: 400 }
      );
    }

    // Extract spreadsheet ID and GID
    const sheetInfo = extractSheetInfo(sheet_url);
    if (!sheetInfo) {
      return NextResponse.json(
        { error: 'Invalid Google Sheets URL. Expected format: https://docs.google.com/spreadsheets/d/{ID}/edit...' },
        { status: 400 }
      );
    }

    const { spreadsheetId, gid } = sheetInfo;

    // Use CSV export URL (works for publicly accessible sheets)
    // Format: https://docs.google.com/spreadsheets/d/{ID}/export?format=csv&gid={GID}
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

    // Fetch CSV data
    const csvResponse = await fetch(csvUrl);
    
    if (!csvResponse.ok) {
      // If CSV export fails, the sheet might not be public
      // Try using the Sheets API if credentials are available
      if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
        return NextResponse.json(
          { 
            error: 'Sheet is not publicly accessible. Please make the sheet public (View permission) or set up Google Sheets API credentials.',
            details: 'To make it public: Share → Change to "Anyone with the link" → Viewer'
          },
          { status: 403 }
        );
      }
      
      // Fall back to API method
      try {
        const { google } = await import('googleapis');
        const auth = new google.auth.JWT({
          email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        // First, try to get the sheet metadata to find the correct sheet name
        const metadataResponse = await sheets.spreadsheets.get({
          spreadsheetId,
        });

        // Get the first sheet name (or use Sheet1 as fallback)
        const sheetName = metadataResponse.data.sheets?.[0]?.properties?.title || 'Sheet1';
        
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A2:E1000`, // Use the actual sheet name
        });

        const rows = response.data.values || [];
        
        if (rows.length === 0) {
          return NextResponse.json(
            { error: 'No data found in Google Sheet' },
            { status: 404 }
          );
        }

        // Process rows - support multiple formats
        const firstRow = rows[0] || [];
        const isHeaderRow = firstRow.some(cell => {
          const cellStr = String(cell || '').toLowerCase();
          return cellStr.includes('election') || cellStr.includes('code') || 
                 cellStr.includes('first') || cellStr.includes('name') ||
                 cellStr.includes('last') || cellStr.includes('voted');
        });
        
        const dataRows = isHeaderRow ? rows.slice(1) : rows;
        
        const voters = dataRows.map((row, index) => {
          const rowIndex = isHeaderRow ? index + 2 : index + 1;
          
          // Detailed format: election_code, first_name, last_name, has_voted, voted_at
          if (row.length >= 2 && row[0] && row[1]) {
            return {
              election_code: row[0]?.trim() || '',
              first_name: row[1]?.trim() || '',
              last_name: row[2]?.trim() || null,
              has_voted: row[3] === 'TRUE' || row[3] === 'true' || row[3] === true,
              voted_at: row[4] || null,
            };
          } else if (row[0]) {
            // Simple format: just a name
            const fullName = String(row[0]).trim();
            if (!fullName) return null;
            
            const { first_name, last_name } = parseName(fullName);
            if (!first_name) return null;
            
            const election_code = generateElectionCode(fullName, rowIndex);
            
            return {
              election_code,
              first_name,
              last_name,
              has_voted: false,
              voted_at: null,
            };
          }
          return null;
        }).filter(v => v !== null && v.election_code && v.first_name);

        // Upsert voters
        let synced = 0;
        for (const voter of voters) {
          const { error } = await supabaseAdmin
            .from('voters')
            .upsert({
              election_code: voter.election_code,
              first_name: voter.first_name,
              last_name: voter.last_name,
              has_voted: voter.has_voted,
              voted_at: voter.voted_at || null,
              voting_start_date: new Date().toISOString(),
            }, {
              onConflict: 'election_code'
            });

          if (!error) synced++;
        }

        return NextResponse.json({
          success: true,
          message: `Successfully synced ${synced} voters from Google Sheets`,
          synced,
          method: 'api',
        });
      } catch (apiError) {
        return NextResponse.json(
          { error: 'Failed to access Google Sheet. Make sure the sheet is public or API credentials are configured.', details: apiError instanceof Error ? apiError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // Parse CSV data
    const csvText = await csvResponse.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no data rows' },
        { status: 400 }
      );
    }

    // Parse CSV - support multiple formats
    const firstLine = lines[0] || '';
    const isHeaderRow = firstLine.toLowerCase().includes('election') || 
                        firstLine.toLowerCase().includes('code') ||
                        firstLine.toLowerCase().includes('first') ||
                        firstLine.toLowerCase().includes('name');
    
    const startIndex = isHeaderRow ? 1 : 0;
    const voters = [];
    
    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length >= 2 && values[0] && values[1]) {
        // Detailed format: election_code, first_name, last_name, has_voted, voted_at
        voters.push({
          election_code: values[0],
          first_name: values[1],
          last_name: values[2] || null,
          has_voted: values[3] === 'TRUE' || values[3] === 'true' || false,
          voted_at: values[4] || null,
        });
      } else if (values[0]) {
        // Simple format: just a name
        const fullName = values[0].trim();
        if (!fullName) continue;
        
        const { first_name, last_name } = parseName(fullName);
        if (!first_name) continue;
        
        const election_code = generateElectionCode(fullName, i + 1);
        
        voters.push({
          election_code,
          first_name,
          last_name,
          has_voted: false,
          voted_at: null,
        });
      }
    }

    if (voters.length === 0) {
      return NextResponse.json(
        { error: 'No valid voters found in CSV' },
        { status: 400 }
      );
    }

    // Upsert voters into Supabase
    let synced = 0;
    for (const voter of voters) {
      const { error } = await supabaseAdmin
        .from('voters')
        .upsert({
          election_code: voter.election_code,
          first_name: voter.first_name,
          last_name: voter.last_name,
          has_voted: voter.has_voted,
          voted_at: voter.voted_at || null,
          voting_start_date: new Date().toISOString(),
        }, {
          onConflict: 'election_code'
        });

      if (!error) synced++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${synced} voters from Google Sheets`,
      synced,
      method: 'csv',
    });
  } catch (error) {
    console.error('Sync sheet URL error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

