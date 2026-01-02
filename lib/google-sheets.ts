import { google } from 'googleapis';
import { supabaseAdmin } from './supabase';
import { generateElectionCode, parseName } from './election-codes';

// Initialize Google Sheets API
function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('Google Sheets API credentials not configured. Please set GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY environment variables.');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// Sync voters from Google Sheets to Supabase
export async function syncVotersFromSheets() {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
    
    // First, get sheet metadata to find the correct sheet name
    const metadataResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // Get the first sheet name (or use Sheet1 as fallback)
    const sheetName = metadataResponse.data.sheets?.[0]?.properties?.title || 'Sheet1';
    
    // Read from Google Sheets (read from row 1 to detect header automatically)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:E1000`, // Start from row 1 to detect headers
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      console.log('No data found in Google Sheets');
      return { success: true, synced: 0 };
    }

    // Process rows - support multiple formats:
    // Format 1: election_code, first_name, last_name, has_voted, voted_at (with header)
    // Format 2: name (simple format - just names, generate codes)
    
    // Check if first row looks like a header (contains common header words)
    const firstRow = rows[0] || [];
    const isHeaderRow = firstRow.some(cell => {
      const cellStr = String(cell || '').toLowerCase();
      return cellStr.includes('election') || cellStr.includes('code') || 
             cellStr.includes('first') || cellStr.includes('name') ||
             cellStr.includes('last') || cellStr.includes('voted');
    });
    
    const dataRows = isHeaderRow ? rows.slice(1) : rows;
    
    const voters = dataRows.map((row, index) => {
      const rowIndex = isHeaderRow ? index + 2 : index + 1; // Account for header if present
      
      // Check if this is the detailed format (has election_code and first_name in separate columns)
      if (row.length >= 2 && row[0] && row[1]) {
        // Detailed format: election_code, first_name, last_name, has_voted, voted_at
        return {
          election_code: row[0]?.trim() || '',
          first_name: row[1]?.trim() || '',
          last_name: row[2]?.trim() || null,
          has_voted: row[3] === 'TRUE' || row[3] === 'true' || row[3] === true,
          voted_at: row[4] || null,
        };
      } else if (row[0]) {
        // Simple format: just a name in first column
        const fullName = String(row[0]).trim();
        if (!fullName) return null;
        
        const { first_name, last_name } = parseName(fullName);
        if (!first_name) return null;
        
        // Generate election code from name
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
    }).filter(v => v !== null && v.election_code && v.first_name); // Filter out invalid rows

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
        }, {
          onConflict: 'election_code'
        });

      if (!error) synced++;
    }

    return { success: true, synced };
  } catch (error) {
    console.error('Error syncing from Google Sheets:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Update voter status in Google Sheets after voting
export async function updateVoterInSheets(electionCode: string, votedAt: string) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
    
    // Get the sheet name first
    const metadataResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    const sheetName = metadataResponse.data.sheets?.[0]?.properties?.title || 'Sheet1';
    
    // First, find the row number for this election code
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:E1000`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0]?.trim() === electionCode);

    if (rowIndex === -1) {
      console.error(`Election code ${electionCode} not found in Google Sheets`);
      return { success: false, error: 'Election code not found' };
    }

    // Update the row (rowIndex + 2 because we start at row 2, and Google Sheets is 1-indexed)
    const updateRange = `${sheetName}!D${rowIndex + 2}:E${rowIndex + 2}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[true, votedAt]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating Google Sheets:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get all voters from Google Sheets (for admin view)
export async function getAllVotersFromSheets() {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
    
    // Get the sheet name first
    const metadataResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    const sheetName = metadataResponse.data.sheets?.[0]?.properties?.title || 'Sheet1';
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:E1000`,
    });

    const rows = response.data.values || [];
    
    return rows.map((row) => ({
      election_code: row[0]?.trim() || '',
      first_name: row[1]?.trim() || '',
      last_name: row[2]?.trim() || '',
      has_voted: row[3] === 'TRUE' || row[3] === 'true' || row[3] === true,
      voted_at: row[4] || null,
    })).filter(v => v.election_code && v.first_name);
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    return [];
  }
}

