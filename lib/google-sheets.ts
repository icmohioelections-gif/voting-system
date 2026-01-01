import { google } from 'googleapis';
import { supabaseAdmin } from './supabase';

// Initialize Google Sheets API
function getSheetsClient() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  return google.sheets({ version: 'v4', auth });
}

// Sync voters from Google Sheets to Supabase
export async function syncVotersFromSheets() {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
    
    // Read from Google Sheets (assuming data starts at row 2, row 1 is header)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:E1000', // Adjust range as needed
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      console.log('No data found in Google Sheets');
      return { success: true, synced: 0 };
    }

    // Process each row: election_code, first_name, last_name, has_voted, voted_at
    const voters = rows.map((row) => ({
      election_code: row[0]?.trim() || '',
      first_name: row[1]?.trim() || '',
      last_name: row[2]?.trim() || null,
      has_voted: row[3] === 'TRUE' || row[3] === 'true' || row[3] === true,
      voted_at: row[4] || null,
    })).filter(v => v.election_code && v.first_name); // Filter out invalid rows

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
    
    // First, find the row number for this election code
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:E1000',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0]?.trim() === electionCode);

    if (rowIndex === -1) {
      console.error(`Election code ${electionCode} not found in Google Sheets`);
      return { success: false, error: 'Election code not found' };
    }

    // Update the row (rowIndex + 2 because we start at row 2, and Google Sheets is 1-indexed)
    const updateRange = `Sheet1!D${rowIndex + 2}:E${rowIndex + 2}`;
    
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
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:E1000',
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

